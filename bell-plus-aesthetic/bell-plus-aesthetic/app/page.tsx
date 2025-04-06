'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

// Load components from src directory
const BellTimer = dynamic(() => import('../src/components/BellTimer').then(mod => ({ default: mod.BellTimer })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-[#333] dark:bg-white animate-bounce"></div>
          <div className="w-3 h-3 rounded-full bg-[#333] dark:bg-white animate-bounce200"></div>
          <div className="w-3 h-3 rounded-full bg-[#333] dark:bg-white animate-bounce300"></div>
        </div>
        <p className="text-xl font-mono opacity-70">Loading b3ll...</p>
      </div>
    </div>
  )
})

// Main page component
export default function Home() {
  // Use state to handle client-side rendering
  const [isClient, setIsClient] = useState(false)
  
  // Set client-side rendering on mount
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Render loading state if not client
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#333] dark:bg-white animate-bounce"></div>
            <div className="w-3 h-3 rounded-full bg-[#333] dark:bg-white animate-bounce200"></div>
            <div className="w-3 h-3 rounded-full bg-[#333] dark:bg-white animate-bounce300"></div>
          </div>
          <p className="text-xl font-mono opacity-70">Loading b3ll...</p>
        </div>
      </div>
    )
  }

  // Render the main content
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <main className="relative">
        <section className="min-h-screen flex flex-col items-center justify-center">
          <BellTimer />
        </section>
      </main>
    </div>
  )
}
