/**
 * PC² PDF Theme Registry  —  src/pdf-themes.js
 *
 * Each theme is a self-contained descriptor.
 * To add a new theme: add ONE entry here. Nothing else needs to change.
 *
 * Fields:
 *   id          – unique key stored in chrome.storage.local
 *   name        – display name shown in the Settings UI
 *   description – one-line description shown in the Settings UI
 *   css         – full CSS injected into the PDF print window
 */

window.PC2 = window.PC2 || {};

window.PC2.PDF_THEMES = {

    // ── 1. Clean White ────────────────────────────────────────────────────────
    clean: {
        id: 'clean',
        name: 'Clean White',
        description: 'Minimal serif layout — classic competitive programming look.',
        css: `
            body {
                margin: 0; padding: 40px;
                background: #fff; color: #1f2937;
                font-family: "Times New Roman", Times, serif;
                font-size: 15px; line-height: 1.6;
            }
            .problem-wrap { max-width: 860px; margin: 0 auto; }
            .problem-wrap + .problem-wrap { page-break-before: always; }
            .pc2-modern-title {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                font-size: 1.75rem; font-weight: 700; color: #111827;
                margin: 0 0 1rem; padding-bottom: .5rem;
                border-bottom: 2px solid #e5e7eb;
            }
            .problem-metadata {
                font-family: -apple-system, sans-serif;
                display: flex; flex-wrap: wrap; gap: .75rem; margin-bottom: 2rem;
            }
            .meta-tag {
                background: #f3f4f6; color: #4b5563;
                padding: .35rem .75rem; border-radius: 9999px;
                font-size: .85rem; border: 1px solid #e5e7eb;
            }
            .meta-tag strong { color: #111827; font-weight: 600; }
            .samples-table {
                font-family: -apple-system, sans-serif;
                width: 100%; border-collapse: separate; border-spacing: 0;
                border: 1px solid #d1d5db; border-radius: 8px;
                overflow: hidden; margin: 1.5rem 0; table-layout: fixed;
            }
            .samples-table th {
                background: #f9fafb; font-weight: 600; text-align: left;
                padding: .75rem 1rem; border-bottom: 1px solid #d1d5db;
                color: #374151; width: 50%;
            }
            .samples-table th:first-child { border-right: 1px solid #d1d5db; }
            .samples-table td { padding: 1rem; vertical-align: top; }
            .samples-table td:first-child { border-right: 1px solid #d1d5db; }
            .samples-table pre {
                white-space: pre-wrap; word-wrap: break-word;
                font-family: ui-monospace, Menlo, Consolas, monospace;
                font-size: .875rem; margin: 0; color: #1f2937;
            }
            .problem-statement p { margin-bottom: 1rem; }
            .section-title { font-weight: bold; font-size: 1.1rem; margin: 1.2rem 0 .5rem; }
            .katex-display { margin: 1rem 0; overflow-x: auto; }
        `
    },

    // ── 2. Blue Accent ────────────────────────────────────────────────────────
    blue: {
        id: 'blue',
        name: 'Blue Accent',
        description: 'Crisp white with blue highlights — ICPC style.',
        css: `
            body {
                margin: 0; padding: 40px;
                background: #fff; color: #1e293b;
                font-family: "Georgia", serif; font-size: 14.5px; line-height: 1.65;
            }
            .problem-wrap { max-width: 860px; margin: 0 auto; }
            .problem-wrap + .problem-wrap { page-break-before: always; }
            .pc2-modern-title {
                font-family: -apple-system, sans-serif;
                font-size: 1.75rem; font-weight: 800; color: #1d4ed8;
                margin: 0 0 1rem; padding-bottom: .5rem;
                border-bottom: 3px solid #3b82f6;
            }
            .problem-metadata {
                font-family: -apple-system, sans-serif;
                display: flex; flex-wrap: wrap; gap: .6rem; margin-bottom: 2rem;
            }
            .meta-tag {
                background: #dbeafe; color: #1e40af;
                padding: .3rem .8rem; border-radius: 6px;
                font-size: .82rem; border: 1px solid #bfdbfe;
            }
            .meta-tag strong { color: #1d4ed8; font-weight: 700; }
            .samples-table {
                font-family: -apple-system, sans-serif;
                width: 100%; border-collapse: collapse;
                border: 2px solid #3b82f6; margin: 1.5rem 0; table-layout: fixed;
            }
            .samples-table th {
                background: #2563eb; color: #fff; font-weight: 700;
                text-align: left; padding: .75rem 1rem; width: 50%;
            }
            .samples-table th:first-child { border-right: 1px solid #60a5fa; }
            .samples-table td { padding: .9rem 1rem; vertical-align: top; border-top: 1px solid #dbeafe; }
            .samples-table td:first-child { border-right: 2px solid #3b82f6; }
            .samples-table pre {
                white-space: pre-wrap; word-wrap: break-word;
                font-family: ui-monospace, Consolas, monospace;
                font-size: .875rem; margin: 0; color: #0f172a;
            }
            .problem-statement p { margin-bottom: 1rem; }
            .section-title { font-weight: bold; font-size: 1.1rem; margin: 1.2rem 0 .5rem; color: #1d4ed8; }
            .katex-display { margin: 1rem 0; overflow-x: auto; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        `
    },

    // ── 3. Dark Hacker ────────────────────────────────────────────────────────
    dark: {
        id: 'dark',
        name: 'Dark Hacker',
        description: 'Dark background with green terminal aesthetic.',
        css: `
            body {
                margin: 0; padding: 40px;
                background: #0d1117; color: #e6edf3;
                font-family: "Consolas", "Fira Code", monospace;
                font-size: 13.5px; line-height: 1.7;
            }
            .problem-wrap { max-width: 860px; margin: 0 auto; }
            .problem-wrap + .problem-wrap { page-break-before: always; }
            .pc2-modern-title {
                font-family: "Consolas", monospace;
                font-size: 1.6rem; font-weight: 700; color: #22c55e;
                margin: 0 0 1rem; padding-bottom: .5rem;
                border-bottom: 2px solid #22c55e;
            }
            .problem-metadata {
                display: flex; flex-wrap: wrap; gap: .6rem; margin-bottom: 2rem;
            }
            .meta-tag {
                background: #161b22; color: #7ee787;
                padding: .3rem .75rem; border-radius: 4px;
                font-size: .82rem; border: 1px solid #30363d;
            }
            .meta-tag strong { color: #22c55e; font-weight: 700; }
            .samples-table {
                width: 100%; border-collapse: collapse;
                border: 1px solid #30363d; margin: 1.5rem 0; table-layout: fixed;
            }
            .samples-table th {
                background: #161b22; color: #22c55e; font-weight: 700;
                text-align: left; padding: .75rem 1rem; width: 50%;
                border-bottom: 1px solid #22c55e;
            }
            .samples-table th:first-child { border-right: 1px solid #30363d; }
            .samples-table td { padding: .9rem 1rem; vertical-align: top; border-top: 1px solid #21262d; }
            .samples-table td:first-child { border-right: 1px solid #30363d; }
            .samples-table pre {
                white-space: pre-wrap; word-wrap: break-word;
                font-family: "Consolas", monospace;
                font-size: .85rem; margin: 0; color: #a5d6ff;
            }
            .problem-statement p { margin-bottom: 1rem; }
            .section-title { font-weight: bold; font-size: 1.05rem; margin: 1.2rem 0 .5rem; color: #22c55e; }
            .katex-display { margin: 1rem 0; overflow-x: auto; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        `
    },

    // ── 4. Warm Parchment ─────────────────────────────────────────────────────
    parchment: {
        id: 'parchment',
        name: 'Warm Parchment',
        description: 'Sepia-tinted, easy-to-read scholarly layout.',
        css: `
            body {
                margin: 0; padding: 40px;
                background: #fdf8f0; color: #3d2b1f;
                font-family: "Palatino Linotype", Palatino, "Book Antiqua", serif;
                font-size: 15px; line-height: 1.7;
            }
            .problem-wrap { max-width: 860px; margin: 0 auto; }
            .problem-wrap + .problem-wrap { page-break-before: always; }
            .pc2-modern-title {
                font-family: "Palatino Linotype", Palatino, serif;
                font-size: 1.75rem; font-weight: 700; color: #78350f;
                margin: 0 0 1rem; padding-bottom: .5rem;
                border-bottom: 2px solid #d97706;
            }
            .problem-metadata {
                font-family: -apple-system, sans-serif;
                display: flex; flex-wrap: wrap; gap: .6rem; margin-bottom: 2rem;
            }
            .meta-tag {
                background: #fef3c7; color: #78350f;
                padding: .3rem .75rem; border-radius: 6px;
                font-size: .83rem; border: 1px solid #fde68a;
            }
            .meta-tag strong { color: #92400e; font-weight: 700; }
            .samples-table {
                font-family: -apple-system, sans-serif;
                width: 100%; border-collapse: collapse;
                border: 2px solid #d97706; margin: 1.5rem 0; table-layout: fixed;
            }
            .samples-table th {
                background: #fef3c7; color: #78350f; font-weight: 700;
                text-align: left; padding: .75rem 1rem; width: 50%;
                border-bottom: 2px solid #d97706;
            }
            .samples-table th:first-child { border-right: 1px solid #d97706; }
            .samples-table td { padding: .9rem 1rem; vertical-align: top; border-top: 1px solid #fde68a; }
            .samples-table td:first-child { border-right: 1px solid #d97706; }
            .samples-table pre {
                white-space: pre-wrap; word-wrap: break-word;
                font-family: ui-monospace, Consolas, monospace;
                font-size: .875rem; margin: 0; color: #3d2b1f;
                background: #fefce8; padding: .5rem; border-radius: 4px;
            }
            .problem-statement p { margin-bottom: 1rem; }
            .section-title { font-weight: bold; font-size: 1.1rem; margin: 1.2rem 0 .5rem; color: #92400e; }
            .katex-display { margin: 1rem 0; overflow-x: auto; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        `
    },

    // ── 5. High Contrast ──────────────────────────────────────────────────────
    contrast: {
        id: 'contrast',
        name: 'High Contrast',
        description: 'Maximum readability with bold black borders.',
        css: `
            body {
                margin: 0; padding: 40px;
                background: #fff; color: #000;
                font-family: Arial, Helvetica, sans-serif;
                font-size: 14px; line-height: 1.6;
            }
            .problem-wrap { max-width: 860px; margin: 0 auto; }
            .problem-wrap + .problem-wrap { page-break-before: always; }
            .pc2-modern-title {
                font-family: Arial, Helvetica, sans-serif;
                font-size: 1.6rem; font-weight: 900; color: #000;
                margin: 0 0 1rem; padding-bottom: .5rem;
                border-bottom: 4px solid #000;
            }
            .problem-metadata {
                display: flex; flex-wrap: wrap; gap: .6rem; margin-bottom: 2rem;
            }
            .meta-tag {
                background: #000; color: #fff;
                padding: .3rem .75rem; border-radius: 3px;
                font-size: .82rem; font-weight: 700;
            }
            .meta-tag strong { color: #fff; }
            .samples-table {
                width: 100%; border-collapse: collapse;
                border: 3px solid #000; margin: 1.5rem 0; table-layout: fixed;
            }
            .samples-table th {
                background: #000; color: #fff; font-weight: 900;
                text-align: left; padding: .75rem 1rem; width: 50%;
            }
            .samples-table th:first-child { border-right: 2px solid #fff; }
            .samples-table td { padding: .9rem 1rem; vertical-align: top; border-top: 2px solid #000; }
            .samples-table td:first-child { border-right: 3px solid #000; }
            .samples-table pre {
                white-space: pre-wrap; word-wrap: break-word;
                font-family: "Courier New", monospace;
                font-size: .875rem; margin: 0; color: #000;
            }
            .problem-statement p { margin-bottom: 1rem; }
            .section-title { font-weight: 900; font-size: 1.1rem; margin: 1.2rem 0 .5rem; text-decoration: underline; }
            .katex-display { margin: 1rem 0; overflow-x: auto; }
        `
    },
};
