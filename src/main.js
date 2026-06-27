window.PC2 = window.PC2 || {};

window.PC2.Main = (function () {
    const State = window.PC2.State;
    const UI = window.PC2.UI;
    const API = window.PC2.API;

    if (!State.isContestPage) return {};

    function wireEvents() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.name = 'sourceFile';
        fileInput.style.cssText = 'position:fixed;top:-300px;left:-300px;width:1px;height:1px;opacity:0;';
        document.body.appendChild(fileInput);

        const fileDisplay = document.getElementById('file-display');

        document.getElementById('select-file-btn').addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', () => {
            const name = fileInput.files[0]?.name || '';
            fileDisplay.textContent = name || 'No file selected';
            fileDisplay.classList.toggle('empty', !name);
            document.getElementById('status-file').textContent = 'File: ' + (name || '—');
        });

        document.getElementById('problem-select').addEventListener('change', function () {
            document.getElementById('status-problem').textContent =
                'Problem: ' + (this.value ? this.options[this.selectedIndex].textContent : '—');
        });

        document.getElementById('language-select').addEventListener('change', function () {
            document.getElementById('status-lang').textContent =
                'Language: ' + (this.value ? this.options[this.selectedIndex].textContent : '—');
        });

        document.getElementById('print-all-btn').addEventListener('click', () => {
            const btn = document.getElementById('print-all-btn');
            btn.disabled = true;
            btn.innerHTML = '<span style="font-size: 13px; line-height: 1;">⌛</span> Wait...';
            window.PC2.Print.exportAllToPDF().finally(() => {
                btn.disabled = false;
                btn.innerHTML = '<span style="font-size: 13px; line-height: 1;">🖨️</span> Print Statement';
            });
        });

        document.getElementById('exit-btn').addEventListener('click', () => {
            if (confirm('Exit PC^2?')) history.back();
        });

        // Clarifications wiring
        const clarsTbody = document.getElementById('clars-tbody');
        if (clarsTbody) {
            clarsTbody.addEventListener('click', (e) => {
                const tr = e.target.closest('tr');
                if (!tr || !tr.dataset.id) return;
                
                clarsTbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected-row'));
                tr.classList.add('selected-row');

                const clarId = tr.dataset.id;
                const clar = (State.clarifications || []).find(c => String(c.id) === String(clarId));
                if (clar) {
                    document.getElementById('clar-question-text').value = clar.question;
                    document.getElementById('clar-answer-text').value = clar.answer || '—';
                }
            });
        }

        const submitClarBtn = document.getElementById('submit-clar-btn');
        if (submitClarBtn) {
            submitClarBtn.addEventListener('click', () => {
                const probSelect = document.getElementById('request-clar-problem-select');
                const textEl = document.getElementById('request-clar-text');
                const problemLetter = probSelect ? probSelect.value : '';
                const text = textEl ? textEl.value : '';

                if (!problemLetter) {
                    UI.showToast('Please select a problem.');
                    return;
                }
                if (!text.trim()) {
                    UI.showToast('Please enter your question.');
                    return;
                }

                submitClarBtn.disabled = true;
                const originalText = submitClarBtn.textContent;
                submitClarBtn.textContent = 'Submitting...';

                API.submitClarification(problemLetter, text)
                    .then(() => {
                        UI.showToast('Clarification requested successfully!', true);
                        textEl.value = '';
                        const viewClarsTab = document.querySelector('[data-target="tab-view-clars"]');
                        if (viewClarsTab) viewClarsTab.click();
                    })
                    .catch(err => {
                        UI.showToast(err.message || 'Failed to submit clarification.');
                    })
                    .finally(() => {
                        submitClarBtn.disabled = false;
                        submitClarBtn.textContent = originalText;
                    });
            });
        }

        const clarsFilterBtn = document.getElementById('clars-filter-btn');
        if (clarsFilterBtn) {
            clarsFilterBtn.addEventListener('click', () => {
                API.fetchClarifications();
                document.getElementById('clar-question-text').value = '';
                document.getElementById('clar-answer-text').value = '';
                UI.showToast('Refreshing clarifications...', true);
            });
        }

        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                if (!tab.dataset.target) return;

                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(tab.dataset.target).classList.add('active');

                if (tab.dataset.target === 'tab-runs') {
                    API.fetchRuns();
                }

                if (tab.dataset.target === 'tab-view-clars') {
                    API.fetchClarifications();
                    document.getElementById('clar-question-text').value = '';
                    document.getElementById('clar-answer-text').value = '';
                }
            });
        });

        const optFancyBg = document.getElementById('opt-fancy-bg');
        const optScale = document.getElementById('opt-scale');
        const optScaleVal = document.getElementById('opt-scale-val');
        const optScaleReset = document.getElementById('opt-scale-reset');

        const resizer = document.getElementById('app-resizer');
        const appWin = document.getElementById('app-window');

        const savedScale = parseFloat(localStorage.getItem('pc2_scale') || '1.0');
        const savedFancyBg = localStorage.getItem('pc2_fancy_bg') !== 'false';

        optScale.value = savedScale;
        optFancyBg.checked = savedFancyBg;

        if (savedFancyBg) document.body.classList.add('fancy-bg');

        optFancyBg.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            localStorage.setItem('pc2_fancy_bg', isChecked);
            if (isChecked) document.body.classList.add('fancy-bg');
            else document.body.classList.remove('fancy-bg');
        });

        const applyScale = (scale) => {
            optScaleVal.textContent = Math.round(scale * 100) + '%';
            appWin.style.transform = `scale(${scale})`;
            resizer.style.width = (620 * scale) + 'px';
            resizer.style.height = (appWin.offsetHeight * scale) + 'px';
        };

        optScale.addEventListener('input', (e) => {
            const scale = parseFloat(e.target.value);
            localStorage.setItem('pc2_scale', scale);
            applyScale(scale);
        });

        optScaleReset.addEventListener('click', () => {
            optScale.value = '1.0';
            localStorage.setItem('pc2_scale', '1.0');
            applyScale(1.0);
        });

        let lastH = 0;
        const ro = new ResizeObserver(() => {
            const currentH = appWin.offsetHeight;
            if (currentH !== lastH) {
                lastH = currentH;
                applyScale(parseFloat(optScale.value));
            }
        });
        ro.observe(appWin);

        applyScale(savedScale);

        if (State.isCountdown) {
            const timeLeftEl = document.querySelector('.time-left');

            if (State.isBeforeContest) {
                document.getElementById('submit-btn').disabled = true;
                document.getElementById('problem-select').disabled = true;
                document.getElementById('select-file-btn').disabled = true;
            }

            function updateTime() {
                if (State.countdownSeconds <= 0) {
                    timeLeftEl.textContent = State.isBeforeContest ? 'STARTED' : 'FINISHED';
                    if (State.countdownRedirect) window.location.href = State.countdownRedirect;
                    else window.location.reload();
                    return;
                }
                State.countdownSeconds--;
                let s = State.countdownSeconds;
                let d = Math.floor(s / 86400); s %= 86400;
                let h = Math.floor(s / 3600); s %= 3600;
                let m = Math.floor(s / 60); s %= 60;
                let str = '';
                if (d > 0) str += d + 'd ';
                str += String(h).padStart(2, '0') + ':';
                str += String(m).padStart(2, '0') + ':';
                str += String(s).padStart(2, '0');

                timeLeftEl.textContent = State.isBeforeContest ? ('Starts in: ' + str) : ('Time Left: ' + str);

                setTimeout(updateTime, 1000);
            }
            updateTime();
        }

        document.getElementById('submit-btn').addEventListener('click', () => {
            const problemLetter = document.getElementById('problem-select').value;
            const programTypeId = document.getElementById('language-select').value;
            const langSel = document.getElementById('language-select');
            const langText = langSel.options[langSel.selectedIndex].dataset.short
                || langSel.options[langSel.selectedIndex].textContent;

            if (!problemLetter) { UI.showToast('Please select a problem.'); return; }
            if (!programTypeId) { UI.showToast('Please select a language.'); return; }
            if (!fileInput.files?.length) { UI.showToast('Please select a source file.'); return; }
            if (!State.contestPath) { UI.showToast('Contest path not found.'); return; }
            if (!State.csrfToken) { UI.showToast('CSRF token not found — try reloading.'); return; }

            const filename = fileInput.files[0].name;

            UI.showConfirmDialog({
                problem: problemLetter,
                language: langText,
                filename: filename,
                onConfirm: async () => {
                    const btn = document.getElementById('submit-btn');
                    btn.disabled = true;
                    btn.textContent = 'Submitting...';

                    try {
                        const fd = new FormData();
                        fd.append('csrf_token', State.csrfToken);
                        fd.append('ftaa', State.ftaa);
                        fd.append('bfaa', State.bfaa);
                        fd.append('turnstileToken', '');
                        fd.append('action', 'submitSolutionFormSubmitted');
                        fd.append('submittedProblemIndex', problemLetter);
                        fd.append('programTypeId', programTypeId);
                        fd.append('source', '');
                        fd.append('sourceFile', fileInput.files[0]);

                        const adcd1e = 'caf4f' + Math.random().toString(36).substr(2, 9);

                        const submitResp = await fetch(
                            `https://codeforces.com${State.contestPath}/problem/${problemLetter}` +
                            `?csrf_token=${State.csrfToken}&adcd1e=${adcd1e}`,
                            { method: 'POST', body: fd, credentials: 'include', redirect: 'manual' }
                        );

                        if (submitResp.type !== 'opaqueredirect' && !submitResp.ok && submitResp.status !== 0) {
                            throw new Error('Server returned status ' + submitResp.status);
                        }

                        await new Promise(r => setTimeout(r, 900));

                        let runId = '—';
                        try {
                            const myHtml = await fetch(
                                `https://codeforces.com${State.contestPath}/my`,
                                { credentials: 'include' }
                            ).then(r => r.text());

                            const doc = new DOMParser().parseFromString(myHtml, 'text/html');
                            const cell = doc.querySelector('table[class*="status"] tr:not(:first-child) td:first-child');
                            if (cell) runId = cell.textContent.trim();
                        } catch (_) {}

                        UI.showDialog({ runId, problem: problemLetter, language: langText });
                        API.pollVerdict(runId, problemLetter, langText);

                    } catch (err) {
                        UI.showToast('Submission error: ' + (err.message || 'Unknown'));
                    } finally {
                        btn.disabled = false;
                        btn.textContent = 'Submit';
                    }
                }
            });
        });
    }

    function run() {
        window.addEventListener('beforeunload', e => { e.stopImmediatePropagation(); }, true);
        window.addEventListener('unload', e => { e.stopImmediatePropagation(); }, true);

        document.title = 'PC^2 TEAM 1 (Site 1) [RUNNING]';
        while (document.head.firstChild) document.head.removeChild(document.head.firstChild);
        const mc = document.createElement('meta'); mc.setAttribute('charset', 'UTF-8');
        document.head.appendChild(mc);

        UI.injectStyles();
        UI.buildBody();
        wireEvents();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }

    return { run };
})();
