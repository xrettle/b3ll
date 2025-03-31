'use client'

import dynamic from 'next/dynamic'
import { Header } from '@/components/Header'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Schedule as ScheduleType, getCurrentDaySchedule, schedules } from '@/data/schedules'

// Disable SSR completely for all dynamic components
const BellTimer = dynamic(() => import('@/components/BellTimer').then(mod => mod.BellTimer), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen">Loading timer...</div>
})

// Dynamically import Schedule component with error handling
const Schedule = dynamic(() => import('@/components/Schedule'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-40 p-8 bg-white/5 backdrop-blur-md rounded-xl">Loading schedule...</div>
})

export default function Home() {
  const [showSchedule, setShowSchedule] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState<ScheduleType | null>(null);
  const [assemblyLetter, setAssemblyLetter] = useState("B");

  // Initialize component and set default schedule
  useEffect(() => {
    setMounted(true);

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

    return () => clearTimeout(timer);
  }, []);  // Only run once on mount

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

  // Return empty div during SSR
  if (!mounted) {
    return <div className="bg-[#151718] h-screen w-screen"></div>;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Header />

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
        </section>
      </main>
    </div>
  )
}
