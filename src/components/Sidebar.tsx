import React, { useState } from 'react';
import {
  FileCode, Folder, FolderOpen, Plus, FolderPlus, Trash2, Edit3, Copy,
  ChevronRight, ChevronDown, FileText, Palette, Braces, MoreVertical, MoveRight,
} from 'lucide-react';
import { FileNode, Language } from '../types';
import { translations } from '../translations';
import { getFileType, getDescendantIds, sortNodes } from '../utils/fileHelpers';

interface SidebarProps {
  files: Record<string, FileNode>;
  activeFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onOpenFileModal: (
    type: 'new-file' | 'new-folder' | 'rename-node' | 'delete-node' | 'move-node',
    targetId?: string
  ) => void;
  onDuplicateFile: (fileId: string) => void;
  onMoveNode: (nodeId: string, targetFolderId: string | null) => void;
  lang: Language;
  className?: string;
}

interface MenuState {
  nodeId: string;
  x: number;
  y: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onOpenFileModal,
  onDuplicateFile,
  onMoveNode,
  lang,
  className,
}) => {
  const t = translations[lang];
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null); // 'root' أو معرّف مجلد

  const allNodes = (Object.values(files || {}) as FileNode[]).filter((f) => f && f.id);
  const childrenOf = (parentId: string | null) =>
    sortNodes(allNodes.filter((f) => (f.parentId ?? null) === parentId));

  const toggleFolder = (id: string) => setOpenFolders((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));

  const getIconForFile = (name: string) => {
    switch (getFileType(name)) {
      case 'html': return <FileCode size={15} className="text-orange-400 shrink-0" />;
      case 'css': return <Palette size={15} className="text-sky-400 shrink-0" />;
      case 'js': return <FileCode size={15} className="text-amber-400 shrink-0" />;
      case 'json': return <Braces size={15} className="text-emerald-400 shrink-0" />;
      default: return <FileText size={15} className="text-neutral-400 shrink-0" />;
    }
  };

  // ---- القائمة ----
  const openButtonMenu = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenu({ nodeId, x: rect.right - 176, y: rect.bottom + 4 });
  };
  const openContextMenu = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ nodeId, x: e.clientX, y: e.clientY });
  };
  const menuNode = menu ? files[menu.nodeId] : null;

  // ---- السحب والإفلات ----
  const canDropOn = (targetId: string | null): boolean => {
    if (!draggingId) return false;
    const node = files[draggingId];
    if (!node) return false;
    if ((node.parentId ?? null) === targetId) return false;
    if (targetId === draggingId) return false;
    if (targetId && node.type === 'folder' && getDescendantIds(files, draggingId).has(targetId)) return false;
    return true;
  };
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
  };
  const clearDrag = () => {
    setDraggingId(null);
    setDropTarget(null);
  };
  const handleDragOverOn = (e: React.DragEvent, targetId: string | null) => {
    e.stopPropagation();
    if (!canDropOn(targetId)) return;
    e.preventDefault();
    setDropTarget(targetId ?? 'root');
  };
  const handleDropOn = (e: React.DragEvent, targetId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingId && canDropOn(targetId)) {
      onMoveNode(draggingId, targetId);
      if (targetId) setOpenFolders((prev) => ({ ...prev, [targetId]: true }));
    }
    clearDrag();
  };

  const rowActionButton = (nodeId: string) => (
    <button
      onClick={(e) => openButtonMenu(e, nodeId)}
      className="p-1 text-neutral-400 hover:text-white hover:bg-white/[0.1] active:scale-95 rounded-lg transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
      aria-label={t.optionsMenu}
    >
      <MoreVertical size={13} />
    </button>
  );

  const renderNode = (node: FileNode, depth = 0): React.ReactNode => {
    const paddingLeft = `${depth * 14 + 10}px`;

    if (node.type === 'folder') {
      const isOpen = openFolders[node.id] ?? true;
      const children = childrenOf(node.id);
      const isDropTarget = dropTarget === node.id;

      return (
        <div key={node.id} className="select-none my-0.5">
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, node.id)}
            onDragEnd={clearDrag}
            onDragOver={(e) => handleDragOverOn(e, node.id)}
            onDrop={(e) => handleDropOn(e, node.id)}
            onContextMenu={(e) => openContextMenu(e, node.id)}
            style={{ paddingInlineStart: paddingLeft }}
            onClick={() => toggleFolder(node.id)}
            className={`group flex items-center justify-between py-1.5 pe-2 text-xs text-neutral-300 hover:text-white cursor-pointer rounded-xl transition-all duration-150 ${
              isDropTarget ? 'bg-blue-500/15 ring-1 ring-blue-500/40' : 'hover:bg-white/[0.06]'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              {isOpen ? <ChevronDown size={14} className="text-neutral-500 shrink-0" /> : <ChevronRight size={14} className="text-neutral-500 shrink-0 rtl:rotate-180" />}
              {isOpen ? <FolderOpen size={15} className="text-blue-400 shrink-0" /> : <Folder size={15} className="text-blue-400 shrink-0" />}
              <span className="truncate font-medium">{node.name}</span>
            </div>
            {rowActionButton(node.id)}
          </div>

          {isOpen && (
            <div>
              {children.length === 0 ? (
                <div style={{ paddingInlineStart: `${(depth + 1) * 14 + 16}px` }} className="py-1 text-[11px] text-neutral-500 italic">
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

    const isActive = activeFileId === node.id;
    return (
      <div
        key={node.id}
        draggable
        onDragStart={(e) => handleDragStart(e, node.id)}
        onDragEnd={clearDrag}
        onDragOver={(e) => handleDragOverOn(e, node.parentId ?? null)}
        onDrop={(e) => handleDropOn(e, node.parentId ?? null)}
        onContextMenu={(e) => openContextMenu(e, node.id)}
        style={{ paddingInlineStart: paddingLeft }}
        onClick={() => onSelectFile(node.id)}
        className={`group flex items-center justify-between py-2 sm:py-1.5 pe-2 my-0.5 text-xs cursor-pointer rounded-2xl transition-all duration-150 select-none font-light ${
          isActive
            ? 'bg-blue-500/15 text-white shadow-sm border border-blue-500/30 font-normal'
            : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04] border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {getIconForFile(node.name)}
          <span className="truncate">{node.name}</span>
        </div>
        {rowActionButton(node.id)}
      </div>
    );
  };

  const menuItemClass =
    'w-full px-3 py-2 text-start text-xs text-neutral-200 hover:text-white hover:bg-white/[0.08] rounded-xl flex items-center gap-2 transition-all';

  return (
    <aside className={`bg-[#080b12]/80 backdrop-blur-2xl ltr:border-r rtl:border-l border-white/[0.05] flex flex-col h-full min-h-0 shrink-0 select-none font-light ${className || 'w-60'}`}>
      <div className="h-10 px-3.5 border-b border-white/[0.05] flex items-center justify-between shrink-0">
        <span className="text-[11px] font-light uppercase tracking-wider text-neutral-500 font-mono">{t.explorer}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => onOpenFileModal('new-file')} className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.06] active:scale-95 rounded-xl transition-all duration-200" title={t.newFile}>
            <Plus size={14} />
          </button>
          <button onClick={() => onOpenFileModal('new-folder')} className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.08] active:scale-95 rounded-xl transition-all duration-200" title={t.newFolder}>
            <FolderPlus size={14} />
          </button>
        </div>
      </div>

      <div
        className={`flex-1 overflow-y-auto py-2 px-2 transition-colors ${dropTarget === 'root' ? 'bg-blue-500/[0.06]' : ''}`}
        onDragOver={(e) => handleDragOverOn(e, null)}
        onDrop={(e) => handleDropOn(e, null)}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropTarget(null);
        }}
      >
        {allNodes.length === 0 ? (
          <div className="p-4 text-center text-xs text-neutral-500">{t.noFilesFound}</div>
        ) : (
          childrenOf(null).map((node) => renderNode(node, 0))
        )}
      </div>

      {menu && menuNode && (
        <>
          <div className="fixed inset-0 z-[59]" onMouseDown={() => setMenu(null)} onContextMenu={(e) => { e.preventDefault(); setMenu(null); }} />
          <div
            style={{
              left: Math.max(8, Math.min(menu.x, window.innerWidth - 184)),
              top: Math.max(8, Math.min(menu.y, window.innerHeight - 190)),
            }}
            className="fixed z-[60] w-44 glass-modal rounded-2xl p-1.5 animate-in fade-in zoom-in-95 duration-100"
          >
            {menuNode.type === 'file' && (
              <button className={menuItemClass} onClick={() => { setMenu(null); onDuplicateFile(menuNode.id); }}>
                <Copy size={13} className="text-neutral-400" />
                <span>{t.duplicate}</span>
              </button>
            )}
            <button className={menuItemClass} onClick={() => { setMenu(null); onOpenFileModal('rename-node', menuNode.id); }}>
              <Edit3 size={13} className="text-neutral-400" />
              <span>{t.rename}</span>
            </button>
            <button className={menuItemClass} onClick={() => { setMenu(null); onOpenFileModal('move-node', menuNode.id); }}>
              <MoveRight size={13} className="text-neutral-400 rtl:rotate-180" />
              <span>{t.moveTo}</span>
            </button>
            <div className="border-t border-white/[0.06] my-1" />
            <button
              className="w-full px-3 py-2 text-start text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl flex items-center gap-2 transition-all"
              onClick={() => { setMenu(null); onOpenFileModal('delete-node', menuNode.id); }}
            >
              <Trash2 size={13} />
              <span>{t.delete}</span>
            </button>
          </div>
        </>
      )}
    </aside>
  );
};
