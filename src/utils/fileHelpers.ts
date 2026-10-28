import { FileNode, FileType } from '../types';

export function getFileType(fileName: string): FileType {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
      return 'css';
    case 'js':
    case 'jsx':
    case 'mjs':
      return 'js';
    case 'json':
      return 'json';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
    case 'webp':
    case 'gif':
      return 'image';
    default:
      return 'text';
  }
}

export function getMonacoLanguage(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
      return 'css';
    case 'js':
    case 'jsx':
    case 'mjs':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    default:
      return 'plaintext';
  }
}

/**
 * Builds sandboxed HTML bundle from project files with captured console events.
 */
export function buildPreviewHtml(files?: Record<string, FileNode>): string {
  if (!files || typeof files !== 'object') {
    return `<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        margin: 0;
        padding: 2rem;
        background: #090b10;
        color: #8b94a5;
        font-family: system-ui, sans-serif;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 80vh;
      }
    </style>
  </head>
  <body>
    <p>Keine Dateien vorhanden.</p>
  </body>
</html>`;
  }

  // Find primary HTML file
  const htmlFile = Object.values(files).find(
    (f) => f && f.type === 'file' && f.name && (f.name.toLowerCase() === 'index.html' || f.name.toLowerCase().endsWith('.html'))
  );

  if (!htmlFile || !htmlFile.content) {
    return `<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        margin: 0;
        padding: 2rem;
        background: #0f1117;
        color: #9ba3b8;
        font-family: system-ui, sans-serif;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 80vh;
      }
      p { font-size: 0.95rem; }
    </style>
  </head>
  <body>
    <p>Erstelle oder wähle eine <strong>index.html</strong> Datei, um die Live-Vorschau anzuzeigen.</p>
  </body>
</html>`;
  }

  let rawHtml = htmlFile.content;

  // Intercept console and error events
  const consoleScript = `
<script>
(function() {
  function send(type, text) {
    try {
      window.parent.postMessage({
        source: 'studio-lab-preview',
        type: type,
        text: text,
        timestamp: Date.now()
      }, '*');
    } catch(e) {}
  }
  
  var origLog = console.log;
  var origWarn = console.warn;
  var origError = console.error;
  var origInfo = console.info;

  console.log = function() {
    origLog.apply(console, arguments);
    var args = Array.prototype.slice.call(arguments).map(function(a) {
      return typeof a === 'object' ? JSON.stringify(a) : String(a);
    }).join(' ');
    send('log', args);
  };

  console.info = function() {
    origInfo.apply(console, arguments);
    var args = Array.prototype.slice.call(arguments).map(function(a) {
      return typeof a === 'object' ? JSON.stringify(a) : String(a);
    }).join(' ');
    send('info', args);
  };

  console.warn = function() {
    origWarn.apply(console, arguments);
    var args = Array.prototype.slice.call(arguments).map(function(a) {
      return typeof a === 'object' ? JSON.stringify(a) : String(a);
    }).join(' ');
    send('warn', args);
  };

  console.error = function() {
    origError.apply(console, arguments);
    var args = Array.prototype.slice.call(arguments).map(function(a) {
      return typeof a === 'object' ? JSON.stringify(a) : String(a);
    }).join(' ');
    send('error', args);
  };

  window.onerror = function(msg, url, line, col, error) {
    send('error', (msg || 'Error') + (line ? ' (Line: ' + line + ')' : ''));
    return false;
  };
})();
</script>
`;

  // Map other CSS and JS files
  const cssFiles = Object.values(files).filter(
    (f) => f.type === 'file' && f.name.toLowerCase().endsWith('.css')
  );
  const jsFiles = Object.values(files).filter(
    (f) => f.type === 'file' && f.name.toLowerCase().endsWith('.js')
  );

  // Replace external link tags or inject inline css
  let processedHtml = rawHtml;

  // Check if link rel="stylesheet" href="style.css" or similar exists
  cssFiles.forEach((cf) => {
    const escapedName = cf.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const linkRegex = new RegExp(`<link[^>]*href=["'](?:\\.\\/)?${escapedName}["'][^>]*>`, 'gi');
    if (linkRegex.test(processedHtml)) {
      processedHtml = processedHtml.replace(linkRegex, `<style>/* ${cf.name} */\n${cf.content || ''}</style>`);
    } else {
      // Inject before </head> or at beginning
      const styleTag = `<style>/* ${cf.name} */\n${cf.content || ''}</style>`;
      if (processedHtml.includes('</head>')) {
        processedHtml = processedHtml.replace('</head>', `${styleTag}\n</head>`);
      } else {
        processedHtml = styleTag + '\n' + processedHtml;
      }
    }
  });

  // Inject console intercept script right after <head> or at top
  if (processedHtml.includes('<head>')) {
    processedHtml = processedHtml.replace('<head>', `<head>\n${consoleScript}`);
  } else {
    processedHtml = consoleScript + '\n' + processedHtml;
  }

  // Check if script src="script.js" exists
  jsFiles.forEach((jf) => {
    const escapedName = jf.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const scriptRegex = new RegExp(`<script[^>]*src=["'](?:\\.\\/)?${escapedName}["'][^>]*>\\s*<\\/script>`, 'gi');
    if (scriptRegex.test(processedHtml)) {
      processedHtml = processedHtml.replace(scriptRegex, `<script>/* ${jf.name} */\n${jf.content || ''}</script>`);
    } else {
      const scriptTag = `<script>/* ${jf.name} */\n${jf.content || ''}</script>`;
      if (processedHtml.includes('</body>')) {
        processedHtml = processedHtml.replace('</body>', `${scriptTag}\n</body>`);
      } else {
        processedHtml = processedHtml + '\n' + scriptTag;
      }
    }
  });

  return processedHtml;
}
