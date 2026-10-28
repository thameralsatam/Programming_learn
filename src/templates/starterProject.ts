import { Project, FileNode, Language } from '../types';

export function createStarterProject(lang: Language = 'de', projectName?: string): Project {
  const isDe = lang === 'de';
  const isAr = lang === 'ar';
  const defaultName = isAr ? 'مشروع تجريبي' : isDe ? 'Hallo Welt' : 'Hello World';
  const name = projectName || defaultName;
  const now = Date.now();

  const htmlContent = isAr
    ? `<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>مرحباً بالعالم</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <main class="card">
      <span class="tag">Studio Lab</span>
      <h1>مرحباً بالعالم</h1>
      <p>مستندك الأول في هذه البيئة التجريبية.</p>
      <button id="btn">انقر هنا</button>
    </main>

    <script src="script.js"></script>
  </body>
</html>`
    : isDe
    ? `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hallo Welt</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <main class="card">
      <span class="tag">Studio Lab</span>
      <h1>Hallo Welt</h1>
      <p>Dein erstes Dokument in dieser Umgebung.</p>
      <button id="btn">Klick mich</button>
    </main>

    <script src="script.js"></script>
  </body>
</html>`
    : `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hello World</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <main class="card">
      <span class="tag">Studio Lab</span>
      <h1>Hello World</h1>
      <p>Your first document in this workspace.</p>
      <button id="btn">Click me</button>
    </main>

    <script src="script.js"></script>
  </body>
</html>`;

  const cssContent = `/* Modern & Minimalist Styles */
:root {
  --bg: #090b10;
  --card-bg: rgba(255, 255, 255, 0.03);
  --card-border: rgba(255, 255, 255, 0.08);
  --text-main: #f0f3f8;
  --text-muted: #8b94a5;
  --accent: #3b82f6;
  --accent-hover: #2563eb;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg);
  color: var(--text-main);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  padding: 1.5rem;
}

.card {
  background: var(--card-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--card-border);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.tag {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--accent);
  letter-spacing: 0.04em;
  margin-bottom: 0.75rem;
}

h1 {
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

p {
  color: var(--text-muted);
  font-size: 0.925rem;
  line-height: 1.5;
  margin-bottom: 1.75rem;
}

button {
  background-color: var(--accent);
  color: #ffffff;
  border: none;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.65rem 1.4rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

button:hover {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
}

button:active {
  transform: scale(0.97);
}
`;

  const jsContent = isAr
    ? `// تفاعل بسيط
const btn = document.getElementById('btn');
let count = 0;

if (btn) {
  btn.addEventListener('click', () => {
    count++;
    btn.textContent = \`النقرات: \${count}\`;
    console.log('[Studio Lab] تم تسجيل نقرة:', count);
  });
}
`
    : isDe
    ? `// Einfache Interaktion
const btn = document.getElementById('btn');
let count = 0;

if (btn) {
  btn.addEventListener('click', () => {
    count++;
    btn.textContent = \`Geklickt: \${count}\`;
    console.log('[Studio Lab] Klick registriert:', count);
  });
}
`
    : `// Simple Interaction
const btn = document.getElementById('btn');
let count = 0;

if (btn) {
  btn.addEventListener('click', () => {
    count++;
    btn.textContent = \`Clicked: \${count}\`;
    console.log('[Studio Lab] Click registered:', count);
  });
}
`;

  const indexHtmlId = 'file_index_html';
  const styleCssId = 'file_style_css';
  const scriptJsId = 'file_script_js';

  const files: Record<string, FileNode> = {
    [indexHtmlId]: {
      id: indexHtmlId,
      name: 'index.html',
      type: 'file',
      content: htmlContent,
      parentId: null,
    },
    [styleCssId]: {
      id: styleCssId,
      name: 'style.css',
      type: 'file',
      content: cssContent,
      parentId: null,
    },
    [scriptJsId]: {
      id: scriptJsId,
      name: 'script.js',
      type: 'file',
      content: jsContent,
      parentId: null,
    },
  };

  return {
    id: `project_${now}`,
    name,
    createdAt: now,
    updatedAt: now,
    files,
    activeFileId: indexHtmlId,
    openFileIds: [indexHtmlId, styleCssId, scriptJsId],
  };
}
