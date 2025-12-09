'use client'

import dynamic from 'next/dynamic'
import { Header } from '@/components/Header'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Schedule as ScheduleType, getCurrentDaySchedule, schedules } from '@/data/schedules'
import { InfoButton } from '@/components/InfoPanel'
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

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
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="heading-1 mb-6">
              Transform Your Business with{" "}
              <span className="text-gradient">AI Solutions</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Leverage cutting-edge artificial intelligence to streamline operations,
              enhance decision-making, and drive growth.
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="btn-primary">Get Started</Button>
              <Button className="btn-secondary">Learn More</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <h2 className="heading-2 text-center mb-12">Why Choose B3LL</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="heading-2 mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Join thousands of businesses already using B3LL to transform their operations.
            </p>
            <Button className="btn-primary">Start Free Trial</Button>
          </div>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    title: "Smart Automation",
    description: "Automate repetitive tasks and workflows with intelligent AI solutions.",
    icon: (
      <svg
        className="w-6 h-6 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
  {
    title: "Data Analytics",
    description: "Gain valuable insights from your data with advanced analytics tools.",
    icon: (
      <svg
        className="w-6 h-6 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    title: "24/7 Support",
    description: "Get round-the-clock support from our dedicated team of experts.",
    icon: (
      <svg
        className="w-6 h-6 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
]
