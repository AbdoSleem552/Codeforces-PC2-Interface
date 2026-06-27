window.PC2 = window.PC2 || {};

window.PC2.UI = (function () {
  const State = window.PC2.State;

  function injectStyles() {
    if (document.querySelector('link.pc2-style')) return;
    const link = document.createElement('link');
    link.className = 'pc2-style';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    const stylesURL = document.documentElement.getAttribute('data-pc2-styles-url') || '';
    link.href = stylesURL;
    document.head.appendChild(link);
  }

  function buildBody(container) {
    let opts = '<option value="">Select Problem</option>';
    let clarOpts = '<option value="General">General</option>';
    if (State.isBeforeContest) {
      opts = '<option value="">Contest not started</option>';
      clarOpts = '<option value="General">General (Contest not started)</option>';
    } else {
      State.problems.forEach(({ letter, name }) => {
        opts += `<option value="${letter}">${letter} - ${name}</option>`;
        clarOpts += `<option value="${letter}">${letter} - ${name}</option>`;
      });
    }

    const target = container || document.body;
    if (target === document.body) {
      document.body.className = '';
    }
    target.innerHTML = `
        <div class="app-resizer" id="app-resizer">
          <div class="app-window" id="app-window">
            <div class="title-bar">
              <div class="title-bar-text">&#9749; PC^2 TEAM 1 (Site 1) [RUNNING] 9.10.0-7065</div>
            <div class="title-bar-controls">
              <button>_</button><button>&#9633;</button><button id="btn-close">&#x2715;</button>
            </div>
          </div>
          <div class="window-body">
            <div class="app-header">
              <div class="time-left">${State.isCountdown ? '...' : 'FINISHED'}</div>
              <div style="display: flex; gap: 6px; align-items: center;">
                <button class="win-btn" id="print-all-btn" style="font-weight: bold; display: flex; align-items: center; gap: 5px; padding: 4px 10px;" title="Export all problems to a single PDF">
                  <span style="font-size: 13px; line-height: 1;">🖨️</span> Print Statement
                </button>
                <button class="win-btn" id="exit-btn" style="padding: 4px 12px;">Exit</button>
              </div>
            </div>
            <div class="tabs">
              <div class="tab active" data-target="tab-submit">Submit Run</div>
              <div class="tab" data-target="tab-runs">View Runs</div>
              <div class="tab" data-target="tab-request-clar">Request Clarification</div>
              <div class="tab" data-target="tab-view-clars">View Clarifications</div>
              <div class="tab" data-target="tab-options">Options</div>
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

            <div id="tab-request-clar" class="tab-content" style="padding: 15px 20px;">
              <div class="form-group">
                <span class="form-label">Problem</span>
                <select id="request-clar-problem-select">${clarOpts}</select>
              </div>
              <fieldset style="border: 1px solid #999; border-radius: 3px; padding: 6px 10px; margin-bottom: 12px; margin-top: 10px; background: transparent;">
                <legend style="font-size: 11px; font-weight: bold; padding: 0 4px; color: #333;">Clarification Question</legend>
                <textarea id="request-clar-text" style="width: 100%; height: 90px; background: #fff; border: 1px inset #999; resize: none; font-size: 12px; font-family: 'Segoe UI', Tahoma, sans-serif; padding: 6px; outline: none;"></textarea>
              </fieldset>
              <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
                <button class="win-btn" id="submit-clar-btn">Submit</button>
              </div>
            </div>

            <div id="tab-view-clars" class="tab-content" style="padding: 10px 14px;">
              <div class="pc2-table-container" style="height: 150px; margin-bottom: 10px;">
                <table class="pc2-table">
                  <thead>
                    <tr>
                      <th style="width: 12%;">Site ▴</th>
                      <th style="width: 12%;">Team</th>
                      <th style="width: 12%;">Clar Id</th>
                      <th style="width: 10%;">Time</th>
                      <th style="width: 12%;">Status</th>
                      <th style="width: 12%;">Problem</th>
                      <th style="width: 15%;">Question</th>
                      <th style="width: 15%;">Answer</th>
                    </tr>
                  </thead>
                  <tbody id="clars-tbody">
                    <tr><td colspan="8" style="text-align:center;">Loading clarifications...</td></tr>
                  </tbody>
                </table>
              </div>
              
              <fieldset style="border: 1px solid #999; border-radius: 3px; padding: 4px 8px; margin-bottom: 6px; background: transparent;">
                <legend style="font-size: 11px; font-weight: bold; padding: 0 4px; color: #333;">Clarification</legend>
                <textarea id="clar-question-text" readonly style="width: 100%; height: 40px; background: #e4e7ec; border: 1px inset #999; resize: none; font-size: 11px; font-family: 'Segoe UI', Tahoma, sans-serif; padding: 4px; outline: none;"></textarea>
              </fieldset>

              <div style="border-top: 1px dotted #999; margin: 6px 0;"></div>

              <fieldset style="border: 1px solid #999; border-radius: 3px; padding: 4px 8px; margin-bottom: 8px; background: transparent;">
                <legend style="font-size: 11px; font-weight: bold; padding: 0 4px; color: #333;">Answer</legend>
                <textarea id="clar-answer-text" readonly style="width: 100%; height: 40px; background: #e4e7ec; border: 1px inset #999; resize: none; font-size: 11px; font-family: 'Segoe UI', Tahoma, sans-serif; padding: 4px; outline: none;"></textarea>
              </fieldset>

              <div style="text-align: center; margin-top: 6px; padding-bottom: 4px;">
                <button class="win-btn" id="clars-filter-btn">Filter</button>
              </div>
            </div>

            <div id="tab-options" class="tab-content" style="padding: 25px 30px;">
              <h2 style="font-size: 16px; margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">PC^2 Options</h2>
              
              <div class="form-group" style="margin-bottom: 20px;">
                <label style="font-size: 13px; font-weight: bold; display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input type="checkbox" id="opt-fancy-bg" style="cursor: pointer; width: 16px; height: 16px;" />
                  Enable Fancy Background (Balloons & Verdicts)
                </label>
              </div>

              <div class="form-group">
                <label style="font-size: 13px; font-weight: bold; display: block; margin-bottom: 8px;">
                  Window Scale: <span id="opt-scale-val">100%</span>
                </label>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <input type="range" id="opt-scale" min="0.5" max="2.0" step="0.05" value="1.0" style="width: 250px; cursor: pointer;" />
                  <button class="win-btn" id="opt-scale-reset" style="min-width: 60px; padding: 2px 10px;">Reset</button>
                </div>
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
            <span class="status-cell">Contest: CF ${State.contestId}</span>
            <span class="status-cell" id="status-problem">Problem: —</span>
            <span class="status-cell" id="status-lang">Language: G++23</span>
            <span class="status-cell" id="status-file">File: —</span>
          </div>
          </div>
        </div>
        <div id="toast"></div>`;
  }

  function showToast(msg, ok) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = ok ? 'ok' : '';
    t.style.display = 'block';
    clearTimeout(t._t);
    t._t = setTimeout(() => { t.style.display = 'none'; }, 3500);
  }

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
    makeDraggable(dialog, header);
  }

  function showVerdictDialog({ runId, problem, language, verdictText, verdictColor }) {
    document.getElementById('pc2-verdict-dialog')?.remove();
    document.getElementById('pc2-verdict-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'pc2-verdict-overlay';
    overlay.className = 'pc2-overlay';
    document.body.appendChild(overlay);

    const dialog = document.createElement('div');
    dialog.id = 'pc2-verdict-dialog';
    dialog.className = 'pc2-dialog';
    dialog.style.width = '420px';
    dialog.style.left = (Math.max(20, (window.innerWidth - 420) / 2 + 30)) + 'px';
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
              <span style="color:${verdictColor}; font-size:16px;">${verdictText}</span>
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
    makeDraggable(dialog, header);
  }

  function showConfirmDialog({ problem, language, filename, onConfirm, onCancel }) {
    document.getElementById('pc2-confirm-dialog')?.remove();
    document.getElementById('pc2-confirm-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'pc2-confirm-overlay';
    overlay.className = 'pc2-overlay';
    document.body.appendChild(overlay);

    const dialog = document.createElement('div');
    dialog.id = 'pc2-confirm-dialog';
    dialog.className = 'pc2-dialog';
    dialog.style.left = ((window.innerWidth - 330) / 2) + 'px';
    dialog.style.top = ((window.innerHeight - 250) / 2) + 'px';

    const header = document.createElement('div');
    header.className = 'pc2-header';
    header.innerHTML = '<div class="pc2-header-title"><span>&#9749;</span> Confirm Submit</div>';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'pc2-close';
    closeBtn.textContent = '×';
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = 'pc2-body';
    body.innerHTML = `
            <div class="pc2-header-text"><div class="info-icon">?</div>Submit Solution?</div>
            <div class="pc2-row" style="font-size:13px; margin-bottom:10px;">Are you sure you want to submit?</div>
            <div class="pc2-row" style="font-size:12px; margin-bottom:6px;">Problem: <span class="val-blue">${problem}</span></div>
            <div class="pc2-row" style="font-size:12px; margin-bottom:6px;">Language: <span class="val-blue">${language}</span></div>
            <div class="pc2-row" style="font-size:12px; margin-bottom:6px;">File: <span class="val-blue">${filename}</span></div>`;

    const footer = document.createElement('div');
    footer.className = 'pc2-footer';
    footer.style.gap = '15px';

    const yesBtn = document.createElement('button');
    yesBtn.className = 'pc2-ok-btn';
    yesBtn.id = 'confirm-yes-btn';
    yesBtn.style.cssText = 'background: #2e7d32; color: #fff; border: 1px solid #1b5e20; box-shadow: inset 1px 1px 0 #4caf50, inset -1px -1px 0 #0d3c0e; font-weight: bold; padding: 4px 22px;';
    yesBtn.textContent = 'Yes';

    const noBtn = document.createElement('button');
    noBtn.className = 'pc2-ok-btn';
    noBtn.id = 'confirm-no-btn';
    noBtn.textContent = 'No';

    footer.appendChild(yesBtn);
    footer.appendChild(noBtn);

    dialog.appendChild(header);
    dialog.appendChild(body);
    dialog.appendChild(footer);
    document.body.appendChild(dialog);

    function closeDialog() { dialog.remove(); overlay.remove(); }
    closeBtn.addEventListener('click', () => { closeDialog(); if (onCancel) onCancel(); });
    noBtn.addEventListener('click', () => { closeDialog(); if (onCancel) onCancel(); });
    yesBtn.addEventListener('click', () => { closeDialog(); if (onConfirm) onConfirm(); });
    makeDraggable(dialog, header);
  }

  function showLoginOverlay() {
    document.getElementById('pc2-login-overlay')?.remove();
    document.getElementById('pc2-login-dialog')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'pc2-login-overlay';
    overlay.className = 'pc2-overlay';
    overlay.style.zIndex = '9999';
    overlay.style.background = 'transparent';
    document.body.appendChild(overlay);

    const dialog = document.createElement('div');
    dialog.id = 'pc2-login-dialog';
    dialog.className = 'pc2-dialog';
    dialog.style.zIndex = '10000';
    dialog.style.left = ((window.innerWidth - 330) / 2) + 'px';
    dialog.style.top = ((window.innerHeight - 200) / 2) + 'px';

    const header = document.createElement('div');
    header.className = 'pc2-header';
    header.innerHTML = '<div class="pc2-header-title"><span>&#9749;</span> Authentication Required</div>';

    const body = document.createElement('div');
    body.className = 'pc2-body';
    body.innerHTML =
      '<div class="pc2-header-text"><div class="info-icon" style="background:#cc0000;color:white;border:none;">!</div>Not Logged In</div>' +
      '<div class="pc2-row" style="margin-top:20px; font-size:13px; text-align:center;">' +
      'You must login to Codeforces to use the PC^2 interface.' +
      '</div>';

    const footer = document.createElement('div');
    footer.className = 'pc2-footer';
    footer.style.justifyContent = 'center';
    footer.style.gap = '15px';

    const loginBtn = document.createElement('button');
    loginBtn.className = 'pc2-ok-btn';
    loginBtn.textContent = 'Go to Login';
    loginBtn.addEventListener('click', () => {
      window.open('/enter?back=' + encodeURIComponent(window.location.pathname), '_blank');
    });

    const checkBtn = document.createElement('button');
    checkBtn.className = 'pc2-ok-btn';
    checkBtn.textContent = 'I have logged in';
    checkBtn.style.background = '#2e7d32';
    checkBtn.style.borderColor = '#1b5e20';
    checkBtn.style.color = '#fff';
    checkBtn.addEventListener('click', () => {
      window.location.reload();
    });

    footer.appendChild(loginBtn);
    footer.appendChild(checkBtn);

    dialog.appendChild(header);
    dialog.appendChild(body);
    dialog.appendChild(footer);
    document.body.appendChild(dialog);
  }

  return {
    injectStyles,
    buildBody,
    showToast,
    showDialog,
    showVerdictDialog,
    showConfirmDialog,
    showLoginOverlay
  };
})();
