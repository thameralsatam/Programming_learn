/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import JSZip from "jszip";

loader.config({ monaco });
import { saveAs } from "file-saver";
import {
  Code2,
  Copy,
  Check,
  RotateCcw,
  Monitor,
  Smartphone,
  FolderOpen,
  FileCode,
  Menu,
  X,
  Plus,
  FolderPlus,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FilePlus,
  Download,
  Save,
  Upload,
  FolderInput,
  Home as HomeIcon,
  Settings,
  Wand2,
  Accessibility,
  Scissors,
  Clipboard
} from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  parentId: string | null;
  isOpen?: boolean;
}

interface ConsoleLog {
  id: string;
  level: "log" | "warn" | "error";
  message: string;
}

interface Project {
  id: string;
  name: string;
  fs: FileItem[];
  createdAt: number;
}

import { emmetHTML, emmetCSS } from "emmet-monaco-es";

const INITIAL_FS: FileItem[] = [
  {
    id: "1",
    name: "index.html",
    type: "file",
    parentId: null,
    content: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="hero">
    <h1>مختبر التصميم</h1>
    <p>أهلاً بك في بيئة التطوير الخاصة بك. جرب التعديل في الملفات الحالية.</p>
    <button onclick="sayHello()" class="apple-btn">اضغط هنا</button>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
  },
  {
    id: "2",
    name: "style.css",
    type: "file",
    parentId: null,
    content: `body {
  background: #000;
  color: #fff;
  font-family: -apple-system, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  text-align: center;
  -webkit-font-smoothing: antialiased;
}
.hero {
  max-width: 600px;
  padding: 20px;
}
h1 {
  font-size: 56px;
  font-weight: 700;
  letter-spacing: -2px;
  margin: 0;
  background: linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.4) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
p {
  color: #86868b;
  font-size: 20px;
  margin: 15px 0 30px;
}
.apple-btn {
  background: #fff;
  color: #000;
  border: none;
  padding: 14px 32px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.apple-btn:hover {
  background: #eeeeee;
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}`,
  },
  {
    id: "3",
    name: "script.js",
    type: "file",
    parentId: null,
    content: `function sayHello() {
  alert('أهلاً بك في مختبر التعلم الجديد!');
  console.log('Script execution confirmed.');
}`,
  },
];

function useBerlinTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "Europe/Berlin",
          hour: "numeric",
          minute: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);
  return time;
}

// Smart HTML Indentation Formatter for symbol & nesting guides
function formatHtmlCode(html: string): string {
  let normalized = html
    .replace(/>\s*<([a-zA-Z0-9\-!]+)/g, ">\n<$1")
    .replace(/>\s*<\/([a-zA-Z0-9\-]+)/g, ">\n</$1");

  const lines = normalized.split("\n");
  const voidTags = new Set([
    "area", "base", "br", "col", "embed", "hr", "img", "input", 
    "link", "meta", "param", "source", "track", "wbr", "!doctype"
  ]);
  
  let formattedLines: string[] = [];
  let indentLevel = 0;
  const indentStr = "  ";

  for (let rawLine of lines) {
    let line = rawLine.trim();
    if (!line) {
      formattedLines.push("");
      continue;
    }

    const startsWithClosing = line.match(/^<\/([a-zA-Z0-9\-]+)>/i);
    if (startsWithClosing) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    formattedLines.push(indentStr.repeat(indentLevel) + line);

    let cleaned = line.replace(/<!--[\s\S]*?-->/g, "");
    if (startsWithClosing) {
      cleaned = cleaned.substring(startsWithClosing[0].length);
    }

    const openTags = cleaned.match(/<([a-zA-Z0-9\-]+)(?:\s+[^>]*?)?(?<!\/)>/g) || [];
    const closeTags = cleaned.match(/<\/([a-zA-Z0-9\-]+)>/g) || [];

    let netChange = 0;
    for (const tag of openTags) {
      const tagNameMatch = tag.match(/<([a-zA-Z0-9\-]+)/);
      if (tagNameMatch) {
        const tagName = tagNameMatch[1].toLowerCase();
        if (!voidTags.has(tagName) && !tag.endsWith("/>")) {
          netChange++;
        }
      }
    }
    netChange -= closeTags.length;

    indentLevel = Math.max(0, indentLevel + netChange);
  }

  return formattedLines.join("\n");
}

export default function App() {
  const berlinTime = useBerlinTime();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logs, setLogs] = useState<ConsoleLog[]>([]);

  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isAuditingA11y, setIsAuditingA11y] = useState(false);

  const runAccessibilityAudit = () => {
    setIsAuditingA11y(true);
    const iframe = document.querySelector("iframe") as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage("RUN_A11Y", "*");
    }
    setTimeout(() => setIsAuditingA11y(false), 1500);
  };

  const [history, setHistory] = useState<string[]>(["index.html"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [previewKey, setPreviewKey] = useState(0);
  const historyRef = useRef({ list: history, index: historyIndex });

  useEffect(() => {
    historyRef.current = { list: history, index: historyIndex };
  }, [history, historyIndex]);

  const currentPreviewPath = history[historyIndex] || "index.html";
  const [previewDoc, setPreviewDoc] = useState("");

  const [isInitializing, setIsInitializing] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  useEffect(() => {
    let currentId: string | null = null;
    try {
      currentId = localStorage.getItem("studio-lab-current-project-v1");
    } catch {}

    setCurrentProjectId(currentId);

    import("idb-keyval").then(({ get }) => {
      Promise.all([
        get("studio-lab-projects-v1"),
        get("studio-lab-fs-v3")
      ]).then(([savedProjects, savedFs]) => {
        if (savedProjects && Array.isArray(savedProjects)) {
           setProjects(savedProjects);
        } else if (savedFs && Array.isArray(savedFs)) {
           setProjects([
             {
               id: Date.now().toString(),
               name: "مشروعي الأول",
               fs: savedFs,
               createdAt: Date.now(),
             },
           ]);
        }
        setIsInitializing(false);
      }).catch((e) => {
        console.error("Failed to load from IDB", e);
        setIsInitializing(false);
      });
    });
  }, []);

  // Update FS when project changes OR initially load
  const [fs, setFs] = useState<FileItem[]>(INITIAL_FS);
  const isLoadingProject = useRef(false);
  useEffect(() => {
    if (!isInitializing && projects.length > 0 && currentProjectId) {
      const p = projects.find((p) => p.id === currentProjectId);
      if (p) {
        isLoadingProject.current = true;
        setFs(p.fs);
      } else {
        // Project not found, go home
        setCurrentProjectId(null);
      }
    }
  }, [currentProjectId, isInitializing]);

  const fsRef = useRef(fs);
  useEffect(() => {
    fsRef.current = fs;
  }, [fs]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        if (!e.data || typeof e.data !== "object") return;

        if (e.data.type === "CONSOLE_LOG") {
          const rawArgs = Array.isArray(e.data.args) ? e.data.args : [e.data.message ?? ""];
          const formattedMessage = rawArgs
            .map((arg: any) => {
              if (typeof arg === "string") return arg;
              try {
                return JSON.stringify(arg);
              } catch {
                return String(arg);
              }
            })
            .join(" ");

          setLogs((prev) => {
            const newLogs = [
              ...prev,
              {
                level: e.data.level || "log",
                message: formattedMessage,
                id: Math.random().toString(),
              },
            ];
            return newLogs.slice(-20);
          });
        } else if (e.data.type === "NAVIGATE") {
          let path = e.data.path;
          if (typeof path !== "string") return;

          if (path.startsWith("http://") || path.startsWith("https://")) {
            if (!path.includes(window.location.host)) {
              window.open(path, "_blank");
            }
            return;
          }

          path = path
            .replace(/^\.?\//, "")
            .split("#")[0]
            .split("?")[0];
          if (path === "") path = "index.html";

          const { list, index } = historyRef.current;
          if (path === list[index]) return;

          const targetFile = fsRef.current.find(
            (f) => f.name === path && f.type === "file",
          );
          if (!targetFile) {
            console.warn("Target file not found for navigation:", path);
          } else {
            console.log("Navigating preview to:", path);
          }

          const newList = list.slice(0, index + 1);
          newList.push(path);
          setHistory(newList);
          setHistoryIndex(newList.length - 1);
        }
      } catch (err) {
        console.warn("Ignored malformed postMessage:", err);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (isInitializing) return;
    import("idb-keyval").then(({ set }) => {
      set("studio-lab-projects-v1", projects).catch(console.error);
    });
  }, [projects, isInitializing]);

  useEffect(() => {
    try {
      if (currentProjectId) {
        localStorage.setItem("studio-lab-current-project-v1", currentProjectId);
      } else {
        localStorage.removeItem("studio-lab-current-project-v1");
      }
    } catch (e) {}
  }, [currentProjectId]);

  const [activeFileId, setActiveFileId] = useState(() => {
    try {
      const saved = localStorage.getItem("studio-lab-active-file-v3");
      return saved || "1";
    } catch (e) {
      return "1";
    }
  });
  const [showSidebar, setShowSidebar] = useState(() => {
    try {
      const saved = localStorage.getItem("studio-lab-show-sidebar-v3");
      return saved ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });
  const [activeView, setActiveView] = useState<"editor" | "preview">(() => {
    try {
      const saved = localStorage.getItem("studio-lab-active-view-v3");
      return (saved as "editor" | "preview") || "editor";
    } catch (e) {
      return "editor";
    }
  });
  const [copied, setCopied] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [promptDialog, setPromptDialog] = useState<{
    isOpen: boolean;
    message: string;
    defaultValue?: string;
    onConfirm: (value: string) => void;
  } | null>(null);

  const [promptInput, setPromptInput] = useState("");
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const exportWorkspace = async () => {
    const zip = new JSZip();
    zip.file("Studio-Lab-Backup.json", JSON.stringify(projects));
    
    // Also include readable project files as a bonus
    projects.forEach((p) => {
      const pFolder = zip.folder(p.name || "Unnamed Project");
      if (pFolder) {
        const addFolderPaths = (parentId: string | null, parentFolder: any) => {
          p.fs.filter(f => f.parentId === parentId).forEach(f => {
             if (f.type === 'folder') {
               const newFolder = parentFolder.folder(f.name);
               addFolderPaths(f.id, newFolder);
             } else {
               let fileContent = f.content || "";
               // Simple handling for text vs data URIs
               if (fileContent.startsWith("data:")) {
                 const base64Index = fileContent.indexOf(",");
                 if (base64Index !== -1) {
                   parentFolder.file(f.name, fileContent.substring(base64Index + 1), { base64: true });
                 }
               } else {
                 parentFolder.file(f.name, fileContent);
               }
             }
          });
        };
        addFolderPaths(null, pFolder);
      }
    });

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `Studio-Lab-Backup.zip`);
  };

  const importWorkspace = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    try {
      let imported: any[] = [];
      
      if (file.name.endsWith('.zip')) {
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(file);
        const backupFile = loadedZip.file("Studio-Lab-Backup.json");
        if (backupFile) {
          const text = await backupFile.async("text");
          imported = JSON.parse(text);
        } else {
          setConfirmDialog({
            isOpen: true,
            message: "استيراد ملف Zip لا يحتوي على معلومات صالحة. يرجى اختيار ملف Studio-Lab-Backup.zip",
            onConfirm: () => setConfirmDialog(null)
          });
          return;
        }
      } else if (file.name.endsWith('.json')) {
        const text = await file.text();
        imported = JSON.parse(text);
      } else {
        setConfirmDialog({
            isOpen: true,
            message: "يرجى اختيار ملف JSON أو ZIP صالح.",
            onConfirm: () => setConfirmDialog(null)
        });
        return;
      }

      if (Array.isArray(imported)) {
          setConfirmDialog({
            isOpen: true,
            message:
              "هذا سيستبدل جميع المشاريع الحالية. هل أنت متأكد من الاستيراد؟",
            onConfirm: () => {
              setProjects(imported);
              setConfirmDialog(null);
            },
          });
      }
    } catch (err) {
      setConfirmDialog({
        isOpen: true,
        message: "فشل في قراءة الملف. تأكد أنه ملف نسخة احتياطية صالح.",
        onConfirm: () => setConfirmDialog(null),
      });
    }
  };

  const renderDialogs = () => (
    <>
      {/* Confirmation Dialog */}
      {confirmDialog?.isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          dir="rtl"
        >
          <div className="bg-[#141416] border border-white/10 rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">تأكيد الإجراء</h3>
            <p className="text-sm text-white/70 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex items-center justify-end gap-2.5 mt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium"
                id="cancel-confirm"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors font-medium shadow-sm"
                id="confirm-delete"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Dialog */}
      {promptDialog?.isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          dir="rtl"
        >
          <div className="bg-[#141416] border border-white/10 rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">إدخال نص</h3>
            <p className="text-sm text-white/70 leading-relaxed">{promptDialog.message}</p>
            <input
              type="text"
              autoFocus
              className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none focus:border-white/40 transition-colors"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  promptDialog.onConfirm(promptInput);
                  setPromptDialog(null);
                }
              }}
              id="prompt-input-field"
            />
            <div className="flex items-center justify-end gap-2.5 mt-2">
              <button
                onClick={() => setPromptDialog(null)}
                className="px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium"
                id="cancel-prompt"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  promptDialog.onConfirm(promptInput);
                  setPromptDialog(null);
                }}
                className="px-4 py-2 text-sm bg-white hover:bg-white/90 text-black rounded-xl transition-colors font-semibold shadow-sm"
                id="save-prompt"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Auto-save fs
  useEffect(() => {
    if (isLoadingProject.current) {
      isLoadingProject.current = false;
      return;
    }
    if (currentProjectId) {
      setProjects((prev) => {
        const pIndex = prev.findIndex(p => p.id === currentProjectId);
        if (pIndex === -1 || prev[pIndex].fs === fs) return prev;
        
        const newProjects = [...prev];
        newProjects[pIndex] = { ...newProjects[pIndex], fs };
        return newProjects;
      });
    }
  // No fallback necessary
  }, [fs, currentProjectId]);

  // Save activeFileId
  useEffect(() => {
    try {
      localStorage.setItem("studio-lab-active-file-v3", activeFileId);
    } catch (e) {}
  }, [activeFileId]);

  // Save showSidebar
  useEffect(() => {
    try {
      localStorage.setItem(
        "studio-lab-show-sidebar-v3",
        JSON.stringify(showSidebar),
      );
    } catch (e) {}
  }, [showSidebar]);

  // Save activeView
  useEffect(() => {
    try {
      localStorage.setItem("studio-lab-active-view-v3", activeView);
    } catch (e) {}
  }, [activeView]);

  const activeFile = fs.find((f) => f.id === activeFileId) || fs[0];

  const handleCopy = () => {
    if (activeFile?.content) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  
  const lastSelectionRef = useRef<any>(null);
  const [copySuccessToast, setCopySuccessToast] = useState(false);

  const handleEditorCopy = async () => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    let selection = editor.getSelection();
    if (!selection || (selection.startLineNumber === selection.endLineNumber && selection.startColumn === selection.endColumn)) {
      if (lastSelectionRef.current) selection = lastSelectionRef.current;
    }
    const model = editor.getModel();
    if (selection && model) {
      const text = model.getValueInRange(selection);
      if (text) {
        try {
          await navigator.clipboard.writeText(text);
          setCopySuccessToast(true);
          setTimeout(() => setCopySuccessToast(false), 2000);
          return;
        } catch {
          editor.focus();
          editor.trigger('source', 'editor.action.clipboardCopyAction', null);
          return;
        }
      }
    }
    if (activeFile?.content) {
      try {
        await navigator.clipboard.writeText(activeFile.content);
        setCopySuccessToast(true);
        setTimeout(() => setCopySuccessToast(false), 2000);
      } catch {}
    }
  };

  const handleEditorCut = async () => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    let selection = editor.getSelection();
    if (!selection || (selection.startLineNumber === selection.endLineNumber && selection.startColumn === selection.endColumn)) {
      if (lastSelectionRef.current) selection = lastSelectionRef.current;
    }
    const model = editor.getModel();
    if (selection && model) {
      const text = model.getValueInRange(selection);
      if (text) {
        try {
          await navigator.clipboard.writeText(text);
          editor.executeEdits('cut-action', [{ range: selection, text: '' }]);
          setCopySuccessToast(true);
          setTimeout(() => setCopySuccessToast(false), 2000);
        } catch {
          editor.focus();
          editor.trigger('source', 'editor.action.clipboardCutAction', null);
        }
      }
    }
  };

  const handleEditorPaste = async () => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    editor.focus();
    let selection = editor.getSelection() || lastSelectionRef.current;
    try {
      const text = await navigator.clipboard.readText();
      if (text && selection) {
        editor.executeEdits('paste-action', [{ range: selection, text }]);
      } else {
        editor.trigger('source', 'editor.action.clipboardPasteAction', null);
      }
    } catch {
      editor.trigger('source', 'editor.action.clipboardPasteAction', null);
    }
  };

  const handleAutoFixIndentation = () => {
    if (!editorRef.current || !activeFile) return;
    const currentContent = activeFile.content || "";
    let formatted = currentContent;
    if (activeFile.name.endsWith(".html")) {
      formatted = formatHtmlCode(currentContent);
    } else {
      editorRef.current.focus();
      handleAutoFixIndentation();
      return;
    }
    updateFileContent(formatted);
    if (editorRef.current) {
      editorRef.current.setValue(formatted);
    }
  };

  const handleBackToHome = () => {
    setCurrentProjectId(null);
  };

  const updateFileContent = (newVal: string | undefined) => {
    setFs((prev) =>
      prev.map((f) =>
        f.id === activeFileId ? { ...f, content: newVal || "" } : f,
      ),
    );
  };

  const generatePreviewDoc = (currentFs: FileItem[], currentPath: string) => {
    const targetFile = currentFs.find((f) => f.name === currentPath);
    let html = "";

    if (!targetFile) {
      html = `<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"/></head><body style="background:#f8f9fa;color:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:-apple-system, sans-serif;text-align:center;"><div style="font-size:48px;margin-bottom:10px;">📄</div><h1 style="margin:0;font-size:20px;font-weight:600;color:#333;">الصفحة غير موجودة</h1><p style="color:#666;font-size:14px;margin-top:5px;">لم يتم العثور على <code style="direction:ltr;display:inline-block;">${currentPath}</code> في ملفات المشروع.</p></body></html>`;
    } else {
      html = targetFile.content || "";
    }

    // Replace basic resource links
    currentFs.forEach((f) => {
      if (f.type === "file" && f.content && f.content.startsWith("data:")) {
        const regex = new RegExp(
          `(src|href)=["']?\\/?\\.?\\/?${f.name}["']?`,
          "g",
        );
        html = html.replace(regex, `$1="${f.content}"`);
        const urlRegex = new RegExp(
          `url\\(["']?\\/?\\.?\\/?${f.name}["']?\\)`,
          "g",
        );
        html = html.replace(urlRegex, `url('${f.content}')`);
      }
    });

    const styleFile = currentFs.find((f) => f.name === "style.css");
    const scriptFile = currentFs.find((f) => f.name === "script.js");

    if (styleFile && !html.includes("الصفحة غير موجودة")) {
      const css = `<style>${styleFile.content}</style>`;
      if (html.includes("style.css")) {
        html = html.replace(/<link.*style\.css.*>/, css);
      } else if (html.includes("</head>")) {
        html = html.replace("</head>", `${css}</head>`);
      }
    }

    if (scriptFile && !html.includes("الصفحة غير موجودة")) {
      const js = `<script>${scriptFile.content}<\/script>`;
      if (html.includes("script.js")) {
        html = html.replace(/<script.*script\.js.*><\/script>/, js);
      } else if (html.includes("</body>")) {
        html = html.replace("</body>", `${js}</body>`);
      }
    }

    const persistScrollScript = `<style>
      html, body {
        overscroll-behavior: none;
      }
      /* Force display of number input spinners on webkit */
      input[type=number]::-webkit-inner-spin-button, 
      input[type=number]::-webkit-outer-spin-button { 
        opacity: 1; 
      }
    </style>
    <script>
      (function() {
        // Forward iframe console logs to parent app studio
        const levels = ['log', 'warn', 'error', 'info'];
        levels.forEach(function(level) {
          const original = console[level];
          console[level] = function() {
            try {
              const args = Array.from(arguments).map(function(arg) {
                if (typeof arg === 'object') {
                  try { return JSON.stringify(arg); } catch(e) { return String(arg); }
                }
                return String(arg);
              });
              window.parent.postMessage({ type: 'CONSOLE_LOG', level: level, args: args }, '*');
            } catch(e) {}
            if (original) original.apply(console, arguments);
          };
        });

        // Safely intercept unhandled runtime errors in preview iframe
        window.addEventListener('error', function(e) {
          try {
            const errorMsg = e.message || (e.error && e.error.message) || 'Uncaught error in preview';
            window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'error', args: ['[خطأ برمجي]: ' + errorMsg] }, '*');
          } catch(err) {}
          // Prevent error from bubbling up as cross-origin Script error
          e.preventDefault();
        });

        window.addEventListener('unhandledrejection', function(e) {
          try {
            const reason = e.reason ? (e.reason.message || String(e.reason)) : 'Unhandled promise rejection';
            window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'error', args: ['[رفض Promise غير معالج]: ' + reason] }, '*');
          } catch(err) {}
          e.preventDefault();
        });

        const interceptNavigation = (urlStr, e) => {
            try {
              if (!urlStr || urlStr.startsWith('javascript:') || urlStr.startsWith('#') || urlStr.startsWith('mailto:')) return;
              if (e) {
                e.preventDefault();
                e.stopPropagation();
              }
              window.parent.postMessage({ type: 'NAVIGATE', path: urlStr }, '*');
            } catch (err) {}
        };

        document.addEventListener('click', (e) => {
          const link = e.target.closest('a');
          if (link) {
            const href = link.getAttribute('href');
            if (href) interceptNavigation(href, e);
          }
        }, true);
        
        document.addEventListener('submit', (e) => {
          const form = e.target;
          if (form) {
            const action = form.getAttribute('action') || '';
            interceptNavigation(action, e);
          }
        }, true);

        const scrollKey = 'studio_iframe_scroll';
        const st = sessionStorage.getItem(scrollKey);
        if (st) {
          document.documentElement.style.scrollBehavior = 'auto';
          window.scrollTo(0, parseInt(st, 10));
          window.addEventListener('DOMContentLoaded', () => { window.scrollTo(0, parseInt(st, 10)); });
          window.addEventListener('load', () => { window.scrollTo(0, parseInt(st, 10)); });
        }
        window.addEventListener('scroll', () => {
          sessionStorage.setItem(scrollKey, window.scrollY);
        }, { passive: true });
        
        window.addEventListener('message', (e) => {
          if (e.data === 'RUN_A11Y') {
            runBuiltinA11y();
          }
        });
        
        function runBuiltinA11y() {
          console.info('%c[فحص إمكانية الوصول] جاري التحقق من معايير WCAG والوصول...', 'color: #007aff; font-weight: bold;');
          const violations = [];

          // 1. Image alt tags
          const imgs = document.querySelectorAll('img:not([alt])');
          imgs.forEach(function(img) {
            violations.push({
              id: 'image-alt',
              impact: 'حرجة',
              description: 'صورة تفتقر إلى نص بديل (alt attribute)',
              element: img.outerHTML.slice(0, 100)
            });
          });

          // 2. Buttons without accessible text
          const buttons = document.querySelectorAll('button');
          buttons.forEach(function(btn) {
            if (!btn.textContent.trim() && !btn.getAttribute('aria-label') && !btn.getAttribute('title')) {
              violations.push({
                id: 'button-name',
                impact: 'حرجة',
                description: 'زر يفتقر إلى نص مقروء أو تسمية توضيحية (aria-label)',
                element: btn.outerHTML.slice(0, 100)
              });
            }
          });

          // 3. Inputs without labels
          const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"])');
          inputs.forEach(function(inp) {
            const id = inp.id;
            const hasLabel = id ? document.querySelector('label[for="' + id + '"]') : inp.closest('label');
            const hasAria = inp.getAttribute('aria-label') || inp.getAttribute('placeholder');
            if (!hasLabel && !hasAria) {
              violations.push({
                id: 'label',
                impact: 'متوسطة',
                description: 'حقل إدخال يفتقر إلى تسمية توضيحية (label أو aria-label)',
                element: inp.outerHTML.slice(0, 100)
              });
            }
          });

          // 4. HTML lang attribute
          if (!document.documentElement.getAttribute('lang')) {
            violations.push({
              id: 'html-has-lang',
              impact: 'متوسطة',
              description: 'عنصر <html> يفتقر إلى سمة اللغة (lang="ar")',
              element: '<html>'
            });
          }

          if (violations.length === 0) {
            console.info('%c[فحص الوصول] 🎉 رائع! لم يتم العثور على أي مشاكل وصولية أو نواقص في الصفحة.', 'color: #34c759; font-weight: bold;');
          } else {
            console.warn('%c[فحص الوصول] ⚠️ تم العثور على ' + violations.length + ' ملاحظات وصولية:', 'color: #ff9500; font-weight: bold;');
            violations.forEach(function(v, i) {
              console.warn((i + 1) + '. [' + v.impact + '] ' + v.description + ' -> ' + v.element);
            });
          }
        }
      })();
    </script>`;

    if (html.includes("</body>")) {
      html = html.replace("</body>", `${persistScrollScript}</body>`);
    } else {
      html += persistScrollScript;
    }

    return html;
  };

  // Debounced preview update
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPreviewDoc(generatePreviewDoc(fs, currentPreviewPath));
    }, 500);
    return () => clearTimeout(timeout);
  }, [fs, currentPreviewPath]);

  // Reset preview path when project changes
  useEffect(() => {
    setHistory(["index.html"]);
    setHistoryIndex(0);
  }, [currentProjectId]);

  const createFile = (parentId: string | null, type: "file" | "folder") => {
    const name = type === "file" ? "new-file.text" : "new-folder";
    const id = Date.now().toString();
    const newNode: FileItem = {
      id,
      name,
      type,
      parentId,
      content: type === "file" ? "" : undefined,
      isOpen: type === "folder" ? true : undefined,
    };
    setFs((prev) => [...prev, newNode]);
    setEditingId(id);
    setEditName(name);
  };

  const handleFileUpload = (parentId: string | null = null) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*/*";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const isTextFile =
        file.type.startsWith("text/") ||
        file.name.match(/\.(js|ts|json|md|html|css|xml|jsx|tsx)$/i);

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const id = Date.now().toString();
        const newNode: FileItem = {
          id,
          name: file.name,
          type: "file",
          parentId,
          content,
        };
        setFs((prev) => [...prev, newNode]);
        setActiveFileId(id);
      };

      if (isTextFile) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const deleteNode = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      message: "هل أنت متأكد من حذف هذا العنصر؟",
      onConfirm: () => {
        const toDelete = [id];
        const findChildren = (pid: string) => {
          fs.filter((f) => f.parentId === pid).forEach((child) => {
            toDelete.push(child.id);
            findChildren(child.id);
          });
        };
        findChildren(id);
        setFs((prev) => {
          const nextFs = prev.filter((f) => !toDelete.includes(f.id));
          if (toDelete.includes(activeFileId)) {
            // Find first available file
            const firstFile = nextFs.find((f) => f.type === "file");
            if (firstFile) setTimeout(() => setActiveFileId(firstFile.id), 0);
          }
          return nextFs;
        });
        setConfirmDialog(null);
      },
    });
  };

  const renameNode = () => {
    if (!editingId || !editName.trim()) return;
    setFs((prev) =>
      prev.map((f) =>
        f.id === editingId ? { ...f, name: editName.trim() } : f,
      ),
    );
    setEditingId(null);
  };

  const toggleFolder = (id: string) => {
    setFs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isOpen: !f.isOpen } : f)),
    );
  };

  const duplicateFile = (id: string) => {
    const original = fs.find((f) => f.id === id);
    if (!original || original.type === "folder") return;
    const newId = Date.now().toString();
    const newNode: FileItem = {
      ...original,
      id: newId,
      name: `copy-${original.name}`,
    };
    setFs((prev) => [...prev, newNode]);
  };

  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // High contrast Apple dark theme with clear nesting guide lines
    try {
      monaco.editor.defineTheme("apple-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#050505",
          "editorIndentGuide.background": "#ffffff2a",
          "editorIndentGuide.activeBackground": "#007aff",
          "editorBracketMatch.border": "#007aff99",
          "editorBracketMatch.background": "#007aff25",
          "editor.lineHighlightBackground": "#ffffff08",
        },
      });
      monaco.editor.setTheme("apple-dark");
    } catch (e) {}

    editor.onDidChangeCursorSelection((e: any) => {
      lastSelectionRef.current = e.selection;
    });
    
    // Setup Emmet
    try {
      emmetHTML(monaco);
      emmetCSS(monaco);
    } catch (e) {
      console.error("Emmet setup failed:", e);
    }

    // File paths autocomplete
    const fileCompletionProvider = {
      triggerCharacters: ['"', "'", "/", "./", "../"],
      provideCompletionItems: (model: any, position: any) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: Math.max(1, position.lineNumber - 1),
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        const match = textUntilPosition.match(/(['"])([^'"]*)$/);
        if (!match) return { suggestions: [] };

        const currentFs = fsRef.current;
        const suggestions = currentFs.map(f => ({
          label: f.name,
          kind: monaco.languages.CompletionItemKind.File,
          insertText: f.name,
          detail: f.type === 'folder' ? 'Folder' : 'File'
        }));

        return { suggestions };
      }
    };

    monaco.languages.registerCompletionItemProvider("html", fileCompletionProvider);
    monaco.languages.registerCompletionItemProvider("css", fileCompletionProvider);
    monaco.languages.registerCompletionItemProvider("javascript", fileCompletionProvider);

    monaco.languages.setLanguageConfiguration("html", {
      onEnterRules: [
        {
          // Between dual tags: <p>|</p> -> <p>\n  |\n</p>
          beforeText:
            /<(?!(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr))([_:\w][\w\d\-._:]*)(?:\s+[^<>]*?)?>/i,
          afterText: /<\/([_:\w][\w\d\-._:]*)>/i,
          action: { indentAction: monaco.languages.IndentAction.IndentOutdent },
        },
        {
          // After a tag: <p>| -> <p>\n  |
          beforeText:
            /<(?!(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr))([_:\w][\w\d\-._:]*)(?:\s+[^<>]*?)?>/i,
          action: { indentAction: monaco.languages.IndentAction.Indent },
        },
      ],
    });

    // Provide autocomplete snippets for HTML tags
    monaco.languages.registerCompletionItemProvider("html", {
      triggerCharacters: [
        "<",
        "a",
        "b",
        "d",
        "e",
        "f",
        "h",
        "i",
        "l",
        "m",
        "n",
        "p",
        "s",
        "t",
        "u",
        "v",
      ],
      provideCompletionItems: (model: any, position: any) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        const match = textUntilPosition.match(/(<)?([a-zA-Z1-6!]*)$/);
        if (!match) return { suggestions: [] };

        const hasOpenBracket = !!match[1];
        const word = match[2];

        const tags = [
          "html",
          "head",
          "body",
          "div",
          "span",
          "script",
          "style",
          "p",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "a",
          "button",
          "ul",
          "li",
          "nav",
          "header",
          "footer",
          "main",
          "section",
          "article",
          "form",
          "label",
          "table",
          "tr",
          "td",
          "th",
          "thead",
          "tbody",
          "strong",
          "em",
          "b",
          "i",
          "u",
          "s",
          "svg",
          "path",
          "video",
          "audio",
          "canvas",
          "iframe",
        ];
        const voidTags = [
          "img",
          "input",
          "br",
          "hr",
          "link",
          "meta",
          "source",
          "area",
        ];

        const suggestions: any[] = [];
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column - word.length - (hasOpenBracket ? 1 : 0),
          endColumn: position.column,
        };

        // HTML5 Boilerplate for "!"
        if (word === "!" || textUntilPosition.trim().endsWith("!")) {
          suggestions.push({
            label: "!",
            kind: monaco.languages.CompletionItemKind.Snippet,
            sortText: "0000",
            insertText: "<!DOCTYPE html>\n<html lang=\"ar\" dir=\"rtl\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>${1:صفحة جديدة}</title>\n</head>\n<body>\n  ${0}\n</body>\n</html>",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "قالب صفحة HTML أساسية (! + Tab)",
            filterText: "!",
            range,
          });
        }

        tags.forEach((tag) => {
          suggestions.push({
            label: tag, // Display name
            kind: monaco.languages.CompletionItemKind.Snippet,
            sortText: "0", // prioritize
            insertText: `<${tag}>$1</${tag}>`,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: `Insert <${tag}>...</${tag}> snippet`,
            filterText: hasOpenBracket ? `<${tag}` : tag,
            range,
          });
        });

        voidTags.forEach((tag) => {
          suggestions.push({
            label: tag,
            kind: monaco.languages.CompletionItemKind.Snippet,
            sortText: "0",
            insertText: `<${tag}>$1`,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: `Insert void tag <${tag}>`,
            filterText: hasOpenBracket ? `<${tag}` : tag,
            range,
          });
        });

        return { suggestions };
      },
    });

    editor.onKeyDown((e: any) => {
      const model = editor.getModel();
      const position = editor.getPosition();

      
      if ((e.keyCode === monaco.KeyCode.Tab || e.keyCode === monaco.KeyCode.Enter) && !e.shiftKey) {
        const lineContent = model.getLineContent(position.lineNumber);
        const prefix = lineContent.substring(0, position.column - 1).trim();
        if (prefix === "!") {
          e.preventDefault();
          e.stopPropagation();
          const boilerplate = "<!DOCTYPE html>\n<html lang=\"ar\" dir=\"rtl\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>صفحة جديدة</title>\n</head>\n<body>\n  \n</body>\n</html>";
          const fullLineRange = new monaco.Range(position.lineNumber, 1, position.lineNumber, lineContent.length + 1);
          editor.executeEdits("emmet-exclamation", [
            { range: fullLineRange, text: boilerplate }
          ]);
          editor.setPosition({ lineNumber: 8, column: 3 });
          return;
        }
      }

      if (e.keyCode === monaco.KeyCode.Enter) {
        const lineContent = model.getLineContent(position.lineNumber);
        const prefix = lineContent.substring(0, position.column - 1);
        const suffix = lineContent.substring(position.column - 1);

        // Match <tag>|</tag> -> hitting Enter splits it into multiple lines
        const openMatch = prefix.match(/<([a-zA-Z1-6]+)>$/);
        const closeMatch = suffix.match(/^<\/([a-zA-Z1-6]+)>/);

        if (openMatch && closeMatch && openMatch[1] === closeMatch[1]) {
          e.preventDefault();
          e.stopPropagation();

          editor.executeEdits("tag-indent", [
            {
              range: new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column,
              ),
              text: "\n  \n",
            },
          ]);

          editor.setPosition({
            lineNumber: position.lineNumber + 1,
            column: model.getLineContent(position.lineNumber + 1).length + 1,
          });
          return;
        }
      }
    });
  };

  const editorOptions = {
    fontSize: 14,
    lineHeight: 22,
    fontFamily:
      '"JetBrains Mono", SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    minimap: { enabled: false },
    autoClosingBrackets: "always" as const,
    autoClosingQuotes: "always" as const,
    autoClosingTags: true,
    autoClosingDelete: "always" as const,
    autoClosingOvertype: "always" as const,
    suggestOnTriggerCharacters: true,
    padding: { top: 14, bottom: 14 },
    lineNumbers: "on" as const,
    lineNumbersMinChars: 3,
    glyphMargin: false,
    scrollBeyondLastLine: false,
    wordWrap: "on" as const,
    wrappingIndent: "indent" as const,
    cursorBlinking: "smooth" as const,
    cursorSmoothCaretAnimation: "on" as const,
    quickSuggestions: true,
    bracketPairColorization: { enabled: true },
    guides: { indentation: true, bracketPairs: true, bracketPairsHorizontal: true, highlightActiveIndentation: true },
    folding: true,
    showFoldingControls: "mouseover" as const,
    formatOnPaste: true,
    formatOnType: true,
    renderIndentGuides: true,
    scrollbar: {
      vertical: "auto" as const,
      horizontal: "auto" as const,
      useShadows: false,
      verticalSliderSize: 4,
      horizontalSliderSize: 4,
    },
  };

  const renderTree = (parentId: string | null, level = 0) => {
    const nodes = fs
      .filter((f) => f.parentId === parentId)
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

    return nodes.map((node) => (
      <div key={node.id}>
        <div
          className={`group flex items-center gap-2 px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${activeFileId === node.id ? "bg-white text-black" : "text-white/30 hover:bg-white/[0.03] hover:text-white/60"}`}
          style={{ marginRight: level * 10 }}
          onClick={() => {
            if (node.type === "folder") toggleFolder(node.id);
            else {
              setActiveFileId(node.id);
              setActiveView("editor");
              if (typeof window !== "undefined" && window.innerWidth < 768) {
                setShowSidebar(false);
              }
            }
          }}
        >
          {node.type === "folder" ? (
            node.isOpen ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronRight size={12} />
            )
          ) : (
            <FileCode
              size={12}
              className={
                activeFileId === node.id
                  ? "text-black"
                  : node.name.endsWith(".html")
                    ? "text-[#ff5d01]"
                    : node.name.endsWith(".css")
                      ? "text-[#007acc]"
                      : "text-[#f0db4f]"
              }
            />
          )}

          {editingId === node.id ? (
            <input
              autoFocus
              className={`bg-transparent border-none outline-none w-full py-0 px-0 h-4 ${activeFileId === node.id ? "text-black" : "text-white"}`}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={renameNode}
              onKeyDown={(e) => e.key === "Enter" && renameNode()}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 truncate py-0.5">{node.name}</span>
          )}

          <div
            className={`flex items-center gap-1 transition-opacity ${activeFileId === node.id || (node.type === "folder" && node.isOpen) ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
          >
            {node.type === "folder" && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileUpload(node.id);
                  }}
                  className={`p-0.5 transition-colors ${activeFileId === node.id ? "hover:text-blue-600" : "hover:text-white/80"}`}
                  title="رفع ملف هنا"
                >
                  <Upload size={10} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    createFile(node.id, "file");
                  }}
                  className={`p-0.5 transition-colors ${activeFileId === node.id ? "hover:text-blue-600" : "hover:text-white/80"}`}
                  title="ملف جديد"
                >
                  <Plus size={10} />
                </button>
              </>
            )}
            {node.type === "file" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateFile(node.id);
                }}
                className={`p-0.5 transition-colors ${activeFileId === node.id ? "hover:text-blue-600" : "hover:text-white/80"}`}
              >
                <Copy size={10} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingId(node.id);
                setEditName(node.name);
              }}
              className={`p-0.5 transition-colors ${activeFileId === node.id ? "hover:text-blue-600" : "hover:text-blue-400"}`}
              title="تعديل الاسم"
            >
              <Edit2 size={10} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteNode(node.id);
              }}
              className={`p-0.5 transition-colors ${activeFileId === node.id ? "hover:text-red-600" : "hover:text-red-400"}`}
              title="حذف"
            >
              <Trash2 size={10} />
            </button>
          </div>
        </div>
        {node.type === "folder" && node.isOpen && (
          <div className="mt-0.5">{renderTree(node.id, level + 1)}</div>
        )}
      </div>
    ));
  };

  const createNewProject = () => {
    setPromptInput("");
    setPromptDialog({
      isOpen: true,
      message: "ما هو اسم المشروع الجديد؟",
      onConfirm: (name) => {
        if (!name || !name.trim()) return;
        const newProject: Project = {
          id: Date.now().toString(),
          name: name.trim(),
          fs: INITIAL_FS,
          createdAt: Date.now(),
        };
        setProjects((prev) => [newProject, ...prev]);
        setCurrentProjectId(newProject.id);
      },
    });
  };

  const deleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      message: "هل أنت متأكد من حذف هذا المشروع نهائياً؟",
      onConfirm: () => {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        if (currentProjectId === id) setCurrentProjectId(null);
        setConfirmDialog(null);
      },
    });
  };

  const renameProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const p = projects.find((proj) => proj.id === id);
    if (!p) return;
    setPromptInput(p.name);
    setPromptDialog({
      isOpen: true,
      message: "أدخل الاسم الجديد للمشروع:",
      defaultValue: p.name,
      onConfirm: (newName) => {
        if (newName && newName.trim()) {
          setProjects((prev) =>
            prev.map((proj) =>
              proj.id === id ? { ...proj, name: newName.trim() } : proj,
            ),
          );
        }
      },
    });
  };

  if (!currentProjectId) {
    return (
      <div
        className="min-h-screen w-full bg-[#000] text-white flex flex-col items-center py-6 px-4 sm:py-16 sm:px-6 relative overflow-y-auto"
        dir="rtl"
      >
        <input
          type="file"
          accept=".json,.zip"
          ref={fileInputRef}
          onChange={handleImportFileChange}
          className="hidden"
        />
        {/* Apple-style background blur elements */}
        <div className="absolute top-1/4 right-1/4 w-[260px] sm:w-[500px] h-[260px] sm:h-[500px] bg-white/5 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-blue-500/5 rounded-full blur-[70px] sm:blur-[100px] pointer-events-none" />

        <div className="max-w-4xl w-full z-10 flex flex-col gap-6 sm:gap-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-5 pb-5 sm:pb-8 border-b border-white/10">
            <div>
              <h1 className="text-2xl sm:text-5xl font-bold tracking-tight mb-1 sm:mb-2 text-white">
                مشاريعك
              </h1>
              <p className="text-white/50 text-xs sm:text-base">
                مرحباً بك مجدداً في مساحة عملك الإبداعية.
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={importWorkspace}
                className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl text-xs sm:text-sm font-medium transition-all active:scale-95 border border-white/5 min-h-[38px]"
                title="استيراد نسخة احتياطية"
              >
                <FolderInput size={16} />
                <span>استيراد</span>
              </button>
              <button
                onClick={exportWorkspace}
                className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl text-xs sm:text-sm font-medium transition-all active:scale-95 border border-white/5 min-h-[38px]"
                title="تصدير نسخة احتياطية"
              >
                <Download size={16} />
                <span>تصدير</span>
              </button>
              <button
                onClick={createNewProject}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 bg-white text-black hover:bg-white/90 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-sm min-h-[38px]"
              >
                <Plus size={16} />
                <span>مشروع جديد</span>
              </button>
            </div>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-32 text-center border border-white/5 rounded-2xl sm:rounded-3xl bg-white/[0.02] backdrop-blur-xl px-4">
              <FolderOpen size={36} className="text-white/15 mb-3" />
              <h3 className="text-base sm:text-xl font-semibold text-white/70 mb-1.5">
                لا توجد مشاريع حالياً
              </h3>
              <p className="text-white/40 text-xs sm:text-sm">
                ابدأ بإنشاء أول مشروع لك ومارس الإبداع.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setCurrentProjectId(project.id)}
                  className="group relative flex flex-col justify-between min-h-[145px] p-4 sm:p-6 rounded-2xl border border-white/[0.08] bg-[#0c0c0e] hover:bg-[#131316] backdrop-blur-2xl cursor-pointer transition-all duration-300 hover:shadow-[0_8px_32px_rgba(255,255,255,0.03)] hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 group-hover:text-white/90 group-hover:bg-white/10 transition-colors shrink-0">
                        <Code2 size={18} />
                      </div>
                      <div className="flex items-center gap-1.5 relative z-20 pointer-events-auto shrink-0">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            renameProject(project.id, e);
                          }}
                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90"
                          title="تعديل الاسم"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteProject(project.id, e);
                          }}
                          className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-all active:scale-90"
                          title="حذف المشروع"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-white/95 group-hover:text-white transition-colors truncate">
                      {project.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-[11px] sm:text-xs text-white/40 pt-3 border-t border-white/5 mt-3">
                    <span className="truncate">
                      آخر تعديل:{" "}
                      {new Date(project.createdAt).toLocaleDateString("ar-SA")}
                    </span>
                    <span className="flex items-center gap-1 group-hover:text-white/60 transition-colors shrink-0" dir="ltr">
                      <FileCode size={12} />
                      <span dir="rtl">{project.fs.filter((f) => f.type === "file").length} ملف</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {renderDialogs()}
      </div>
    );
  }

  return (
    <div
      className="h-screen w-full bg-[#000] text-white flex flex-col overflow-hidden"
      dir="rtl"
    >
      
      {/* Universal Top Navigation Bar */}
      <header className="h-12 border-b border-white/[0.08] px-3 md:px-6 flex items-center justify-between shrink-0 bg-[#070708] relative z-50 select-none">
        {/* Right side (RTL Start): Brand & Back to Home */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-1.5 md:gap-2 text-white hover:text-white/80 transition-colors active:scale-95 px-2 py-1.5 rounded-lg hover:bg-white/5"
            title="العودة للرئيسية"
          >
            <HomeIcon size={16} />
            <span className="font-bold text-xs sm:text-sm tracking-tight hidden sm:inline">Studio Lab</span>
          </button>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          
          <div className="flex items-center gap-1.5 text-xs text-white/50 font-mono hidden md:flex truncate max-w-[200px]" dir="ltr">
            <span className="w-2 h-2 rounded-full bg-emerald-500/80 shrink-0"></span>
            <span className="truncate">{activeFile?.name || "index.html"}</span>
          </div>
        </div>

        {/* Center: Mobile Switcher (الكود / المعاينة) */}
        <div className="flex items-center justify-center flex-1 max-w-[180px] md:max-w-none md:flex-initial mx-2">
          <div className="flex md:hidden bg-white/10 p-0.5 rounded-lg text-xs font-medium w-full">
            <button
              onClick={() => setActiveView("editor")}
              className={`flex-1 py-1 rounded-md transition-all font-semibold text-center ${
                activeView === "editor" ? "bg-white text-black shadow-sm" : "text-white/60 hover:text-white"
              }`}
            >
              الكود
            </button>
            <button
              onClick={() => setActiveView("preview")}
              className={`flex-1 py-1 rounded-md transition-all font-semibold text-center ${
                activeView === "preview" ? "bg-white text-black shadow-sm" : "text-white/60 hover:text-white"
              }`}
            >
              المعاينة
            </button>
          </div>
        </div>

        {/* Left side (RTL End): Actions & Tools */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-2.5 shrink-0">
          {/* Tools Menu Button */}
          <div className="relative">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isToolsOpen ? "bg-white/20 text-white" : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
              title="أدوات التحرير المتقدمة"
            >
              <Settings size={15} />
              <span className="hidden sm:inline">الأدوات</span>
            </button>

            {/* Tools Dropdown Menu */}
            {isToolsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsToolsOpen(false);
                  }}
                />
                <div
                  className="absolute left-0 md:right-0 md:left-auto top-full mt-2 w-64 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 text-xs flex flex-col gap-0.5 font-sans animate-in fade-in zoom-in-95 duration-150"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {/* Format document / Auto Indent */}
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      handleAutoFixIndentation();
                      setIsToolsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-right flex items-center justify-between text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Wand2 size={14} className="text-[#007aff]" />
                      <span>تعديل وترتيب المساحات والخطوط</span>
                    </span>
                    <span className="text-[10px] text-white/30 font-mono">Shift+Alt+F</span>
                  </button>

                  <div className="h-px bg-white/5 my-1" />

                  {/* Copy */}
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      handleEditorCopy();
                      setIsToolsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-right flex items-center justify-between text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Copy size={14} />
                      <span>نسخ النص المحدد (Copy)</span>
                    </span>
                    <span className="text-[10px] text-white/30 font-mono">⌘C</span>
                  </button>

                  {/* Paste */}
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      handleEditorPaste();
                      setIsToolsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-right flex items-center justify-between text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Clipboard size={14} />
                      <span>لصق (Paste)</span>
                    </span>
                    <span className="text-[10px] text-white/30 font-mono">⌘V</span>
                  </button>

                  {/* Cut */}
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      handleEditorCut();
                      setIsToolsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-right flex items-center justify-between text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Scissors size={14} />
                      <span>قص النص المحدد (Cut)</span>
                    </span>
                    <span className="text-[10px] text-white/30 font-mono">⌘X</span>
                  </button>

                  <div className="h-px bg-white/5 my-1" />

                  {/* Accessibility Audit in menu */}
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      runAccessibilityAudit();
                      setIsToolsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-right flex items-center justify-between text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Accessibility size={14} className="text-amber-400" />
                      <span>فحص إمكانية الوصول والنواقص</span>
                    </span>
                  </button>

                  {/* Export ZIP in menu */}
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      exportWorkspace();
                      setIsToolsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-right flex items-center justify-between text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Download size={14} />
                      <span>تحميل المشروع كاملاً (ZIP)</span>
                    </span>
                  </button>

                  <div className="h-px bg-white/5 my-1" />

                  {/* Go to symbol */}
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (editorRef.current) {
                        editorRef.current.focus();
                        editorRef.current.trigger('source', 'editor.action.quickOutline');
                      }
                      setIsToolsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-right flex items-center justify-between text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span>الانتقال لرمز (Go to symbol)</span>
                    <span className="text-[10px] text-white/30 font-mono">⌘O</span>
                  </button>

                  {/* Rename symbol */}
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (editorRef.current) {
                        editorRef.current.focus();
                        editorRef.current.trigger('source', 'editor.action.rename');
                      }
                      setIsToolsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-right flex items-center justify-between text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span>إعادة تسمية الرمز (Rename)</span>
                    <span className="text-[10px] text-white/30 font-mono">F2</span>
                  </button>

                  {/* Change all occurrences */}
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (editorRef.current) {
                        editorRef.current.focus();
                        editorRef.current.trigger('source', 'editor.action.changeAll');
                      }
                      setIsToolsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-right flex items-center justify-between text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span>تغيير كافة التكرارات (Change all)</span>
                    <span className="text-[10px] text-white/30 font-mono">⌘F2</span>
                  </button>

                  {/* Command palette */}
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (editorRef.current) {
                        editorRef.current.focus();
                        editorRef.current.trigger('source', 'editor.action.quickCommand');
                      }
                      setIsToolsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-right flex items-center justify-between text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span>لوحة الأوامر (Command palette)</span>
                    <span className="text-[10px] text-white/30 font-mono">F1</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Accessibility Audit (Desktop) */}
          <button
            onClick={runAccessibilityAudit}
            disabled={isAuditingA11y}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all"
            title="فحص إمكانية الوصول والنواقص (Accessibility Audit)"
          >
            <Accessibility size={14} className={isAuditingA11y ? "animate-spin text-amber-400" : "text-amber-400/80"} />
            <span className="hidden xl:inline">إمكانية الوصول</span>
          </button>

          {/* Export Project ZIP (Desktop) */}
          <button
            onClick={exportWorkspace}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all"
            title="تحميل المشروع كاملاً (ZIP)"
          >
            <Download size={14} />
            <span className="hidden xl:inline">تصدير</span>
          </button>

          {/* Toggle Explorer Sidebar */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-2 rounded-lg transition-colors ${
              showSidebar ? "bg-white/20 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
            title="الملفات (Explorer)"
          >
            {showSidebar ? <X size={17} /> : <FolderOpen size={17} />}
          </button>
        </div>
      </header>

      

      {/* Workspace Panes Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Right Side Pane: Preview (Child 1 in RTL order) */}
        <section
          className={`h-full w-full md:w-[450px] shrink-0 bg-[#000] flex flex-col overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] relative ${activeView === "editor" ? "hidden md:flex" : "flex"}`}
        >
        <div className="flex-1 flex justify-center items-center p-0 md:py-6 md:px-4 bg-[#000] overflow-hidden">
          {/* iPhone Frame: Edge-to-edge on mobile, Beautiful iPhone frame on desktop */}
          <div className="relative w-full md:max-w-[390px] h-full md:max-h-[844px] bg-[#000] md:bg-[#1a1a1c] rounded-none md:rounded-[54px] p-0 md:p-[10px] md:shadow-[0_0_100px_rgba(255,255,255,0.02)]">
            {/* Screen Area */}
            <div className="relative w-full h-full bg-white rounded-none md:rounded-[44px] overflow-hidden flex flex-col">
              {/* Unified Safari + iOS Header */}
              <div className="w-full shrink-0 flex flex-col bg-[#f8f8f8] relative z-30 border-b border-[#e5e5e5]">
                {/* iOS Status Bar (Simulated on desktop, hidden on mobile for clean full space) */}
                <div className="hidden md:flex h-[50px] w-full items-center justify-between px-7 relative">
                  {/* Dynamic Island / Notch */}
                  <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[120px] h-[32px] bg-black rounded-[20px] flex items-center justify-end px-3 shadow-inner pointer-events-auto z-50">
                    <div className="w-[10px] h-[10px] rounded-full bg-[#1a1a1c] border border-white/10 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.2)] flex items-center justify-center">
                      <div className="w-[4px] h-[4px] bg-blue-900/60 rounded-full blur-[0.5px]"></div>
                    </div>
                  </div>

                  {/* Time */}
                  <span
                    className="text-[15px] font-semibold tracking-[-0.2px] text-black pt-1"
                    style={{
                      fontFamily:
                        "'-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
                    }}
                  >
                    {berlinTime || "9:41"}
                  </span>

                  {/* Icons */}
                  <div className="flex items-center gap-[6px] pt-1 text-black">
                    {/* Cellular */}
                    <svg
                      width="18"
                      height="12"
                      viewBox="0 0 18 12"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect x="0.5" y="8.5" width="2.5" height="3" rx="1" />
                      <rect x="5.5" y="6" width="2.5" height="5.5" rx="1" />
                      <rect x="10.5" y="3.5" width="2.5" height="8" rx="1" />
                      <rect x="15.5" y="1" width="2.5" height="10.5" rx="1" />
                    </svg>
                    {/* WiFi */}
                    <svg
                      width="17"
                      height="12"
                      viewBox="0 0 17 12"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M8.5 12C9.19036 12 9.75 11.4404 9.75 10.75C9.75 10.0596 9.19036 9.5 8.5 9.5C7.80964 9.5 7.25 10.0596 7.25 10.75C7.25 11.4404 7.80964 12 8.5 12ZM8.5 7.5C10.1569 7.5 11.6569 8.17157 12.7426 9.25736L13.7844 8.2155C12.4344 6.86548 10.5656 6 8.5 6C6.43443 6 4.56557 6.86548 3.21557 8.2155L4.25744 9.25736C5.34315 8.17157 6.84315 7.5 8.5 7.5ZM15.6568 6.34315C13.8284 4.51472 11.2917 3.5 8.5 3.5C5.70829 3.5 3.17157 4.51472 1.34315 6.34315L0 5C2.17157 2.82843 5.17157 1.5 8.5 1.5C11.8284 1.5 14.8284 2.82843 17 5L15.6568 6.34315Z"
                      />
                    </svg>
                    {/* Battery */}
                    <svg
                      width="25"
                      height="12"
                      viewBox="0 0 25 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="0.5"
                        y="0.5"
                        width="21"
                        height="11"
                        rx="3.5"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                      <rect
                        x="2"
                        y="2"
                        width="15"
                        height="8"
                        rx="2"
                        fill="currentColor"
                      />
                      <path
                        d="M23 4C23.5523 4 24 4.44772 24 5V7C24 7.55228 23.5523 8 23 8V4Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>

                {/* Safari URL Bar */}
                <div className="h-[44px] flex items-center justify-between px-3 pb-2">
                  <div
                    className="flex items-center gap-0.5 sm:gap-1 text-[#007aff] shrink-0"
                    dir="ltr"
                  >
                    <button
                      onClick={() => {
                        if (historyIndex > 0) setHistoryIndex(historyIndex - 1);
                      }}
                      className={`transition-opacity p-1.5 ${historyIndex > 0 ? "opacity-100 hover:opacity-70" : "opacity-30 cursor-default"}`}
                      title="الخلف"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        if (historyIndex < history.length - 1)
                          setHistoryIndex(historyIndex + 1);
                      }}
                      className={`transition-opacity p-1.5 ${historyIndex < history.length - 1 ? "opacity-100 hover:opacity-70" : "opacity-30 cursor-default"}`}
                      title="الأمام"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex-1 mx-1.5 sm:mx-2 h-[32px] bg-[#e3e3e4] rounded-lg flex items-center justify-center px-3 sm:px-4 overflow-hidden relative min-w-0">
                    <svg
                      className="absolute left-2.5 text-black/50 hidden sm:block"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 11H5C3.89 11 3 11.89 3 13V20C3 21.11 3.89 22 5 22H19C20.11 22 21 21.11 21 20V13C21 11.89 20.11 11 19 11ZM12 18C10.9 18 10 17.1 10 16C10 14.9 10.9 14 12 14C13.1 14 14 14.9 14 16C14 17.1 13.1 18 12 18ZM17 11H7V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11ZM12 4C10.34 4 9 5.34 9 7V11H15V7C15 5.34 13.66 4 12 4Z" />
                    </svg>
                    <span
                      className="text-xs sm:text-[14px] text-black font-medium truncate px-4 sm:px-6 text-center"
                      dir="ltr"
                      style={{ fontFamily: "'-apple-system', sans-serif" }}
                    >
                      {currentPreviewPath}
                    </span>
                    <button
                      onClick={() => setPreviewKey((k) => k + 1)}
                      className="absolute right-2 text-black/50 hover:text-black transition-colors p-1"
                      title="تحديث"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                    </button>
                  </div>

                  <div
                    className="flex items-center justify-end gap-2 text-[#007aff] px-1 shrink-0"
                    dir="ltr"
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const blob = new Blob([previewDoc], { type: "text/html" });
                        const url = URL.createObjectURL(blob);
                        window.open(url, "_blank");
                        setTimeout(() => URL.revokeObjectURL(url), 10000);
                      }}
                      className="hover:opacity-70 transition-opacity"
                      title="Live Server - عرض الصفحة (Open in New Tab)"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
                        if (iframe && iframe.contentWindow) {
                          iframe.contentWindow.postMessage('RUN_A11Y', '*');
                        }
                      }}
                      className="hover:opacity-70 transition-opacity"
                      title="فحص سهولة الوصول (Accessibility Check)"
                    >
                      <Accessibility size={20} />
                    </button>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* iFrame Content Container */}
              <div className="flex-1 relative bg-white flex flex-col overflow-hidden">
                <div className="flex-1 relative w-full">
                  <iframe
                    id="preview-iframe"
                    key={previewKey}
                    title="Preview"
                    className="w-full h-full border-none absolute inset-0 bg-transparent"
                    style={{ overscrollBehavior: "none" }}
                    srcDoc={previewDoc}
                    sandbox="allow-scripts allow-same-origin allow-popups allow-modals allow-forms"
                  />
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Left Side Pane: App Nav + Editor + Sidebar */}
      <div
        className={`flex-1 flex flex-col overflow-hidden border-l border-white/[0.05] ${activeView === "preview" ? "hidden md:flex" : "flex"}`}
      >
        

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden">
          {/* Child 2 (Center) - Editor Pane */}
          <section
            className="flex-1 flex flex-col bg-[#000] border-x border-white/[0.05] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] min-w-0 overflow-hidden"
            dir="ltr"
          >

            {copySuccessToast && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-[#1c1c1e] text-white text-xs px-4 py-2 rounded-full border border-white/15 shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
                <Check size={14} className="text-emerald-400" />
                <span>تم النسخ بنجاح!</span>
              </div>
            )}

            {/* File Tabs */}
            <div className="h-10 flex shrink-0 border-b border-white/[0.03] bg-black justify-between items-center group/tabs relative z-10 w-full overflow-hidden">
              <div className="flex flex-1 h-full items-center overflow-x-auto scrollbar-hide scroll-smooth">
                {fs
                  .filter((f) => f.parentId === null)
                  .map((file) => (
                    <button
                      key={file.id}
                      onClick={() => setActiveFileId(file.id)}
                      className={`h-full px-3 sm:px-5 flex items-center gap-1.5 sm:gap-2 text-[11px] font-mono whitespace-nowrap transition-all border-b shrink-0 ${activeFileId === file.id ? "text-white border-white bg-white/[0.04]" : "text-white/40 border-transparent hover:text-white/60"}`}
                      dir="ltr"
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${file.name.endsWith(".html") ? "bg-[#ff5d01]" : file.name.endsWith(".css") ? "bg-[#007acc]" : "bg-[#f0db4f]"}`}
                      ></div>
                      <span>{file.name}</span>
                    </button>
                  ))}
              </div>
              
              <div className="h-full flex items-center shrink-0 border-l border-white/[0.05]">
                {/* Auto Indent / Fix Spacing & Lines */}
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.preventDefault();
                    handleAutoFixIndentation();
                  }}
                  className="h-full px-2.5 sm:px-3 flex items-center gap-1.5 text-xs text-white/60 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.12] transition-colors shrink-0"
                  title="تعديل وترتيب المساحات والخطوط (Auto Indent / Nesting Guides)"
                >
                  <Wand2 size={13} className="text-[#007aff]" />
                  <span className="hidden sm:inline text-[11px] font-medium">ترتيب السطور والخطوط</span>
                </button>

                {/* Quick Copy */}
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.preventDefault();
                    handleEditorCopy();
                  }}
                  className="hidden sm:flex h-full px-2.5 items-center gap-1 text-xs text-white/50 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.12] transition-colors"
                  title="نسخ النص المحدد (Copy)"
                >
                  <Copy size={13} />
                  <span className="hidden xl:inline text-[11px]">نسخ</span>
                </button>

                {/* Quick Paste */}
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.preventDefault();
                    handleEditorPaste();
                  }}
                  className="hidden sm:flex h-full px-2.5 items-center gap-1 text-xs text-white/50 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.12] transition-colors"
                  title="لصق (Paste)"
                >
                  <Clipboard size={13} />
                  <span className="hidden xl:inline text-[11px]">لصق</span>
                </button>

                {/* Quick Cut */}
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.preventDefault();
                    handleEditorCut();
                  }}
                  className="hidden sm:flex h-full px-2.5 items-center gap-1 text-xs text-white/50 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.12] transition-colors"
                  title="قص النص المحدد (Cut)"
                >
                  <Scissors size={13} />
                  <span className="hidden xl:inline text-[11px]">قص</span>
                </button>
              </div>
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <Editor
                height="100%"
                language={
                  activeFile.name.endsWith(".html")
                    ? "html"
                    : activeFile.name.endsWith(".css")
                      ? "css"
                      : "javascript"
                }
                theme="apple-dark"
                value={activeFile.content || ""}
                onChange={updateFileContent}
                options={editorOptions}
                onMount={handleEditorDidMount}
                loading={
                  <div className="h-full flex items-center justify-center text-[10px] text-white/5 font-bold uppercase tracking-[0.3em] animate-pulse">
                    Initializing Environment...
                  </div>
                }
              />
            </div>
          </section>

          {/* Mobile Backdrop for Sidebar */}
          {showSidebar && (
            <div
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
              onClick={() => setShowSidebar(false)}
            />
          )}

          {/* Child 3: (Left in RTL) - Sidebar (Responsive Drawer on Mobile, Panel on Desktop) */}
          <aside
            className={`fixed md:relative top-12 md:top-0 right-0 md:right-auto bottom-0 z-50 md:z-auto transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-[#0d0d0e] md:bg-[#050505] flex flex-col shrink-0 overflow-hidden border-l border-white/[0.08] ${
              showSidebar
                ? "w-64 md:w-52 shadow-2xl md:shadow-none translate-x-0"
                : "w-0 translate-x-full md:translate-x-0 pointer-events-none md:pointer-events-auto"
            }`}
          >
            <div className="h-10 px-4 flex items-center border-b border-white/[0.03] justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen size={12} className="text-white/20" />
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                  Explorer
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleFileUpload(null)}
                  className="p-1 hover:bg-white/5 rounded text-white/20 hover:text-white/60 transition-colors"
                  title="رفع ملف"
                >
                  <Upload size={12} />
                </button>
                <button
                  onClick={() => createFile(null, "file")}
                  className="p-1 hover:bg-white/5 rounded text-white/20 hover:text-white/60 transition-colors"
                  title="ملف جديد"
                >
                  <FilePlus size={12} />
                </button>
                <button
                  onClick={() => createFile(null, "folder")}
                  className="p-1 hover:bg-white/5 rounded text-white/20 hover:text-white/60 transition-colors"
                  title="مجلد جديد"
                >
                  <FolderPlus size={12} />
                </button>
              </div>
            </div>
            <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
              {renderTree(null)}
            </div>
          </aside>
        </main>
      </div>
      </div>

      {renderDialogs()}
    </div>
  );
}
