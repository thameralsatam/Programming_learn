import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  AlertCircle,
  AlertTriangle,
  Info,
  Copy
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
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
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all');
  const [seenAt, setSeenAt] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureFailed, setCaptureFailed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const counts = useMemo(() => ({
    error: consoleMessages.filter((m) => m.type === 'error').length,
    warn: consoleMessages.filter((m) => m.type === 'warn').length,
  }), [consoleMessages]);
  const visibleMessages = consoleMessages.filter((m) =>
    filter === 'all' ? true : filter === 'info' ? ['info', 'log', 'debug'].includes(m.type) : m.type === filter
  );
  const unseenErrors = consoleMessages.filter((m) => m.type === 'error' && m.timestamp > seenAt).length;
  const unseenWarns = consoleMessages.filter((m) => m.type === 'warn' && m.timestamp > seenAt).length;
  const toggleConsole = () => { setSeenAt(Date.now()); setIsConsoleOpen((o) => !o); };
  useEffect(() => {
    if (isConsoleOpen) listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [consoleMessages, isConsoleOpen, filter]);
  const copyText = (text: string) => { navigator.clipboard?.writeText(text).catch(() => {}); };
  const formatMessage = (m: ConsoleMessage) =>
    `[${m.type.toUpperCase()}] ${m.text}${m.origin ? `\n  at ${m.origin}` : ''}${m.stack ? `\n${m.stack}` : ''}`;
  const msgStyles: Record<string, string> = {
    error: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
    warn: 'bg-amber-500/10 text-amber-200 border-amber-500/25',
    info: 'bg-sky-500/5 text-sky-200 border-transparent',
    log: 'text-neutral-300 border-transparent',
    debug: 'text-neutral-500 border-transparent',
  };

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  const openInNewTab = () => {
    const url = URL.createObjectURL(new Blob([bundledHtml], { type: 'text/html' }));
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const handleCaptureScreenshot = async () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc?.body) return;
    try {
      setIsCapturing(true);
      const canvas = await html2canvas(doc.body, {
        useCORS: true,
        scale: 2,
        backgroundColor: getComputedStyle(doc.body).backgroundColor,
        windowWidth: doc.documentElement.scrollWidth,
        windowHeight: doc.documentElement.scrollHeight,
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll<HTMLElement>('*').forEach((el) => {
            el.style.backdropFilter = 'none';
            el.style.setProperty('-webkit-backdrop-filter', 'none');
          });
        },
      });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob) saveAs(blob, `studio_preview_${device}_${Date.now()}.png`);
    } catch (err) {
      console.error('Screenshot failed', err);
      setCaptureFailed(true);
      setTimeout(() => setCaptureFailed(false), 3000);
    } finally {
      setIsCapturing(false);
    }
  };

  const iframeElement = (
    <iframe
      ref={iframeRef}
      key={iframeKey}
      srcDoc={bundledHtml}
      title="Studio Lab Preview"
      sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
      className="w-full h-full border-none bg-[#090b10]"
    />
  );

  const renderContent = () => {
    if (device === 'mobile') {
      return (
        <div className="w-[360px] max-w-full h-[660px] max-h-[82vh] bg-[#111522] border-2 border-white/15 rounded-[42px] shadow-2xl p-3 flex flex-col items-center relative shrink-0 transition-all duration-300 animate-in zoom-in-95">
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
        <div className="w-[640px] max-w-full h-[720px] max-h-[85vh] bg-[#111522] border-2 border-white/15 rounded-[32px] shadow-2xl p-3.5 flex flex-col items-center relative shrink-0 transition-all duration-300 animate-in zoom-in-95">
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
        <div className="w-full max-w-[960px] flex flex-col items-center shrink-0 transition-all duration-300 my-auto animate-in zoom-in-95">
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
      <div className="w-full h-full rounded-2xl overflow-hidden border border-white/[0.08] bg-[#090b10] shadow-xl transition-all duration-300">
        {iframeElement}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#06080e] ltr:border-l rtl:border-r border-white/[0.05] overflow-hidden font-light">
      {/* Sleek Browser-Style Navigation & Device Control Header */}
      <div className="h-11 bg-[#080b12]/90 backdrop-blur-2xl border-b border-white/[0.06] px-3 flex items-center justify-between gap-2 select-none shrink-0 z-10">
        {/* Left: Refresh Control */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleRefresh}
            className="p-1.5 text-neutral-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] active:scale-95 rounded-xl transition-all"
            title={t.refresh}
          >
            <RotateCw size={13} />
          </button>
        </div>

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
            title={captureFailed ? t.screenshotFailed : t.screenshot}
          >
            <Camera size={14} className={isCapturing ? 'animate-pulse text-blue-400' : captureFailed ? 'text-rose-400' : ''} />
          </button>

          {/* External Window */}
          <button
            onClick={openInNewTab}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.08] active:scale-95 rounded-xl transition-all duration-200"
            title={t.openNewWindow}
          >
            <ExternalLink size={14} />
          </button>

          {/* Console Toggle */}
          <button
            onClick={toggleConsole}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs transition-all duration-200 active:scale-95 ${
              isConsoleOpen
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.08]'
            }`}
          >
            <Terminal size={13} />
            <span className="hidden lg:inline">{t.console}</span>
            {counts.error > 0 && <span className="text-[10px] bg-rose-500/25 text-rose-300 px-1.5 rounded-full font-mono font-medium">{counts.error}</span>}
            {counts.warn > 0 && <span className="text-[10px] bg-amber-500/25 text-amber-300 px-1.5 rounded-full font-mono font-medium">{counts.warn}</span>}
          </button>
        </div>
      </div>

      {/* Live Preview Viewport Canvas */}
      <div className="flex-1 bg-[#06080c] p-2 sm:p-4 flex items-center justify-center overflow-auto relative w-full select-none">
        {renderContent()}
        {!isConsoleOpen && (unseenErrors > 0 || unseenWarns > 0) && (
          <button
            onClick={toggleConsole}
            className={`absolute bottom-3 ltr:right-3 rtl:left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs border backdrop-blur-xl shadow-xl active:scale-95 transition-all ${
              unseenErrors > 0 ? 'bg-rose-500/20 border-rose-500/40 text-rose-200' : 'bg-amber-500/20 border-amber-500/40 text-amber-200'
            }`}
          >
            {unseenErrors > 0 ? <AlertCircle size={13} /> : <AlertTriangle size={13} />}
            <span>{unseenErrors > 0 ? `${unseenErrors} ${t.consoleErrors}` : `${unseenWarns} ${t.consoleWarnings}`}</span>
          </button>
        )}
      </div>

      {/* Integrated Console Drawer */}
      {isConsoleOpen && (
        <div className="h-56 bg-[#0a0d14]/90 backdrop-blur-xl border-t border-white/[0.08] flex flex-col shrink-0">
          <div className="h-8 px-2 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between text-xs text-neutral-400 font-mono select-none">
            <div className="flex items-center gap-1">
              {([['all', t.consoleAll], ['error', t.consoleErrors], ['warn', t.consoleWarnings], ['info', t.consoleInfo]] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-2 py-1 rounded-lg text-[11px] transition-all ${filter === key ? 'bg-white/[0.1] text-white' : 'hover:text-white'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => copyText(visibleMessages.map(formatMessage).join('\n\n'))} className="hover:text-white transition-colors flex items-center gap-1 text-[11px]" title={t.copyAll}>
                <Copy size={12} /><span className="hidden sm:inline">{t.copyAll}</span>
              </button>
              <button onClick={onClearConsole} className="hover:text-white transition-colors flex items-center gap-1 text-[11px]" title={t.clear}>
                <Trash2 size={12} /><span className="hidden sm:inline">{t.clear}</span>
              </button>
            </div>
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1">
            {visibleMessages.length === 0 ? (
              <div className="text-neutral-500 italic text-[11px] py-1">{t.noLogs}</div>
            ) : (
              visibleMessages.map((m) => (
                <div key={m.id} className={`group/msg px-2.5 py-1.5 rounded-lg text-[11px] leading-relaxed border ${msgStyles[m.type] ?? msgStyles.log}`}>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0">
                      {m.type === 'error' ? <AlertCircle size={12} /> : m.type === 'warn' ? <AlertTriangle size={12} /> : m.type === 'info' ? <Info size={12} /> : <span className="inline-block w-3 text-center opacity-50">›</span>}
                    </span>
                    <div className="min-w-0 flex-1 select-text">
                      <div className="whitespace-pre-wrap break-words">{m.text}</div>
                      {m.origin && <div className="text-[10px] opacity-60 mt-0.5">{m.origin}</div>}
                      {m.stack && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-[10px] opacity-70">Stack</summary>
                          <pre className="mt-1 text-[10px] whitespace-pre-wrap break-words opacity-80">{m.stack}</pre>
                        </details>
                      )}
                    </div>
                    {(m.count ?? 1) > 1 && <span className="shrink-0 text-[10px] px-1.5 rounded-full bg-white/10 font-mono">{m.count}</span>}
                    <span className="shrink-0 text-[10px] opacity-50">{new Date(m.timestamp).toLocaleTimeString()}</span>
                    <button onClick={() => copyText(formatMessage(m))} title={t.copy} className="shrink-0 p-1 opacity-100 sm:opacity-0 group-hover/msg:opacity-100 hover:text-white transition-all">
                      <Copy size={11} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
