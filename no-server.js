/**
 * No-Server Mode Helper
 * 
 * This script enables the Quality Re-Org Platform to run without a server.
 * It configures necessary fallbacks and handles environment detection.
 */

(function() {
  console.log('Initializing no-server mode...');
  
  // Check if running from file system
  const isFileSystem = window.location.protocol === 'file:';
  
  // Configuration for no-server mode
  window.appConfig = window.appConfig || {};
  window.appConfig.noServer = {
    enabled: true,
    isFileSystem: isFileSystem,
    useLocalStorage: true
  };
  
  // Disable API calls if running from file system
  if (isFileSystem) {
    console.log('Running from file system, API calls will be disabled');
    
    // Add warning if running from file system
    function addFileSystemWarning() {
      if (document.body) {
        const warningEl = document.createElement('div');
        warningEl.className = 'system-warning';
        warningEl.innerHTML = `
          <div class="warning-content">
            <h3><i class="fas fa-exclamation-triangle"></i> File System Mode</h3>
            <p>You are running this application directly from the file system. Some features may be limited.</p>
            <button id="dismissWarning">Dismiss</button>
          </div>
        `;
        
        // Style the warning
        warningEl.style.position = 'fixed';
        warningEl.style.bottom = '20px';
        warningEl.style.right = '20px';
        warningEl.style.zIndex = '9999';
        warningEl.style.backgroundColor = '#fff3cd';
        warningEl.style.border = '1px solid #ffeeba';
        warningEl.style.borderLeft = '4px solid #ffc107';
        warningEl.style.borderRadius = '4px';
        warningEl.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        warningEl.style.maxWidth = '300px';
        
        document.body.appendChild(warningEl);
        
        // Add dismiss handler
        document.getElementById('dismissWarning').addEventListener('click', function() {
          warningEl.style.display = 'none';
        });
      } else {
        // Body not ready yet, try again later
        setTimeout(addFileSystemWarning, 500);
      }
    }
    
    // Add warning when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', addFileSystemWarning);
    } else {
      addFileSystemWarning();
    }
  }
  
  // Initialize app data if needed
  window.appData = window.appData || { state: {}, methods: {} };
  
  // Configure XMLHttpRequest to handle file:// protocol
  if (isFileSystem) {
    // Monkey patch XMLHttpRequest to better handle file:// URLs
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      // Handle relative URLs in file:// context
      if (url.startsWith('./') || url.startsWith('../') || !url.includes('://')) {
        // Convert to absolute if needed
        if (url.startsWith('./')) {
          url = url.substring(2);
        }
        console.log(`XHR: Converting relative URL to absolute: ${url}`);
      }
      
      // Call original method
      return originalXHROpen.call(this, method, url, async, user, password);
    };
  }
  
  // Helper to load essential scripts
  function loadEssentialScripts() {
    const scripts = [
      'firebase-init.js',
      'js/firebaseService.js',
      'js/firebaseDataService.js',
      'js/dataService.js'
    ];
    
    // Load each script sequentially
    let chain = Promise.resolve();
    scripts.forEach(script => {
      chain = chain.then(() => loadScript(script));
    });
    
    return chain;
  }
  
  // Load a script asynchronously
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      
      script.onload = () => resolve();
      script.onerror = (e) => {
        console.warn(`Failed to load script: ${src}`, e);
        resolve(); // Resolve anyway to continue chain
      };
      
      document.head.appendChild(script);
    });
  }
  
  // Initialize everything when DOM is loaded
  function initialize() {
    console.log('No-server mode: DOM loaded, initializing...');
    
    // Load essential scripts
    loadEssentialScripts().then(() => {
      console.log('No-server mode: Essential scripts loaded');
      
      // Initialize data service if available
      if (window.dataService && typeof window.dataService.init === 'function') {
        window.dataService.init().then(() => {
          console.log('No-server mode: Data service initialized');
        }).catch(err => {
          console.error('No-server mode: Error initializing data service', err);
        });
      }
    });
  }
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Expose helper methods
  window.noServerHelper = {
    loadScript: loadScript,
    isFileSystem: isFileSystem
  };
  
  console.log('No-server mode initialization complete');
})(); 