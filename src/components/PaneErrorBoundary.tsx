import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
}

export class PaneErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PaneErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full w-full bg-[#07090e]/50 text-neutral-500 text-xs p-4 border border-white/[0.05] rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <AlertTriangle size={16} className="text-rose-500" />
            <span>{this.props.title || 'Error'}</span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
