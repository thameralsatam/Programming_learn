import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

function createDummyWorker(): Worker {
  return {
    postMessage: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    terminate: () => {},
    dispatchEvent: () => false,
    onmessage: null,
    onmessageerror: null,
    onerror: null,
  } as unknown as Worker;
}

function createSafeWorker(WorkerClass: new () => Worker, label: string): Worker {
  try {
    const worker = new WorkerClass();
    // Intercept error events immediately so they don't bubble or reach Monaco's throw handler
    worker.addEventListener(
      'error',
      (e) => {
        try {
          e.stopImmediatePropagation?.();
          e.preventDefault?.();
        } catch {
          // ignore
        }
      },
      true
    );
    return worker;
  } catch {
    return createDummyWorker();
  }
}

export function setupMonacoWorkers() {
  if (typeof window === 'undefined') return;

  // @ts-ignore
  window.MonacoEnvironment = {
    getWorker(_: unknown, label: string) {
      if (label === 'json') {
        return createSafeWorker(jsonWorker, label);
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return createSafeWorker(cssWorker, label);
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return createSafeWorker(htmlWorker, label);
      }
      if (label === 'typescript' || label === 'javascript') {
        return createSafeWorker(tsWorker, label);
      }
      return createSafeWorker(editorWorker, label);
    },
  };
}
