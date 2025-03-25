// Quick fix script - Ensures UI module is available
console.log('Quick fix script running...');

// Create a basic UI object if one doesn't exist
window.ui = window.ui || {
  initialized: false,
  init: function() {
    console.log('Basic UI initialized from quick-fix.js');
    this.initialized = true;
    this.setupTabs();
    return true;
  },
  setupTabs: function() {
    // Basic tab functionality
    document.querySelectorAll('[data-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        this.switchTab(tabId);
      });
    });
  },
  switchTab: function(tabId) {
    console.log('Switching to tab:', tabId);
    
    // Update active tab in navigation
    document.querySelectorAll('#main-nav .nav-item').forEach(el => {
      el.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`#main-nav [data-tab="${tabId}"]`);
    if (activeTab) activeTab.classList.add('active');
    
    // Show simple tab content
    const tabContent = document.getElementById('tabContent');
    if (tabContent) {
      tabContent.innerHTML = `<h2>${tabId.charAt(0).toUpperCase() + tabId.slice(1)}</h2><p>Tab content for ${tabId}</p>`;
    }
  },
  showToast: function(message, type) {
    alert(message);
  }
};

// Helper function to safely load scripts
function safeLoadScript(src, async = true) {
  return new Promise((resolve, reject) => {
    try {
      const script = document.createElement('script');
      script.src = src;
      script.async = async;
      
      script.onload = () => {
        console.log(`Successfully loaded: ${src}`);
        resolve();
      };
      
      script.onerror = (error) => {
        console.warn(`Failed to load script: ${src}`, error);
        resolve(); // Resolve anyway to continue loading other scripts
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.error(`Error attempting to load ${src}:`, error);
      resolve(); // Resolve anyway to continue loading other scripts
    }
  });
}

// Preload the UI module when the document loads
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('Quick-fix: Pre-loading essential modules...');
    await safeLoadScript('js/modules/ui.js', false);
    console.log('Quick-fix: UI module preload complete');
  } catch (error) {
    console.error('Quick-fix: Error preloading modules:', error);
  }
});

console.log('Quick fix script loaded'); 