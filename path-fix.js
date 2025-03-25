// Path Fix Script
// This script fixes path references in the HTML to work in both root and public directories

(function() {
  console.log('Running path-fix.js to fix resource paths');
  
  // Wait for DOM to be loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixPaths);
  } else {
    fixPaths();
  }
  
  function fixPaths() {
    // Fix CSS paths
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    cssLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('src/css/')) {
        const newHref = href.replace('src/css/', 'css/');
        console.log(`Fixing CSS path: ${href} -> ${newHref}`);
        link.setAttribute('href', newHref);
      }
    });
    
    // Fix JS paths
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      // Skip CDN scripts
      if (src && !src.includes('//') && !src.startsWith('http')) {
        let newSrc = src;
        
        // Handle src/js paths
        if (src.startsWith('src/js/')) {
          newSrc = src.replace('src/js/', 'js/');
        }
        
        // Only log if we made a change
        if (newSrc !== src) {
          console.log(`Fixing JS path: ${src} -> ${newSrc}`);
          script.setAttribute('src', newSrc);
        }
      }
    });
    
    // Fix image paths
    const images = document.querySelectorAll('img[src]');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src && src.startsWith('src/img/')) {
        const newSrc = src.replace('src/img/', 'img/');
        console.log(`Fixing image path: ${src} -> ${newSrc}`);
        img.setAttribute('src', newSrc);
      }
    });
    
    console.log('Path fixing complete');
  }
})(); 