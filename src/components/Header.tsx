import React, { useState, useRef, useEffect } from 'react';
import { 
  Columns2, 
  Rows2, 
  Code2, 
  Eye, 
  Download, 
  Upload, 
  Keyboard, 
  FolderOpen, 
  ChevronDown, 
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,
  Edit3,
  SlidersHorizontal,
  ArrowLeft
} from 'lucide-react';
import { Project, LayoutMode, Language } from '../types';
import { translations } from '../translations';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  currentProject: Project;
  allProjects: Project[];
  layout: LayoutMode;
  onLayoutChange: (layout: LayoutMode) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  onSelectProject: (projectId: string) => void;
  onOpenModal: (type: 'new-project' | 'rename-project' | 'delete-project' | 'shortcuts') => void;
  onExportZip: () => void;
  onImportClick: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isSaved: boolean;
  onNavigateToDashboard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  allProjects,
  layout,
  onLayoutChange,
  lang,
  onLangChange,
  onSelectProject,
  onOpenModal,
  onExportZip,
  onImportClick,
  isSidebarOpen,
  onToggleSidebar,
  isSaved,
  onNavigateToDashboard,
}) => {
  const t = translations[lang] || translations.de;
  const [isProjectsDropdownOpen, setIsProjectsDropdownOpen] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProjectsDropdownOpen(false);
      }
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
        setIsOptionsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-[#080b12]/85 backdrop-blur-2xl border-b border-white/[0.05] px-3 sm:px-5 flex items-center justify-between select-none shrink-0 z-30 font-light transition-colors">
      {/* Left: Sidebar Toggle, Navigation back to Projects Dashboard & Project Selector */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Sidebar Fold/Unfold Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="hidden md:flex p-1.5 text-neutral-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] active:scale-95 rounded-xl transition-all duration-200 shrink-0"
          title={`${isSidebarOpen ? t.collapseSidebar : t.expandSidebar} (Ctrl+B)`}
        >
          {isSidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
        </button>

        {/* Back to Projects Dashboard */}
        <button
          onClick={onNavigateToDashboard}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-white hover:bg-white/[0.05] active:scale-95 rounded-xl transition-all duration-200"
          title={t.dashboardTitle}
        >
          <ArrowLeft size={13} className="text-neutral-500 rtl:rotate-180 transition-transform" />
          <span className="hidden sm:inline font-light">{t.backToDashboard}</span>
        </button>

        <span className="text-white/10 font-extralight hidden sm:inline">/</span>

        {/* Project Selector Dropdown */}
        <div className="relative min-w-0" ref={dropdownRef}>
          <button
            onClick={() => setIsProjectsDropdownOpen(!isProjectsDropdownOpen)}
            className="flex items-center gap-1.5 text-xs font-light text-neutral-200 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] active:scale-[0.98] border border-white/[0.06] hover:border-white/15 px-3 py-1.5 rounded-xl transition-all duration-200 max-w-[140px] sm:max-w-[210px]"
          >
            <FolderOpen size={13} className="text-blue-400/90 shrink-0" />
            <span className="truncate">{currentProject.name}</span>
            <ChevronDown size={12} className="text-neutral-500 shrink-0" />
          </button>

          {isProjectsDropdownOpen && (
            <div className="absolute ltr:left-0 rtl:right-0 mt-2 w-64 glass-modal rounded-3xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-1.5 text-[11px] font-light text-neutral-400 border-b border-white/[0.05] flex items-center justify-between">
                <span>{t.projects}</span>
              </div>

              <div className="max-h-60 overflow-y-auto py-1">
                {allProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProject(p.id);
                      setIsProjectsDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-start text-xs flex items-center justify-between rounded-2xl mx-1 max-w-[calc(100%-8px)] hover:bg-white/[0.06] transition-all font-light text-neutral-300"
                  >
                    <span className="truncate">{p.name}</span>
                    {p.id === currentProject.id && <Check size={13} className="text-blue-400 shrink-0 ltr:ml-2 rtl:mr-2" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Saved Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-neutral-500 font-light pl-1">
          <span className={`w-1.5 h-1.5 rounded-full ${isSaved ? 'bg-emerald-500/80' : 'bg-amber-500/80'}`}></span>
          <span>{isSaved ? t.saved : t.unsaved}</span>
        </div>
      </div>

      {/* Right: Language Switcher & Options Menu Button */}
      <div className="flex items-center gap-2 shrink-0">
        <LanguageSwitcher lang={lang} onLangChange={onLangChange} />

        {/* Unified Options Menu Button */}
        <div className="relative" ref={optionsRef}>
          <button
            onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-light rounded-xl border transition-all duration-200 active:scale-95 ${
              isOptionsMenuOpen
                ? 'bg-white/10 text-white border-white/20 shadow-sm'
                : 'bg-white/[0.03] hover:bg-white/[0.06] text-neutral-300 hover:text-white border-white/[0.06]'
            }`}
            title={t.optionsMenu}
          >
            <SlidersHorizontal size={13} className="text-blue-400/90" />
            <span className="hidden sm:inline">{t.optionsMenu}</span>
          </button>

          {isOptionsMenuOpen && (
            <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-64 glass-modal rounded-3xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 font-light">
              {/* Layout Switcher Section (Desktop / Tablet) */}
              <div className="hidden md:block px-2 pt-1 pb-2">
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-1.5 px-1 font-mono">
                  {t.layoutOptions}
                </span>
                <div className="grid grid-cols-4 gap-1 p-1 bg-white/[0.03] rounded-2xl border border-white/[0.05]">
                  <button
                    onClick={() => {
                      onLayoutChange('split-horizontal');
                    }}
                    title={t.layoutSplitH}
                    className={`py-1.5 flex justify-center items-center rounded-xl transition-all ${
                      layout === 'split-horizontal'
                        ? 'bg-blue-600/25 text-blue-400 border border-blue-500/30 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-200'
                    }`}
                  >
                    <Columns2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      onLayoutChange('split-vertical');
                    }}
                    title={t.layoutSplitV}
                    className={`py-1.5 flex justify-center items-center rounded-xl transition-all ${
                      layout === 'split-vertical'
                        ? 'bg-blue-600/25 text-blue-400 border border-blue-500/30 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-200'
                    }`}
                  >
                    <Rows2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      onLayoutChange('editor-only');
                    }}
                    title={t.layoutEditorOnly}
                    className={`py-1.5 flex justify-center items-center rounded-xl transition-all ${
                      layout === 'editor-only'
                        ? 'bg-blue-600/25 text-blue-400 border border-blue-500/30 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-200'
                    }`}
                  >
                    <Code2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      onLayoutChange('preview-only');
                    }}
                    title={t.layoutPreviewOnly}
                    className={`py-1.5 flex justify-center items-center rounded-xl transition-all ${
                      layout === 'preview-only'
                        ? 'bg-blue-600/25 text-blue-400 border border-blue-500/30 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-200'
                    }`}
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>

              <div className="border-t border-white/[0.05] my-1"></div>

              {/* Actions Section */}
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setIsOptionsMenuOpen(false);
                    onOpenModal('rename-project');
                  }}
                  className="w-full px-3 py-2 text-start text-xs text-neutral-200 hover:text-white hover:bg-white/[0.06] rounded-2xl flex items-center gap-2.5 transition-all"
                >
                  <Edit3 size={14} className="text-neutral-400" />
                  <span>{t.renameProjectTitle}</span>
                </button>
                <button
                  onClick={() => {
                    setIsOptionsMenuOpen(false);
                    onExportZip();
                  }}
                  className="w-full px-3 py-2 text-start text-xs text-neutral-200 hover:text-white hover:bg-white/[0.06] rounded-2xl flex items-center gap-2.5 transition-all"
                >
                  <Download size={14} className="text-neutral-400" />
                  <span>{t.exportProject}</span>
                </button>
                <button
                  onClick={() => {
                    setIsOptionsMenuOpen(false);
                    onImportClick();
                  }}
                  className="w-full px-3 py-2 text-start text-xs text-neutral-200 hover:text-white hover:bg-white/[0.06] rounded-2xl flex items-center gap-2.5 transition-all"
                >
                  <Upload size={14} className="text-neutral-400" />
                  <span>{t.importProject}</span>
                </button>
                <button
                  onClick={() => {
                    setIsOptionsMenuOpen(false);
                    onOpenModal('shortcuts');
                  }}
                  className="w-full px-3 py-2 text-start text-xs text-neutral-200 hover:text-white hover:bg-white/[0.06] rounded-2xl flex items-center gap-2.5 transition-all"
                >
                  <Keyboard size={14} className="text-neutral-400" />
                  <span>{t.shortcuts}</span>
                </button>

                <div className="border-t border-white/[0.05] my-1"></div>

                <button
                  onClick={() => {
                    setIsOptionsMenuOpen(false);
                    onOpenModal('delete-project');
                  }}
                  className="w-full px-3 py-2 text-start text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-2xl flex items-center gap-2.5 transition-all"
                >
                  <Trash2 size={14} />
                  <span>{t.deleteProjectTitle}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
