// PDF theme CSS registry is defined in src/pdf-themes.js (loaded before this file).
// Access themes via:  window.PC2.PDF_THEMES['themeId'].css

window.PC2 = window.PC2 || {};

window.PC2.Print = (function () {
    const State = window.PC2.State;
    const UI = window.PC2.UI;

    const KATEX_VERSION = '0.16.11';
    const KATEX_JS = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.js`;
    const KATEX_CSS = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.css`;

    // ── KaTeX loader ──────────────────────────────────────────────────────────
    let _katexPromise = null;
    function loadKaTeX() {
        if (_katexPromise) return _katexPromise;
        _katexPromise = new Promise((resolve, reject) => {
            if (window.katex) { resolve(); return; }
            const s = document.createElement('script');
            s.src = KATEX_JS;
            s.onload = resolve;
            s.onerror = () => { _katexPromise = null; reject(new Error('KaTeX load failed')); };
            document.head.appendChild(s);
        });
        return _katexPromise;
    }

    // ── Math pre-renderer ─────────────────────────────────────────────────────
    // Replaces Codeforces $$$$$$...$$$$$$  (display) and $$$...$$$  (inline)
    // with static KaTeX HTML — no MathJax needed in the print window at all.
    //
    // NOTE: process 6-$ display math BEFORE 3-$ inline math so the 6-$ pattern
    // is never partially consumed as two 3-$ patterns.
    function renderMath(html) {
        if (!window.katex) return html;

        const render = (latex, display) => {
            try {
                return window.katex.renderToString(latex.trim(), {
                    throwOnError: false,
                    strict: false,
                    displayMode: display
                });
            } catch (e) {
                return display ? `$$$$$$${latex}$$$$$$` : `$$$${latex}$$$`;
            }
        };

        // Display math:  $$$$$$...$$$$$$  →  KaTeX block
        html = html.replace(/\$\$\$\$\$\$([\s\S]+?)\$\$\$\$\$\$/g,
            (_, tex) => render(tex, true));

        // Inline math:   $$$...$$$  →  KaTeX inline
        html = html.replace(/\$\$\$([\s\S]+?)\$\$\$/g,
            (_, tex) => render(tex, false));

        return html;
    }

    // ── Problem fetcher ───────────────────────────────────────────────────────
    async function fetchProblem(url, retries = 2) {
        try {
            const res = await fetch(url);
            const txt = await res.text();
            const doc = new DOMParser().parseFromString(txt, 'text/html');
            const prob = doc.querySelector('.problem-statement');
            if (!prob) throw new Error('Missing .problem-statement');

            // Remove copy buttons
            prob.querySelectorAll('.input-output-copier').forEach(el => el.remove());

            // Extract metadata before removing header
            const header = doc.querySelector('.header');
            let title = 'Unknown Problem';
            let inputFile = 'standard input';
            let outputFile = 'standard output';
            let timeLimit = 'N/A';
            let memoryLimit = 'N/A';

            if (header) {
                title = header.querySelector('.title')?.textContent.trim() || title;
                inputFile = header.querySelector('.input-file')?.textContent.replace(/input/i, '').trim() || inputFile;
                outputFile = header.querySelector('.output-file')?.textContent.replace(/output/i, '').trim() || outputFile;
                timeLimit = header.querySelector('.time-limit')?.textContent.replace(/time limit per test/i, '').trim() || timeLimit;
                memoryLimit = header.querySelector('.memory-limit')?.textContent.replace(/memory limit per test/i, '').trim() || memoryLimit;
                header.remove();
            }

            // Inject modern title
            const h2 = document.createElement('h2');
            h2.className = 'pc2-modern-title';
            h2.textContent = title;
            prob.insertBefore(h2, prob.firstChild);

            // Inject metadata pills
            const meta = document.createElement('div');
            meta.className = 'problem-metadata';
            meta.innerHTML = `
                <span class="meta-tag"><strong>Input:</strong> ${inputFile}</span>
                <span class="meta-tag"><strong>Output:</strong> ${outputFile}</span>
                <span class="meta-tag"><strong>Time Limit:</strong> ${timeLimit}</span>
                <span class="meta-tag"><strong>Memory Limit:</strong> ${memoryLimit}</span>`;
            prob.insertBefore(meta, prob.firstChild.nextSibling);

            // Remove redundant CF section titles inside I/O blocks
            prob.querySelectorAll('.input .title, .output .title').forEach(el => el.remove());

            // Pre-render all $$$...$$$  into static KaTeX HTML
            return renderMath(prob.outerHTML);

        } catch (err) {
            if (retries > 0) {
                await new Promise(r => setTimeout(r, 400));
                return fetchProblem(url, retries - 1);
            }
            return null;
        }
    }

    // ── I/O sample table builder ──────────────────────────────────────────────
    function buildSamplesTable(probEl) {
        const inputs = probEl.querySelectorAll('.input');
        const outputs = probEl.querySelectorAll('.output');
        if (!inputs.length || !outputs.length) return;

        // Strip CF alternating-row classes (they carry background colours we don't want)
        probEl.querySelectorAll('.test-example-line-even, .test-example-line-odd').forEach(el => {
            el.classList.remove('test-example-line-even', 'test-example-line-odd');
        });

        const table = document.createElement('table');
        table.className = 'samples-table';

        const headRow = table.insertRow();
        ['Standard Input', 'Standard Output'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headRow.appendChild(th);
        });

        const count = Math.min(inputs.length, outputs.length);
        for (let j = 0; j < count; j++) {
            const row = table.insertRow();
            [inputs[j], outputs[j]].forEach(el => {
                const cell = row.insertCell();
                if (el) {
                    const pre = el.querySelector('pre') || el;
                    cell.appendChild(pre.cloneNode(true));
                }
            });
        }

        const sample = probEl.querySelector('.sample-tests') || probEl.querySelector('.sample-test');
        if (sample) {
            sample.parentNode.insertBefore(table, sample.nextSibling);
            sample.remove();
        } else {
            probEl.appendChild(table);
        }
    }

    // ── Main export ───────────────────────────────────────────────────────────
    async function exportAllToPDF() {
        if (!State.problems || State.problems.length === 0) {
            UI.showToast('No problems available to print.');
            return;
        }

        UI.showToast('Fetching problems…', true);

        // Load KaTeX FIRST — fetchProblem uses it to pre-render math
        try {
            await loadKaTeX();
        } catch (e) {
            console.warn('[PC2] KaTeX failed to load; math will appear as raw $$$…$$$ text.', e);
        }

        const links = State.problems.map(
            p => `https://codeforces.com${State.contestPath}/problem/${p.letter}`
        );
        const rawHTMLs = await Promise.all(links.map(url => fetchProblem(url)));

        // Assemble and post-process in a scratch div
        const scratch = document.createElement('div');
        scratch.innerHTML = rawHTMLs
            .map((html, i) => html
                || `<div><h2 class="pc2-modern-title">Problem ${State.problems[i].letter} — failed to load.</h2></div>`)
            .join('');

        scratch.querySelectorAll('.problem-statement').forEach(p => buildSamplesTable(p));

        const sections = Array.from(scratch.querySelectorAll('.problem-statement'))
            .map(el => `<div class="problem-wrap">${el.outerHTML}</div>`)
            .join('');

        // ── Read theme + custom CSS from data attributes ───────────────────────
        // inject-env.js (isolated world) bridges these from chrome.storage.local
        // because print.js runs in the MAIN world where chrome.* is unavailable.
        const themeId   = document.documentElement.getAttribute('data-pc2-pdf-theme') || 'clean';
        const customCss = document.documentElement.getAttribute('data-pc2-custom-print-css') || '';

        const theme     = (window.PC2.PDF_THEMES || {})[themeId]
                       || (window.PC2.PDF_THEMES || {})['clean']
                       || { css: '' };

        const basePageCss = `
            *, *::before, *::after { box-sizing: border-box; }
            @page { margin: 0; }
            @media print {
                body { padding: 15mm; }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                .katex-display { overflow: visible !important; }
            }
        `;

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Contest ${State.contestId} \u2014 Problems</title>
<link rel="stylesheet" href="${KATEX_CSS}">
<style>
${basePageCss}
${theme.css}
${customCss}
</style>
</head>
<body>
${sections}
<script>
window.addEventListener('load', function () {
    setTimeout(function () { window.print(); }, 250);
});
<\/script>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, '_blank', 'width=960,height=720');

        if (!win) {
            UI.showToast('Popup blocked — allow popups for Codeforces and try again.');
            return;
        }

        // Cleanup the blob URL after a short delay so memory is freed
        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    }

    return { exportAllToPDF };
})();
