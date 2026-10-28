import React, { useState } from 'react';
import { 
  RotateCw, 
  Terminal, 
  ExternalLink, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Trash2,
  Maximize2
} from 'lucide-react';
import { DeviceMode, ConsoleMessage, Language } from '../types';
import { translations } from '../translations';

interface PreviewPaneProps {
  bundledHtml: string;
  consoleMessages: ConsoleMessage[];
  onClearConsole: () => void;
  lang: Language;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  bundledHtml,
  consoleMessages,
  onClearConsole,
  lang,
}) => {
  const t = translations[lang];
  const [device, setDevice] = useState<DeviceMode>('responsive');
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  const openInNewTab = () => {
    const blob = new Blob([bundledHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const getDeviceWidthClass = () => {
    switch (device) {
      case 'desktop':
        return 'max-w-[1200px] border border-white/10 rounded-3xl shadow-2xl overflow-hidden';
      case 'tablet':
        return 'max-w-[768px] border border-white/10 rounded-3xl shadow-2xl overflow-hidden';
      case 'mobile':
        return 'max-w-[375px] border border-white/10 rounded-3xl shadow-2xl overflow-hidden';
      default:
        return 'w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.06] shadow-xl';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#06080e] ltr:border-l rtl:border-r border-white/[0.05] overflow-hidden font-light">
      {/* Preview Toolbar */}
      <div className="h-10 bg-[#080b12]/80 backdrop-blur-2xl border-b border-white/[0.05] px-3 flex items-center justify-between select-none shrink-0">
        {/* Left: Device Presets on Desktop, Title on Mobile */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-light text-neutral-300 sm:hidden">
            {t.preview}
          </span>
          <div className="hidden sm:flex items-center gap-1 p-0.5 bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-2xl">
            <button
              onClick={() => setDevice('responsive')}
              title={t.deviceResponsive}
              className={`p-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                device === 'responsive' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
              }`}
            >
              <Maximize2 size={14} />
            </button>
            <button
              onClick={() => setDevice('desktop')}
              title={t.deviceDesktop}
              className={`p-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                device === 'desktop' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
              }`}
            >
              <Monitor size={14} />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              title={t.deviceTablet}
              className={`p-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                device === 'tablet' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
              }`}
            >
              <Tablet size={14} />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              title={t.deviceMobile}
              className={`p-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                device === 'mobile' ? 'bg-white/10 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
              }`}
            >
              <Smartphone size={14} />
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Console Toggle */}
          <button
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs transition-all duration-200 active:scale-95 ${
              isConsoleOpen
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.08]'
            }`}
          >
            <Terminal size={13} />
            <span className="hidden sm:inline">{t.console}</span>
            {consoleMessages.length > 0 && (
              <span className="text-[10px] bg-blue-500/25 text-blue-400 px-1.5 py-0.2 rounded-full font-mono font-medium">
                {consoleMessages.length}
              </span>
            )}
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.08] active:scale-95 rounded-xl transition-all duration-200"
            title={t.refresh}
          >
            <RotateCw size={14} />
          </button>

          {/* External Window */}
          <button
            onClick={openInNewTab}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.08] active:scale-95 rounded-xl transition-all duration-200"
            title="Open in new window"
          >
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Live Preview Viewport Canvas */}
      <div className="flex-1 bg-[#06080c] p-2 sm:p-3 flex items-center justify-center overflow-auto relative w-full">
        <div className={`h-full w-full flex items-center justify-center transition-all duration-200 ${getDeviceWidthClass()}`}>
          <iframe
            key={iframeKey}
            srcDoc={bundledHtml}
            title="Studio Lab Preview"
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            className="w-full h-full border-none bg-[#090b10]"
          />
        </div>
      </div>

      {/* Integrated Console Drawer */}
      {isConsoleOpen && (
        <div className="h-44 bg-[#0a0d14]/90 backdrop-blur-xl border-t border-white/[0.08] flex flex-col shrink-0">
          <div className="h-7 px-3 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between text-xs text-neutral-400 font-mono select-none">
            <span className="flex items-center gap-1.5">
              <Terminal size={12} className="text-blue-400" />
              {t.console} ({consoleMessages.length})
            </span>
            <button
              onClick={onClearConsole}
              className="hover:text-white transition-colors flex items-center gap-1 text-[11px]"
              title={t.clear}
            >
              <Trash2 size={12} />
              <span>{t.clear}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1">
            {consoleMessages.length === 0 ? (
              <div className="text-neutral-500 italic text-[11px] py-1">{t.noLogs}</div>
            ) : (
              consoleMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`px-2.5 py-1 rounded-lg text-[11px] leading-relaxed flex items-start gap-2 ${
                    msg.type === 'error'
                      ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                      : msg.type === 'warn'
                      ? 'bg-amber-500/10 text-amber-200 border border-amber-500/20'
                      : 'text-neutral-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="text-neutral-500 select-none text-[10px]">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="break-all">{msg.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
