'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import BellTimer with no SSR
const BellTimer = dynamic(() => import('@/components/BellTimer').then(mod => ({ default: mod.BellTimer })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-pulse">Loading timer...</div>
    </div>
  )
});

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#151718] text-white p-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-4">B3ll Timer</h1>
        <div className="bg-red-900/20 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-2">Page Not Found</h2>
          <p className="mb-4">The page you're looking for doesn't exist or has been moved.</p>
          <Link href="/" className="text-blue-400 hover:underline">
            Return to Home
          </Link>
        </div>
        
        {/* The bell timer will still work even on 404 pages */}
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
