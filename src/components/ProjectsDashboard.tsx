import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  X,
  MoreVertical, 
  Code2, 
  Trash2, 
  Copy, 
  Download, 
  Edit3,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Project, Language, FileNode } from '../types';
import { translations } from '../translations';
import { LanguageSwitcher } from './LanguageSwitcher';

interface ProjectsDashboardProps {
  projects: Project[];
  currentProjectId: string;
  onSelectProject: (id: string) => void;
  onOpenModal: (type: 'new-project' | 'rename-project' | 'delete-project', targetId?: string) => void;
  onDuplicateProject: (projectId: string) => void;
  onExportProject: (project: Project) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
}

export const ProjectsDashboard: React.FC<ProjectsDashboardProps> = ({
  projects,
  currentProjectId,
  onSelectProject,
  onOpenModal,
  onDuplicateProject,
  onExportProject,
  lang,
  onLangChange,
}) => {
  const t = translations[lang] || translations.de;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('.card-menu-container')) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter((p) => p.name.toLowerCase().includes(q));
  }, [projects, searchQuery]);

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      const locale = lang === 'ar' ? 'ar-SA' : lang === 'de' ? 'de-DE' : 'en-US';
      return date.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const getFilesStats = (project: Project) => {
    const files = (Object.values(project.files || {}) as FileNode[]).filter((f) => f && f.type === 'file');
    return files.length;
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full min-h-0 overflow-hidden bg-[#06080e] text-neutral-300 font-light select-none">
      {/* Sleek Minimal Dashboard Header */}
      <header className="h-14 bg-[#0a0d14]/70 backdrop-blur-2xl border-b border-white/[0.05] px-4 sm:px-8 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500/80 shadow-sm shadow-blue-500/40"></div>
          <span className="text-sm font-normal tracking-tight text-white">
            {t.brandName}
          </span>
          <span className="text-white/15 font-light">/</span>
          <span className="text-xs text-neutral-400 font-light tracking-wide">
            {t.dashboardTitle}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher lang={lang} onLangChange={onLangChange} />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 sm:py-12 max-w-6xl mx-auto w-full pb-40">
        {/* Title & Search Filter */}
        <div className="flex flex-col gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white mb-1.5 font-heading">
              {t.dashboardTitle}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
              {t.dashboardSubtitle}
            </p>
          </div>

          {/* Full-Width Search Bar Below Title */}
          <div className="relative w-full transition-all duration-300">
            <Search size={15} className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchProjects}
              className="w-full bg-white/[0.03] border border-white/[0.08] hover:border-white/20 focus:border-blue-500/40 focus:bg-white/[0.05] rounded-2xl ltr:pl-10 ltr:pr-10 rtl:pr-10 rtl:pl-10 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none transition-all font-light shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute ltr:right-3.5 rtl:left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all active:scale-90"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Quick Create Card */}
          <button
            onClick={() => onOpenModal('new-project')}
            className="group h-44 rounded-3xl border border-dashed border-white/[0.08] hover:border-blue-500/40 bg-white/[0.015] hover:bg-blue-500/[0.02] p-5 flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-[0.99]"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/[0.03] group-hover:bg-blue-500/10 border border-white/[0.06] group-hover:border-blue-500/20 flex items-center justify-center mb-2.5 text-neutral-400 group-hover:text-blue-400 transition-all">
              <Plus size={18} />
            </div>
            <span className="text-xs font-light text-neutral-300 group-hover:text-white transition-colors">
              {t.newProject}
            </span>
          </button>

          {/* Project Cards */}
          {[...filteredProjects].sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)).map((project) => {
            const fileCount = getFilesStats(project);
            const isCurrent = project.id === currentProjectId;
            const isMenuOpen = activeMenuId === project.id;

            return (
              <div
                key={project.id}
                onClick={() => (isMenuOpen ? setActiveMenuId(null) : onSelectProject(project.id))}
                className={`group relative h-44 rounded-3xl p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 active:scale-[0.98] hover:scale-[1.015] ${
                  isMenuOpen ? 'z-30' : ''
                } ${
                  isCurrent
                    ? 'bg-white/[0.045] border border-blue-500/30 shadow-lg shadow-blue-950/20'
                    : 'bg-white/[0.02] hover:bg-white/[0.045] border border-white/[0.06] hover:border-white/20 shadow-sm hover:shadow-xl'
                }`}
              >
                {/* Card Top: Title & Options Menu */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <FolderOpen size={15} className={isCurrent ? 'text-blue-400' : 'text-neutral-400'} />
                      <h3 className="text-sm font-light text-white truncate tracking-tight">
                        {project.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-light">
                      <span className="flex items-center gap-1">
                        <Layers size={11} />
                        {fileCount} {t.filesCount}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {formatDate(project.updatedAt || project.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Options Menu Trigger */}
                  <div className="relative card-menu-container" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setActiveMenuId(isMenuOpen ? null : project.id)}
                      className="p-1.5 text-neutral-500 hover:text-white hover:bg-white/[0.08] active:scale-95 rounded-xl transition-all"
                      title={t.optionsMenu}
                    >
                      <MoreVertical size={15} />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-48 glass-modal rounded-2xl shadow-2xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150 font-light">
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onSelectProject(project.id);
                          }}
                          className="w-full px-3 py-2 text-start text-xs text-neutral-200 hover:text-white hover:bg-white/[0.08] rounded-xl flex items-center gap-2 mx-1 max-w-[calc(100%-8px)] transition-all font-light"
                        >
                          <Code2 size={13} className="text-blue-400" />
                          <span>{t.openProject}</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onDuplicateProject(project.id);
                          }}
                          className="w-full px-3 py-2 text-start text-xs text-neutral-200 hover:text-white hover:bg-white/[0.08] rounded-xl flex items-center gap-2 mx-1 max-w-[calc(100%-8px)] transition-all font-light"
                        >
                          <Copy size={13} className="text-neutral-400" />
                          <span>{t.duplicate}</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onExportProject(project);
                          }}
                          className="w-full px-3 py-2 text-start text-xs text-neutral-200 hover:text-white hover:bg-white/[0.08] rounded-xl flex items-center gap-2 mx-1 max-w-[calc(100%-8px)] transition-all font-light"
                        >
                          <Download size={13} className="text-neutral-400" />
                          <span>{t.exportProject}</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onOpenModal('rename-project', project.id);
                          }}
                          className="w-full px-3 py-2 text-start text-xs text-neutral-200 hover:text-white hover:bg-white/[0.08] rounded-xl flex items-center gap-2 mx-1 max-w-[calc(100%-8px)] transition-all font-light"
                        >
                          <Edit3 size={13} className="text-neutral-400" />
                          <span>{t.rename}</span>
                        </button>
                        <div className="border-t border-white/[0.06] my-1"></div>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            onOpenModal('delete-project', project.id);
                          }}
                          className="w-full px-3 py-2 text-start text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl flex items-center gap-2 mx-1 max-w-[calc(100%-8px)] transition-all font-light"
                        >
                          <Trash2 size={13} />
                          <span>{t.delete}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Open Link */}
                <div className="flex items-center justify-between text-xs font-light pt-3 border-t border-white/[0.04]">
                  <span className="text-neutral-500 text-[11px]">
                    {isCurrent ? t.workspace : ''}
                  </span>
                  <div className="flex items-center gap-1 text-neutral-400 group-hover:text-blue-400 transition-colors">
                    <span>{t.openProject}</span>
                    <ArrowRight size={13} className="rtl:rotate-180 group-hover:ltr:translate-x-0.5 group-hover:rtl:-translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
