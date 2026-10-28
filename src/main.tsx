import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

import { setupMonacoWorkers } from './monacoWorker.ts';

setupMonacoWorkers();

const OriginalResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends OriginalResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    super((entries, observer) => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }
        callback(entries, observer);
      });
    });
  }
};

const isBenignError = (message?: unknown, error?: unknown, target?: unknown): boolean => {
  const msgStr = typeof message === 'string' ? message : '';
  const errStr = error ? String(error) : '';
  const errObj = error as { message?: string } | undefined;
  const errMsg = errObj?.message || '';

  return (
    msgStr.includes('ResizeObserver') ||
    msgStr.includes('Script error.') ||
    msgStr.includes('[object Event]') ||
    errStr.includes('[object Event]') ||
    errMsg.includes('ResizeObserver') ||
    errMsg.includes('Script error.') ||
    errMsg.includes('[object Event]') ||
    (typeof Event !== 'undefined' && (error instanceof Event || message instanceof Event)) ||
    (typeof Worker !== 'undefined' && target instanceof Worker) ||
    !message
  );
};

const hideResizeObserverError = () => {
  const origOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (isBenignError(message, error)) {
      return true;
    }
    if (typeof origOnError === 'function') {
      return origOnError(message, source, lineno, colno, error);
    }
    return false;
  };

  window.addEventListener(
    'error',
    (e) => {
      if (isBenignError(e.message, e.error, e.target)) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    },
    true
  );

  window.addEventListener(
    'unhandledrejection',
    (e) => {
      if (isBenignError(e.reason?.message, e.reason)) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    },
    true
  );
};
hideResizeObserverError();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

