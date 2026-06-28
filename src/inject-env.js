(function () {
    document.documentElement.setAttribute('data-pc2-styles-url', chrome.runtime.getURL('pc2-styles.css'));

    // Bridge ALL storage settings that MAIN-world scripts need to read.
    // MAIN world has no chrome.* APIs, so we pass values via data attributes.
    chrome.storage.local.get({
        pc2_enabled:          true,
        pc2_pdf_theme:        'clean',
        pc2_custom_print_css: '',
    }, (result) => {
        document.documentElement.setAttribute('data-pc2-enabled',          result.pc2_enabled ? 'true' : 'false');
        document.documentElement.setAttribute('data-pc2-pdf-theme',        result.pc2_pdf_theme || 'clean');
        document.documentElement.setAttribute('data-pc2-custom-print-css', result.pc2_custom_print_css || '');
    });
})();
