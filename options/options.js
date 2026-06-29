/**
 * PC² Extension — Options Page
 *
 * Architecture: Settings Registry
 * ─────────────────────────────
 * Each setting is a descriptor object in SETTINGS_REGISTRY.
 * Adding a new setting = ONE new entry. No scattered if-blocks needed.
 *
 * The PDF theme picker is a custom "theme-grid" control type that
 * reads from window.PC2.PDF_THEMES (defined in print.js) at runtime.
 */

'use strict';

// ── Settings Registry ─────────────────────────────────────────────────────────

const SETTINGS_REGISTRY = [
  // ── Appearance ──────────────────────────────────────────────────────────────
  {
    key: 'pc2_fancy_bg',
    default: PC2_DEFAULT_CONFIG.pc2_fancy_bg,
    elementId: 'opt-fancy-bg',
    type: 'toggle',
    read:  (el) => el.checked,
    write: (el, v) => { el.checked = !!v; },
  },
  {
    key: 'pc2_sounds_enabled',
    default: PC2_DEFAULT_CONFIG.pc2_sounds_enabled,
    elementId: 'opt-sounds-enabled',
    type: 'toggle',
    read:  (el) => el.checked,
    write: (el, v) => { el.checked = !!v; },
  },
  {
    key: 'pc2_sound_library',
    default: JSON.stringify(PC2_DEFAULT_CONFIG.pc2_sound_library),
    elementId: null,         // custom control — managed by buildSoundLibrary()
    type: 'sound-library',
    read:  () => readSoundLibraryFromDOM(),
    write: (_, v) => writeSoundLibraryToDOM(v),
  },
  {
    key: 'pc2_theme',
    default: PC2_DEFAULT_CONFIG.pc2_theme,
    elementId: 'opt-theme',
    type: 'select',
    read:  (el) => el.value,
    write: (el, v) => { el.value = v; },
  },
  {
    key: 'pc2_scale',
    default: PC2_DEFAULT_CONFIG.pc2_scale,
    elementId: 'opt-scale',
    type: 'range',
    read:  (el) => parseFloat(el.value),
    write: (el, v) => {
      el.value = v;
      updateRangeDisplay('opt-scale-val', v, (n) => Math.round(n * 100) + '%');
    },
    onChange: (v) => {
      updateRangeDisplay('opt-scale-val', v, (n) => Math.round(n * 100) + '%');
    },
  },
  {
    key: 'pc2_start_maximized',
    default: PC2_DEFAULT_CONFIG.pc2_start_maximized,
    elementId: 'opt-start-maximized',
    type: 'toggle',
    read:  (el) => el.checked,
    write: (el, v) => { el.checked = !!v; },
  },

  // ── Interface ────────────────────────────────────────────────────────────────
  {
    key: 'pc2_auto_refresh_runs',
    default: PC2_DEFAULT_CONFIG.pc2_auto_refresh_runs,
    elementId: 'opt-auto-refresh',
    type: 'toggle',
    read:  (el) => el.checked,
    write: (el, v) => { el.checked = !!v; },
  },
  {
    key: 'pc2_default_tab',
    default: PC2_DEFAULT_CONFIG.pc2_default_tab,
    elementId: 'opt-default-tab',
    type: 'select',
    read:  (el) => el.value,
    write: (el, v) => { el.value = v; },
  },
  {
    key: 'pc2_show_submit_confirm',
    default: PC2_DEFAULT_CONFIG.pc2_show_submit_confirm,
    elementId: 'opt-submit-confirm',
    type: 'toggle',
    read:  (el) => el.checked,
    write: (el, v) => { el.checked = !!v; },
  },

  // ── Printing ─────────────────────────────────────────────────────────────────
  {
    key: 'pc2_pdf_theme',
    default: PC2_DEFAULT_CONFIG.pc2_pdf_theme,
    elementId: null,          // custom control — managed by buildThemeGrid()
    type: 'theme-grid',
    read:  () => _currentTheme,
    write: (_, v) => selectThemeCard(v),
  },
  {
    key: 'pc2_custom_print_css',
    default: PC2_DEFAULT_CONFIG.pc2_custom_print_css,
    elementId: 'opt-custom-css',
    type: 'textarea',
    read:  (el) => el.value,
    write: (el, v) => { el.value = v || ''; },
  },
  {
    key: 'pc2_print_page_size',
    default: PC2_DEFAULT_CONFIG.pc2_print_page_size,
    elementId: 'opt-paper-size',
    type: 'select',
    read:  (el) => el.value,
    write: (el, v) => { el.value = v; },
  },
  {
    key: 'pc2_print_show_header',
    default: PC2_DEFAULT_CONFIG.pc2_print_show_header,
    elementId: 'opt-print-header',
    type: 'toggle',
    read:  (el) => el.checked,
    write: (el, v) => { el.checked = !!v; },
  },
];

// ── Theme grid state ──────────────────────────────────────────────────────────
let _currentTheme = 'clean';




function buildThemeGrid(selectedId) {
  const grid = document.getElementById('theme-grid');
  if (!grid) return;
  grid.innerHTML = '';

  // window.PC2_THEMES_META is loaded from options/themes-meta.js
  // (a separate metadata-only file — no CSS, safe to load in the options page context).
  const themes = window.PC2_THEMES_META || [];

  if (themes.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">Theme metadata not loaded.</p>';
    return;
  }

  themes.forEach((theme) => {
    const p = theme.preview || {};
    const card = document.createElement('div');
    card.className = 'theme-card' + (theme.id === (selectedId || 'clean') ? ' selected' : '');
    card.dataset.themeId = theme.id;

    card.innerHTML = `
      <div class="check-mark">✓</div>
      <div class="theme-preview" style="background:${p.bg || '#fff'};">
        <div class="preview-title-bar" style="background:${p.title || '#000'};"></div>
        <div class="preview-pill-row">
          <div class="preview-pill" style="background:${p.pillBg || '#eee'}; border:1px solid ${p.pillFg || '#ccc'};"></div>
          <div class="preview-pill" style="background:${p.pillBg || '#eee'}; border:1px solid ${p.pillFg || '#ccc'};"></div>
          <div class="preview-pill" style="background:${p.pillBg || '#eee'}; border:1px solid ${p.pillFg || '#ccc'};"></div>
        </div>
        <div class="preview-line" style="background:${p.text || '#ccc'};"></div>
        <div class="preview-line short" style="background:${p.text || '#ccc'};"></div>
        <div class="preview-line" style="background:${p.text || '#ccc'};"></div>
      </div>
      <div class="theme-name">${theme.name}</div>
      <div class="theme-desc">${theme.description}</div>
    `;

    card.addEventListener('click', () => {
      selectThemeCard(theme.id);
      scheduleSave();
    });

    grid.appendChild(card);
  });

  _currentTheme = selectedId || 'clean';
}


function selectThemeCard(themeId) {
  _currentTheme = themeId || 'clean';
  document.querySelectorAll('.theme-card').forEach((card) => {
    card.classList.toggle('selected', card.dataset.themeId === _currentTheme);
  });
}

// ── Sound Library UI ──────────────────────────────────────────────────────────

const VERDICT_DEFS = [
  { key: 'correct',           emoji: '✅', name: 'Correct (AC)',              badge: 'AC',   badgeBg: 'rgba(0,200,80,0.18)',   badgeFg: '#4caf50' },
  { key: 'wrong_answer',      emoji: '❌', name: 'Wrong Answer',              badge: 'WA',   badgeBg: 'rgba(244,67,54,0.15)',  badgeFg: '#ef5350' },
  { key: 'time_limit',        emoji: '⏱️', name: 'Time Limit Exceeded',      badge: 'TLE',  badgeBg: 'rgba(255,152,0,0.15)',  badgeFg: '#ffa726' },
  { key: 'memory_limit',      emoji: '💾', name: 'Memory Limit Exceeded',    badge: 'MLE',  badgeBg: 'rgba(255,152,0,0.15)',  badgeFg: '#ffa726' },
  { key: 'runtime_error',     emoji: '💥', name: 'Runtime Error',            badge: 'RE',   badgeBg: 'rgba(255,87,34,0.15)',  badgeFg: '#ff7043' },
  { key: 'compilation_error', emoji: '🔧', name: 'Compilation Error',        badge: 'CE',   badgeBg: 'rgba(103,58,183,0.15)', badgeFg: '#9575cd' },
  { key: 'output_limit',      emoji: '📜', name: 'Output Limit Exceeded',    badge: 'OLE',  badgeBg: 'rgba(255,152,0,0.15)',  badgeFg: '#ffa726' },
  { key: 'idleness_limit',    emoji: '💤', name: 'Idleness Limit Exceeded',  badge: 'ILE',  badgeBg: 'rgba(255,152,0,0.15)',  badgeFg: '#ffa726' },
  { key: 'hacked',            emoji: '🛡️', name: 'Hacked',                   badge: 'HACK', badgeBg: 'rgba(33,150,243,0.15)', badgeFg: '#64b5f6' },
  { key: 'partial',           emoji: '🏅', name: 'Partial Score',            badge: 'PC',   badgeBg: 'rgba(255,235,59,0.15)', badgeFg: '#fdd835' },
  { key: 'skipped',           emoji: '⏭️', name: 'Skipped',                  badge: 'SKP',  badgeBg: 'rgba(120,120,150,0.15)',badgeFg: '#9090aa' },
];

const ACTION_DEFS = [
  { key: 'action_start',  emoji: '🏁', name: 'Contest Started',      badge: 'START',  badgeBg: 'rgba(0,188,212,0.15)',  badgeFg: '#26c6da' },
  { key: 'action_submit', emoji: '🚀', name: 'Solution Submitted',   badge: 'SUBMIT', badgeBg: 'rgba(156,39,176,0.15)', badgeFg: '#ab47bc' },
  { key: 'action_finish', emoji: '🛑', name: 'Contest Finished',     badge: 'END',    badgeBg: 'rgba(96,125,139,0.15)', badgeFg: '#78909c' },
];

let _soundLibrary = []; // in-memory copy
const _previewAudioCache = {};
let _draggedCard = null;

function buildSoundLibrary(jsonStr) {
  try { _soundLibrary = JSON.parse(jsonStr || '[]'); } catch (_) { _soundLibrary = []; }
  const list = document.getElementById('sound-library-list');
  if (!list) return;
  list.innerHTML = '';
  _soundLibrary.forEach((sound) => addSoundCard(sound, false));
  updateEmptyState();
}

function updateEmptyState() {
  const empty = document.getElementById('sound-library-empty');
  const list  = document.getElementById('sound-library-list');
  if (!empty || !list) return;
  empty.style.display = list.children.length === 0 ? 'flex' : 'none';
}

function addSoundCard(sound, saveNow = true) {
  const list = document.getElementById('sound-library-list');
  if (!list) return;

  if (!sound.id) sound.id = Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  if (!_soundLibrary.find(s => s.id === sound.id)) {
    _soundLibrary.push(sound);
  }

  const card = document.createElement('div');
  card.className = 'sl-card';
  if (saveNow) card.classList.add('open');
  card.dataset.soundId = sound.id;

  // Build checkboxes HTML
  const buildChipsHtml = (defs) => defs.map(def => {
    const checked = Array.isArray(sound.verdicts) && sound.verdicts.includes(def.key) ? 'checked' : '';
    return `<label class="sl-verdict-chip ${checked ? 'active' : ''}"
              title="${def.name}"
              style="${checked ? `background:${def.badgeBg};color:${def.badgeFg};border-color:${def.badgeFg}40;` : ''}">
              <input type="checkbox" data-key="${def.key}" ${checked} style="display:none">
              <span>${def.emoji}</span>
              <span style="font-size:9px;font-weight:700;">${def.badge}</span>
            </label>`;
  }).join('');

  const verdictsHtml = buildChipsHtml(VERDICT_DEFS);
  const actionsHtml = buildChipsHtml(ACTION_DEFS);

  card.innerHTML = `
    <div class="sl-card-header">
      <div class="sl-card-drag">⠿</div>
      <label class="toggle" style="transform: scale(0.75); margin-right: 8px; flex-shrink: 0;" title="Enable/Disable this sound">
        <input type="checkbox" class="sl-enabled-toggle" ${sound.enabled !== false ? 'checked' : ''}>
        <span class="toggle-track"></span>
      </label>
      <div class="sl-card-fields">
        <input class="sl-input sl-title" type="text" placeholder="Sound title (e.g. Victory Fanfare)"
               value="${escHtml(sound.title || '')}" spellcheck="false">
      </div>
      <button class="sl-card-toggle" title="Toggle details">▼</button>
    </div>
    <div class="sl-card-body">
      <div class="sl-url-row" style="margin-bottom: 14px;">
        <input class="sl-input sl-url" type="url" placeholder="https://example.com/sound.mp3"
               value="${escHtml(sound.url || '')}" spellcheck="false">
        <button class="sl-btn sl-preview" title="Preview sound">🔊</button>
        <button class="sl-btn sl-remove" title="Remove sound">🗑</button>
      </div>
      <div class="sl-verdict-label">Trigger on verdicts:</div>
      <div class="sl-verdict-chips" style="margin-bottom: 12px;">${verdictsHtml}</div>
      <div class="sl-verdict-label">Trigger on actions:</div>
      <div class="sl-verdict-chips">${actionsHtml}</div>
    </div>
  `;

  // Toggle open/close (clicking the header)
  card.querySelector('.sl-card-header').addEventListener('click', (e) => {
    // Prevent toggling when clicking inputs or specific buttons
    if (!e.target.closest('.sl-input') && !e.target.closest('.sl-btn')) {
      card.classList.toggle('open');
    }
  });

  // Verdict chip toggle
  card.querySelectorAll('.sl-verdict-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const cb = chip.querySelector('input[type=checkbox]');
      cb.checked = !cb.checked;
      const def = VERDICT_DEFS.find(d => d.key === cb.dataset.key) || ACTION_DEFS.find(d => d.key === cb.dataset.key);
      if (cb.checked) {
        chip.classList.add('active');
        chip.style.cssText = `background:${def.badgeBg};color:${def.badgeFg};border-color:${def.badgeFg}40;`;
      } else {
        chip.classList.remove('active');
        chip.style.cssText = '';
      }
      syncSoundFromCard(card);
      scheduleSave();
    });
  });

  // Title/URL input change
  card.querySelector('.sl-title').addEventListener('input', () => { syncSoundFromCard(card); scheduleSave(); });
  card.querySelector('.sl-url').addEventListener('input',  () => { syncSoundFromCard(card); scheduleSave(); });

  // Enabled toggle
  const enabledToggle = card.querySelector('.sl-enabled-toggle');
  if (enabledToggle) {
    enabledToggle.addEventListener('change', () => {
      syncSoundFromCard(card);
      scheduleSave();
      card.style.opacity = enabledToggle.checked ? '1' : '0.5';
    });
    card.style.opacity = enabledToggle.checked ? '1' : '0.5';
  }

  // Preview
  card.querySelector('.sl-preview').addEventListener('click', (e) => {
    e.stopPropagation();
    let url = card.querySelector('.sl-url').value.trim();
    if (!url) { showToast('Enter a URL first', true); return; }
    
    if (!url.startsWith('http') && !url.startsWith('data:')) {
      url = chrome.runtime.getURL(url.replace(/^\/+/, ''));
    }

    if (!_previewAudioCache[url]) {
      _previewAudioCache[url] = new Audio(url);
    }
    const audio = _previewAudioCache[url];
    if (audio.readyState > 0) {
      audio.currentTime = 0;
    }
    audio.play().catch(err => {
      console.error(err);
      showToast('⚠ Could not play URL', true);
    });
  });

  // Remove
  card.querySelector('.sl-remove').addEventListener('click', () => {
    _soundLibrary = _soundLibrary.filter(s => s.id !== sound.id);
    card.remove();
    updateEmptyState();
    scheduleSave();
  });

  // Drag & Drop Reordering
  const dragHandle = card.querySelector('.sl-card-drag');
  dragHandle.addEventListener('mousedown', () => { card.draggable = true; });
  dragHandle.addEventListener('mouseup', () => { card.draggable = false; });
  card.addEventListener('mouseleave', () => { card.draggable = false; });

  card.addEventListener('dragstart', (e) => {
    _draggedCard = card;
    setTimeout(() => card.style.opacity = '0.4', 0);
    e.dataTransfer.effectAllowed = 'move';
  });

  card.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!_draggedCard || _draggedCard === card) return;
    
    const rect = card.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    if (e.clientY < midY) {
      list.insertBefore(_draggedCard, card);
    } else {
      list.insertBefore(_draggedCard, card.nextSibling);
    }
  });

  card.addEventListener('dragend', () => {
    const enabledToggle = _draggedCard.querySelector('.sl-enabled-toggle');
    _draggedCard.style.opacity = (enabledToggle && enabledToggle.checked) ? '1' : '0.5';
    _draggedCard.draggable = false;
    _draggedCard = null;
    
    const newLibrary = [];
    list.querySelectorAll('.sl-card').forEach(c => {
      const id = c.dataset.soundId;
      const s = _soundLibrary.find(x => x.id === id);
      if (s) newLibrary.push(s);
    });
    _soundLibrary = newLibrary;
    scheduleSave();
  });

  list.appendChild(card);
  updateEmptyState();
  if (saveNow) scheduleSave();
}

function syncSoundFromCard(card) {
  const id = card.dataset.soundId;
  const sound = _soundLibrary.find(s => s.id === id);
  if (!sound) return;
  sound.title = card.querySelector('.sl-title').value;
  sound.url   = card.querySelector('.sl-url').value.trim();
  const toggle = card.querySelector('.sl-enabled-toggle');
  if (toggle) sound.enabled = toggle.checked;
  sound.verdicts = Array.from(card.querySelectorAll('.sl-verdict-chip input:checked'))
                        .map(cb => cb.dataset.key);
}

function readSoundLibraryFromDOM() {
  // Sync all cards first
  document.querySelectorAll('.sl-card').forEach(syncSoundFromCard);
  return JSON.stringify(_soundLibrary);
}

function writeSoundLibraryToDOM(jsonStr) {
  buildSoundLibrary(jsonStr);
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}



// ── Helpers ───────────────────────────────────────────────────────────────────

function updateRangeDisplay(displayId, value, format) {
  const el = document.getElementById(displayId);
  if (el) el.textContent = format(value);
}

function getDefaultValues() {
  return Object.fromEntries(SETTINGS_REGISTRY.map((s) => [s.key, s.default]));
}

function readAllFromDOM() {
  const values = {};
  for (const setting of SETTINGS_REGISTRY) {
    if (setting.type === 'theme-grid' || setting.type === 'sound-library') {
      values[setting.key] = setting.read();
      continue;
    }
    const el = document.getElementById(setting.elementId);
    if (el) values[setting.key] = setting.read(el);
  }
  return values;
}

function writeAllToDOM(values) {
  for (const setting of SETTINGS_REGISTRY) {
    const val = values[setting.key] !== undefined ? values[setting.key] : setting.default;
    if (setting.type === 'theme-grid' || setting.type === 'sound-library') {
      setting.write(null, val);
      continue;
    }
    const el = document.getElementById(setting.elementId);
    if (!el) continue;
    setting.write(el, val);
  }
}

function saveToStorage(values) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(values, () => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      else resolve();
    });
  });
}

function loadFromStorage() {
  return new Promise((resolve, reject) => {
    const defaults = getDefaultValues();
    chrome.storage.local.get(defaults, (result) => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      else resolve(result);
    });
  });
}

// ── Toast notification ────────────────────────────────────────────────────────

let _toastTimer = null;

function showToast(message = '✓ Settings saved', isError = false) {
  const el = document.getElementById('save-toast');
  el.textContent = message;
  el.style.background = isError ? '#f44336' : 'var(--accent)';
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

// ── Auto-save helper ──────────────────────────────────────────────────────────

let _saveTimer = null;

function scheduleSave() {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(async () => {
    try {
      await saveToStorage(readAllFromDOM());
      showToast();
    } catch (e) {
      showToast('⚠ Could not save settings', true);
      console.error('[PC2 Options] Save error:', e);
    }
  }, 400);
}

// ── Sidebar navigation ────────────────────────────────────────────────────────

function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-section]');
  const sections = document.querySelectorAll('.settings-section');

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const target = item.dataset.section;
      navItems.forEach((n) => n.classList.remove('active'));
      item.classList.add('active');
      sections.forEach((s) => s.classList.remove('active'));
      const targetSection = document.getElementById(`section-${target}`);
      if (targetSection) targetSection.classList.add('active');
    });
  });
}

// ── Wire setting controls ─────────────────────────────────────────────────────

function wireSettingControls() {
  for (const setting of SETTINGS_REGISTRY) {
    if (setting.type === 'theme-grid') continue;  // wired inside buildThemeGrid
    if (setting.type === 'sound-library') continue; // wired inside buildSoundLibrary
    const el = document.getElementById(setting.elementId);
    if (!el) continue;

    const eventName = setting.type === 'toggle' ? 'change' : 'input';
    el.addEventListener(eventName, () => {
      if (setting.onChange) setting.onChange(setting.read(el));
      scheduleSave();
    });
  }
}

// ── Extra button wiring ───────────────────────────────────────────────────────

function wireExtraButtons() {
  // Clear Custom CSS
  const btnClearCss = document.getElementById('btn-clear-css');
  const cssEl = document.getElementById('opt-custom-css');
  if (btnClearCss && cssEl) {
    btnClearCss.addEventListener('click', () => { cssEl.value = ''; scheduleSave(); });
  }

  // Export settings
  document.getElementById('btn-export')?.addEventListener('click', () => {
    const data = readAllFromDOM();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pc2-settings.json'; a.click();
    URL.revokeObjectURL(url);
    showToast('⬇ Settings exported');
  });

  // Import settings
  const importBtn = document.getElementById('btn-import');
  const importFile = document.getElementById('import-file');
  importBtn?.addEventListener('click', () => importFile?.click());
  importFile?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        const knownKeys = new Set(SETTINGS_REGISTRY.map((s) => s.key));
        const filtered = Object.fromEntries(
          Object.entries(imported).filter(([k]) => knownKeys.has(k))
        );
        await saveToStorage(filtered);
        writeAllToDOM({ ...getDefaultValues(), ...filtered });
        showToast('⬆ Settings imported');
      } catch {
        showToast('⚠ Invalid settings file', true);
      }
      importFile.value = '';
    };
    reader.readAsText(file);
  });

  // Reset all settings
  document.getElementById('btn-reset')?.addEventListener('click', async () => {
    if (!confirm('Reset all settings to their defaults? This cannot be undone.')) return;
    const defaults = getDefaultValues();
    try {
      await saveToStorage(defaults);
      writeAllToDOM(defaults);
      showToast('↺ Settings reset to defaults');
    } catch {
      showToast('⚠ Reset failed', true);
    }
  });
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

async function init() {
  let stored;
  try {
    stored = await loadFromStorage();
  } catch (e) {
    console.warn('[PC2 Options] Could not load settings, using defaults:', e);
    stored = getDefaultValues();
  }

  // Build theme grid first (needs stored theme id)
  buildThemeGrid(stored.pc2_pdf_theme || 'clean');

  // Build sound library
  buildSoundLibrary(stored.pc2_sound_library || '[]');

  // Wire "Add Sound" button
  document.getElementById('btn-add-sound')?.addEventListener('click', () => {
    addSoundCard({ title: '', url: '', verdicts: [] });
  });

  // Write remaining settings to DOM
  writeAllToDOM(stored);

  initNavigation();
  wireSettingControls();
  wireExtraButtons();
}

document.addEventListener('DOMContentLoaded', init);
