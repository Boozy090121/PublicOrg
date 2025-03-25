// Module loading fix script
console.log('Starting module fix script...');

// Helper function to check if a module is properly loaded
function checkModuleLoaded(moduleName, windowProperty) {
  const propertyExists = window[windowProperty] !== undefined;
  console.log(`Checking ${moduleName} (window.${windowProperty}): ${propertyExists ? 'LOADED' : 'MISSING'}`);
  return propertyExists;
}

// Fix missing modules by adding basic stubs
function fixMissingModules() {
  // Add minimal implementations of required modules
  
  // Fix config
  if (!checkModuleLoaded('config', 'config')) {
    console.log('Adding minimal config module...');
    window.config = {
      init: function() {
        console.log('Minimal config.init() called');
        return Promise.resolve();
      },
      settings: {
        app: {
          name: 'Quality Re-Org & Capability Management Platform',
          version: '1.0.0'
        },
        ui: {
          theme: 'light',
          animations: true
        },
        features: {
          firebase: true,
          localStorage: true
        }
      },
      getConfig: function(key) {
        console.log(`Config.getConfig(${key}) called`);
        // Simple nested property getter
        return key.split('.').reduce((o, i) => o ? o[i] : undefined, this.settings);
      }
    };
  }
  
  // Fix UI
  if (!checkModuleLoaded('ui', 'ui')) {
    console.log('Adding minimal UI module...');
    window.ui = {
      init: function() {
        console.log('Minimal ui.init() called');
        // Set up basic tab navigation
        const tabLinks = document.querySelectorAll('[data-tab]');
        tabLinks.forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('data-tab');
            this.switchTab(tabId);
          });
        });
        
        // Default to dashboard tab
        setTimeout(() => this.switchTab('dashboard'), 100);
        
        return Promise.resolve();
      },
      switchTab: function(tabId) {
        console.log(`Switching to tab: ${tabId}`);
        // Update active tab in navigation
        document.querySelectorAll('#main-nav a').forEach(el => {
          el.classList.remove('active');
        });
        const activeTab = document.querySelector(`#main-nav a[data-tab="${tabId}"]`);
        if (activeTab) activeTab.classList.add('active');
        
        // Clear tab content
        const tabContent = document.getElementById('tab-content');
        if (tabContent) {
          tabContent.innerHTML = `<div id="${tabId}-tab-content">
            <h2>${tabId.charAt(0).toUpperCase() + tabId.slice(1)}</h2>
            <p>This module is currently being repaired. Please try again later.</p>
          </div>`;
        }
        
        // Update app state
        if (window.appData && window.appData.state) {
          window.appData.state.currentTab = tabId;
        }
      },
      refreshAllTabs: function() {
        console.log('Refreshing all tabs (minimal implementation)');
        // Just refresh the current tab
        if (window.appData && window.appData.state && window.appData.state.currentTab) {
          this.switchTab(window.appData.state.currentTab);
        }
      }
    };
  }
  
  // Fix orgChart
  if (!window.orgChart) {
    console.log('Adding minimal orgChart module...');
    window.orgChart = {
      init: function() {
        console.log('Minimal orgChart.init() called');
        return Promise.resolve();
      },
      render: function(containerId) {
        console.log(`orgChart.render(${containerId}) called`);
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = `
            <div class="module-repair-message">
              <h3>Org Chart Module</h3>
              <p>This module is currently being repaired. Please try again later.</p>
            </div>
          `;
        }
      }
    };
  }
  
  // Fix raciMatrix
  if (!window.raciMatrix) {
    console.log('Adding minimal raciMatrix module...');
    window.raciMatrix = {
      init: function() {
        console.log('Minimal raciMatrix.init() called');
        return Promise.resolve();
      },
      render: function(containerId) {
        console.log(`raciMatrix.render(${containerId}) called`);
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = `
            <div class="module-repair-message">
              <h3>RACI Matrix Module</h3>
              <p>This module is currently being repaired. Please try again later.</p>
            </div>
          `;
        }
      }
    };
  }
  
  console.log('Module fixes applied');
}

// Fix any path casing issues that might be present
function fixPathCasing() {
  // Create mapping for common path casing issues
  const pathMapping = {
    'js/modules/racimatrix.js': 'js/modules/raciMatrix.js',
    'js/modules/orgchart.js': 'js/modules/orgChart.js',
    'js/modules/teambuilder.js': 'js/modules/teamBuilder.js',
    'js/modules/skillsmatrix.js': 'js/modules/skillsMatrix.js'
  };
  
  // Patch the loadScript function to handle casing issues
  const originalLoadScript = window.loadScript;
  if (originalLoadScript) {
    window.loadScript = function(src) {
      console.log(`Attempting to load script: ${src}`);
      // Check if we have a mapping for this path
      const mappedSrc = pathMapping[src.toLowerCase()] || src;
      if (mappedSrc !== src) {
        console.log(`Remapped path ${src} to ${mappedSrc}`);
      }
      
      // Call the original loadScript with possibly remapped path
      return originalLoadScript(mappedSrc).catch(error => {
        console.error(`Failed to load ${mappedSrc}:`, error);
        // Apply fixes for known modules
        fixMissingModules();
        // Return a resolved promise to prevent further errors
        return Promise.resolve();
      });
    };
  }
}

// Patch the error handling to ensure the app still loads
function enhanceErrorHandling() {
  // Override the showError function to be more informative
  if (window.showError) {
    const originalShowError = window.showError;
    window.showError = function(message) {
      console.error('Enhanced error handling:', message);
      // Call original function
      originalShowError(`${message} - Recovery mode has been activated.`);
      
      // Apply fixes
      fixMissingModules();
    };
  }
  
  // Add global error handler
  window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
    // Apply fixes
    fixMissingModules();
    // Prevent default behavior
    event.preventDefault();
  });
}

// Apply all fixes when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, applying module fixes...');
  
  // Fix path casing issues
  fixPathCasing();
  
  // Enhance error handling
  enhanceErrorHandling();
  
  // Add recovery UI
  const recoveryMessage = document.createElement('div');
  recoveryMessage.innerHTML = `
    <div id="recovery-message" style="position: fixed; bottom: 0; left: 0; right: 0; background-color: #f8d7da; color: #721c24; padding: 10px; text-align: center; z-index: 9999;">
      <p>Some modules failed to load. Recovery mode active. <button id="retry-loading">Retry Loading Modules</button></p>
    </div>
  `;
  document.body.appendChild(recoveryMessage);
  
  // Add retry button functionality
  document.getElementById('retry-loading').addEventListener('click', function() {
    console.log('Retrying module loading...');
    window.location.reload();
  });
  
  console.log('Module fixes complete');
});

// Export the fix functions for external use
window.moduleFixes = {
  checkModuleLoaded,
  fixMissingModules,
  fixPathCasing,
  enhanceErrorHandling
};

console.log('Module fix script loaded successfully'); 