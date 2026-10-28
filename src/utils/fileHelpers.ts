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

export function getNodePath(files: Record<string, FileNode>, node: FileNode): string {
  const parts: string[] = [node.name];
  const seen = new Set<string>([node.id]);
  let cur = node.parentId ? files[node.parentId] : undefined;
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    parts.unshift(cur.name);
    cur = cur.parentId ? files[cur.parentId] : undefined;
  }
  return parts.join('/');
}

export function getDescendantIds(files: Record<string, FileNode>, id: string): Set<string> {
  const result = new Set<string>();
  const stack = [id];
  while (stack.length) {
    const current = stack.pop()!;
    Object.values(files).forEach((f) => {
      if (f.parentId === current && !result.has(f.id)) {
        result.add(f.id);
        stack.push(f.id);
      }
    });
  }
  return result;
}

export function hasNameConflict(
  files: Record<string, FileNode>,
  parentId: string | null,
  name: string,
  ignoreId?: string
): boolean {
  const lower = name.toLowerCase();
  return Object.values(files).some(
    (f) => f.id !== ignoreId && (f.parentId ?? null) === parentId && f.name.toLowerCase() === lower
  );
}

export function uniqueName(files: Record<string, FileNode>, parentId: string | null, name: string): string {
  if (!hasNameConflict(files, parentId, name)) return name;
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';
  let i = 2;
  while (hasNameConflict(files, parentId, `${base}-${i}${ext}`)) i++;
  return `${base}-${i}${ext}`;
}

export function sortNodes(nodes: FileNode[]): FileNode[] {
  return [...nodes].sort((a, b) =>
    a.type !== b.type
      ? a.type === 'folder' ? -1 : 1
      : a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
  );
}

const URL_LIKE = /^([a-z][a-z0-9+.-]*:|\/\/|#)/i;

const emptyPage = (message: string) => `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>body{margin:0;padding:2rem;background:#090b10;color:#8b94a5;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:80vh;text-align:center}</style></head>
<body><p>${message}</p></body></html>`;

function resolvePath(baseDir: string, href: string): string {
  const clean = href.split('#')[0].split('?')[0];
  const parts: string[] = clean.startsWith('/') ? [] : baseDir ? baseDir.split('/') : [];
  clean.split('/').forEach((seg) => {
    if (!seg || seg === '.') return;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  });
  return parts.join('/');
}

function buildConsoleScript(missing: string[]): string {
  const missingJson = JSON.stringify(missing).replace(/</g, '\\u003c');
  return `<script>
(function () {
  function fmt(a) {
    if (a instanceof Error) return a.message;
    if (typeof a === 'object' && a !== null) { try { return JSON.stringify(a); } catch (e) { return String(a); } }
    return String(a);
  }
  function send(type, text, extra) {
    try {
      var msg = { source: 'studio-lab-preview', type: type, text: text, timestamp: Date.now() };
      if (extra) {
        if (extra.stack) msg.stack = String(extra.stack);
        if (extra.origin) msg.origin = String(extra.origin);
      }
      window.parent.postMessage(msg, '*');
    } catch (e) {}
  }
  send('__reset', '');
  ['log', 'info', 'warn', 'error', 'debug'].forEach(function (type) {
    var orig = console[type];
    console[type] = function () {
      orig.apply(console, arguments);
      var first = arguments[0];
      send(type, Array.prototype.map.call(arguments, fmt).join(' '), first instanceof Error ? { stack: first.stack } : null);
    };
  });
  window.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t !== window && t.tagName) {
      send('error', 'Failed to load resource: <' + t.tagName.toLowerCase() + '> ' + (t.src || t.href || ''));
      return;
    }
    send('error', e.message || 'Error', {
      stack: e.error && e.error.stack,
      origin: e.filename ? e.filename + ':' + e.lineno + ':' + e.colno : ''
    });
  }, true);
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    send('error', 'Unhandled Promise Rejection: ' + fmt(r), { stack: r && r.stack });
  });
  var missing = ${missingJson};
  missing.forEach(function (p) { send('warn', 'File not found in project: ' + p); });
})();
</script>`;
}

export function buildPreviewHtml(files?: Record<string, FileNode>): string {
  if (!files || typeof files !== 'object') return emptyPage('Keine Dateien vorhanden.');

  const nodes = Object.values(files).filter((f): f is FileNode => !!f && f.type === 'file' && !!f.name);
  if (nodes.length === 0) return emptyPage('Keine Dateien vorhanden.');

  const byPath = new Map<string, FileNode>();
  nodes.forEach((f) => byPath.set(getNodePath(files, f).toLowerCase(), f));

  const htmlFile =
    nodes.find((f) => getNodePath(files, f).toLowerCase() === 'index.html') ??
    nodes.find((f) => f.name.toLowerCase() === 'index.html') ??
    nodes.find((f) => /\.html?$/i.test(f.name));

  if (!htmlFile || !htmlFile.content) {
    return emptyPage('Erstelle oder wähle eine <strong>index.html</strong> Datei, um die Live-Vorschau anzuzeigen.');
  }

  const htmlPath = getNodePath(files, htmlFile);
  const baseDir = htmlPath.includes('/') ? htmlPath.slice(0, htmlPath.lastIndexOf('/')) : '';
  const missing: string[] = [];
  const deferred: string[] = [];

  const lookup = (ref: string): FileNode | undefined => byPath.get(resolvePath(baseDir, ref).toLowerCase());

  let html = htmlFile.content;

  html = html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel\s*=\s*["']?stylesheet/i.test(tag)) return tag;
    const m = tag.match(/href\s*=\s*["']([^"']+)["']/i);
    if (!m || URL_LIKE.test(m[1])) return tag;
    const file = lookup(m[1]);
    if (!file) {
      missing.push(m[1]);
      return tag;
    }
    const css = (file.content ?? '').replace(/<\/style/gi, '<\\/style');
    return `<style>/* ${file.name} */\n${css}</style>`;
  });

  html = html.replace(
    /<script\b([^>]*?)\bsrc\s*=\s*["']([^"']+)["']([^>]*)>\s*<\/script>/gi,
    (full, before: string, src: string, after: string) => {
      if (URL_LIKE.test(src)) return full;
      const file = lookup(src);
      if (!file) {
        missing.push(src);
        return full;
      }
      const attrs = `${before}${after}`;
      const isModule = /type\s*=\s*["']module["']/i.test(attrs);
      const isDeferred = /\bdefer\b/i.test(attrs) && !isModule;
      const cleaned = attrs.replace(/\bdefer\b/gi, '');
      const js = (file.content ?? '').replace(/<\/script/gi, '<\\/script');
      const tag = `<script${cleaned}>\n${js}\n//# sourceURL=${file.name}\n</script>`;
      if (isDeferred) {
        deferred.push(tag);
        return '';
      }
      return tag;
    }
  );

  const consoleScript = buildConsoleScript(missing);
  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, (m) => `${m}\n${consoleScript}`);
  } else if (/<html[^>]*>/i.test(html)) {
    html = html.replace(/<html[^>]*>/i, (m) => `${m}\n${consoleScript}`);
  } else {
    html = consoleScript + '\n' + html;
  }

  if (deferred.length > 0) {
    const block = deferred.join('\n');
    html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, () => `${block}\n</body>`) : `${html}\n${block}`;
  }

  return html;
}
