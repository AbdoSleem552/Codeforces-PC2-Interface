window.PC2 = window.PC2 || {};

window.PC2.State = (function() {
    const _path = window.location.pathname;
    const isContestPage = /^\/contest\/\d+\/?$/.test(_path) || /^\/contest\/\d+\/countdown\/?$/.test(_path);

    if (!isContestPage) return { isContestPage: false };

    const contestId = (_path.match(/\/contest\/(\d+)/) || [])[1] || '';
    const csrfToken = (document.querySelector('meta[name="X-Csrf-Token"]') || {}).content || '';
    const ftaa = window._ftaa || '';
    const bfaa = window._bfaa || '';

    const countdownEl = document.querySelector('.countdown');
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
