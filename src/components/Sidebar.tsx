import React, { useState } from 'react';
import { 
  FileCode, 
  Folder, 
  FolderOpen, 
  Plus, 
  FolderPlus, 
  Trash2, 
  Edit3, 
  Copy, 
  ChevronRight, 
  ChevronDown,
  FileText,
  FileSpreadsheet,
  PanelLeftClose
} from 'lucide-react';
import { FileNode, Language } from '../types';
import { translations } from '../translations';
import { getFileType } from '../utils/fileHelpers';

interface SidebarProps {
  files: Record<string, FileNode>;
  activeFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onOpenFileModal: (type: 'new-file' | 'new-folder' | 'rename-node' | 'delete-node', targetId?: string) => void;
  onDuplicateFile: (fileId: string) => void;
  lang: Language;
  className?: string;
  onToggleSidebar?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onOpenFileModal,
  onDuplicateFile,
  lang,
  className,
  onToggleSidebar,
}) => {
  const t = translations[lang];
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (folderId: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const getIconForFile = (name: string) => {
    const type = getFileType(name);
    switch (type) {
      case 'html':
        return <FileCode size={15} className="text-orange-400 shrink-0" />;
      case 'css':
        return <FileSpreadsheet size={15} className="text-sky-400 shrink-0" />;
      case 'js':
        return <FileCode size={15} className="text-amber-400 shrink-0" />;
      case 'json':
        return <FileText size={15} className="text-emerald-400 shrink-0" />;
      default:
        return <FileText size={15} className="text-neutral-400 shrink-0" />;
    }
  };

  const allNodes = (Object.values(files || {}) as FileNode[]).filter((f) => f && f.id);
  const rootNodes = allNodes.filter((f) => !f.parentId);

  const renderNode = (node: FileNode, depth = 0) => {
    const isFolder = node.type === 'folder';
    const isOpen = openFolders[node.id] ?? true;
    const isActive = activeFileId === node.id;
    const paddingLeft = `${depth * 14 + 10}px`;

    if (isFolder) {
      const children = allNodes.filter((f) => f.parentId === node.id);

      return (
        <div key={node.id} className="select-none my-0.5">
          <div
            style={{ paddingLeft }}
            onClick={() => toggleFolder(node.id)}
            className="group flex items-center justify-between py-1.5 pr-2 text-xs text-neutral-300 hover:text-white hover:bg-white/[0.06] active:scale-[0.99] cursor-pointer rounded-xl transition-all duration-150"
          >
            <div className="flex items-center gap-1.5 truncate">
              {isOpen ? (
                <ChevronDown size={14} className="text-neutral-500 shrink-0" />
              ) : (
                <ChevronRight size={14} className="text-neutral-500 shrink-0" />
              )}
              {isOpen ? (
                <FolderOpen size={15} className="text-blue-400 shrink-0" />
              ) : (
                <Folder size={15} className="text-blue-400 shrink-0" />
              )}
              <span className="truncate font-medium">{node.name}</span>
            </div>

            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenFileModal('rename-node', node.id);
                }}
                className="p-1 text-neutral-400 hover:text-white hover:bg-white/[0.1] active:scale-95 rounded-lg transition-all"
                title={t.rename}
              >
                <Edit3 size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenFileModal('delete-node', node.id);
                }}
                className="p-1 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 rounded-lg transition-all"
                title={t.delete}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {isOpen && (
            <div>
              {children.length === 0 ? (
                <div
                  style={{ paddingLeft: `${(depth + 1) * 14 + 16}px` }}
                  className="py-1 text-[11px] text-neutral-500 italic"
                >
                  {t.emptyFolder}
                </div>
              ) : (
                children.map((child) => renderNode(child, depth + 1))
              )}
            </div>
          )}
        </div>
      );
    }

    // Render regular file
    return (
      <div
        key={node.id}
        style={{ paddingLeft }}
        onClick={() => onSelectFile(node.id)}
        className={`group flex items-center justify-between py-2 sm:py-1.5 pr-2 my-0.5 text-xs cursor-pointer rounded-2xl transition-all duration-150 select-none font-light active:scale-[0.99] ${
          isActive
            ? 'bg-blue-500/15 text-white shadow-sm border border-blue-500/30 font-normal'
            : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {getIconForFile(node.name)}
          <span className="truncate">{node.name}</span>
        </div>

        <div className="opacity-100 sm:opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicateFile(node.id);
            }}
            className="p-1 text-neutral-400 hover:text-white hover:bg-white/[0.1] active:scale-95 rounded-lg transition-all"
            title={t.duplicate}
          >
            <Copy size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenFileModal('rename-node', node.id);
            }}
            className="p-1 text-neutral-400 hover:text-white hover:bg-white/[0.1] active:scale-95 rounded-lg transition-all"
            title={t.rename}
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenFileModal('delete-node', node.id);
            }}
            className="p-1 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 rounded-lg transition-all"
            title={t.delete}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <aside className={`bg-[#080b12]/80 backdrop-blur-2xl ltr:border-r rtl:border-l border-white/[0.05] flex flex-col h-full shrink-0 select-none font-light ${className || 'w-60'}`}>
      {/* Sidebar Header */}
      <div className="h-10 px-3.5 border-b border-white/[0.05] flex items-center justify-between shrink-0">
        <span className="text-[11px] font-light uppercase tracking-wider text-neutral-500 font-mono">
          {t.explorer}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpenFileModal('new-file')}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.06] active:scale-95 rounded-xl transition-all duration-200"
            title={t.newFile}
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => onOpenFileModal('new-folder')}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.08] active:scale-95 rounded-xl transition-all duration-200"
            title={t.newFolder}
          >
            <FolderPlus size={14} />
          </button>
        </div>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {rootNodes.length === 0 ? (
          <div className="p-4 text-center text-xs text-neutral-500">
            {t.noFilesFound}
          </div>
        ) : (
          rootNodes.map((node) => renderNode(node, 0))
        )}
      </div>
    </aside>
  );
};
