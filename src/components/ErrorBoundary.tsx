import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCw, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleResetStorage = () => {
    try {
      localStorage.removeItem('studio_lab_projects_v2');
      localStorage.removeItem('studio_lab_current_id_v2');
      localStorage.removeItem('studio_lab_projects');
      localStorage.removeItem('studio_lab_current_id');
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full w-full bg-[#07090e] p-6 text-neutral-200 select-none">
          <div className="glass-modal rounded-3xl max-w-md w-full p-6 sm:p-8 border border-white/10 shadow-2xl text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-white tracking-tight">
                Studio Lab Wiederherstellung
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Ein unerwarteter Anzeigefehler ist aufgetreten. Sie können die Seite neu laden oder den Arbeitsbereich sicher auf die Standardeinstellungen zurücksetzen.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-black/40 border border-white/[0.06] rounded-xl p-3 text-[11px] font-mono text-rose-300/90 text-left overflow-x-auto max-h-24">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs text-white bg-white/[0.08] hover:bg-white/[0.14] active:scale-95 rounded-xl font-medium transition-all"
              >
                <RotateCw size={14} />
                <span>Seite neu laden</span>
              </button>
              <button
                onClick={this.handleResetStorage}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl font-medium shadow-sm shadow-blue-600/30 transition-all"
              >
                <RefreshCw size={14} />
                <span>Zurücksetzen</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
