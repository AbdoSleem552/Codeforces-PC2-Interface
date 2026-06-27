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

            // ── KEY STEP: pre-render all $$$...$$$  into static KaTeX HTML ──
            // The returned string is pure HTML with no $$$ delimiters left.
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

        // Open a self-contained print window.
        // Because math is already static KaTeX HTML, all we need is the KaTeX CSS.
        // No JavaScript math engine is needed — the window can print immediately on load.

        const css = `
            *, *::before, *::after { box-sizing: border-box; }

            body {
                margin: 0;
                padding: 40px;
                background: #fff;
                color: #1f2937;
                font-family: "Times New Roman", Times, serif;
                font-size: 15px;
                line-height: 1.6;
            }

            .problem-wrap {
                max-width: 860px;
                margin: 0 auto;
            }
            .problem-wrap + .problem-wrap {
                page-break-before: always;
            }

            /* ── Modern title & pills ── */
            .pc2-modern-title {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                font-size: 1.75rem;
                font-weight: 700;
                color: #111827;
                margin: 0 0 1rem 0;
                padding-bottom: 0.5rem;
                border-bottom: 2px solid #e5e7eb;
            }
            .problem-metadata {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                display: flex;
                flex-wrap: wrap;
                gap: 0.75rem;
                margin-bottom: 2rem;
            }
            .meta-tag {
                background: #f3f4f6;
                color: #4b5563;
                padding: 0.35rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.85rem;
                border: 1px solid #e5e7eb;
            }
            .meta-tag strong { color: #111827; font-weight: 600; }

            /* ── I/O sample table ── */
            .samples-table {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                overflow: hidden;
                margin: 1.5rem 0;
                table-layout: fixed;
            }
            .samples-table th {
                background: #f9fafb;
                font-weight: 600;
                text-align: left;
                padding: 0.75rem 1rem;
                border-bottom: 1px solid #d1d5db;
                color: #374151;
                width: 50%;
            }
            .samples-table th:first-child { border-right: 1px solid #d1d5db; }
            .samples-table td { padding: 1rem; vertical-align: top; }
            .samples-table td:first-child { border-right: 1px solid #d1d5db; }
            .samples-table pre {
                white-space: pre-wrap;
                word-wrap: break-word;
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                font-size: 0.875rem;
                margin: 0;
                color: #1f2937;
            }

            /* ── Body text ── */
            .problem-statement p { margin-bottom: 1rem; }
            .section-title {
                font-weight: bold;
                font-size: 1.1rem;
                margin: 1.2rem 0 0.5rem;
            }

            /* ── KaTeX display blocks ── */
            .katex-display { margin: 1rem 0; overflow-x: auto; }

            @page {
                margin: 0;
            }

            @media print {
                body { padding: 15mm; }
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .katex-display { overflow: visible !important; }
            }
        `;

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Contest ${State.contestId} \u2014 Problems</title>
<link rel="stylesheet" href="${KATEX_CSS}">
<style>${css}</style>
</head>
<body>
${sections}
<script>
// Math is already pre-rendered as static KaTeX HTML.
// Just wait for fonts to paint, then print.
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