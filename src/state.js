window.PC2 = window.PC2 || {};

window.PC2.State = (function () {
    const _path = window.location.pathname;
    
    const contestRegex = /^\/(contest|gym)\/(\d+)(\/countdown)?\/?$/;
    const groupContestRegex = /^\/group\/([a-zA-Z0-9_-]+)\/contest\/(\d+)(\/countdown)?\/?$/;
    const isContestPage = contestRegex.test(_path) || groupContestRegex.test(_path);

    if (!isContestPage) return { isContestPage: false };

    let contestPath = '';
    let contestId = '';
    const contestMatch = _path.match(/^\/(contest|gym)\/(\d+)/);
    const groupContestMatch = _path.match(/^\/group\/([a-zA-Z0-9_-]+)\/contest\/(\d+)/);
    
    if (contestMatch) {
        contestPath = contestMatch[0];
        contestId = contestMatch[2];
    } else if (groupContestMatch) {
        contestPath = groupContestMatch[0];
        contestId = groupContestMatch[2];
    }

    const csrfToken = (document.querySelector('meta[name="X-Csrf-Token"]') || {}).content || '';
    const ftaa = window._ftaa || '';
    const bfaa = window._bfaa || '';

    let countdownEl = null;
    document.querySelectorAll('.countdown').forEach(el => {
        if (el.textContent.includes(':')) {
            countdownEl = el;
        }
    });
    let isCountdown = !!countdownEl;
    let countdownRedirect = isCountdown ? countdownEl.getAttribute('redirectUrl') : '';
    let countdownSeconds = 0;

    if (isCountdown) {
        const text = countdownEl.textContent.trim();
        const parts = text.split(':');
        let sec = 0;
        if (parts.length > 0) sec += parseInt(parts.pop() || 0, 10);
        if (parts.length > 0) sec += parseInt(parts.pop() || 0, 10) * 60;
        if (parts.length > 0) {
            let hrStr = parts.pop() || "0";
            let days = 0;
            if (hrStr.includes('day')) {
                const dayParts = hrStr.split(/days?/i);
                days = parseInt(dayParts[0].trim() || 0, 10);
                hrStr = dayParts[1].trim();
            }
            sec += parseInt(hrStr || 0, 10) * 3600;
            sec += days * 86400;
        }
        countdownSeconds = sec;
    }

    const problems = [];
    document.querySelectorAll('table.problems tr').forEach(row => {
        const idCell = row.querySelector('td.id');
        const nameLink = row.querySelector('td:nth-child(2) div[style*="float"] a');
        if (idCell && nameLink) {
            const letter = idCell.textContent.trim();
            const name = nameLink.textContent.trim();
            if (letter && name) problems.push({ letter, name });
        }
    });

    const isBeforeContest = isCountdown && problems.length === 0;
    const isContestRunning = isCountdown && problems.length > 0;

    return {
        isContestPage,
        contestId,
        contestPath,
        csrfToken,
        ftaa,
        bfaa,
        isCountdown,
        countdownRedirect,
        countdownSeconds,
        problems,
        isBeforeContest,
        isContestRunning
    };
})();
