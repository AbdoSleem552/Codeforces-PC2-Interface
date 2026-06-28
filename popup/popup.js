document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('enable-toggle');
  const statusDesc = document.getElementById('status-desc');

  // Load current setting
  chrome.storage.local.get({ pc2_enabled: true }, (result) => {
    toggle.checked = result.pc2_enabled;
    updateStatusText(result.pc2_enabled);
  });

  // Save setting on toggle
  toggle.addEventListener('change', () => {
    const isEnabled = toggle.checked;
    chrome.storage.local.set({ pc2_enabled: isEnabled }, () => {
      updateStatusText(isEnabled);
      
      // Reload active tab if it's a Codeforces page
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url || '';
        if (url.includes('codeforces.com')) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
    });
  });

  // Open Options page
  document.getElementById('open-settings-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  function updateStatusText(enabled) {
    if (enabled) {
      statusDesc.textContent = "Active";
      statusDesc.classList.remove('disabled');
      statusDesc.style.color = '#4caf50';
    } else {
      statusDesc.textContent = "Disabled";
      statusDesc.classList.add('disabled');
      statusDesc.style.color = '#a0a0c0';
    }
  }
});
