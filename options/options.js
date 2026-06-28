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
    default: true,
    elementId: 'opt-fancy-bg',
    type: 'toggle',
    read:  (el) => el.checked,
    write: (el, v) => { el.checked = !!v; },
  },
  {
    key: 'pc2_theme',
    default: 'classic',
    elementId: 'opt-theme',
    type: 'select',
    read:  (el) => el.value,
    write: (el, v) => { el.value = v; },
  },
  {
    key: 'pc2_scale',
    default: 1.0,
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
    default: false,
    elementId: 'opt-start-maximized',
    type: 'toggle',
    read:  (el) => el.checked,
    write: (el, v) => { el.checked = !!v; },
  },

  // ── Interface ────────────────────────────────────────────────────────────────
  {
    key: 'pc2_auto_refresh_runs',
    default: false,
    elementId: 'opt-auto-refresh',
    type: 'toggle',
    read:  (el) => el.checked,
    write: (el, v) => { el.checked = !!v; },
  },
  {
    key: 'pc2_default_tab',
    default: 'tab-submit',
    elementId: 'opt-default-tab',
    type: 'select',
    read:  (el) => el.value,
    write: (el, v) => { el.value = v; },
  },
  {
    key: 'pc2_show_submit_confirm',
    default: true,
    elementId: 'opt-submit-confirm',
    type: 'toggle',
    read:  (el) => el.checked,
    write: (el, v) => { el.checked = !!v; },
  },

  // ── Printing ─────────────────────────────────────────────────────────────────
  {
    key: 'pc2_pdf_theme',
    default: 'clean',
    elementId: null,          // custom control — managed by buildThemeGrid()
    type: 'theme-grid',
    read:  () => _currentTheme,
    write: (_, v) => selectThemeCard(v),
  },
  {
    key: 'pc2_custom_print_css',
    default: '',
    elementId: 'opt-custom-css',
    type: 'textarea',
    read:  (el) => el.value,
    write: (el, v) => { el.value = v || ''; },
  },
  {
    key: 'pc2_print_page_size',
    default: 'A4',
    elementId: 'opt-paper-size',
    type: 'select',
    read:  (el) => el.value,
    write: (el, v) => { el.value = v; },
  },
  {
    key: 'pc2_print_show_header',
    default: false,
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
    if (setting.type === 'theme-grid') {
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
    if (setting.type === 'theme-grid') {
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
    if (setting.type === 'theme-grid') continue; // wired inside buildThemeGrid
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

  // Write remaining settings to DOM
  writeAllToDOM(stored);

  initNavigation();
  wireSettingControls();
  wireExtraButtons();
}

document.addEventListener('DOMContentLoaded', init);
