(function () {
    const extUrl = chrome.runtime.getURL('');
    document.documentElement.setAttribute('data-pc2-ext-url', extUrl);
    document.documentElement.setAttribute('data-pc2-styles-url', chrome.runtime.getURL('pc2-styles.css'));

    const defaults = { ...PC2_DEFAULT_CONFIG };
    defaults.pc2_sound_library = JSON.stringify(defaults.pc2_sound_library);

    // Bridge ALL storage settings that MAIN-world scripts need to read.
    // MAIN world has no chrome.* APIs, so we pass values via data attributes.
    chrome.storage.local.get(defaults, (result) => {
        document.documentElement.setAttribute('data-pc2-enabled',           result.pc2_enabled ? 'true' : 'false');
        document.documentElement.setAttribute('data-pc2-pdf-theme',         result.pc2_pdf_theme || 'clean');
        document.documentElement.setAttribute('data-pc2-custom-print-css',  result.pc2_custom_print_css || '');
        document.documentElement.setAttribute('data-pc2-sounds-enabled',    result.pc2_sounds_enabled !== false ? 'true' : 'false');
        document.documentElement.setAttribute('data-pc2-sound-library',     result.pc2_sound_library || '[]');
    });

    // Listen for live updates from Options page to apply without refresh
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') return;

        if (changes.pc2_enabled) {
            document.documentElement.setAttribute('data-pc2-enabled', changes.pc2_enabled.newValue ? 'true' : 'false');
        }
        if (changes.pc2_pdf_theme) {
            document.documentElement.setAttribute('data-pc2-pdf-theme', changes.pc2_pdf_theme.newValue || 'clean');
        }
        if (changes.pc2_custom_print_css) {
            document.documentElement.setAttribute('data-pc2-custom-print-css', changes.pc2_custom_print_css.newValue || '');
        }
        if (changes.pc2_sounds_enabled) {
            document.documentElement.setAttribute('data-pc2-sounds-enabled', changes.pc2_sounds_enabled.newValue !== false ? 'true' : 'false');
        }
        if (changes.pc2_sound_library) {
            document.documentElement.setAttribute('data-pc2-sound-library', changes.pc2_sound_library.newValue || '[]');
        }
    });
})();
