(function() {
    document.documentElement.setAttribute('data-pc2-styles-url', chrome.runtime.getURL('pc2-styles.css'));
    
    // Read enabled setting from chrome.storage.local (defaults to true)
    chrome.storage.local.get({ pc2_enabled: true }, (result) => {
        document.documentElement.setAttribute('data-pc2-enabled', result.pc2_enabled ? 'true' : 'false');
    });
})();
