export type Language = 'de' | 'en' | 'ar';
export type AppView = 'dashboard' | 'workspace';

export type FileType = 'html' | 'css' | 'js' | 'json' | 'text' | 'image';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  parentId: string | null;
  isOpen?: boolean;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  files: Record<string, FileNode>;
  activeFileId: string | null;
  openFileIds: string[];
}

export type LayoutMode = 'split-horizontal' | 'split-vertical' | 'editor-only' | 'preview-only';

export type DeviceMode = 'responsive' | 'desktop' | 'tablet' | 'mobile';

export interface ConsoleMessage {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error' | 'debug';
  text: string;
  timestamp: number;
  stack?: string;
  origin?: string;
  count?: number;
}

export type ModalType = 
  | 'new-project'
  | 'rename-project'
  | 'delete-project'
  | 'new-file'
  | 'new-folder'
  | 'rename-node'
  | 'delete-node'
  | 'move-node'
  | 'shortcuts'
  | null;

export interface ModalState {
  type: ModalType;
  targetId?: string;
  initialValue?: string;
  files?: Record<string, FileNode>;
}
