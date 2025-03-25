/**
 * Fixed Modules - Helper script for ensuring core modules are available
 * This script provides fallbacks when modules fail to load
 */

// Set flag to prevent automatic fixed-index creation
window.disableFixedIndexCreation = true;
console.log('Fixed index creation disabled by flag');

// Utility function to load scripts dynamically

console.log('Loading fixed modules...');

// Function to safely load a script and add it to head
function loadScript(src, callback) {
  const script = document.createElement('script');
  script.src = src;
  script.async = false; // Preserve loading order
  
  // Handle load events
  script.onload = function() {
    console.log(`Successfully loaded: ${src}`);
    if (callback) callback(null, src);
  };
  
  script.onerror = function(error) {
    console.error(`Failed to load: ${src}`, error);
    if (callback) callback(error, src);
  };
  
  // Add to document
  document.head.appendChild(script);
  
  return script;
}

// Function to fix a module's global variable assignment
function fixModuleExport(moduleName, modulePath, variableName, fallbackImplementation) {
  console.log(`Fixing module: ${moduleName}`);
  
  // Create wrapper function to ensure variable exists in global scope
  window[`${moduleName}Wrapper`] = function() {
    console.log(`Running wrapper for ${moduleName}`);
    
    // Try to access the module's variable
    if (typeof window[variableName] !== 'undefined') {
      console.log(`Module ${moduleName} already exists as ${variableName}`);
      return window[variableName];
    }
    
    // Try to access with different casing
    const lowerCaseVar = variableName.toLowerCase();
    if (typeof window[lowerCaseVar] !== 'undefined') {
      console.log(`Module ${moduleName} exists as ${lowerCaseVar}, fixing casing...`);
      window[variableName] = window[lowerCaseVar];
      return window[variableName];
    }
    
    // Check if the variable exists in any other scope
    try {
      // Look for variables in the global window object
      const possibleVars = Object.keys(window).filter(key => 
        key.toLowerCase().includes(moduleName.toLowerCase())
      );
      
      if (possibleVars.length > 0) {
        console.log(`Found possible matches for ${moduleName}: ${possibleVars.join(', ')}`);
        // Use the first matching variable
        window[variableName] = window[possibleVars[0]];
        return window[variableName];
      }
    } catch (error) {
      console.error(`Error searching for ${moduleName} variable:`, error);
    }
    
    // If all else fails, use the fallback implementation
    console.log(`Using fallback implementation for ${moduleName}`);
    window[variableName] = fallbackImplementation;
    
    // Try to load the actual module script
    try {
      loadScript(modulePath, function(err) {
        if (err) {
          console.warn(`Could not load original module from ${modulePath}, using fallback permanently`);
        } else {
          console.log(`Successfully loaded ${modulePath}, checking if it defined ${variableName}`);
          // Check if the loaded script defined the expected variable
          if (typeof window[variableName] === 'undefined' || 
              window[variableName] === fallbackImplementation) {
            // Still using fallback, try to fix paths
            const altPath = modulePath.replace(/^js\//, '').replace(/^src\//, '');
            if (altPath !== modulePath) {
              console.log(`Trying alternative path: ${altPath}`);
              loadScript(altPath, function(err2) {
                if (err2) {
                  console.warn(`Could not load from alternative path ${altPath}`);
                }
              });
            }
          }
        }
      });
    } catch (e) {
      console.error(`Error attempting to load ${modulePath}:`, e);
    }
    
    return window[variableName];
  };
  
  // Return the wrapper function
  return window[`${moduleName}Wrapper`];
}

// Define fallback implementations for core modules
const configFallback = {
  init: function() {
    console.log('Fallback config.init() called');
    return Promise.resolve();
  },
  
  appName: 'Quality Re-Org Hub',
  version: '1.0.0',
  defaultValueStream: 'bbv',
  
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
  
  colors: {
    bbv: '#00518A',
    add: '#CC2030',
    arb: '#4F46E5',
    shared: '#232323'
  },
  
  valueStreams: {
    bbv: {
      name: 'BBV',
      color: '#00518A',
      fullName: 'BBV Quality'
    },
    add: {
      name: 'ADD',
      color: '#CC2030',
      fullName: 'ADD Quality'
    },
    arb: {
      name: 'ARB',
      color: '#4F46E5',
      fullName: 'ARB Quality'
    }
  },
  
  tabs: [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
    { id: 'personnel', label: 'Personnel', icon: 'fa-users' },
    { id: 'teams', label: 'Team Builder', icon: 'fa-user-friends' },
    { id: 'racimatrix', label: 'RACI Matrix', icon: 'fa-table' },
    { id: 'skillsmatrix', label: 'Skills Matrix', icon: 'fa-chart-bar' },
    { id: 'skilltree', label: 'Skill Tree', icon: 'fa-project-diagram' }
  ],
  
  api: {
    base: '/api',
    teams: '/api/teams',
    personnel: '/api/personnel'
  },
  
  getConfig: function(key) {
    if (!key) return this.settings;
    return key.split('.').reduce((o, i) => o ? o[i] : undefined, this.settings);
  },
  
  setConfig: function(path, value) {
    if (!path) return;
    
    const parts = path.split('.');
    let current = this.settings;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
    return value;
  }
};

const uiFallback = {
  init: function() {
    console.log('Fallback ui.init() called');
    
    // Set up basic tab navigation
    setTimeout(() => {
      const tabLinks = document.querySelectorAll('[data-tab]');
      tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const tabId = link.getAttribute('data-tab');
          this.switchTab(tabId);
        });
      });
      
      // Default to dashboard tab
      this.switchTab('dashboard');
    }, 100);
    
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
    
    // Update app state
    if (window.appData && window.appData.state) {
      window.appData.state.currentTab = tabId;
    }
    
    // Update tab content
    switch (tabId) {
      // Add basic tab implementations here
      default:
        // Find or create tab content element
        let tabContent = document.getElementById('tab-content');
        if (!tabContent) {
          tabContent = document.createElement('div');
          tabContent.id = 'tab-content';
          document.querySelector('.main-content').appendChild(tabContent);
        }
        
        tabContent.innerHTML = `
          <div id="${tabId}-tab-content">
            <h2>${tabId.charAt(0).toUpperCase() + tabId.slice(1)}</h2>
            <p>This module is loading...</p>
          </div>
        `;
    }
  },
  refreshAllTabs: function() {
    console.log('Refreshing all tabs');
    
    // Get current tab
    if (window.appData && window.appData.state && window.appData.state.currentTab) {
      this.switchTab(window.appData.state.currentTab);
    } else {
      this.switchTab('dashboard');
    }
  }
};

const orgChartFallback = {
  init: function() {
    console.log('Fallback orgChart.init() called');
    return Promise.resolve();
  },
  render: function(containerId) {
    console.log(`orgChart.render(${containerId}) called`);
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #ffc107; margin-bottom: 15px;">
          <h3 style="color: #856404; margin-top: 0;">Organization Chart</h3>
          <p>The organization chart module is running in recovery mode.</p>
        </div>
      `;
    }
  }
};

const raciMatrixFallback = {
  init: function() {
    console.log('Fallback raciMatrix.init() called');
    return Promise.resolve();
  },
  render: function(containerId) {
    console.log(`raciMatrix.render(${containerId}) called`);
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #ffc107; margin-bottom: 15px;">
          <h3 style="color: #856404; margin-top: 0;">RACI Matrix</h3>
          <p>The RACI matrix module is running in recovery mode.</p>
        </div>
      `;
    }
  }
};

// Fix the core modules
const configWrapper = fixModuleExport('config', 'js/core/config.js', 'config', configFallback);
const uiWrapper = fixModuleExport('ui', 'js/modules/ui.js', 'ui', uiFallback);
const orgChartWrapper = fixModuleExport('orgChart', 'js/modules/orgchart.js', 'orgChart', orgChartFallback);
const raciMatrixWrapper = fixModuleExport('raciMatrix', 'js/modules/racimatrix.js', 'raciMatrix', raciMatrixFallback);

// Try additional paths for the common modules
setTimeout(() => {
  if (window.ui === uiFallback) {
    loadScript('src/modules/ui.js');
    loadScript('src/ui.js');
  }
  
  if (window.config === configFallback) {
    loadScript('src/core/config.js');
    loadScript('src/config.js');
  }
}, 1000);

// Ensure the application modules are available globally
window.config = configWrapper();
window.ui = uiWrapper();
window.orgChart = orgChartWrapper();
window.raciMatrix = raciMatrixWrapper();

// Create the fixed files
// createFixedIndexHtml(); // Disabled - No longer automatically create fixed HTML file
console.log('Fixed HTML creation disabled');
// Conditionally create restart script, it's now automatic only when errors occur
// Exposing a function to manually create it if needed

// Create a restart script
function createRestartScript() {
  // Only create the script if requested or if there was an error detected
  if (window.createFixedScriptRequested || window.moduleLoadErrors) {
    const scriptContent = `
      @echo off
      echo Starting Quality Re-Org Platform with Fixed Modules...
      echo.
      
      start fixed-index.html
      echo.
      echo If the application doesn't open automatically, please
      echo manually open fixed-index.html in your browser.
      echo.
      echo Press any key to exit...
      pause >nul
    `;
    
    // Create a Blob with the script content
    const blob = new Blob([scriptContent], { type: 'application/bat' });
    const blobUrl = URL.createObjectURL(blob);
    
    // Create a download link
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'start-fixed.bat';
    a.textContent = 'Download Fixed Starter';
    a.style.display = 'none';
    
    // Only append to document.body if it exists
    if (document.body) {
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      }, 100);
    } else {
      // If document.body is not available yet, wait for DOMContentLoaded
      document.addEventListener('DOMContentLoaded', function() {
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
          document.body.removeChild(a);
        }, 100);
      });
    }
  } else {
    console.log('Skipping creation of start-fixed.bat as no errors were detected');
  }
}

// Add global flag to track if any module errors have been detected
window.moduleLoadErrors = false;

// Add error event listener to catch and handle module loading errors
window.addEventListener('error', function(event) {
  console.error('Global error caught:', event.message);
  console.error('File:', event.filename);
  console.error('Line:', event.lineno);
  
  // Set the error flag when module errors are detected
  window.moduleLoadErrors = true;
  
  // Check if the error is related to a specific module
  const moduleNames = ['config', 'ui', 'orgChart', 'raciMatrix'];
  
  for (const moduleName of moduleNames) {
    if (event.message.includes(moduleName) || 
        (event.filename && event.filename.includes(moduleName.toLowerCase()))) {
      console.log(`Error appears to be related to ${moduleName} module, attempting fix...`);
      // Re-apply the corresponding wrapper
      if (window[`${moduleName}Wrapper`]) {
        window[moduleName] = window[`${moduleName}Wrapper`]();
      }
    }
  }
});

// Create the fixed files
// createFixedIndexHtml(); // Disabled - No longer automatically create fixed HTML file
console.log('Fixed HTML creation disabled');
// Conditionally create restart script, it's now automatic only when errors occur
// Exposing a function to manually create it if needed

console.log('Fixed modules loaded and applied');

// For interactive testing
window.fixedModules = {
  configWrapper,
  uiWrapper,
  orgChartWrapper,
  raciMatrixWrapper,
  loadScript,
  fixModuleExport,
  // Add a manual function to create the restart script if needed
  createRestartScript: function() {
    window.createFixedScriptRequested = true;
    createRestartScript();
  },
  // Add a diagnostic function to check module status
  diagnose: function() {
    return {
      config: typeof window.config === 'object' ? 
        (window.config === configFallback ? 'using fallback' : 'loaded') : 'undefined',
      ui: typeof window.ui === 'object' ? 
        (window.ui === uiFallback ? 'using fallback' : 'loaded') : 'undefined',
      orgChart: typeof window.orgChart === 'object' ? 
        (window.orgChart === orgChartFallback ? 'using fallback' : 'loaded') : 'undefined',
      raciMatrix: typeof window.raciMatrix === 'object' ? 
        (window.raciMatrix === raciMatrixFallback ? 'using fallback' : 'loaded') : 'undefined'
    };
  }
};

// Fix missing modules by adding basic stubs
function fixMissingModules() {
  console.log('Applying module fixes...');

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
        // Simple nested property getter
        return key.split('.').reduce((o, i) => o ? o[i] : undefined, this.settings);
      }
    };
  }

  // Fix UI
  if (!checkModuleLoaded('ui', 'ui')) {
    console.log('Adding minimal ui module...');
    window.ui = {
      init: function() {
        console.log('Minimal ui.init() called');
        
        // Set up basic tab navigation
        setTimeout(() => {
          const tabLinks = document.querySelectorAll('[data-tab]');
          tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
              e.preventDefault();
              const tabId = link.getAttribute('data-tab');
              this.switchTab(tabId);
            });
          });
          
          // Default to dashboard tab
          this.switchTab('dashboard');
        }, 100);
        
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
        
        // Update app state
        if (window.appData && window.appData.state) {
          window.appData.state.currentTab = tabId;
        }
        
        // Update tab content
        switch (tabId) {
          // Add basic tab implementations here
          default:
            // Find or create tab content element
            let tabContent = document.getElementById('tab-content');
            if (!tabContent) {
              tabContent = document.createElement('div');
              tabContent.id = 'tab-content';
              document.querySelector('.main-content').appendChild(tabContent);
            }
            
            tabContent.innerHTML = `
              <div id="${tabId}-tab-content">
                <h2>${tabId.charAt(0).toUpperCase() + tabId.slice(1)}</h2>
                <p>This module is loading...</p>
              </div>
            `;
        }
      },
      refreshAllTabs: function() {
        console.log('Refreshing all tabs');
        
        // Get current tab
        if (window.appData && window.appData.state && window.appData.state.currentTab) {
          this.switchTab(window.appData.state.currentTab);
        } else {
          this.switchTab('dashboard');
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
            <div style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #ffc107; margin-bottom: 15px;">
              <h3 style="color: #856404; margin-top: 0;">Organization Chart</h3>
              <p>The organization chart module is running in recovery mode.</p>
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
            <div style="padding: 15px; background-color: #f8f9fa; border-left: 4px solid #ffc107; margin-bottom: 15px;">
              <h3 style="color: #856404; margin-top: 0;">RACI Matrix</h3>
              <p>The RACI matrix module is running in recovery mode.</p>
            </div>
          `;
        }
      }
    };
  }

  console.log('Module fixes applied');
}

// Expose module fix functions globally
window.moduleFixes = {
  fixMissingModules: fixMissingModules,
  enhanceErrorHandling: enhanceErrorHandling,
  fixPathCasing: fixPathCasing,
  checkDependencies: function() {
    console.log('Checking module dependencies...');
    return {
      config: checkModuleLoaded('config', 'config'),
      ui: checkModuleLoaded('ui', 'ui'),
      orgChart: checkModuleLoaded('orgChart', 'orgChart'),
      raciMatrix: checkModuleLoaded('raciMatrix', 'raciMatrix')
    };
  },
  diagnose: function() {
    console.log('Running module diagnostics...');
    const moduleStatus = {};
    
    // Check core modules
    moduleStatus.config = window.config ? 'loaded' : 'missing';
    moduleStatus.ui = window.ui ? 'loaded' : 'missing';
    moduleStatus.orgChart = window.orgChart ? 'loaded' : 'missing';
    moduleStatus.raciMatrix = window.raciMatrix ? 'loaded' : 'missing';
    
    // Check if using fallbacks
    if (moduleStatus.config === 'loaded' && window.config.getConfig && window.config.getConfig.toString().includes('Minimal config')) {
      moduleStatus.config = 'using fallback';
    }
    if (moduleStatus.ui === 'loaded' && window.ui.init && window.ui.init.toString().includes('Minimal ui')) {
      moduleStatus.ui = 'using fallback';
    }
    
    return moduleStatus;
  }
};

// Create a fixed copy of index.html with script module fixes - disabled by default
function createFixedIndexHtml() {
  console.log('Fixed HTML creation is disabled to prevent automatic downloads');
  
  // Set a flag to prevent automatic fixed HTML creation
  if (window.disableFixedIndexCreation === true) {
    console.log('Fixed HTML creation is disabled via configuration flag');
    return;
  }
  
  // Ask for confirmation before creating fixed HTML
  if (!confirm('Do you want to create and download a fixed-index.html file? Click Cancel to abort.')) {
    console.log('Fixed HTML creation cancelled by user');
    return;
  }
  
  console.log('Creating fixed HTML file...');
  
  fetch('index.html')
    .then(response => response.text())
    .then(html => {
      // Add module wrapper fixes
      const fixedHtml = html
        .replace('</head>', `
          <script>
            // Module fixers for Quality Re-Org Platform
            window.moduleFixers = {
              applyFixes: function() {
                console.log('Applying module fixes...');
                
                // Create fallbacks and wrappers for critical modules
                const modules = ['config', 'ui', 'dataService', 'orgChart', 'raciMatrix', 'skillTree'];
                
                modules.forEach(moduleName => {
                  if (!window[moduleName]) {
                    console.log(\`Creating fallback for \${moduleName}\`);
                    window[moduleName] = { 
                      init: function() { 
                        console.log(\`\${moduleName} fallback initialized\`);
                        return Promise.resolve(); 
                      }
                    };
                  }
                });
                
                console.log('All module fixes applied');
              }
            };
            
            // Automatically apply fixes when DOMContentLoaded
            document.addEventListener('DOMContentLoaded', function() {
              window.moduleFixers.applyFixes();
            });
          </script>
        </head>`)
        .replace('</body>', `
          <script>
            // Ensure the platform continues to load even if there are module issues
            window.addEventListener('error', function(event) {
              console.error('Error caught by fixed modules script:', event.message);
              if (event.message.includes('is not defined') || event.message.includes('is not a function')) {
                console.log('Applying emergency module fixes...');
                if (window.moduleFixers && typeof window.moduleFixers.applyFixes === 'function') {
                  window.moduleFixers.applyFixes();
                }
              }
            });
          </script>
        </body>`);
      
      // Create a blob with the fixed HTML
      const blob = new Blob([fixedHtml], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a download link
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'fixed-index.html';
      a.textContent = 'Download Fixed Index';
      a.style.display = 'none';
      
      // Only append to document.body if it exists
      if (document.body) {
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
          document.body.removeChild(a);
        }, 100);
      } else {
        // If document.body is not available yet, wait for DOMContentLoaded
        document.addEventListener('DOMContentLoaded', function() {
          document.body.appendChild(a);
          a.click();
          
          // Clean up
          setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
          }, 100);
        });
      }
    })
    .catch(error => {
      console.error('Error creating fixed HTML:', error);
    });
} 