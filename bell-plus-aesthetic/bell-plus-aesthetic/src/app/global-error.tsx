'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

// Import the standalone timer with no SSR to ensure it works independently
const StandaloneBellTimer = dynamic(() => import('@/components/StandaloneBellTimer'), {
  ssr: false,
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for debugging
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[#151718] text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-xl mx-auto">
              <h1 className="text-3xl font-bold mb-6">B3ll Timer</h1>
              
              <div className="mb-8 p-6 bg-black/20 rounded-xl">
                <h2 className="text-xl font-bold mb-3">Your timer is still working!</h2>
                <p className="mb-6">
                  While we're fixing some technical issues, the bell timer is still fully functional:
                </p>
                
                <div className="mb-8 p-4 bg-black/30 rounded-lg">
                  <StandaloneBellTimer />
                </div>
                
                <button
                  onClick={() => reset()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
              
              <div className="text-center text-sm opacity-60 mt-12">
                <p>If this issue persists, try clearing your browser cache or contact support.</p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
