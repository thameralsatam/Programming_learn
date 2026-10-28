import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { Language } from '../types';

const LANGUAGES: { code: Language; name: string }[] = [
  { code: 'de', name: 'Deutsch' },
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية' },
];

interface LanguageSwitcherProps {
  lang: Language;
  onLangChange: (lang: Language) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ lang, onLangChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/15 px-3 py-1.5 rounded-xl text-xs text-neutral-300 hover:text-white transition-all duration-200 font-light active:scale-95"
      >
        <Globe size={13} className="text-neutral-400" />
        <span>{current.name}</span>
        <ChevronDown size={11} className="text-neutral-500" />
      </button>

      {open && (
        <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-36 glass-modal rounded-2xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150 font-light text-xs">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                onLangChange(l.code);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-start flex items-center justify-between hover:bg-white/[0.06] transition-all ${
                lang === l.code ? 'text-blue-400 font-normal' : 'text-neutral-300'
              }`}
            >
              <span>{l.name}</span>
              <span className="text-[10px] font-mono text-neutral-500">{l.code.toUpperCase()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
