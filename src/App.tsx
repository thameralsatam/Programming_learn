import React, { useState, useEffect, useMemo, useRef } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Code2, Eye, Folder } from 'lucide-react';
import { Project, FileNode, LayoutMode, ModalState, ConsoleMessage, Language, AppView, ModalType } from './types';
import { translations, getInitialLanguage, saveLanguage } from './translations';
import { createStarterProject } from './templates/starterProject';
import { buildPreviewHtml, getDescendantIds, getNodePath, hasNameConflict, uniqueName, sortNodes } from './utils/fileHelpers';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { EditorPane } from './components/EditorPane';
import { PreviewPane } from './components/PreviewPane';
import { Modals } from './components/Modals';
import { ProjectsDashboard } from './components/ProjectsDashboard';

const STORAGE_PROJECTS_KEY = 'studio_lab_projects_v2';
const STORAGE_CURRENT_PROJECT_KEY = 'studio_lab_current_id_v2';
const STORAGE_LAYOUT_KEY = 'studio_lab_layout_v2';

function sanitizeProject(p: any, lang: Language): Project {
  const fallback = createStarterProject(lang);
  if (!p || typeof p !== 'object') return fallback;

  const id = typeof p.id === 'string' && p.id ? p.id : fallback.id;
  const name = typeof p.name === 'string' && p.name ? p.name : fallback.name;

  const files: Record<string, FileNode> = {};
  if (p.files && typeof p.files === 'object') {
    Object.entries(p.files).forEach(([k, v]: [string, any]) => {
      if (v && typeof v === 'object' && v.name) {
        const fileId = v.id || k;
        files[fileId] = {
          id: String(fileId),
          name: String(v.name),
          type: v.type === 'folder' ? 'folder' : 'file',
          content: typeof v.content === 'string' ? v.content : '',
          parentId: v.parentId || null,
          isOpen: typeof v.isOpen === 'boolean' ? v.isOpen : true,
        };
      }
    });
  }

  // Fallback to starter files if no files exist
  if (Object.keys(files).length === 0) {
    Object.assign(files, fallback.files);
  }

  const existingFileIds = Object.keys(files).filter((fid) => files[fid]?.type === 'file');
  let openFileIds: string[] = [];
  if (Array.isArray(p.openFileIds)) {
    openFileIds = p.openFileIds.filter((fid: any) => typeof fid === 'string' && files[fid]);
  }
  if (openFileIds.length === 0 && existingFileIds.length > 0) {
    openFileIds = existingFileIds.slice(0, 3);
  }

  let activeFileId: string | null = null;
  if (p.activeFileId && files[p.activeFileId]) {
    activeFileId = p.activeFileId;
  } else if (openFileIds.length > 0) {
    activeFileId = openFileIds[0];
  } else if (existingFileIds.length > 0) {
    activeFileId = existingFileIds[0];
  }

  return {
    id,
    name,
    createdAt: typeof p.createdAt === 'number' ? p.createdAt : Date.now(),
    updatedAt: typeof p.updatedAt === 'number' ? p.updatedAt : Date.now(),
    files,
    activeFileId,
    openFileIds,
  };
}

function saveProjects(list: Project[]): boolean {
  try {
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    console.error('Failed to persist projects', e);
    return false;
  }
}

export default function App() {
  const [viewMode, setViewMode] = useState<AppView>('dashboard');
  const [lang, setLang] = useState<Language>(getInitialLanguage);
  const [isSaved, setIsSaved] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [layout, setLayout] = useState<LayoutMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LAYOUT_KEY);
      if (saved && ['split-horizontal', 'split-vertical', 'editor-only', 'preview-only'].includes(saved)) {
        return saved as LayoutMode;
      }
    } catch {}
    return 'split-horizontal';
  });
  const [modalState, setModalState] = useState<ModalState>({ type: null });
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview' | 'files'>('editor');
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync HTML lang and dir attributes for RTL/LTR support
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Monitor window resize for mobile breakpoint
  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize or load projects
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROJECTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map((p) => sanitizeProject(p, getInitialLanguage()));
          if (sanitized.length > 0) {
            return sanitized;
          }
        }
      }
    } catch (e) {
      console.error('Failed to load projects from storage', e);
    }
    return [createStarterProject(getInitialLanguage())];
  });

  const [currentProjectId, setCurrentProjectId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_CURRENT_PROJECT_KEY);
      if (savedId && projects.some((p) => p.id === savedId)) {
        return savedId;
      }
    } catch {}
    return projects[0]?.id || '';
  });

  // Current active project
  const currentProject = useMemo(() => {
    return projects.find((p) => p.id === currentProjectId) ?? projects[0];
  }, [projects, currentProjectId]);

  // Save projects with debounced effect
  useEffect(() => {
    setIsSaved(false);
    const id = window.setTimeout(() => setIsSaved(saveProjects(projects)), 600);
    return () => window.clearTimeout(id);
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CURRENT_PROJECT_KEY, currentProjectId);
    } catch {}
  }, [currentProjectId]);

  // Change Layout Mode
  const handleLayoutChange = (newLayout: LayoutMode) => {
    setLayout(newLayout);
    if (newLayout === 'editor-only') setMobileTab('editor');
    if (newLayout === 'preview-only') setMobileTab('preview');
    try {
      localStorage.setItem(STORAGE_LAYOUT_KEY, newLayout);
    } catch (e) {
      console.error('Failed to save layout preference', e);
    }
  };

  // Change Language
  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    saveLanguage(newLang);
  };

  // Listen for iframe console messages
  function handleMessage(event: MessageEvent) {
    const d = event.data;
    if (!d || d.source !== 'studio-lab-preview') return;
    if (d.type === '__reset') { setConsoleMessages([]); return; }
    setConsoleMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.type === d.type && last.text === d.text && last.origin === d.origin) {
        return [...prev.slice(0, -1), { ...last, count: (last.count ?? 1) + 1, timestamp: d.timestamp || Date.now() }];
      }
      return [...prev.slice(-199), {
        id: `msg_${Date.now()}_${Math.random()}`,
        type: d.type || 'log',
        text: String(d.text ?? ''),
        stack: d.stack,
        origin: d.origin,
        timestamp: d.timestamp || Date.now(),
        count: 1,
      }];
    });
  }
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setIsSaved(saveProjects(projects));
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projects]);

  // Update Project helper
  const updateCurrentProject = (updater: (p: Project) => Project, touch = true) => {
    setProjects((prevProjects) => {
      return prevProjects.map((p) => {
        if (p.id === currentProject.id) {
          return updater(touch ? { ...p, updatedAt: Date.now() } : p);
        }
        return p;
      });
    });
  };

  // Select File
  const handleSelectFile = (fileId: string) => {
    updateCurrentProject((p) => {
      const openFileIds = p.openFileIds.includes(fileId) ? p.openFileIds : [...p.openFileIds, fileId];
      return {
        ...p,
        activeFileId: fileId,
        openFileIds,
      };
    });
    if (isMobile) {
      setMobileTab('editor');
    }
  };

  // Close Tab
  const handleCloseFile = (fileId: string) => {
    updateCurrentProject((p) => {
      const newOpenIds = p.openFileIds.filter((id) => id !== fileId);
      let newActiveId = p.activeFileId;
      if (p.activeFileId === fileId) {
        newActiveId = newOpenIds.length > 0 ? newOpenIds[newOpenIds.length - 1] : null;
      }
      return {
        ...p,
        activeFileId: newActiveId,
        openFileIds: newOpenIds,
      };
    });
  };

  // Update File Content
  const handleContentChange = (fileId: string, newContent: string) => {
    updateCurrentProject((p) => {
      const file = p.files[fileId];
      if (!file) return p;
      return {
        ...p,
        files: {
          ...p.files,
          [fileId]: {
            ...file,
            content: newContent,
          },
        },
      };
    });
  };

  // Duplicate File
  const handleDuplicateFile = (fileId: string) => {
    const orig = currentProject.files[fileId];
    if (!orig || orig.type === 'folder') return;

    const parts = orig.name.split('.');
    const ext = parts.length > 1 ? `.${parts.pop()}` : '';
    const baseName = parts.join('.');
    const newName = uniqueName(currentProject.files, orig.parentId ?? null, `${baseName}-copy${ext}`);
    const newId = `file_${Date.now()}`;

    updateCurrentProject((p) => ({
      ...p,
      files: {
        ...p.files,
        [newId]: {
          id: newId,
          name: newName,
          type: 'file',
          content: orig.content,
          parentId: orig.parentId,
        },
      },
      openFileIds: [...p.openFileIds, newId],
      activeFileId: newId,
    }));
  };

  // Project Handlers
  const handleDuplicateProject = (projectId: string) => {
    const orig = projects.find((p) => p.id === projectId);
    if (!orig) return;
    const newId = `project_${Date.now()}`;
    const copySuffix = lang === 'de' ? 'Kopie' : lang === 'ar' ? 'نسخة' : 'Copy';
    const newProj: Project = {
      ...orig,
      id: newId,
      name: `${orig.name} (${copySuffix})`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newProj, ...projects];
    setProjects(updated);
  };

  const handleExportProjectDirect = async (project: Project) => {
    try {
      const zip = new JSZip();
      const nodes = Object.values(project.files || {}) as FileNode[];
      nodes.forEach((node) => {
        if (!node) return;
        const path = getNodePath(project.files, node);
        if (node.type === 'folder') zip.folder(path);
        else zip.file(path, node.content || '');
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${project.name.replace(/\s+/g, '_')}.zip`);
    } catch (err) {
      console.error('Failed to export zip', err);
    }
  };

  const handleMoveNode = (nodeId: string, targetId: string | null) => {
    updateCurrentProject((p) => {
      const node = p.files[nodeId];
      if (!node || (node.parentId ?? null) === targetId) return p;
      if (targetId) {
        const target = p.files[targetId];
        if (!target || target.type !== 'folder') return p;
        if (targetId === nodeId || getDescendantIds(p.files, nodeId).has(targetId)) return p;
      }
      return {
        ...p,
        files: { ...p.files, [nodeId]: { ...node, parentId: targetId, name: uniqueName(p.files, targetId, node.name) } },
      };
    });
  };

  // Modal Handlers
  const handleOpenModal = (type: ModalType, targetId?: string) => {
    let initialValue = '';
    if (type === 'rename-node' && targetId) {
      initialValue = currentProject.files[targetId]?.name || '';
    } else if (type === 'rename-project') {
      const proj = targetId ? projects.find((p) => p.id === targetId) : currentProject;
      initialValue = proj ? proj.name : currentProject.name;
    }
    setModalState({ type, targetId, initialValue, files: currentProject.files });
  };

  const handleCloseModal = () => {
    setModalState({ type: null });
  };

  const validateName = (val: string): string | null => {
    const { type, targetId } = modalState;
    if (type !== 'new-file' && type !== 'new-folder' && type !== 'rename-node') return null;
    if (/[\\/]/.test(val) || val === '.' || val === '..') return t.nameInvalid;
    const parentId = type === 'rename-node' ? (currentProject.files[targetId ?? '']?.parentId ?? null) : null;
    return hasNameConflict(currentProject.files, parentId, val, type === 'rename-node' ? targetId : undefined) ? t.nameExists : null;
  };

  const handleModalConfirm = (val?: string) => {
    if (val && validateName(val)) return;
    const { type, targetId } = modalState;

    if (type === 'new-project' && val) {
      const newProj = createStarterProject(lang, val);
      const updated = [newProj, ...projects];
      setProjects(updated);
      setCurrentProjectId(newProj.id);
      setViewMode('workspace');
    } else if (type === 'rename-project' && val) {
      const targetProjId = targetId || currentProjectId;
      setProjects((prev) => {
        return prev.map((p) => (p.id === targetProjId ? { ...p, name: val, updatedAt: Date.now() } : p));
      });
    } else if (type === 'delete-project') {
      const targetProjId = targetId || currentProjectId;
      if (projects.length <= 1) {
        const fresh = createStarterProject(lang);
        setProjects([fresh]);
        setCurrentProjectId(fresh.id);
      } else {
        const remaining = projects.filter((p) => p.id !== targetProjId);
        setProjects(remaining);
        setCurrentProjectId(remaining[0].id);
      }
    } else if (type === 'new-file' && val) {
      const newId = `file_${Date.now()}`;
      updateCurrentProject((p) => ({
        ...p,
        files: {
          ...p.files,
          [newId]: {
            id: newId,
            name: val,
            type: 'file',
            content: '',
            parentId: null,
          },
        },
        openFileIds: [...p.openFileIds, newId],
        activeFileId: newId,
      }));
      if (isMobile) {
        setMobileTab('editor');
      }
    } else if (type === 'new-folder' && val) {
      const newId = `folder_${Date.now()}`;
      updateCurrentProject((p) => ({
        ...p,
        files: {
          ...p.files,
          [newId]: {
            id: newId,
            name: val,
            type: 'folder',
            parentId: null,
            isOpen: true,
          },
        },
      }));
    } else if (type === 'rename-node' && targetId && val) {
      updateCurrentProject((p) => {
        const node = p.files[targetId];
        if (!node) return p;
        return {
          ...p,
          files: {
            ...p.files,
            [targetId]: { ...node, name: val },
          },
        };
      });
    } else if (type === 'delete-node' && targetId) {
      updateCurrentProject((p) => {
        const toDelete = new Set<string>([targetId]);
        Object.values(p.files).forEach((f) => {
          if (f.parentId && toDelete.has(f.parentId)) toDelete.add(f.id);
        });
        const nextFiles = { ...p.files };
        toDelete.forEach((id) => delete nextFiles[id]);
        const nextOpen = p.openFileIds.filter((id) => !toDelete.has(id));
        const nextActive = toDelete.has(p.activeFileId ?? '') ? (nextOpen[nextOpen.length - 1] ?? null) : p.activeFileId;
        return {
          ...p,
          files: nextFiles,
          openFileIds: nextOpen,
          activeFileId: nextActive,
        };
      });
    } else if (type === 'move-node' && targetId && val) {
      handleMoveNode(targetId, val === '__root__' ? null : val);
    }

    handleCloseModal();
  };

  // Import trigger
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.name.endsWith('.zip')) {
        const zip = new JSZip();
        const loaded = await zip.loadAsync(file);
        const importedFiles: Record<string, FileNode> = {};
        const folderIds = new Map<string, string>();
        const ensureFolder = (path: string): string | null => {
          if (!path) return null;
          const existing = folderIds.get(path);
          if (existing) return existing;
          const idx = path.lastIndexOf('/');
          const parentId = ensureFolder(idx === -1 ? '' : path.slice(0, idx));
          const id = `folder_${Date.now()}_${folderIds.size}`;
          importedFiles[id] = { id, name: idx === -1 ? path : path.slice(idx + 1), type: 'folder', parentId, isOpen: true };
          folderIds.set(path, id);
          return id;
        };
        const openIds: string[] = [];
        let counter = 0;
        for (const [relativePath, zipEntry] of Object.entries(loaded.files)) {
          if (zipEntry.dir || relativePath.startsWith('__MACOSX/') || !/\.(html?|css|m?js|json|md|txt|svg)$/i.test(relativePath)) continue;
          const idx = relativePath.lastIndexOf('/');
          const parentId = ensureFolder(idx === -1 ? '' : relativePath.slice(0, idx));
          const content = await zipEntry.async('string');
          const fileId = `imported_${Date.now()}_${counter++}`;
          importedFiles[fileId] = { id: fileId, name: relativePath.slice(idx + 1), type: 'file', content, parentId };
          openIds.push(fileId);
        }

        if (Object.keys(importedFiles).length > 0) {
          const newProj: Project = {
            id: `project_${Date.now()}`,
            name: file.name.replace(/\.zip$/i, ''),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            files: importedFiles,
            activeFileId: openIds[0] || null,
            openFileIds: openIds.slice(0, 3),
          };
          const updated = [newProj, ...projects];
          setProjects(updated);
          setCurrentProjectId(newProj.id);
        }
      }
    } catch (err) {
      console.error('Import failed', err);
    }

    if (e.target) {
      e.target.value = '';
    }
  };

  // Destinations for move modal
  const moveTargets = useMemo(() => {
    if (modalState.type !== 'move-node' || !modalState.targetId) return [];
    const files = currentProject.files;
    const node = files[modalState.targetId];
    if (!node) return [];
    const blocked = node.type === 'folder' ? new Set<string>([node.id, ...getDescendantIds(files, node.id)]) : new Set<string>();
    const result: { id: string | null; name: string; depth: number; current: boolean }[] = [
      { id: null, name: t.rootFolder, depth: 0, current: (node.parentId ?? null) === null },
    ];
    const walk = (parentId: string | null, depth: number) => {
      sortNodes(Object.values(files).filter((f) => f.type === 'folder' && (f.parentId ?? null) === parentId && !blocked.has(f.id)))
        .forEach((f) => {
          result.push({ id: f.id, name: f.name, depth, current: node.parentId === f.id });
          walk(f.id, depth + 1);
        });
    };
    walk(null, 1);
    return result;
  }, [modalState, currentProject.files, t]);

  // Bundled HTML for preview
  const bundledHtml = useMemo(() => {
    return buildPreviewHtml(currentProject.files);
  }, [currentProject.files]);

  const [previewHtml, setPreviewHtml] = useState(bundledHtml);
  useEffect(() => {
    const id = window.setTimeout(() => setPreviewHtml(bundledHtml), 400);
    return () => window.clearTimeout(id);
  }, [bundledHtml]);

  const t = translations[lang];

  // Memoized editor and preview panes
  const editorPane = (
    <EditorPane
      files={currentProject.files}
      activeFileId={currentProject.activeFileId}
      openFileIds={currentProject.openFileIds}
      onSelectFile={handleSelectFile}
      onCloseFile={handleCloseFile}
      onContentChange={handleContentChange}
      lang={lang}
    />
  );

  const previewPane = (
    <PreviewPane
      bundledHtml={previewHtml}
      consoleMessages={consoleMessages}
      onClearConsole={() => setConsoleMessages([])}
      lang={lang}
    />
  );

  if (viewMode === 'dashboard') {
    return (
      <div className="flex flex-col h-full w-full min-h-0 overflow-hidden bg-[#06080e] text-neutral-300 font-light">
        <ProjectsDashboard
          projects={projects}
          currentProjectId={currentProjectId}
          onSelectProject={(id) => {
            setCurrentProjectId(id);
            setViewMode('workspace');
          }}
          onOpenModal={handleOpenModal}
          onDuplicateProject={handleDuplicateProject}
          onExportProject={handleExportProjectDirect}
          lang={lang}
          onLangChange={handleLangChange}
        />
        <Modals
          modalState={modalState}
          onClose={handleCloseModal}
          onConfirm={handleModalConfirm}
          lang={lang}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden bg-[#06080e] text-neutral-300 font-light">
      {/* Hidden file input for imports */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        className="hidden"
        onChange={handleFileImport}
      />

      {/* Streamlined Minimal Header */}
      <Header
        currentProject={currentProject}
        allProjects={projects}
        layout={layout}
        onLayoutChange={handleLayoutChange}
        lang={lang}
        onLangChange={handleLangChange}
        onSelectProject={(id) => setCurrentProjectId(id)}
        onOpenModal={handleOpenModal}
        onExportZip={() => handleExportProjectDirect(currentProject)}
        onImportClick={handleImportClick}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSaved={isSaved}
        onNavigateToDashboard={() => setViewMode('dashboard')}
      />

      {/* Main Workspace Canvas */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Mobile Viewports (< md) */}
        <div className="flex md:hidden flex-1 flex-col h-full overflow-hidden min-h-0">
          {mobileTab === 'editor' && (
            <div className="flex-1 h-full overflow-hidden animate-in fade-in duration-150">
              {editorPane}
            </div>
          )}

          {mobileTab === 'preview' && (
            <div className="flex-1 h-full overflow-hidden animate-in fade-in duration-150">
              {previewPane}
            </div>
          )}

          {mobileTab === 'files' && (
            <div className="flex-1 h-full overflow-hidden animate-in fade-in duration-150">
              <Sidebar
                files={currentProject.files}
                activeFileId={currentProject.activeFileId}
                onSelectFile={handleSelectFile}
                onOpenFileModal={handleOpenModal}
                onDuplicateFile={handleDuplicateFile}
                onMoveNode={handleMoveNode}
                lang={lang}
                className="w-full"
              />
            </div>
          )}

          {/* Ultra-Smooth Clean Glass Mobile Bottom Navigation Bar */}
          <nav className="h-14 bg-[#080b12]/90 backdrop-blur-2xl border-t border-white/[0.05] flex items-center justify-around px-4 select-none shrink-0 z-20 font-light">
            <button
              onClick={() => setMobileTab('editor')}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 gap-1 text-xs transition-all duration-200 active:scale-95 rounded-2xl mx-1 ${
                mobileTab === 'editor'
                  ? 'text-white bg-white/[0.08] border border-white/[0.08] shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Code2 size={16} strokeWidth={1.5} />
              <span className="text-[11px] font-light">{t.mobileCode}</span>
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 gap-1 text-xs transition-all duration-300 active:scale-95 rounded-2xl mx-1 ${
                mobileTab === 'preview'
                  ? 'text-white bg-white/[0.08] border border-white/[0.08] shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Eye size={16} strokeWidth={1.5} />
              <span className="text-[11px] font-light">{t.mobilePreview}</span>
            </button>
            <button
              onClick={() => setMobileTab('files')}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 gap-1 text-xs transition-all duration-300 active:scale-95 rounded-2xl mx-1 ${
                mobileTab === 'files'
                  ? 'text-white bg-white/[0.08] border border-white/[0.08] shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Folder size={16} strokeWidth={1.5} />
              <span className="text-[11px] font-light">{t.mobileFiles}</span>
            </button>
          </nav>
        </div>

        {/* Desktop Viewports (>= md) */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          {/* Collapsible Sidebar Explorer */}
          {isSidebarOpen && (
            <Sidebar
              files={currentProject.files}
              activeFileId={currentProject.activeFileId}
              onSelectFile={handleSelectFile}
              onOpenFileModal={handleOpenModal}
              onDuplicateFile={handleDuplicateFile}
              onMoveNode={handleMoveNode}
              lang={lang}
              className="w-60"
            />
          )}

          {/* Dynamic Desktop Layout Workspaces */}
          <div className="flex-1 flex overflow-hidden">
            {layout === 'split-horizontal' && (
              <div className="flex-1 flex flex-row overflow-hidden animate-in fade-in duration-200">
                <div className="flex-1 h-full overflow-hidden">
                  {editorPane}
                </div>
                <div className="flex-1 h-full overflow-hidden">
                  {previewPane}
                </div>
              </div>
            )}

            {layout === 'split-vertical' && (
              <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-200">
                <div className="flex-1 h-1/2 overflow-hidden">
                  {editorPane}
                </div>
                <div className="flex-1 h-1/2 overflow-hidden border-t border-white/[0.06]">
                  {previewPane}
                </div>
              </div>
            )}

            {layout === 'editor-only' && (
              <div className="flex-1 h-full overflow-hidden animate-in fade-in duration-200">
                {editorPane}
              </div>
            )}

            {layout === 'preview-only' && (
              <div className="flex-1 h-full overflow-hidden animate-in fade-in duration-200">
                {previewPane}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unified Modals */}
      <Modals
        modalState={modalState}
        onClose={handleCloseModal}
        onConfirm={handleModalConfirm}
        lang={lang}
        validate={validateName}
        moveTargets={moveTargets}
        deleteIsFolder={currentProject.files[modalState.targetId ?? '']?.type === 'folder'}
      />
    </div>
  );
}
