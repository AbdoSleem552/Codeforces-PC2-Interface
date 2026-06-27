const _path = window.location.pathname;
if (/^\/contest\/\d+\/?$/.test(_path) || /^\/contest\/\d+\/countdown\/?$/.test(_path)) {

    // ── Extract page data before replacing DOM ──────────────────────────────────
    const contestId = (window.location.pathname.match(/\/contest\/(\d+)/) || [])[1] || '';
    const csrfToken = (document.querySelector('meta[name="X-Csrf-Token"]') || {}).content || '';
    const ftaa = window._ftaa || '';
    const bfaa = window._bfaa || '';

    // Check for countdown
    const countdownEl = document.querySelector('.countdown');
    let isCountdown = !!countdownEl;
    let countdownRedirect = isCountdown ? countdownEl.getAttribute('redirectUrl') : '';
    let countdownSeconds = 0;
    
    if (isCountdown) {
        const text = countdownEl.textContent.trim(); // "00:02:01" or "1 day 02:00:01"
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

    // ── Inject styles (no inline scripts = no CSP issue) ───────────────────────
    function injectStyles() {
        const s = document.createElement('style');
        s.textContent = `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #2c2c2c; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: 'Segoe UI', Tahoma, sans-serif; }
        .app-window { width: 620px; background: #e4e7ec; border: 1px solid #000; border-radius: 4px 4px 0 0; box-shadow: 0 6px 18px rgba(0,0,0,.6); overflow: hidden; }
        .title-bar { background: linear-gradient(to right,#1a3a6e,#2b4478); color: #fff; padding: 6px 8px; font-size: 12px; display: flex; justify-content: space-between; align-items: center; user-select: none; }
        .title-bar-text { font-weight: bold; display: flex; align-items: center; gap: 6px; }
        .title-bar-controls button { background: transparent; border: none; color: #fff; font-size: 13px; cursor: pointer; padding: 1px 6px; border-radius: 2px; }
        .title-bar-controls button:hover { background: rgba(255,255,255,.25); }
        .window-body { padding: 16px 18px; }
        .app-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
        .time-left { font-weight: bold; font-size: 13px; }
        .win-btn { background: linear-gradient(to bottom,#f8f8f8,#e8e8e8); border: 1px solid #888; border-top-color:#fff; border-left-color:#fff; padding: 4px 20px; font-size: 12px; cursor: pointer; color: #000; min-width: 75px; }
        .win-btn:hover { background: linear-gradient(to bottom,#fff,#eee); }
        .win-btn:active { border-top-color:#888; border-left-color:#888; border-bottom-color:#fff; border-right-color:#fff; background:#ddd; }
        .win-btn:disabled { color:#999; cursor:default; }
        .tabs { display: flex; flex-wrap: wrap; border-bottom: 2px solid #999; margin-bottom: 16px; }
        .tab { padding: 5px 13px; font-size: 12px; border: 1px solid #999; border-bottom: none; background: #f0f0f0; margin-right: 2px; margin-bottom: -2px; border-top-left-radius: 3px; border-top-right-radius: 3px; cursor: default; color: #444; }
        .tab.active { background: #cde1f5; border-bottom: 2px solid #cde1f5; font-weight: bold; color: #000; }
        .form-group { margin-bottom: 13px; }
        .form-label { font-size: 12px; color: #333; margin-bottom: 4px; display: block; font-weight: 600; }
        select { padding: 4px 5px; background: #cde1f5; border: 1px inset #7a7a7a; font-size: 12px; font-family: 'Segoe UI', Tahoma, sans-serif; width: 100%; max-width: 380px; cursor: pointer; }
        select:focus { outline: 1px solid #2b4478; }
        .file-row { display: flex; align-items: center; gap: 10px; }
        .file-display-box { flex: 1; max-width: 270px; height: 24px; background: #d0d4db; border: 1px inset #999; font-size: 11px; line-height: 24px; padding-left: 5px; color: #333; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        .file-display-box.empty { background: #e0e3e8; color: #aaa; font-style: italic; }
        .additional-files-box { border: 2px solid #888; height: 80px; background: #e4e7ec; margin-top: 14px; display: flex; flex-direction: column; }
        .additional-files-header { border-bottom: 1px solid #888; padding: 3px 6px; font-size: 12px; display: flex; justify-content: space-between; align-items: center; background: #d8dce3; }
        .scrollbar-fake { width: 15px; border-left: 1px solid #888; height: 55px; background: #f0f0f0; align-self: flex-end; }
        .action-buttons { display: flex; justify-content: center; gap: 50px; margin-top: 10px; margin-bottom: 18px; }
        .bottom-buttons { display: flex; justify-content: space-between; margin-top: 28px; padding-top: 10px; border-top: 1px solid #c0c0c0; }
        .status-bar { background: #d4d8df; border-top: 1px solid #999; padding: 3px 8px; font-size: 11px; color: #444; display: flex; flex-wrap: wrap; gap: 0; }
        .status-cell { border-right: 1px solid #aaa; padding: 0 10px 0 0; margin-right: 10px; }
        .status-cell:last-child { border-right: none; }
        #toast { display:none; position:fixed; bottom:40px; left:50%; transform:translateX(-50%); background:#b00020; color:#fff; padding:8px 18px; border-radius:3px; font-size:12px; z-index:9997; box-shadow:0 2px 8px rgba(0,0,0,.4); }
        #toast.ok { background:#1a6e1a; }

        /* ── PC2 Dialog (popup.html style) ── */
        .pc2-overlay { position:fixed; inset:0; background:rgba(0,0,0,.35); z-index:9998; }
        .pc2-dialog { position:fixed; width:330px; background:#eeeeee; border:1px solid #999; box-shadow:2px 2px 10px rgba(0,0,0,.3); border-radius:4px; overflow:hidden; color:#000; font-family:"Segoe UI",Tahoma,sans-serif; z-index:9999; }
        .pc2-header { display:flex; align-items:center; justify-content:space-between; padding:4px 8px; background:#f5f5f5; border-bottom:1px solid #ccc; cursor:grab; user-select:none; }
        .pc2-header:active { cursor:grabbing; }
        .pc2-header-title { font-size:12px; color:#555; display:flex; align-items:center; gap:5px; }
        .pc2-close { background:none; border:none; color:#888; font-size:16px; cursor:pointer; padding:0; line-height:1; }
        .pc2-close:hover { color:#f00; }
        .pc2-body { padding:20px; }
        .pc2-header-text { display:flex; align-items:center; font-size:18px; font-weight:bold; margin-bottom:25px; color:#333; }
        .info-icon { display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; background:#d8d8ff; border:2px solid #a8a8e0; color:#5555aa; border-radius:50%; font-weight:bold; font-family:serif; margin-right:15px; font-size:18px; flex-shrink:0; }
        .pc2-row { font-size:15px; font-weight:bold; margin-bottom:15px; margin-left:45px; }
        .val-blue { color:#0000dd; }
        .pc2-footer { display:flex; justify-content:center; padding-bottom:20px; }
        .pc2-ok-btn { background:#e0e0e0; border:1px solid #888; padding:4px 20px; font-family:inherit; font-size:12px; cursor:pointer; box-shadow:inset 1px 1px 0 #fff, inset -1px -1px 0 #aaa; }
        .pc2-ok-btn:active { box-shadow:inset 1px 1px 2px #aaa; }
        
        /* ── Tabs and Tables ── */
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .pc2-table-container { border: 1px solid #999; height: 300px; overflow-y: scroll; background: #e0e0e0; margin-bottom: 10px; }
        .pc2-table { width: 100%; border-collapse: collapse; font-size: 12px; font-family: 'Segoe UI', Tahoma, sans-serif; background: #e4e7ec; }
        .pc2-table th, .pc2-table td { border: 1px solid #999; padding: 3px 5px; text-align: left; white-space: nowrap; }
        .pc2-table th { background: #f0f0f0; font-weight: normal; position: sticky; top: 0; box-shadow: 0 1px 0 #999; }
        .pc2-table tr:nth-child(even) { background: #d8dce3; }
        .pc2-table tr:hover { background: #cde1f5; }
        `;
        document.head.appendChild(s);
    }

    // ── Build body HTML ─────────────────────────────────────────────────────────
    function buildBody() {
        let opts = '<option value="">Select Problem</option>';
        if (isBeforeContest) {
            opts = '<option value="">Contest not started</option>';
        } else {
            problems.forEach(({ letter, name }) => {
                opts += `<option value="${letter}">${letter} - ${name}</option>`;
            });
        }

        document.body.className = '';
        document.body.innerHTML = `
        <div class="app-window">
          <div class="title-bar">
            <div class="title-bar-text">&#9749; PC^2 TEAM 1 (Site 1) [RUNNING] 9.10.0-7065</div>
            <div class="title-bar-controls">
              <button>_</button><button>&#9633;</button><button id="btn-close">&#x2715;</button>
            </div>
          </div>
          <div class="window-body">
            <div class="app-header">
              <div class="time-left">${isCountdown ? '...' : 'FINISHED'}</div>
              <button class="win-btn" id="exit-btn">Exit</button>
            </div>
            <div class="tabs">
              <div class="tab active" data-target="tab-submit">Submit Run</div>
              <div class="tab" data-target="tab-runs">View Runs</div>
              <div class="tab">Request Clarification</div>
              <div class="tab">View Clarifications</div>
              <div class="tab">Options</div>
              <div class="tab" data-target="tab-about">About</div>
            </div>
            
            <div id="tab-submit" class="tab-content active">
              <div class="form-group">
                <span class="form-label">Problem</span>
                <select id="problem-select">${opts}</select>
              </div>
              <div class="form-group">
                <span class="form-label">Language</span>
                <select id="language-select">
                  <option value="">Select Language</option>
                  <option value="91" data-short="C++"     selected>GNU G++23 14.2 (64 bit, msys2)</option>
                  <option value="89" data-short="C++"            >GNU G++20 13.2 (64 bit, winlibs)</option>
                  <option value="54" data-short="C++"            >GNU G++17 7.3.0</option>
                  <option value="43" data-short="C"              >GNU GCC C11 5.1.0</option>
                  <option value="87" data-short="Java"           >Java 21 64bit</option>
                  <option value="36" data-short="Java"           >Java 8 32bit</option>
                  <option value="83" data-short="Kotlin"         >Kotlin 1.7.20</option>
                  <option value="88" data-short="Kotlin"         >Kotlin 1.9.21</option>
                  <option value="99" data-short="Kotlin"         >Kotlin 2.2.0</option>
                  <option value="31" data-short="Python 3"       >Python 3.13.2</option>
                  <option value="7"  data-short="Python 2"       >Python 2.7.18</option>
                  <option value="70" data-short="PyPy 3"         >PyPy 3.10 (7.3.15, 64bit)</option>
                  <option value="41" data-short="PyPy 3"         >PyPy 3.6.9 (7.3.0)</option>
                  <option value="75" data-short="Rust"           >Rust 1.89.0 (2021)</option>
                  <option value="98" data-short="Rust"           >Rust 1.89.0 (2024)</option>
                  <option value="96" data-short="C#"             >C# 13, .NET SDK 9</option>
                  <option value="79" data-short="C#"             >C# 10, .NET SDK 6.0</option>
                  <option value="32" data-short="Go"             >Go 1.22.2</option>
                  <option value="55" data-short="Node.js"        >Node.js 15.8.0 (64bit)</option>
                  <option value="67" data-short="Ruby"           >Ruby 3.2.2</option>
                </select>
              </div>
              <div class="form-group">
                <span class="form-label">Main File</span>
                <div class="file-row">
                  <div class="file-display-box empty" id="file-display">No file selected</div>
                  <button class="win-btn" id="select-file-btn">Select...</button>
                </div>
              </div>
              <div class="additional-files-box">
                <div class="additional-files-header">
                  <span>Additional Files</span>
                  <div class="scrollbar-fake"></div>
                </div>
              </div>
              <div class="action-buttons">
                <button class="win-btn">Add</button>
                <button class="win-btn">Remove</button>
              </div>
              <div class="bottom-buttons">
                <button class="win-btn">Test</button>
                <button class="win-btn" id="submit-btn">Submit</button>
              </div>
            </div>

            <div id="tab-runs" class="tab-content">
               <div style="display:flex; justify-content: flex-end; font-size: 11px; margin-bottom: 2px; font-weight: bold;"><span id="runs-count">0</span></div>
               <div class="pc2-table-container">
                 <table class="pc2-table">
                   <thead>
                     <tr>
                       <th>Site</th>
                       <th>Run Id</th>
                       <th>Problem</th>
                       <th>Time &#9652;</th>
                       <th>Status</th>
                       <th>Balloon</th>
                       <th>Language</th>
                     </tr>
                   </thead>
                   <tbody id="runs-tbody">
                     <tr><td colspan="7" style="text-align:center;">Loading...</td></tr>
                   </tbody>
                 </table>
               </div>
               <div style="text-align: center; margin-top: 10px; padding-bottom: 5px;">
                 <button class="win-btn">Filter</button>
               </div>
            </div>

            <div id="tab-about" class="tab-content" style="padding: 25px 30px;">
              <div style="display: flex; gap: 20px; align-items: flex-start;">
                <div style="font-size: 48px;">&#9749;</div>
                <div style="flex-grow: 1;">
                  <h2 style="font-size: 16px; margin-bottom: 12px; color: #000;">PC^2 Contest Control System</h2>
                  <div style="background: #fff; border: 1px solid #999; padding: 12px; font-size: 13px; line-height: 1.6; box-shadow: inset 1px 1px 3px #ddd;">
                    <p><b>Version:</b> 9.10.0-7065 (Codeforces Edition)</p>
                    <p><b>Developer:</b> Abdo Sleem</p>
                    <p style="margin-top: 10px; color: #555;"><i>A custom interface built to emulate the classic PC^2 environment for Codeforces contests.</i></p>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div class="status-bar">
            <span class="status-cell">Contest: CF ${contestId}</span>
            <span class="status-cell" id="status-problem">Problem: —</span>
            <span class="status-cell" id="status-lang">Language: G++23</span>
            <span class="status-cell" id="status-file">File: —</span>
          </div>
        </div>
        <div id="toast"></div>`;
    }

    // ── Toast ───────────────────────────────────────────────────────────────────
    function showToast(msg, ok) {
        const t = document.getElementById('toast');
        t.textContent = msg;
        t.className = ok ? 'ok' : '';
        t.style.display = 'block';
        clearTimeout(t._t);
        t._t = setTimeout(() => { t.style.display = 'none'; }, 3500);
    }

    // ── Draggable dialog ────────────────────────────────────────────────────────
    function makeDraggable(el, handle) {
        let drag = false, sx, sy, il, it;
        handle.addEventListener('mousedown', e => {
            drag = true; sx = e.clientX; sy = e.clientY;
            il = el.offsetLeft; it = el.offsetTop;
            document.addEventListener('mousemove', mv);
            document.addEventListener('mouseup', up);
        });
        function mv(e) {
            if (!drag) return;
            el.style.left = (il + e.clientX - sx) + 'px';
            el.style.top = (it + e.clientY - sy) + 'px';
        }
        function up() {
            drag = false;
            document.removeEventListener('mousemove', mv);
            document.removeEventListener('mouseup', up);
        }
    }

    function showDialog({ runId, problem, language }) {
        document.getElementById('pc2-judgement-dialog')?.remove();
        document.getElementById('pc2-overlay')?.remove();

        const overlay = document.createElement('div');
        overlay.id = 'pc2-overlay';
        overlay.className = 'pc2-overlay';
        document.body.appendChild(overlay);

        const dialog = document.createElement('div');
        dialog.id = 'pc2-judgement-dialog';
        dialog.className = 'pc2-dialog';
        dialog.style.left = ((window.innerWidth - 330) / 2) + 'px';
        dialog.style.top = ((window.innerHeight - 270) / 2) + 'px';

        const header = document.createElement('div');
        header.className = 'pc2-header';
        header.innerHTML = '<div class="pc2-header-title"><span>&#9749;</span> Run Submitted</div>';
        const closeBtn = document.createElement('button');
        closeBtn.className = 'pc2-close';
        closeBtn.textContent = '×';
        header.appendChild(closeBtn);

        const body = document.createElement('div');
        body.className = 'pc2-body';
        body.innerHTML = `
            <div class="pc2-header-text"><div class="info-icon">i</div>Run Submission Received</div>
            <div class="pc2-row">Problem: <span class="val-blue">${problem}</span></div>
            <div class="pc2-row">Language: <span class="val-blue">${language}</span></div>
            <div class="pc2-row">Run Id: <span class="val-blue">${runId}</span></div>`;

        const footer = document.createElement('div');
        footer.className = 'pc2-footer';
        const okBtn = document.createElement('button');
        okBtn.className = 'pc2-ok-btn';
        okBtn.textContent = 'OK';
        footer.appendChild(okBtn);

        dialog.appendChild(header);
        dialog.appendChild(body);
        dialog.appendChild(footer);
        document.body.appendChild(dialog);

        function close() { dialog.remove(); overlay.remove(); }
        closeBtn.addEventListener('click', close);
        okBtn.addEventListener('click', close);
        overlay.addEventListener('click', close);
        makeDraggable(dialog, header);
    }

    // ── Show verdict as a SEPARATE popup (appears when final verdict arrives) ────
    function showVerdictDialog({ runId, problem, language, verdictText, verdictColor }) {
        // Remove any previous verdict dialog (not the submission one)
        document.getElementById('pc2-verdict-dialog')?.remove();
        document.getElementById('pc2-verdict-overlay')?.remove();

        const overlay = document.createElement('div');
        overlay.id = 'pc2-verdict-overlay';
        overlay.className = 'pc2-overlay';
        document.body.appendChild(overlay);

        const dialog = document.createElement('div');
        dialog.id = 'pc2-verdict-dialog';
        dialog.className = 'pc2-dialog';
        // Offset slightly so it doesn't perfectly overlap the submission popup
        dialog.style.left = (Math.max(20, (window.innerWidth - 330) / 2 + 30)) + 'px';
        dialog.style.top = (Math.max(20, (window.innerHeight - 300) / 2 + 30)) + 'px';

        const header = document.createElement('div');
        header.className = 'pc2-header';
        header.innerHTML = '<div class="pc2-header-title"><span>&#9749;</span> Run Judgement Received</div>';
        const closeBtn = document.createElement('button');
        closeBtn.className = 'pc2-close';
        closeBtn.textContent = '×';
        header.appendChild(closeBtn);

        const body = document.createElement('div');
        body.className = 'pc2-body';
        body.innerHTML = `
            <div class="pc2-header-text"><div class="info-icon">i</div>Judge's Response</div>
            <div class="pc2-row">Problem: <span class="val-blue">${problem}</span></div>
            <div class="pc2-row">Language: <span class="val-blue">${language}</span></div>
            <div class="pc2-row">Run Id: <span class="val-blue">${runId}</span></div>
            <div class="pc2-row" style="margin-top:30px;">Judge's Response:
              <span style="color:${verdictColor}; font-size:18px;"> ${verdictText}</span>
            </div>`;

        const footer = document.createElement('div');
        footer.className = 'pc2-footer';
        const okBtn = document.createElement('button');
        okBtn.className = 'pc2-ok-btn';
        okBtn.textContent = 'OK';
        footer.appendChild(okBtn);

        dialog.appendChild(header);
        dialog.appendChild(body);
        dialog.appendChild(footer);
        document.body.appendChild(dialog);

        function close() { dialog.remove(); overlay.remove(); }
        closeBtn.addEventListener('click', close);
        okBtn.addEventListener('click', close);
        overlay.addEventListener('click', close);
        makeDraggable(dialog, header);
    }

    // ── Live verdict polling — scrapes /contest/{id}/my (no API key needed) ────────

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

    // problem + language passed so verdict popup shows full context
    function pollVerdict(runId, problem, language) {
        if (!runId || runId === '—') return;

        const MAX_ATTEMPTS = 40;
        let attempts = 0;

        async function check() {
            attempts++;
            if (attempts > MAX_ATTEMPTS) return; // give up silently

            try {
                const html = await fetch(
                    `https://codeforces.com/contest/${contestId}/my`,
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
                    // Still judging — keep polling silently (no UI update)
                } else {
                    // Final verdict — show the separate verdict popup
                    const mapped = mapVerdictText(verdictText);
                    showVerdictDialog({
                        runId, problem, language,
                        verdictText: mapped ? mapped.text : verdictText,
                        verdictColor: mapped ? mapped.color : '#cc0000'
                    });
                    return; // stop polling
                }
            } catch (_) { /* keep retrying */ }

            setTimeout(check, 3000);
        }

        setTimeout(check, 2500);
    }


    // ── Fetch Runs logic ────────────────────────────────────────────────────────
    async function fetchRuns() {
        const tbody = document.getElementById('runs-tbody');
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading runs...</td></tr>';
        try {
            const html = await fetch(`https://codeforces.com/contest/${contestId}/my`, { credentials: 'include' }).then(r => r.text());
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const rows = doc.querySelectorAll('table.status-frame-datatable tr[data-submission-id]');
            
            tbody.innerHTML = '';
            let count = 0;

            rows.forEach(row => {
                const runId = row.getAttribute('data-submission-id');
                
                // Extract time. "Jun/27/2026 04:11" -> "04:11" or just show full time
                const timeCell = row.querySelector('.status-small .format-time');
                let timeText = timeCell ? timeCell.textContent.trim() : '';
                if(timeText.includes(' ')) timeText = timeText.split(' ').pop(); // Just extract "04:11" for a cleaner table
                
                // Extract problem letter from link href or text
                const probLink = row.querySelector('td[data-problemId] a');
                let probLetter = '';
                if (probLink) {
                    const match = probLink.href.match(/\/problem\/([A-Z0-9]+)/i);
                    probLetter = match ? match[1] : probLink.textContent.trim().split('-')[0].trim();
                }

                // Language
                const langCell = row.querySelectorAll('td')[4];
                let langText = langCell ? langCell.textContent.trim() : '';
                if (langText.includes('C++')) langText = 'GNU C++'; // Map CF names to PC2-like names to match screenshot

                // Verdict
                const verdictCell = row.querySelector('.status-verdict-cell');
                const rawVerdict = verdictCell ? verdictCell.textContent.trim() : '';
                const mapped = mapVerdictText(rawVerdict);
                let pc2Verdict = 'Pending';
                if (mapped) pc2Verdict = mapped.text;
                else if (isVerdictPending(rawVerdict)) pc2Verdict = 'NEW';
                else pc2Verdict = rawVerdict;

                // Create row
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


    // ── Wire all events ─────────────────────────────────────────────────────────
    function wireEvents() {
        // Off-screen file input (never display:none — some browsers block .click() on it)
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

        document.getElementById('exit-btn').addEventListener('click', () => {
            if (confirm('Exit PC^2?')) history.back();
        });

        // ── Tabs Switching ──
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                if(!tab.dataset.target) return; // ignore unimplemented tabs
                
                // update tab styling
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // update content visibility
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(tab.dataset.target).classList.add('active');

                // Trigger data load if needed
                if (tab.dataset.target === 'tab-runs') {
                    fetchRuns();
                }
            });
        });

        // ── Countdown Timer ──
        if (isCountdown) {
            const timeLeftEl = document.querySelector('.time-left');
            
            if (isBeforeContest) {
                document.getElementById('submit-btn').disabled = true;
                document.getElementById('problem-select').disabled = true;
                document.getElementById('select-file-btn').disabled = true;
            }
            
            function updateTime() {
                if (countdownSeconds <= 0) {
                    timeLeftEl.textContent = isBeforeContest ? 'STARTED' : 'FINISHED';
                    if (countdownRedirect) window.location.href = countdownRedirect;
                    else window.location.reload();
                    return;
                }
                countdownSeconds--;
                let s = countdownSeconds;
                let d = Math.floor(s / 86400); s %= 86400;
                let h = Math.floor(s / 3600); s %= 3600;
                let m = Math.floor(s / 60); s %= 60;
                let str = '';
                if (d > 0) str += d + 'd ';
                str += String(h).padStart(2, '0') + ':';
                str += String(m).padStart(2, '0') + ':';
                str += String(s).padStart(2, '0');
                
                timeLeftEl.textContent = isBeforeContest ? ('Starts in: ' + str) : ('Time Left: ' + str);
                
                setTimeout(updateTime, 1000);
            }
            updateTime();
        }

        // ── Submit via fetch (no page navigation) ───────────────────────────────
        document.getElementById('submit-btn').addEventListener('click', async () => {
            const problemLetter = document.getElementById('problem-select').value;
            const programTypeId = document.getElementById('language-select').value;
            const langSel = document.getElementById('language-select');
            const langText = langSel.options[langSel.selectedIndex].dataset.short
                || langSel.options[langSel.selectedIndex].textContent;

            if (!problemLetter) { showToast('Please select a problem.'); return; }
            if (!programTypeId) { showToast('Please select a language.'); return; }
            if (!fileInput.files?.length) { showToast('Please select a source file.'); return; }
            if (!contestId) { showToast('Contest ID not found.'); return; }
            if (!csrfToken) { showToast('CSRF token not found — try reloading.'); return; }

            const btn = document.getElementById('submit-btn');
            btn.disabled = true;
            btn.textContent = 'Submitting...';

            try {
                const fd = new FormData();
                fd.append('csrf_token', csrfToken);
                fd.append('ftaa', ftaa);
                fd.append('bfaa', bfaa);
                fd.append('turnstileToken', '');
                fd.append('action', 'submitSolutionFormSubmitted');
                fd.append('submittedProblemIndex', problemLetter);
                fd.append('programTypeId', programTypeId);
                fd.append('source', '');
                fd.append('sourceFile', fileInput.files[0]);

                const adcd1e = 'caf4f' + Math.random().toString(36).substr(2, 9);

                // redirect:'manual' → the browser captures the 302 internally.
                // The page never navigates; an opaqueredirect / status-0 response means success.
                const submitResp = await fetch(
                    `https://codeforces.com/contest/${contestId}/problem/${problemLetter}` +
                    `?csrf_token=${csrfToken}&adcd1e=${adcd1e}`,
                    { method: 'POST', body: fd, credentials: 'include', redirect: 'manual' }
                );

                // type === 'opaqueredirect' means Codeforces redirected us → submission accepted
                if (submitResp.type !== 'opaqueredirect' && !submitResp.ok && submitResp.status !== 0) {
                    throw new Error('Server returned status ' + submitResp.status);
                }

                // Wait briefly then fetch /my to get the assigned run ID
                await new Promise(r => setTimeout(r, 900));

                let runId = '—';
                try {
                    const myHtml = await fetch(
                        `https://codeforces.com/contest/${contestId}/my`,
                        { credentials: 'include' }
                    ).then(r => r.text());

                    const doc = new DOMParser().parseFromString(myHtml, 'text/html');
                    // First data row in the submissions table
                    const cell = doc.querySelector('table[class*="status"] tr:not(:first-child) td:first-child');
                    if (cell) runId = cell.textContent.trim();
                } catch (_) { /* couldn't fetch run ID */ }

                showDialog({ runId, problem: problemLetter, language: langText });
                // Poll silently; verdict appears in a SEPARATE popup when ready
                pollVerdict(runId, problemLetter, langText);

            } catch (err) {
                showToast('Submission error: ' + (err.message || 'Unknown'));
            } finally {
                btn.disabled = false;
                btn.textContent = 'Submit';
            }
        });
    }

    // ── Entry point ─────────────────────────────────────────────────────────────
    function run() {
        // Suppress any lingering Codeforces JS that might still try to navigate
        window.addEventListener('beforeunload', e => { e.stopImmediatePropagation(); }, true);
        window.addEventListener('unload', e => { e.stopImmediatePropagation(); }, true);

        document.title = 'PC^2 TEAM 1 (Site 1) [RUNNING]';
        while (document.head.firstChild) document.head.removeChild(document.head.firstChild);
        const mc = document.createElement('meta'); mc.setAttribute('charset', 'UTF-8');
        document.head.appendChild(mc);
        injectStyles();
        buildBody();
        wireEvents();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
}