'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the BellTimer component to ensure it works independently
const BellTimer = dynamic(
  () => import('./BellTimer').then(mod => ({ default: mod.BellTimer })),
  { ssr: false }
);

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Fallback UI that includes the standalone timer
      return (
        <div className="min-h-screen bg-[#151718] text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8 p-4 bg-red-900/20 border border-red-800 rounded-lg">
              <h1 className="text-2xl font-bold mb-4">Debug Mode</h1>
              <p className="mb-4">The application is currently in debug mode, but the timer will continue to work.</p>
              <p className="mb-2">You can:</p>
              <ul className="list-disc pl-5 mb-4">
                <li className="mb-1">Refresh the page to try again</li>
                <li className="mb-1">Check the browser console for more details</li>
                <li className="mb-1">Contact the developer if this persists</li>
              </ul>
              <details className="mt-4">
                <summary className="cursor-pointer text-red-400 hover:text-red-300 transition-colors">
                  Technical Details (for developers)
                </summary>
                <div className="mt-2 p-4 bg-black/30 rounded overflow-auto max-h-[300px] text-sm font-mono">
                  <p className="text-red-400">{this.state.error?.toString()}</p>
                  <pre className="text-gray-400 mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            </div>
            
            {/* The BellTimer component will continue to work even when the main app fails */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Bell Timer (Still Working)</h2>
              <div className="bg-black/20 p-6 rounded-xl">
                <BellTimer />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
