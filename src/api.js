window.PC2 = window.PC2 || {};

window.PC2.API = (function() {
    const State = window.PC2.State;
    const UI = window.PC2.UI;

    function mapVerdictText(raw) {
        const l = raw.toLowerCase();
        if (l === 'accepted') return { text: 'Correct', color: '#00cc00' };
        if (l.startsWith('wrong answer')) return { text: 'No - Wrong Answer', color: '#cc0000' };
        if (l.startsWith('time limit')) return { text: 'No - Time-limit Exceeded', color: '#cc0000' };
        if (l.startsWith('memory limit')) return { text: 'No - Memory Limit Exceeded', color: '#cc0000' };
        if (l.startsWith('runtime error')) return { text: 'No - Run-time Error', color: '#cc0000' };
        if (l.startsWith('compilation err')) return { text: 'No - Compilation Error', color: '#cc0000' };
        if (l.startsWith('output limit')) return { text: 'No - Output Limit Exceeded', color: '#cc0000' };
        if (l.startsWith('idleness limit')) return { text: 'No - Idleness Limit Exceeded', color: '#cc0000' };
        if (l === 'hacked') return { text: 'No - Hacked', color: '#cc0000' };
        if (l.startsWith('partial')) return { text: 'Partial', color: '#dd8800' };
        if (l === 'skipped') return { text: 'Skipped', color: '#888888' };
        return null;
    }

    function isVerdictPending(raw) {
        const l = raw.toLowerCase();
        return !raw || l === 'in queue' || l.startsWith('running') || l.startsWith('waiting') || l.startsWith('testing');
    }

    function pollVerdict(runId, problem, language) {
        if (!runId || runId === '—') return;

        const MAX_ATTEMPTS = 40;
        let attempts = 0;

        async function check() {
            attempts++;
            if (attempts > MAX_ATTEMPTS) return;

            try {
                const html = await fetch(
                    `https://codeforces.com${State.contestPath}/my`,
                    { credentials: 'include', redirect: 'follow' }
                ).then(r => r.text());

                const doc = new DOMParser().parseFromString(html, 'text/html');
                const rows = doc.querySelectorAll('tr');
                let verdictText = null;

                for (const row of rows) {
                    const cells = row.querySelectorAll('td');
                    if (cells.length < 6) continue;
                    if (cells[0].textContent.trim() === String(runId)) {
                        verdictText = cells[5].textContent.trim();
                        break;
                    }
                }

                if (verdictText === null || isVerdictPending(verdictText)) {
                    // Still judging
                } else {
                    const mapped = mapVerdictText(verdictText);
                    UI.showVerdictDialog({
                        runId, problem, language,
                        verdictText: mapped ? mapped.text : verdictText,
                        verdictColor: mapped ? mapped.color : '#cc0000'
                    });
                    return; 
                }
            } catch (_) {}

            setTimeout(check, 3000);
        }
        setTimeout(check, 2500);
    }

    async function fetchRuns() {
        const tbody = document.getElementById('runs-tbody');
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading runs...</td></tr>';
        try {
            const html = await fetch(`https://codeforces.com${State.contestPath}/my`, { credentials: 'include' }).then(r => r.text());
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const rows = doc.querySelectorAll('table.status-frame-datatable tr[data-submission-id]');

            tbody.innerHTML = '';
            let count = 0;

            rows.forEach(row => {
                const runId = row.getAttribute('data-submission-id');
                const timeCell = row.querySelector('.status-small .format-time');
                let timeText = timeCell ? timeCell.textContent.trim() : '';
                if (timeText.includes(' ')) timeText = timeText.split(' ').pop(); 

                const probLink = row.querySelector('td[data-problemId] a');
                let probLetter = '';
                if (probLink) {
                    const match = probLink.href.match(/\/problem\/([A-Z0-9]+)/i);
                    probLetter = match ? match[1] : probLink.textContent.trim().split('-')[0].trim();
                }

                const langCell = row.querySelectorAll('td')[4];
                let langText = langCell ? langCell.textContent.trim() : '';
                if (langText.includes('C++')) langText = 'GNU C++';

                const verdictCell = row.querySelector('.status-verdict-cell');
                const rawVerdict = verdictCell ? verdictCell.textContent.trim() : '';
                const mapped = mapVerdictText(rawVerdict);
                let pc2Verdict = 'Pending';
                if (mapped) pc2Verdict = mapped.text;
                else if (isVerdictPending(rawVerdict)) pc2Verdict = 'NEW';
                else pc2Verdict = rawVerdict;

                count++;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>Site 1</td>
                    <td>${runId}</td>
                    <td>${probLetter}</td>
                    <td>${timeText}</td>
                    <td>${pc2Verdict}</td>
                    <td></td>
                    <td>${langText}</td>
                `;
                tbody.appendChild(tr);
            });

            if (count === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No runs found</td></tr>';
            }
            document.getElementById('runs-count').textContent = count;
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Failed to load runs</td></tr>';
        }
    }

    async function fetchClarifications() {
        const tbody = document.getElementById('clars-tbody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Loading clarifications...</td></tr>';
        try {
            const html = await fetch(`https://codeforces.com${State.contestPath}/questions`, { credentials: 'include' }).then(r => r.text());
            const doc = new DOMParser().parseFromString(html, 'text/html');
            
            const table = doc.querySelector('table.datatable') || doc.querySelector('table');
            if (!table) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No clarifications found</td></tr>';
                return;
            }
            
            const rows = table.querySelectorAll('tr:not(:first-child)');
            tbody.innerHTML = '';
            let count = 0;
            const clarsList = [];

            rows.forEach((row, idx) => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 3) return;
                
                // Codeforces questions columns:
                // Column 0: When
                // Column 1: Problem (e.g. "A - Problem Title" or "General")
                // Column 2: Question text
                // Column 3: Answer text (if present)
                const timeText = cells[0].textContent.trim();
                const probText = cells[1].textContent.trim();
                const problemLetter = probText.includes('-') ? probText.split('-')[0].trim() : probText;
                const questionText = cells[2].textContent.trim();
                const answerText = cells[3] ? cells[3].textContent.trim() : '';
                
                const clarId = idx + 1;
                const status = answerText ? 'Answered' : 'Pending';

                clarsList.push({
                    site: 'Site 1',
                    team: 'Team 1',
                    id: clarId,
                    time: timeText,
                    status: status,
                    problem: problemLetter,
                    question: questionText,
                    answer: answerText
                });
                count++;
            });

            State.clarifications = clarsList;

            clarsList.forEach(c => {
                const tr = document.createElement('tr');
                tr.dataset.id = c.id;
                tr.style.cursor = 'pointer';
                tr.innerHTML = `
                    <td>${c.site}</td>
                    <td>${c.team}</td>
                    <td>${c.id}</td>
                    <td>${c.time}</td>
                    <td>${c.status}</td>
                    <td>${c.problem}</td>
                    <td style="max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.question}</td>
                    <td style="max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.answer || '—'}</td>
                `;
                tbody.appendChild(tr);
            });

            if (count === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No clarifications found</td></tr>';
            }
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:red;">Failed to load clarifications</td></tr>';
        }
    }

    async function submitClarification(problemLetter, text) {
        if (!problemLetter) throw new Error('Please select a problem.');
        if (!text || !text.trim()) throw new Error('Please enter your question.');
        if (!State.csrfToken) throw new Error('CSRF token not found.');

        const fd = new FormData();
        fd.append('csrf_token', State.csrfToken);
        fd.append('action', 'askQuestion');
        fd.append('submittedProblemIndex', problemLetter);
        fd.append('text', text);

        // Fetch ftaa and bfaa from document context if they are empty
        const ftaaVal = State.ftaa || window._ftaa || '';
        const bfaaVal = State.bfaa || window._bfaa || '';
        fd.append('ftaa', ftaaVal);
        fd.append('bfaa', bfaaVal);

        const resp = await fetch(
            `https://codeforces.com${State.contestPath}/questions`,
            { method: 'POST', body: fd, credentials: 'include' }
        );

        if (!resp.ok) {
            throw new Error('Server returned status ' + resp.status);
        }
    }

    return {
        pollVerdict,
        fetchRuns,
        fetchClarifications,
        submitClarification
    };
})();
