"use client";

import * as React from "react";

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to console
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#151718] text-white p-6 overflow-auto">
          <div className="max-w-2xl w-full bg-[#1a1e20] p-6 rounded-lg shadow-lg border border-red-500/30">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
            <p className="mb-4">The application encountered an unexpected error. Please try refreshing the page.</p>
            
            <div className="bg-[#0d1011] p-4 rounded mb-4 overflow-auto max-h-[300px]">
              <p className="text-red-400 font-mono text-sm mb-2">Error: {this.state.error?.toString()}</p>
              {this.state.errorInfo && (
                <pre className="text-gray-400 font-mono text-xs whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded text-white transition-colors"
              >
                Try to Recover
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
