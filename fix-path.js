// Path and module loading fix script
console.log('Starting path fix script...');

// Check if a script is already loaded
function isScriptLoaded(src) {
  return Array.from(document.scripts).some(script => 
    script.src === src || script.src.includes(src.replace(/^\//, ''))
  );
}

// Load a script if it's not already loaded
function ensureScriptLoaded(src) {
  if (isScriptLoaded(src)) {
    console.log(`Script already loaded: ${src}`);
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    console.log(`Loading script: ${src}`);
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    
    script.onload = () => {
      console.log(`Successfully loaded: ${src}`);
      resolve();
    };
    
    script.onerror = (error) => {
      console.error(`Failed to load: ${src}`, error);
      // Try with alternate paths
      const alternativePaths = [
        src.replace(/^js\//, ''),             // Remove 'js/' prefix
        src.replace(/^src\//, ''),            // Remove 'src/' prefix
        `/${src}`,                            // Add leading slash
        src.replace(/\.js$/, '.js?v=' + new Date().getTime()) // Add cache-busting parameter
      ];
      
      // Try alternatives sequentially
      tryAlternatives(alternativePaths, 0, reject);
    };
    
    document.head.appendChild(script);
  });
  
  // Helper function to try alternative paths
  function tryAlternatives(paths, index, finalReject) {
    if (index >= paths.length) {
      finalReject(new Error(`Failed to load script: ${src} after trying all alternatives`));
      return;
    }
    
    const altPath = paths[index];
    console.log(`Trying alternative path: ${altPath}`);
    
    const altScript = document.createElement('script');
    altScript.src = altPath;
    altScript.async = false;
    
    altScript.onload = () => {
      console.log(`Successfully loaded from alternative path: ${altPath}`);
    };
    
    altScript.onerror = () => {
      console.error(`Failed to load from alternative path: ${altPath}`);
      // Try next alternative
      tryAlternatives(paths, index + 1, finalReject);
    };
    
    document.head.appendChild(altScript);
  }
}

// Fix module dependencies
async function fixDependencies() {
  // Try to load config first - it's critical
  console.log('Loading config dependency first...');
  try {
    // Make sure config.js loads before anything else
    await ensureScriptLoaded('js/core/config.js');
    
    // Wait a moment to ensure it's initialized
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify config is available
    if (typeof window.config === 'undefined') {
      console.error('Config module did not expose a global config object, trying alternatives...');
      // Try alternative paths for config
      const configPaths = [
        'core/config.js',
        '/js/core/config.js',
        '/core/config.js',
        'config.js'
      ];
      
      for (const configPath of configPaths) {
        try {
          await ensureScriptLoaded(configPath);
          await new Promise(resolve => setTimeout(resolve, 100));
          if (typeof window.config !== 'undefined') {
            console.log(`Successfully loaded config from alternative path: ${configPath}`);
            break;
          }
        } catch (err) {
          console.warn(`Failed to load config from ${configPath}`);
        }
      }
    }
  } catch (error) {
    console.error('Failed to load config dependency:', error);
    // Create a basic config object if loading fails
    if (typeof window.config === 'undefined') {
      console.warn('Creating minimal config object...');
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
          }
        },
        colors: {
          bbv: '#00518A',
          add: '#CC2030',
          arb: '#4F46E5'
        },
        getConfig: function(key) {
          return key.split('.').reduce((o, i) => o ? o[i] : undefined, this.settings);
        }
      };
    }
  }

  // Define remaining module dependencies
  const coreDependencies = [
    'js/core/app.js',
    'js/core/data.js',
    'js/modules/ui.js'
  ];
  
  const additionalModules = [
    'js/modules/orgchart.js',
    'js/modules/racimatrix.js',
    'js/modules/skillsmatrix.js',
    'js/modules/personnel.js',
    'js/modules/teamBuilder.js',
    'js/modules/gapanalysis.js',
    'js/modules/planning.js'
  ];
  
  // Load core dependencies first
  console.log('Loading core dependencies...');
  for (const dep of coreDependencies) {
    try {
      await ensureScriptLoaded(dep);
    } catch (error) {
      console.error(`Failed to load core dependency: ${dep}`, error);
      // Continue with next dependency even if this one fails
    }
  }
  
  // Load additional modules
  console.log('Loading additional modules...');
  await Promise.all(additionalModules.map(async (module) => {
    try {
      await ensureScriptLoaded(module);
    } catch (error) {
      console.error(`Failed to load module: ${module}`, error);
      // Continue with other modules
    }
  }));
  
  console.log('Dependency loading complete');
}

// Check global object properties
function checkGlobalObjects() {
  const requiredGlobals = ['config', 'ui', 'appData', 'orgChart', 'raciMatrix'];
  const missingGlobals = [];
  
  for (const global of requiredGlobals) {
    if (typeof window[global] === 'undefined') {
      missingGlobals.push(global);
      console.error(`Missing global object: ${global}`);
    }
  }
  
  return {
    missing: missingGlobals,
    exists: requiredGlobals.filter(g => typeof window[g] !== 'undefined')
  };
}

// Apply fixes
async function applyFixes() {
  console.log('Applying module and path fixes...');
  
  // Fix dependencies first
  await fixDependencies();
  
  // Check global objects
  const globals = checkGlobalObjects();
  console.log('Global objects check:', globals);
  
  // Apply module fixes if needed
  if (globals.missing.length > 0 && typeof window.moduleFixes === 'object' && typeof window.moduleFixes.fixMissingModules === 'function') {
    console.log('Applying module fixes...');
    window.moduleFixes.fixMissingModules();
  }
  
  console.log('Fixes applied');
  
  // Return diagnostic information
  return {
    fixesApplied: globals.missing.length > 0,
    missingGlobals: globals.missing,
    existingGlobals: globals.exists
  };
}

// Expose the fix functions globally
window.pathFix = {
  ensureScriptLoaded,
  fixDependencies,
  checkGlobalObjects,
  applyFixes
};

// Auto-run path fixes when the script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyFixes);
} else {
  applyFixes();
} 