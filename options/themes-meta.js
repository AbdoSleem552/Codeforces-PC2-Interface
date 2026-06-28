/**
 * PC² PDF Themes — Options Page Metadata  —  options/themes-meta.js
 *
 * This file is loaded ONLY by the extension's Settings page (options.html).
 * It contains NO CSS — only the metadata needed to render the theme picker UI.
 *
 * The actual CSS for each theme lives in src/pdf-themes.js (content-script).
 *
 * To add a new theme:
 *   1. Add the full CSS entry in  src/pdf-themes.js
 *   2. Add the metadata entry here (id, name, description, preview)
 *   3. Add it to manifest.json content_scripts list (before print.js)
 */

window.PC2_THEMES_META = [
  {
    id: 'clean',
    name: 'Clean White',
    description: 'Minimal serif layout — classic competitive programming look.',
    preview: {
      bg:      '#ffffff',
      title:   '#111827',
      pillBg:  '#f3f4f6',
      pillFg:  '#6b7280',
      text:    '#d1d5db',
    }
  },
  {
    id: 'blue',
    name: 'Blue Accent',
    description: 'Crisp white with blue highlights — ICPC style.',
    preview: {
      bg:      '#ffffff',
      title:   '#1d4ed8',
      pillBg:  '#dbeafe',
      pillFg:  '#1e40af',
      text:    '#93c5fd',
    }
  },
  {
    id: 'dark',
    name: 'Dark Hacker',
    description: 'Dark background with green terminal aesthetic.',
    preview: {
      bg:      '#0d1117',
      title:   '#22c55e',
      pillBg:  '#161b22',
      pillFg:  '#22c55e',
      text:    '#30363d',
    }
  },
  {
    id: 'parchment',
    name: 'Warm Parchment',
    description: 'Sepia-tinted, easy-to-read scholarly layout.',
    preview: {
      bg:      '#fdf8f0',
      title:   '#78350f',
      pillBg:  '#fef3c7',
      pillFg:  '#92400e',
      text:    '#d97706',
    }
  },
  {
    id: 'contrast',
    name: 'High Contrast',
    description: 'Maximum readability with bold black borders.',
    preview: {
      bg:      '#ffffff',
      title:   '#000000',
      pillBg:  '#000000',
      pillFg:  '#ffffff',
      text:    '#999999',
    }
  },
];
