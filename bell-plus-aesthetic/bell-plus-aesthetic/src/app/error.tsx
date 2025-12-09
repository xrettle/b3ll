'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

// Import the standalone timer with no SSR to ensure it works independently
const BellTimer = dynamic(() => import('@/components/BellTimer'), {
  ssr: false,
});

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#151718] text-white p-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-4">B3ll Timer</h1>
        
        <div className="mb-8 p-4 bg-black/20 rounded-lg">
          <h2 className="text-xl font-bold mb-2">The timer is still working!</h2>
          <p className="mb-6">
            While we fix some technical issues, your bell timer continues to work below:
          </p>
          
          <div className="mb-8">
            <BellTimer />
          </div>
          
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
        
        <div className="mt-12 text-sm opacity-70">
          <p>If this error persists, try refreshing the page or clearing your browser cache.</p>
        </div>
      </div>
    </div>
  );
}
