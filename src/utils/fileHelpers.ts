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

const emptyPage = (message: string) => `<!DOCTYPE html><html><head><style>body{margin:0;padding:2rem;background:#090b10;color:#8b94a5;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:80vh;text-align:center}</style></head><body><p>${message}</p></body></html>`;

/**
 * Builds sandboxed HTML bundle from project files with captured console events.
 */
export function buildPreviewHtml(files?: Record<string, FileNode>): string {
  if (!files || typeof files !== 'object') {
    return emptyPage('Keine Dateien vorhanden.');
  }

  // Find primary HTML file (prefer index.html over other html files)
  const htmlFile =
    Object.values(files).find((f) => f?.type === 'file' && f.name?.toLowerCase() === 'index.html') ??
    Object.values(files).find((f) => f?.type === 'file' && f.name?.toLowerCase().endsWith('.html'));

  if (!htmlFile || !htmlFile.content) {
    return emptyPage('Erstelle oder wähle eine <strong>index.html</strong> Datei, um die Live-Vorschau anzuzeigen.');
  }

  let rawHtml = htmlFile.content;

  // Intercept console and error events
  const consoleScript = `
<script>
(function () {
  function fmt(a) {
    if (a instanceof Error) return a.message;
    if (typeof a === 'object' && a !== null) { try { return JSON.stringify(a); } catch (e) { return String(a); } }
    return String(a);
  }
  function send(type, text) {
    try { window.parent.postMessage({ source: 'studio-lab-preview', type: type, text: text, timestamp: Date.now() }, '*'); } catch (e) {}
  }
  ['log', 'info', 'warn', 'error'].forEach(function (type) {
    var orig = console[type];
    console[type] = function () {
      orig.apply(console, arguments);
      send(type, Array.prototype.map.call(arguments, fmt).join(' '));
    };
  });
  window.addEventListener('error', function (e) {
    send('error', (e.message || 'Error') + (e.lineno ? ' (Line: ' + e.lineno + ')' : ''));
  });
  window.addEventListener('unhandledrejection', function (e) {
    send('error', 'Unhandled: ' + fmt(e.reason));
  });
})();
</script>
`;

  // Map other CSS and JS files
  const cssFiles = Object.values(files).filter(
    (f) => f && f.type === 'file' && f.name && f.name.toLowerCase().endsWith('.css')
  );
  const jsFiles = Object.values(files).filter(
    (f) => f && f.type === 'file' && f.name && f.name.toLowerCase().endsWith('.js')
  );

  let processedHtml = rawHtml;

  // Replace external link tags or inject inline css safely
  cssFiles.forEach((cf) => {
    const escapedName = cf.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const linkRegex = new RegExp(`<link[^>]*href=["'](?:\\.\\/)?${escapedName}["'][^>]*>`, 'gi');
    if (linkRegex.test(processedHtml)) {
      processedHtml = processedHtml.replace(linkRegex, () => `<style>/* ${cf.name} */\n${cf.content || ''}</style>`);
    } else {
      const styleTag = `<style>/* ${cf.name} */\n${cf.content || ''}</style>`;
      if (processedHtml.includes('</head>')) {
        processedHtml = processedHtml.replace('</head>', () => `${styleTag}\n</head>`);
      } else {
        processedHtml = styleTag + '\n' + processedHtml;
      }
    }
  });

  // Inject console intercept script right after <head> or at top
  if (processedHtml.includes('<head>')) {
    processedHtml = processedHtml.replace('<head>', () => `<head>\n${consoleScript}`);
  } else {
    processedHtml = consoleScript + '\n' + processedHtml;
  }

  // Check if script src="script.js" exists
  jsFiles.forEach((jf) => {
    const escapedName = jf.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const scriptRegex = new RegExp(`<script[^>]*src=["'](?:\\.\\/)?${escapedName}["'][^>]*>\\s*<\\/script>`, 'gi');
    if (scriptRegex.test(processedHtml)) {
      processedHtml = processedHtml.replace(scriptRegex, () => `<script>/* ${jf.name} */\n${jf.content || ''}</script>`);
    } else {
      const scriptTag = `<script>/* ${jf.name} */\n${jf.content || ''}</script>`;
      if (processedHtml.includes('</body>')) {
        processedHtml = processedHtml.replace('</body>', () => `${scriptTag}\n</body>`);
      } else {
        processedHtml = processedHtml + '\n' + scriptTag;
      }
    }
  });

  return processedHtml;
}
