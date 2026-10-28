import React, { useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { X, Code, AlignLeft } from 'lucide-react';
import { FileNode, Language } from '../types';
import { translations } from '../translations';
import { getMonacoLanguage } from '../utils/fileHelpers';

interface EditorPaneProps {
  files: Record<string, FileNode>;
  activeFileId: string | null;
  openFileIds: string[];
  onSelectFile: (fileId: string) => void;
  onCloseFile: (fileId: string) => void;
  onContentChange: (fileId: string, newContent: string) => void;
  lang: Language;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  files,
  activeFileId,
  openFileIds,
  onSelectFile,
  onCloseFile,
  onContentChange,
  lang,
}) => {
  const t = translations[lang] || translations.de;
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const safeFiles = files || {};
  const safeOpenFileIds = Array.isArray(openFileIds) ? openFileIds : [];
  const activeFile = activeFileId ? safeFiles[activeFileId] : null;

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({
        line: e.position.lineNumber,
        col: e.position.column,
      });
    });
  };

  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  if (!activeFile) {
    return (
      <div className="flex-1 bg-[#090c12] flex flex-col items-center justify-center text-center p-6 select-none h-full">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-3">
          <Code size={24} className="text-neutral-400" />
        </div>
        <h3 className="text-sm font-medium text-neutral-200 mb-1">{t.noFileOpen}</h3>
        <p className="text-xs text-neutral-500 max-w-sm">{t.selectFileHint}</p>
      </div>
    );
  }

  const monacoLang = getMonacoLanguage(activeFile.name || 'index.html');

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#06080e] overflow-hidden font-light">
      {/* File Tabs Bar */}
      <div className="h-10 bg-[#080b12]/80 backdrop-blur-2xl border-b border-white/[0.05] flex items-center justify-between px-3 overflow-x-auto select-none shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto h-full max-w-[80vw] py-1">
          {safeOpenFileIds.map((id) => {
            const f = safeFiles[id];
            if (!f) return null;
            const isActive = activeFileId === id;
            return (
              <div
                key={id}
                onClick={() => onSelectFile(id)}
                className={`h-7 px-3 rounded-2xl flex items-center gap-2 text-xs cursor-pointer shrink-0 transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? 'bg-white/[0.08] text-white border border-white/[0.12] font-normal shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <span className="truncate max-w-[100px] sm:max-w-[140px] font-light">{f.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseFile(id);
                  }}
                  className="p-0.5 text-neutral-500 hover:text-white rounded-lg hover:bg-white/[0.1] active:scale-90 transition-all"
                  aria-label="Close tab"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Action Controls in Tabs Bar */}
        <div className="flex items-center gap-1 shrink-0 ml-1">
          <button
            onClick={formatCode}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.08] active:scale-95 rounded-xl transition-all duration-200"
            title={t.formatCode}
          >
            <AlignLeft size={14} />
          </button>
        </div>
      </div>

      {/* Monaco Editor Canvas */}
      <div className="flex-1 relative overflow-hidden w-full" dir="ltr">
        <Editor
          height="100%"
          language={monacoLang}
          value={activeFile.content || ''}
          theme="vs-dark"
          onChange={(val) => onContentChange(activeFile.id, val || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace",
            lineHeight: 20,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            tabSize: 2,
            wordWrap: 'on',
            automaticLayout: true,
            renderWhitespace: 'selection',
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#0a0d14]/80 backdrop-blur-md border-t border-white/[0.06] px-3 flex items-center justify-between text-[11px] text-neutral-500 font-mono select-none shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-neutral-400">{monacoLang.toUpperCase()}</span>
          <span className="hidden sm:inline">UTF-8</span>
          <span className="hidden sm:inline">Spaces: 2</span>
        </div>
        <div className="flex items-center gap-3">
          <span>
            {t.line} {cursorPos.line}, {t.col} {cursorPos.col}
          </span>
          <span className="hidden md:inline">
            {activeFile.content?.length || 0} {t.chars}
          </span>
        </div>
      </div>
    </div>
  );
};
