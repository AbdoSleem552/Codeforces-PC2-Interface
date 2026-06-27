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
            // First, try fetching the main contest dashboard page, which contains the questions table.
            let html = await fetch(`https://codeforces.com${State.contestPath}`, { credentials: 'include' }).then(r => r.text());
            let doc = new DOMParser().parseFromString(html, 'text/html');
            let table = doc.querySelector('table.problem-questions-table') || doc.querySelector('table.datatable') || doc.querySelector('table');
            
            // Fallback to State.contestPath + '/questions' if table is not found
            if (!table || !table.querySelector('tr.problem-question, tr:not(:first-child)')) {
                const altHtml = await fetch(`https://codeforces.com${State.contestPath}/questions`, { credentials: 'include' }).then(r => r.text());
                const altDoc = new DOMParser().parseFromString(altHtml, 'text/html');
                const altTable = altDoc.querySelector('table.problem-questions-table') || altDoc.querySelector('table.datatable') || altDoc.querySelector('table');
                if (altTable) {
                    table = altTable;
                    html = altHtml;
                    doc = altDoc;
                }
            }

            if (!table) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No clarifications found</td></tr>';
                return;
            }
            
            const rows = table.querySelectorAll('tr.problem-question, tr:not(:first-child)');
            tbody.innerHTML = '';
            let count = 0;
            const clarsList = [];

            rows.forEach((row, idx) => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 3) return;
                
                let timeText = '';
                let problemLetter = 'General';
                let questionText = '';
                let answerText = '';
                let clarId = idx + 1;

                if (cells.length === 3) {
                    // 3-column layout: Time | Question | Answer
                    timeText = cells[0].textContent.trim();

                    const questionDiv = cells[1].querySelector('.question-content') || cells[1];
                    if (questionDiv) {
                        // Replace <br> tags with a separator so we can split
                        const clone = questionDiv.cloneNode(true);
                        clone.querySelectorAll('br').forEach(br => br.replaceWith('*****'));
                        const text = clone.textContent.trim();
                        let headerText = '';
                        let bodyText = '';

                        if (text.includes('*****')) {
                            const parts = text.split('*****');
                            headerText = parts[0].trim();
                            bodyText = parts.slice(1).join(' ').replace(/\s+/g, ' ').trim();
                        } else {
                            const bEl = questionDiv.querySelector('b');
                            if (bEl) {
                                headerText = bEl.textContent.trim();
                                const temp = questionDiv.cloneNode(true);
                                const tempB = temp.querySelector('b');
                                if (tempB) tempB.remove();
                                bodyText = temp.textContent.trim();
                            } else {
                                bodyText = text;
                            }
                        }

                        // Extract problem letter from headerText or bodyText
                        let matchedLetter = null;
                        const headerMatch = headerText.match(/^(?:Problem\s+)?([A-Z0-9]+)\b/i);
                        if (headerMatch) {
                            matchedLetter = headerMatch[1].toUpperCase();
                        } else {
                            const bodyMatch = bodyText.match(/^(?:Problem\s+)?([A-Z0-9]+)\b/i);
                            if (bodyMatch) {
                                matchedLetter = bodyMatch[1].toUpperCase();
                            }
                        }

                        if (matchedLetter && matchedLetter !== 'GENERAL') {
                            problemLetter = matchedLetter;
                        }

                        questionText = bodyText || headerText;
                    }

                    const responseDiv = cells[2].querySelector('.question-response') || cells[2];
                    if (responseDiv) {
                        // Extract actual answer, cleaning up header and separator if present
                        const clone = responseDiv.cloneNode(true);
                        clone.querySelectorAll('br').forEach(br => br.replaceWith('*****'));
                        const rawAnswer = clone.textContent.trim();
                        if (rawAnswer.includes('*****')) {
                            const parts = rawAnswer.split('*****');
                            answerText = parts.slice(1).join(' ').replace(/\s+/g, ' ').trim();
                        } else {
                            answerText = responseDiv.textContent.trim();
                        }

                        const qIdAttr = responseDiv.getAttribute('data-question-id');
                        if (qIdAttr) {
                            clarId = qIdAttr;
                        }
                    }
                } else {
                    // 4+ column layout (old fallback)
                    timeText = cells[0].textContent.trim();
                    const probText = cells[1].textContent.trim();
                    problemLetter = probText.includes('-') ? probText.split('-')[0].trim() : probText;
                    questionText = cells[2].textContent.trim();
                    answerText = cells[3] ? cells[3].textContent.trim() : '';
                }
                
                const status = answerText ? 'Answered' : 'Pending';

                clarsList.push({
                    site: 'Site 1',
                    team: 'Team 1',
                    id: clarId,
                    time: timeText,
                    status: status,
                    problem: problemLetter,
                    question: questionText || 'Announcement',
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
        if (!text || !text.trim()) throw new Error('Please enter your question.');
        if (!State.csrfToken) throw new Error('CSRF token not found.');

        let postUrl = '/data/newProblemQuestion';
        const groupMatch = State.contestPath.match(/^\/group\/([a-zA-Z0-9_-]+)/);
        if (groupMatch) {
            postUrl = `/group/${groupMatch[1]}/data/newProblemQuestion`;
        }

        const params = new URLSearchParams();
        params.append('csrf_token', State.csrfToken);
        params.append('contestId', State.contestId);
        params.append('submittedProblemIndex', problemLetter === 'General' ? '' : problemLetter);
        params.append('question', text);
        if (State.ftaa) params.append('ftaa', State.ftaa);
        if (State.bfaa) params.append('bfaa', State.bfaa);

        const resp = await fetch(`https://codeforces.com${postUrl}`, {
            method: 'POST',
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Csrf-Token': State.csrfToken
            },
            credentials: 'include'
        });

        if (!resp.ok) {
            throw new Error('Server returned status ' + resp.status);
        }

        let data;
        try {
            data = await resp.json();
        } catch(e) {
            // Assume success if status is 200 but response is not JSON
            return;
        }

        let hasError = false;
        let errorMessage = '';

        if (data) {
            if (data.success === "false" || data.success === false) {
                hasError = true;
                errorMessage = data.message || 'Failed to submit question.';
            } else {
                // Check for keys starting with error__
                for (const key of Object.keys(data)) {
                    if (key.startsWith('error__') && data[key]) {
                        hasError = true;
                        errorMessage = data[key];
                        break;
                    }
                }
            }
        }

        if (hasError) {
            throw new Error(errorMessage || 'Failed to submit question.');
        }
    }

    return {
        pollVerdict,
        fetchRuns,
        fetchClarifications,
        submitClarification
    };
})();
