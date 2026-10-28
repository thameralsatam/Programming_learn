import React, { useState, useRef } from 'react';
import { 
  RotateCw, 
  Terminal, 
  ExternalLink, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Trash2,
  Maximize2,
  Camera,
  ChevronLeft,
  ChevronRight,
  Lock,
  Globe,
  Home
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
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
  const t = translations[lang] || translations.de;
  const [device, setDevice] = useState<DeviceMode>('responsive');
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [inputUrl, setInputUrl] = useState('studiolab.app/index.html');
  const [activeExternalUrl, setActiveExternalUrl] = useState<string | null>(null);
  const [historyStack, setHistoryStack] = useState<string[]>(['studiolab.app/index.html']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  const openInNewTab = () => {
    const urlToOpen = activeExternalUrl || URL.createObjectURL(new Blob([bundledHtml], { type: 'text/html' }));
    window.open(urlToOpen, '_blank');
  };

  const handleNavigateUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputUrl.trim();
    if (!query || query.includes('studiolab.app') || query.includes('index.html')) {
      setActiveExternalUrl(null);
      setInputUrl('studiolab.app/index.html');
      return;
    }

    let targetUrl = query;
    if (!/^https?:\/\//i.test(targetUrl)) {
      if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
        targetUrl = `https://${targetUrl}`;
      } else {
        targetUrl = `https://www.bing.com/search?q=${encodeURIComponent(targetUrl)}`;
      }
    }

    setActiveExternalUrl(targetUrl);
    setInputUrl(targetUrl.replace(/^https?:\/\//i, ''));

    setHistoryStack((prev) => [...prev.slice(0, historyIndex + 1), targetUrl]);
    setHistoryIndex((prev) => prev + 1);
  };

  const handleGoBack = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevUrl = historyStack[prevIndex];
      setHistoryIndex(prevIndex);
      if (prevUrl.includes('studiolab.app')) {
        setActiveExternalUrl(null);
        setInputUrl('studiolab.app/index.html');
      } else {
        setActiveExternalUrl(prevUrl);
        setInputUrl(prevUrl.replace(/^https?:\/\//i, ''));
      }
    }
  };

  const handleGoForward = () => {
    if (historyIndex < historyStack.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextUrl = historyStack[nextIndex];
      setHistoryIndex(nextIndex);
      if (nextUrl.includes('studiolab.app')) {
        setActiveExternalUrl(null);
        setInputUrl('studiolab.app/index.html');
      } else {
        setActiveExternalUrl(nextUrl);
        setInputUrl(nextUrl.replace(/^https?:\/\//i, ''));
      }
    }
  };

  const handleResetToProject = () => {
    setActiveExternalUrl(null);
    setInputUrl('studiolab.app/index.html');
  };

  const handleCaptureScreenshot = async () => {
    if (!previewContainerRef.current) return;
    try {
      setIsCapturing(true);
      const canvas = await html2canvas(previewContainerRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#090b10',
      });
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `studio_preview_${device}_${Date.now()}.png`);
        }
        setIsCapturing(false);
      });
    } catch (err) {
      console.error('Failed to take screenshot', err);
      setIsCapturing(false);
    }
  };

  const renderContent = () => {
    const iframeElement = activeExternalUrl ? (
      <div className="relative w-full h-full">
        <iframe
          key={`ext_${iframeKey}_${activeExternalUrl}`}
          src={activeExternalUrl}
          title="External Web Browser"
          sandbox="allow-scripts allow-modals allow-forms allow-same-origin allow-popups"
          className="w-full h-full border-none bg-white"
        />
        {/* Floating Quick Action overlay */}
        <div className="absolute bottom-2 ltr:right-2 rtl:left-2 bg-[#0a0d14]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-1.5 text-[11px] text-neutral-300 flex items-center gap-2 shadow-2xl z-20 font-light select-none">
          <span className="truncate max-w-[160px] text-neutral-400 font-mono text-[10px]">{activeExternalUrl}</span>
          <button
            onClick={handleResetToProject}
            className="flex items-center gap-1 px-2 py-0.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 rounded-lg transition-all active:scale-95 text-[10px]"
            title="Return to local project code"
          >
            <Home size={10} />
            <span>Code</span>
          </button>
          <a
            href={activeExternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:text-white transition-colors"
            title="Open in new window"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    ) : (
      <iframe
        key={iframeKey}
        srcDoc={bundledHtml}
        title="Studio Lab Preview"
        sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
        className="w-full h-full border-none bg-[#090b10] transition-opacity duration-300"
      />
    );

    if (device === 'mobile') {
      return (
        <div 
          ref={previewContainerRef}
          className="w-[360px] max-w-full h-[660px] max-h-[82vh] bg-[#111522] border-2 border-white/15 rounded-[42px] shadow-2xl p-3 flex flex-col items-center relative shrink-0 transition-all duration-300 animate-in zoom-in-95"
        >
          {/* Top Notch / Dynamic Island */}
          <div className="w-20 h-4 bg-black/90 rounded-full mb-2 shrink-0 border border-white/10 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-800 border border-neutral-700"></div>
          </div>
          {/* Screen Container */}
          <div className="w-full flex-1 rounded-[28px] overflow-hidden border border-white/10 bg-[#090b10] relative shadow-inner">
            {iframeElement}
          </div>
          {/* Bottom Home Bar */}
          <div className="w-28 h-1 bg-white/20 rounded-full mt-2.5 shrink-0"></div>
        </div>
      );
    }

    if (device === 'tablet') {
      return (
        <div 
          ref={previewContainerRef}
          className="w-[640px] max-w-full h-[720px] max-h-[85vh] bg-[#111522] border-2 border-white/15 rounded-[32px] shadow-2xl p-3.5 flex flex-col items-center relative shrink-0 transition-all duration-300 animate-in zoom-in-95"
        >
          {/* Top Camera Dot */}
          <div className="w-3 h-3 bg-black/90 rounded-full mb-2.5 shrink-0 border border-white/10 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60"></div>
          </div>
          {/* Screen Container */}
          <div className="w-full flex-1 rounded-[20px] overflow-hidden border border-white/10 bg-[#090b10] relative shadow-inner">
            {iframeElement}
          </div>
          {/* Bottom Home Indicator */}
          <div className="w-32 h-1 bg-white/20 rounded-full mt-2.5 shrink-0"></div>
        </div>
      );
    }

    if (device === 'desktop') {
      return (
        <div 
          ref={previewContainerRef}
          className="w-full max-w-[960px] flex flex-col items-center shrink-0 transition-all duration-300 my-auto animate-in zoom-in-95"
        >
          {/* Laptop Screen Body */}
          <div className="w-full bg-[#111522] border-2 border-white/15 rounded-t-2xl shadow-2xl p-2.5 flex flex-col items-center relative">
            {/* Top Webcam */}
            <div className="w-2.5 h-2.5 bg-black/90 rounded-full mb-2 border border-white/10 shrink-0 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-blue-500/80"></div>
            </div>
            {/* Screen Content */}
            <div className="w-full h-[480px] max-h-[60vh] rounded-lg overflow-hidden border border-white/10 bg-[#090b10] relative shadow-inner">
              {iframeElement}
            </div>
          </div>
          {/* Laptop Bottom Chin / Base */}
          <div className="w-[103%] h-4 bg-gradient-to-b from-[#1c2232] via-[#141926] to-[#0c0f18] rounded-b-xl border-x border-b border-white/15 shadow-xl flex justify-center items-center shrink-0">
            <div className="w-12 h-1 bg-white/20 rounded-full"></div>
          </div>
        </div>
      );
    }

    // Responsive Default Mode
    return (
      <div 
        ref={previewContainerRef}
        className="w-full h-full rounded-2xl overflow-hidden border border-white/[0.08] bg-[#090b10] shadow-xl transition-all duration-300"
      >
        {iframeElement}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#06080e] ltr:border-l rtl:border-r border-white/[0.05] overflow-hidden font-light">
      {/* Sleek Browser-Style Navigation & Device Control Header */}
      <div className="h-11 bg-[#080b12]/90 backdrop-blur-2xl border-b border-white/[0.06] px-3 flex items-center justify-between gap-2 select-none shrink-0 z-10">
        {/* Left: Simulated Browser Back/Forward/Reload Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleGoBack}
            disabled={historyIndex <= 0}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.06] active:scale-95 rounded-lg transition-all disabled:opacity-30 disabled:pointer-events-none"
            title="Back"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={handleGoForward}
            disabled={historyIndex >= historyStack.length - 1}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.06] active:scale-95 rounded-lg transition-all disabled:opacity-30 disabled:pointer-events-none"
            title="Forward"
          >
            <ChevronRight size={14} />
          </button>
          <button
            onClick={handleRefresh}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.06] active:scale-95 rounded-lg transition-all"
            title={t.refresh}
          >
            <RotateCw size={13} />
          </button>
        </div>

        {/* Center: Real Working Interactive Address Bar */}
        <form 
          onSubmit={handleNavigateUrl}
          className="flex-1 max-w-sm sm:max-w-md bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] focus-within:border-blue-500/40 focus-within:bg-white/[0.06] rounded-xl px-2.5 py-1 flex items-center gap-1.5 text-xs text-neutral-300 transition-all font-mono"
        >
          {activeExternalUrl ? (
            <Globe size={11} className="text-blue-400 shrink-0" />
          ) : (
            <Lock size={11} className="text-emerald-400 shrink-0" />
          )}
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Type website (e.g. google.com)"
            className="w-full bg-transparent border-none text-[11px] text-neutral-300 focus:outline-none focus:text-white tracking-tight truncate font-mono"
          />
          {activeExternalUrl && (
            <button
              type="button"
              onClick={handleResetToProject}
              className="text-[10px] text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-1.5 py-0.5 rounded-md transition-all shrink-0 font-sans flex items-center gap-1"
              title="Return to local project code"
            >
              <Home size={10} />
              <span>Project</span>
            </button>
          )}
        </form>

        {/* Right: Device Switcher & Screenshot Action */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Device Selector */}
          <div className="hidden sm:flex items-center gap-0.5 p-0.5 bg-white/[0.03] border border-white/[0.06] rounded-xl backdrop-blur-2xl">
            <button
              onClick={() => setDevice('responsive')}
              title={t.deviceResponsive}
              className={`p-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                device === 'responsive' ? 'bg-blue-600/25 text-blue-400 border border-blue-500/30 shadow-sm' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
              }`}
            >
              <Maximize2 size={13} />
            </button>
            <button
              onClick={() => setDevice('desktop')}
              title={t.deviceDesktop}
              className={`p-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                device === 'desktop' ? 'bg-blue-600/25 text-blue-400 border border-blue-500/30 shadow-sm' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
              }`}
            >
              <Monitor size={13} />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              title={t.deviceTablet}
              className={`p-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                device === 'tablet' ? 'bg-blue-600/25 text-blue-400 border border-blue-500/30 shadow-sm' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
              }`}
            >
              <Tablet size={13} />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              title={t.deviceMobile}
              className={`p-1.5 rounded-lg transition-all duration-200 active:scale-95 ${
                device === 'mobile' ? 'bg-blue-600/25 text-blue-400 border border-blue-500/30 shadow-sm' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
              }`}
            >
              <Smartphone size={13} />
            </button>
          </div>

          {/* Screenshot Capture Button */}
          <button
            onClick={handleCaptureScreenshot}
            disabled={isCapturing}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.08] active:scale-95 rounded-xl transition-all duration-200 disabled:opacity-40"
            title="Take Screenshot PNG"
          >
            <Camera size={14} className={isCapturing ? 'animate-pulse text-blue-400' : ''} />
          </button>

          {/* External Window */}
          <button
            onClick={openInNewTab}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.08] active:scale-95 rounded-xl transition-all duration-200"
            title="Open in new window"
          >
            <ExternalLink size={14} />
          </button>

          {/* Console Toggle */}
          <button
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs transition-all duration-200 active:scale-95 ${
              isConsoleOpen
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.08]'
            }`}
          >
            <Terminal size={13} />
            <span className="hidden lg:inline">{t.console}</span>
            {consoleMessages.length > 0 && (
              <span className="text-[10px] bg-blue-500/25 text-blue-400 px-1.5 py-0.2 rounded-full font-mono font-medium">
                {consoleMessages.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Live Preview Viewport Canvas */}
      <div className="flex-1 bg-[#06080c] p-2 sm:p-4 flex items-center justify-center overflow-auto relative w-full select-none">
        {renderContent()}
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
