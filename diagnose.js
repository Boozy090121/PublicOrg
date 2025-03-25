// Diagnostic script for the Quality Re-Org Platform
// This script analyzes module loading issues and provides fixes

console.log('Running module diagnostics...');

// Add a log entry to the diagnostic log
function addLog(message, type = '') {
  const logContainer = document.getElementById('log-container');
  const logEntry = document.createElement('div');
  logEntry.className = `log-entry ${type}`;
  logEntry.textContent = message;
  logContainer.appendChild(logEntry);
  
  // Auto-scroll to bottom
  logContainer.scrollTop = logContainer.scrollHeight;
}

// Update the status of a module in the UI
function updateModuleStatus(moduleId, status, message) {
  const moduleSection = document.getElementById(`${moduleId}-module`);
  if (!moduleSection) return;
  
  // Update status badge
  const badge = moduleSection.querySelector('.status-badge');
  if (badge) {
    badge.className = `status-badge status-${status}`;
    
    switch (status) {
      case 'success':
        badge.textContent = 'Loaded';
        break;
      case 'warning':
        badge.textContent = 'Using Fallback';
        break;
      case 'error':
        badge.textContent = 'Failed';
        break;
      default:
        badge.textContent = 'Checking...';
    }
  }
  
  // Update content
  const content = moduleSection.querySelector('.module-content');
  if (content) {
    content.innerHTML = message;
  }
}

// Check a specific module's status
function checkModuleStatus(moduleName, moduleId) {
  addLog(`Checking ${moduleName} module...`);
  
  let statusContent = '';
  let moduleVar = window[moduleName];
  let status = 'error';
  
  // Check if module exists
  if (typeof moduleVar === 'undefined') {
    statusContent = `
      <p>The ${moduleName} module is not loaded.</p>
      <div class="module-detail">
        <div class="module-detail-row">
          <div class="module-detail-label">Status:</div>
          <div>Not Found</div>
        </div>
        <div class="module-detail-row">
          <div class="module-detail-label">Possible Issues:</div>
          <div>The module file may be missing or have syntax errors.</div>
        </div>
      </div>
    `;
    addLog(`${moduleName} module is not loaded.`, 'error');
  } 
  // Check if using fallback implementation
  else if (window.fixedModules && window.fixedModules.diagnose && 
           window.fixedModules.diagnose()[moduleName] === 'using fallback') {
    statusContent = `
      <p>The ${moduleName} module is running in fallback mode.</p>
      <div class="module-detail">
        <div class="module-detail-row">
          <div class="module-detail-label">Status:</div>
          <div>Using Fallback Implementation</div>
        </div>
        <div class="module-detail-row">
          <div class="module-detail-label">Possible Issues:</div>
          <div>The module file may exist but is failing to export properly.</div>
        </div>
      </div>
    `;
    status = 'warning';
    addLog(`${moduleName} module is using fallback implementation.`, 'warning');
  } 
  // Module is loaded properly
  else {
    statusContent = `
      <p>The ${moduleName} module is loaded correctly.</p>
      <div class="module-detail">
        <div class="module-detail-row">
          <div class="module-detail-label">Status:</div>
          <div>Loaded Successfully</div>
        </div>
        <div class="module-detail-row">
          <div class="module-detail-label">Properties:</div>
          <div>${Object.keys(moduleVar).join(', ')}</div>
        </div>
      </div>
    `;
    status = 'success';
    addLog(`${moduleName} module loaded successfully.`, 'success');
  }
  
  // Update the UI
  updateModuleStatus(moduleId, status, statusContent);
  
  return status;
}

// Run diagnostics on all modules
function runDiagnostics() {
  addLog('Starting complete diagnostic scan...');
  
  // Reset UI
  document.querySelectorAll('.status-badge').forEach(badge => {
    badge.className = 'status-badge status-loading';
    badge.textContent = 'Checking...';
  });
  
  // Check each module
  setTimeout(() => checkModuleStatus('config', 'config'), 500);
  setTimeout(() => checkModuleStatus('ui', 'ui'), 1000);
  setTimeout(() => checkModuleStatus('orgChart', 'orgchart'), 1500);
  setTimeout(() => checkModuleStatus('raciMatrix', 'raci'), 2000);
  
  // Final diagnosis after all modules are checked
  setTimeout(() => {
    // Get diagnostic results
    const results = window.fixedModules.diagnose();
    
    // Count issues
    const issues = Object.values(results).filter(status => status !== 'loaded').length;
    
    if (issues === 0) {
      addLog('All modules are loaded correctly!', 'success');
    } else {
      addLog(`Found ${issues} module(s) with issues. Recommended fixes are available below.`, 'warning');
    }
  }, 2500);
}

// Fix module references in the application
function fixModuleReferences() {
  addLog('Applying module reference fixes...');
  
  try {
    // Create a script to fix module references
    const fixScript = document.createElement('script');
    fixScript.textContent = `
      // Fix module references
      (function() {
        // Create a unified global interface for modules with case variations
        ['config', 'Config', 'CONFIG'].forEach(name => {
          if (window[name] && name !== 'config') {
            window.config = window[name];
            console.log('Fixed config module reference from ' + name);
          }
        });
        
        ['ui', 'UI', 'Ui'].forEach(name => {
          if (window[name] && name !== 'ui') {
            window.ui = window[name];
            console.log('Fixed ui module reference from ' + name);
          }
        });
        
        ['orgChart', 'orgchart', 'OrgChart', 'ORGCHART'].forEach(name => {
          if (window[name] && name !== 'orgChart') {
            window.orgChart = window[name];
            console.log('Fixed orgChart module reference from ' + name);
          }
        });
        
        ['raciMatrix', 'racimatrix', 'RaciMatrix', 'RACIMATRIX'].forEach(name => {
          if (window[name] && name !== 'raciMatrix') {
            window.raciMatrix = window[name];
            console.log('Fixed raciMatrix module reference from ' + name);
          }
        });
        
        console.log('Module references fixed');
      })();
    `;
    
    document.head.appendChild(fixScript);
    addLog('Module reference fixes applied successfully.', 'success');
    
    // Re-run diagnostics to see the impact of fixes
    setTimeout(runDiagnostics, 1000);
  } catch (error) {
    addLog(`Error applying reference fixes: ${error.message}`, 'error');
  }
}

// Fix case sensitivity issues in module paths
function fixCaseSensitivity() {
  addLog('Applying case sensitivity fixes...');
  
  try {
    // Create a script to fix file path references
    const fixScript = document.createElement('script');
    fixScript.textContent = `
      // Fix case sensitivity issues
      (function() {
        // This is a specialized function to correct common path casing issues
        function fixPath(path) {
          // Common case issues in paths
          const replacements = {
            'src/Modules/': 'src/modules/',
            'src/Core/': 'src/core/',
            'js/Modules/': 'js/modules/',
            'js/Core/': 'js/core/',
            'JS/': 'js/',
            'SRC/': 'src/',
            'Config.js': 'config.js',
            'Ui.js': 'ui.js',
            'UI.js': 'ui.js',
            'OrgChart.js': 'orgchart.js',
            'Orgchart.js': 'orgchart.js',
            'RaciMatrix.js': 'racimatrix.js',
            'Racimatrix.js': 'racimatrix.js'
          };
          
          let fixedPath = path;
          for (const [pattern, replacement] of Object.entries(replacements)) {
            fixedPath = fixedPath.replace(new RegExp(pattern, 'g'), replacement);
          }
          
          return fixedPath;
        }
        
        // Find script tags and correct their src attributes
        document.querySelectorAll('script[src]').forEach(script => {
          const originalSrc = script.getAttribute('src');
          const fixedSrc = fixPath(originalSrc);
          
          if (originalSrc !== fixedSrc) {
            console.log('Fixed path: ' + originalSrc + ' → ' + fixedSrc);
            script.setAttribute('src', fixedSrc);
          }
        });
        
        console.log('Case sensitivity fixes applied');
      })();
    `;
    
    document.head.appendChild(fixScript);
    addLog('Case sensitivity fixes applied successfully.', 'success');
    
    // Re-run diagnostics to see the impact of fixes
    setTimeout(runDiagnostics, 1000);
  } catch (error) {
    addLog(`Error applying case sensitivity fixes: ${error.message}`, 'error');
  }
}

// Generate a fixed version of the application
function generateFixedApp() {
  addLog('Generating fixed application...');
  
  try {
    // Use the built-in functionality from fixed-modules.js
    if (window.createFixedIndexHtml && typeof window.createFixedIndexHtml === 'function') {
      window.createFixedIndexHtml();
      addLog('Created fixed-index.html', 'success');
    } else {
      window.fixedModules.createFixedIndexHtml();
      addLog('Created fixed-index.html using fixedModules interface', 'success');
    }
    
    if (window.createRestartScript && typeof window.createRestartScript === 'function') {
      window.createRestartScript();
      addLog('Created start-fixed.bat', 'success');
    } else {
      window.fixedModules.createRestartScript();
      addLog('Created start-fixed.bat using fixedModules interface', 'success');
    }
    
    addLog('Fixed application generated successfully. You can now use fixed-index.html to run the application.', 'success');
  } catch (error) {
    addLog(`Error generating fixed application: ${error.message}`, 'error');
    
    // Fallback to using the auto-fix.html page
    addLog('Trying alternative approach...', 'warning');
    window.location.href = 'auto-fix.html';
  }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  addLog('Diagnostic tool initialized.');
  
  // Run initial diagnostics
  runDiagnostics();
  
  // Set up button handlers
  document.getElementById('run-diagnostics').addEventListener('click', runDiagnostics);
  document.getElementById('fix-references').addEventListener('click', fixModuleReferences);
  document.getElementById('fix-case').addEventListener('click', fixCaseSensitivity);
  document.getElementById('generate-fixed').addEventListener('click', generateFixedApp);
  document.getElementById('goto-app').addEventListener('click', function() {
    window.location.href = 'index-fixed.html';
  });
}); 