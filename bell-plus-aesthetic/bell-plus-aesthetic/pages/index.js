import { useEffect } from 'react';
import { useRouter } from 'next/router';

// This is a simple redirection page that redirects to the App Router implementation
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // During SSR, useEffect won't run
    router.push('/');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#333] dark:bg-white animate-bounce"></div>
          <div className="w-3 h-3 rounded-full bg-[#333] dark:bg-white animate-bounce"></div>
          <div className="w-3 h-3 rounded-full bg-[#333] dark:bg-white animate-bounce"></div>
        </div>
        <p className="text-xl font-mono opacity-70">Loading b3ll...</p>
      </div>
    </div>
  );
}
