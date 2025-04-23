'use client'

import dynamic from 'next/dynamic'
import { Header } from '@/components/Header'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Schedule as ScheduleType, getCurrentDaySchedule, schedules } from '@/data/schedules'
import { InfoButton } from '@/components/InfoPanel'

// Dynamically import BellTimer component with loading state
const BellTimer = dynamic(() => import('@/components/BellTimer').then(mod => ({ default: mod.BellTimer })), {
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

// Dynamically import Schedule component with loading state
const Schedule = dynamic(() => import('@/components/Schedule'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-40 p-8 bg-white/5 backdrop-blur-md rounded-xl">
      <div className="flex flex-col items-center gap-3">
        <div className="flex space-x-2">
          <div className="w-2 h-2 rounded-full bg-[#333] dark:bg-white animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-[#333] dark:bg-white animate-bounce200"></div>
          <div className="w-2 h-2 rounded-full bg-[#333] dark:bg-white animate-bounce300"></div>
        </div>
        <p className="text-sm font-mono opacity-60">Loading schedule...</p>
      </div>
    </div>
  )
})

// Dynamically import SettingsPanel with lazy loading - optimize with priority
const SettingsPanel = dynamic(() => import('@/components/SettingsPanel').then(mod => ({ default: mod.SettingsPanel })), {
  ssr: false,
  loading: () => (
    <div className="fixed top-0 right-0 bottom-0 w-80 bg-[#1a1e20]/80 backdrop-blur-sm z-50 shadow-xl animate-pulse">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="h-6 w-32 bg-white/10 rounded"></div>
        <div className="h-8 w-8 bg-white/10 rounded-full"></div>
      </div>
      <div className="p-6 space-y-4">
        <div className="h-4 bg-white/10 rounded w-3/4"></div>
        <div className="h-10 bg-white/10 rounded"></div>
        <div className="h-4 bg-white/10 rounded w-1/2"></div>
        <div className="h-10 bg-white/10 rounded"></div>
      </div>
    </div>
  )
})

// Dynamically import InfoPanel with lazy loading - optimize with lower priority
const InfoPanel = dynamic(() => import('@/components/InfoPanel').then(mod => ({ default: mod.InfoPanel })), {
  ssr: false,
  loading: () => null
})

export default function Home() {
  const [showSchedule, setShowSchedule] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState<ScheduleType | null>(null);
  const [assemblyLetter, setAssemblyLetter] = useState("B");
  const [showSettings, setShowSettings] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize component and set default schedule
  useEffect(() => {
    setMounted(true);
    
    // Add a timeout to track loading state
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    // Get saved schedule from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const savedSchedule = localStorage.getItem('bell-timer-schedule');
        const savedAssemblyLetter = localStorage.getItem('bell-timer-assembly-letter');

        if (savedAssemblyLetter) {
          setAssemblyLetter(savedAssemblyLetter);
        }

        if (savedSchedule && schedules[savedSchedule]) {
          // Use saved schedule if valid
          setActiveSchedule(schedules[savedSchedule]);
        } else {
          // Otherwise use current day's schedule
          const defaultSchedule = getCurrentDaySchedule();
          setActiveSchedule(defaultSchedule);
          // Save current day schedule to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('bell-timer-schedule', defaultSchedule.name);
          }
        }
      } catch (error) {
        // In case of any localStorage errors, use default schedule
        const defaultSchedule = getCurrentDaySchedule();
        setActiveSchedule(defaultSchedule);
      }
    } else {
      // Fallback if localStorage is not available
      const defaultSchedule = getCurrentDaySchedule();
      setActiveSchedule(defaultSchedule);
    }

    // Always show schedule after a short delay
    const timer = setTimeout(() => {
      setShowSchedule(true);
    }, 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(loadingTimer);
    };
  }, []);  // Only run once on mount

  // Add keyboard shortcut handler
  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle keyboard shortcuts
      if (e.key === 'Escape') {
        // Close settings panel if open
        if (showSettings) {
          setShowSettings(false);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        // Redirect to home page / refresh
        window.location.href = '/';
      } else if (e.key === 's' || e.key === 'S') {
        // Toggle settings panel
        setShowSettings(prev => !prev);
      }
    };

    // Add event listener for keyboard shortcuts
    window.addEventListener('keydown', handleKeyDown);

    // Clean up event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mounted, showSettings]);

  // Show schedule when scrolling down
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      if (window.scrollY > 10) {
        setShowSchedule(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Force schedule to show after a delay if not already shown
  useEffect(() => {
    if (!mounted) return;

    const timer = setTimeout(() => {
      setShowSchedule(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [mounted]); // Only depend on mounted state

  // Callback to update schedule
  const handleScheduleUpdate = useCallback((schedule: ScheduleType, letter?: string) => {
    setActiveSchedule(schedule);

    if (letter) {
      setAssemblyLetter(letter);
      // Save assembly letter to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('bell-timer-assembly-letter', letter);
      }
    }

    // Save selected schedule to localStorage
    if (typeof window !== 'undefined' && schedule) {
      localStorage.setItem('bell-timer-schedule', schedule.name);
    }
  }, []);

  // Handle settings panel toggle
  const toggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  // Return empty div during SSR
  if (!mounted) {
    return <div className="bg-[#151718] h-screen w-screen"></div>;
  }

  // Show loading indicator if still loading after 3 seconds
  if (isLoading) {
    return (
      <div className="bg-[#151718] h-screen w-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#333] dark:bg-white animate-bounce"></div>
            <div className="w-3 h-3 rounded-full bg-[#333] dark:bg-white animate-bounce200"></div>
            <div className="w-3 h-3 rounded-full bg-[#333] dark:bg-white animate-bounce300"></div>
          </div>
          <p className="text-xl font-mono text-white/70">Loading application...</p>
          <p className="text-sm font-mono text-white/50">This may take a moment on first load</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Header onSettingsClick={toggleSettings} />

      {/* Settings Panel */}
      {showSettings && <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />}
      
      {/* Info Panel - only load when needed */}
      {showInfoPanel && <InfoPanel isOpen={showInfoPanel} onClose={() => setShowInfoPanel(false)} />}

      <main className="relative">
        {/* Timer Section */}
        <section className="min-h-screen flex flex-col items-center justify-center">
          <BellTimer onScheduleUpdate={handleScheduleUpdate} />
        </section>

        {/* Schedule Section */}
        <section className="min-h-screen flex items-center justify-center px-4 py-20">
          {showSchedule && activeSchedule && (
            <Schedule
              activeSchedule={activeSchedule}
              assemblyLetter={assemblyLetter}
            />
          )}
          
          {/* Info Button - only show when schedule is visible */}
          {showSchedule && (
            <InfoButton onClick={() => setShowInfoPanel(true)} />
          )}
        </section>
      </main>
    </div>
  )
}
