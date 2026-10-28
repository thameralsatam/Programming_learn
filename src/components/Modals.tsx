import React, { useState, useEffect } from 'react';
import { X, Keyboard, AlertTriangle } from 'lucide-react';
import { ModalState, Language } from '../types';
import { translations } from '../translations';

interface ModalsProps {
  modalState: ModalState;
  onClose: () => void;
  onConfirm: (val?: string) => void;
  lang: Language;
}

export const Modals: React.FC<ModalsProps> = ({
  modalState,
  onClose,
  onConfirm,
  lang,
}) => {
  const t = translations[lang];
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (modalState.initialValue) {
      setInputValue(modalState.initialValue);
    } else {
      setInputValue('');
    }
  }, [modalState]);

  if (!modalState.type) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(inputValue.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 font-light">
      <div className="glass-modal rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-sm font-normal text-white tracking-tight">
            {modalState.type === 'new-project' && t.createProjectTitle}
            {modalState.type === 'rename-project' && t.renameProjectTitle}
            {modalState.type === 'delete-project' && t.deleteProjectTitle}
            {modalState.type === 'new-file' && t.createFileTitle}
            {modalState.type === 'new-folder' && t.createFolderTitle}
            {modalState.type === 'rename-node' && t.renameItemTitle}
            {modalState.type === 'delete-node' && t.deleteItemTitle}
            {modalState.type === 'shortcuts' && t.shortcuts}
            {modalState.type === 'import' && t.importConfirmTitle}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-white/[0.08] active:scale-90 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        {modalState.type === 'shortcuts' ? (
          <div className="p-6 space-y-3 text-xs text-neutral-300">
            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
              <span>{t.shortcutSave}</span>
              <kbd className="px-2.5 py-1 bg-white/[0.05] border border-white/[0.1] rounded-lg text-neutral-200 font-mono text-[11px] shadow-sm">
                Ctrl + S
              </kbd>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
              <span>{t.shortcutFormat}</span>
              <kbd className="px-2.5 py-1 bg-white/[0.05] border border-white/[0.1] rounded-lg text-neutral-200 font-mono text-[11px] shadow-sm">
                Shift + Alt + F
              </kbd>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
              <span>{t.shortcutToggleSidebar}</span>
              <kbd className="px-2.5 py-1 bg-white/[0.05] border border-white/[0.1] rounded-lg text-neutral-200 font-mono text-[11px] shadow-sm">
                Ctrl + B
              </kbd>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
              <span>{t.runPreview}</span>
              <kbd className="px-2.5 py-1 bg-white/[0.05] border border-white/[0.1] rounded-lg text-neutral-200 font-mono text-[11px] shadow-sm">
                Ctrl + R
              </kbd>
            </div>
            <div className="pt-3 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] active:scale-95 text-white rounded-xl text-xs font-medium transition-all"
              >
                {t.close}
              </button>
            </div>
          </div>
        ) : modalState.type === 'delete-project' || modalState.type === 'delete-node' ? (
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3.5 text-amber-400">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed pt-1">
                {modalState.type === 'delete-project' ? t.deleteProjectConfirm : t.deleteItemConfirm}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-neutral-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] active:scale-95 rounded-xl transition-all"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => onConfirm()}
                className="px-4 py-2 text-xs text-white bg-rose-600 hover:bg-rose-500 active:scale-95 rounded-xl font-medium shadow-sm shadow-rose-600/30 transition-all"
              >
                {t.delete}
              </button>
            </div>
          </div>
        ) : modalState.type === 'import' ? (
          <div className="p-6 space-y-4">
            <p className="text-xs text-neutral-300 leading-relaxed">
              {t.importConfirmText}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-neutral-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] active:scale-95 rounded-xl transition-all"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => onConfirm()}
                className="px-4 py-2 text-xs text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl font-medium shadow-sm shadow-blue-600/30 transition-all"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 font-light">
            <div>
              <label className="block text-xs font-light text-neutral-400 mb-2">
                {modalState.type === 'new-project' || modalState.type === 'rename-project'
                  ? t.projectNamePlaceholder
                  : modalState.type === 'new-file'
                  ? t.fileNamePlaceholder
                  : t.folderNamePlaceholder}
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  modalState.type === 'new-project'
                    ? 'Hello World'
                    : modalState.type === 'new-file'
                    ? 'index.html'
                    : 'assets'
                }
                autoFocus
                className="w-full bg-white/[0.03] border border-white/[0.08] focus:border-white/20 focus:bg-white/[0.06] rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all placeholder:text-neutral-600 shadow-inner font-light"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 rounded-2xl transition-all font-light"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="px-4 py-2 text-xs text-white bg-blue-600/90 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 rounded-2xl font-light shadow-sm shadow-blue-600/25 transition-all"
              >
                {modalState.type === 'rename-project' || modalState.type === 'rename-node'
                  ? t.confirm
                  : t.create}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
