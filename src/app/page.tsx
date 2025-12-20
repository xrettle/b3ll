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

// Visual effect components
const MeshGradientBg = dynamic(() => import('@/components/ui/mesh-gradient-bg').then(mod => mod.default), {
  ssr: false,
})

const FlickeringGrid = dynamic(() => import('@/components/ui/flickering-grid').then(mod => mod.default), {
  ssr: false,
})

const FluidAnimation = dynamic(() => import('@/components/ui/fluid-animation').then(mod => mod.default), {
  ssr: false,
})

export default function Home() {
  const [showSchedule, setShowSchedule] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState<ScheduleType | null>(null);
  const [assemblyLetter, setAssemblyLetter] = useState("B");
  const [isLightTheme, setIsLightTheme] = useState(false);

  // Visual effects state
  const [gradientBgEnabled, setGradientBgEnabled] = useState(false);
  const [flickeringGridEnabled, setFlickeringGridEnabled] = useState(false);
  const [fluidAnimEnabled, setFluidAnimEnabled] = useState(false);

  // Initialize component and set default schedule
  useEffect(() => {
    setMounted(true);

    // Check theme
    const checkTheme = () => {
      setIsLightTheme(document.documentElement.classList.contains('light-theme'));
    };
    checkTheme();

    // Load visual effects settings
    if (typeof window !== 'undefined') {
      setGradientBgEnabled(localStorage.getItem('bell-timer-effect-gradient-bg') === 'true');
      setFlickeringGridEnabled(localStorage.getItem('bell-timer-effect-flickering-grid') === 'true');
      setFluidAnimEnabled(localStorage.getItem('bell-timer-effect-fluid-anim') === 'true');
    }

    // Get saved schedule from localStorage if available
    if (typeof window !== 'undefined') {
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
    } else {
      // Fallback if localStorage is not available
      const defaultSchedule = getCurrentDaySchedule();
      setActiveSchedule(defaultSchedule);
    }
  }, []);  // Only run once on mount

  // Show schedule when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setShowSchedule(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Force schedule to show after a delay
  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => {
        setShowSchedule(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [mounted]);

  // Listen for visual effects settings changes from SettingsPanel
  useEffect(() => {
    const handleVisualEffectsChange = () => {
      if (typeof window !== 'undefined') {
        setGradientBgEnabled(localStorage.getItem('bell-timer-effect-gradient-bg') === 'true');
        setFlickeringGridEnabled(localStorage.getItem('bell-timer-effect-flickering-grid') === 'true');
        setFluidAnimEnabled(localStorage.getItem('bell-timer-effect-fluid-anim') === 'true');
      }
    };

    window.addEventListener('visual-effects-change', handleVisualEffectsChange);
    return () => window.removeEventListener('visual-effects-change', handleVisualEffectsChange);
  }, []);

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
      {/* Visual Effects Background */}
      {fluidAnimEnabled && (
        <FluidAnimation
          className="fixed inset-0 z-0"
          complexity={3}
          baseColor={isLightTheme ? 0.5 : 0.15}
          fluidSpeed={0.02}
        />
      )}
      {gradientBgEnabled && <MeshGradientBg />}
      {flickeringGridEnabled && (
        <FlickeringGrid
          className="fixed inset-0 z-0 pointer-events-none"
          color={isLightTheme ? "rgb(50, 50, 50)" : "rgb(255, 255, 255)"}
          maxOpacity={isLightTheme ? 0.08 : 0.1}
          flickerChance={0.15}
          squareSize={3}
          gridGap={6}
        />
      )}

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
