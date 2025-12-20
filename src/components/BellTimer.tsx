'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { schedules, Schedule, Period, getCurrentDaySchedule, assemblyToPeriodMap, getAssemblyPeriodName } from '@/data/schedules';
import { ScheduleSelector } from './ScheduleSelector';
import { OuroborusEffect, OuroborusPresetKey } from './ui/ouroborus-effect';

interface BellTimerProps {
  onScheduleUpdate?: (schedule: Schedule, assemblyLetter?: string) => void;
}

function BellTimer({ onScheduleUpdate }: BellTimerProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [currentPeriod, setCurrentPeriod] = useState<string>('Loading...');
  const [currentSchedule, setCurrentSchedule] = useState<string>('');
  const [scheduleName, setScheduleName] = useState<string>('');
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);
  const [totalTimeMs, setTotalTimeMs] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState<Schedule>(getCurrentDaySchedule());
  const [assemblyLetter, setAssemblyLetter] = useState<string>("B");
  const [nextPeriodName, setNextPeriodName] = useState<string>("");
  const [isLightTheme, setIsLightTheme] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // State for countdown display
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [showCountdown, setShowCountdown] = useState<boolean>(false);
  const [isOutsideSchoolHours, setIsOutsideSchoolHours] = useState<boolean>(false);

  // Ouroborus effect state
  const [ouroborusEnabled, setOuroborusEnabled] = useState<boolean>(false);
  const [ouroborusPreset, setOuroborusPreset] = useState<OuroborusPresetKey>('woodGrain');

  // Check for theme changes
  useEffect(() => {
    const checkTheme = () => {
      const isLight = document.documentElement.classList.contains('light-theme');
      setIsLightTheme(isLight);
    };

    // Initial check
    checkTheme();

    // Set up a mutation observer to detect class changes on documentElement
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Load and listen for Ouroborus effect settings
  useEffect(() => {
    const loadOuroborusSettings = () => {
      if (typeof window !== 'undefined') {
        setOuroborusEnabled(localStorage.getItem('bell-timer-effect-ouroborus') === 'true');
        const preset = localStorage.getItem('bell-timer-ouroborus-preset') || 'woodGrain';
        setOuroborusPreset(preset as OuroborusPresetKey);
      }
    };

    loadOuroborusSettings();

    window.addEventListener('visual-effects-change', loadOuroborusSettings);
    return () => window.removeEventListener('visual-effects-change', loadOuroborusSettings);
  }, []);

  // Set mounted to true when component mounts on client
  useEffect(() => {
    setMounted(true);
    // Initialize with current day's schedule based on actual day of the week
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.

    // Map day number to schedule name
    let scheduleToUse: string;
    switch (dayOfWeek) {
      case 0: scheduleToUse = 'sunday'; break;
      case 1: scheduleToUse = 'monday'; break;
      case 2: scheduleToUse = 'tuesday'; break;
      case 3: scheduleToUse = 'wednesday'; break;
      case 4: scheduleToUse = 'thursday'; break;
      case 5: scheduleToUse = 'friday'; break;
      case 6: scheduleToUse = 'saturday'; break;
      default: scheduleToUse = 'monday'; // Fallback (should never happen)
    }

    const defaultSchedule = schedules[scheduleToUse];
    setActiveSchedule(defaultSchedule);
    setCurrentSchedule(scheduleToUse);
    setScheduleName(defaultSchedule.displayName);

    // Notify parent component
    if (onScheduleUpdate) {
      onScheduleUpdate(defaultSchedule);
    }
  }, [onScheduleUpdate]);

  const handleScheduleChange = useCallback((scheduleName: string) => {
    const newSchedule = schedules[scheduleName];
    if (newSchedule) {
      setActiveSchedule(newSchedule);
      setCurrentSchedule(scheduleName);
      setScheduleName(newSchedule.displayName);

      // Notify parent component
      if (onScheduleUpdate) {
        onScheduleUpdate(newSchedule, assemblyLetter);
      }
    }
  }, [assemblyLetter, onScheduleUpdate]);

  const handleAssemblyLetterChange = useCallback((letter: string) => {
    setAssemblyLetter(letter);

    // Notify parent component
    if (onScheduleUpdate && currentSchedule === 'assembly') {
      onScheduleUpdate(activeSchedule, letter);
    }
  }, [activeSchedule, currentSchedule, onScheduleUpdate]);

  // Function to parse time string to Date object
  const parseTimeString = useCallback((timeStr: string): Date => {
    const [hoursStr, minutesStr] = timeStr.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    // Handle 12-hour format conversion
    // Times 1-7 are PM (1:00 = 13:00, etc.)
    // Times 8-12 are AM (morning classes)
    if (hours >= 1 && hours < 8) {
      hours += 12;
    }

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }, []);

  // Function to format time as HH:MM:SS (removed milliseconds)
  const formatCountdown = useCallback(() => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [hours, minutes, seconds]);

  // Calculate time until next school day at 8:25 AM if outside school hours
  const calculateTimeUntilNextSchoolDay = useCallback(() => {
    const now = new Date();
    const tomorrow = new Date(now);

    // Move to next day
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Set to 8:25 AM
    tomorrow.setHours(8, 25, 0, 0);

    // Skip weekends
    if (tomorrow.getDay() === 0) { // Sunday
      tomorrow.setDate(tomorrow.getDate() + 1); // Move to Monday
    } else if (tomorrow.getDay() === 6) { // Saturday
      tomorrow.setDate(tomorrow.getDate() + 2); // Move to Monday
    }

    // Calculate time difference
    const timeLeftMs = tomorrow.getTime() - now.getTime();
    return timeLeftMs;
  }, []);

  // Function to update countdown
  const updateCountdown = useCallback(() => {
    if (timeLeftMs <= 0 && !isOutsideSchoolHours) return;

    let remainingMs = timeLeftMs;
    if (isOutsideSchoolHours) {
      remainingMs = calculateTimeUntilNextSchoolDay();
    }

    // Calculate hours, minutes, seconds (removed milliseconds)
    const hrs = Math.floor(remainingMs / 3600000);
    const mins = Math.floor((remainingMs % 3600000) / 60000);
    const secs = Math.floor((remainingMs % 60000) / 1000);

    setHours(hrs);
    setMinutes(mins);
    setSeconds(secs);
    setShowCountdown(true);
  }, [timeLeftMs, isOutsideSchoolHours, calculateTimeUntilNextSchoolDay]);

  // Function to find current period based on time
  const findCurrentPeriod = useCallback((now: Date): void => {
    if (!activeSchedule || !activeSchedule.periods || activeSchedule.periods.length === 0) {
      setCurrentPeriod("No schedule available");
      return;
    }

    const periods = activeSchedule.periods;
    const firstPeriodStart = parseTimeString(periods[0].startTime);
    const lastPeriodEnd = parseTimeString(periods[periods.length - 1].endTime);

    // Check if we're outside of school hours
    if (now < firstPeriodStart || now >= lastPeriodEnd) {
      setCurrentPeriod("Free");
      setNextPeriodName("Next School Day");
      setIsOutsideSchoolHours(true);
      setTimeLeftMs(calculateTimeUntilNextSchoolDay());
      setProgress(1); // Completed current day
      return;
    }

    setIsOutsideSchoolHours(false);

    for (let i = 0; i < periods.length - 1; i++) {
      const currentPeriodStart = parseTimeString(periods[i].startTime);
      const nextPeriodStart = parseTimeString(periods[i + 1].startTime);

      if (now >= currentPeriodStart && now < nextPeriodStart) {
        const periodName = periods[i].name;
        let displayName = periodName;

        // For assembly schedule, map letters to period names
        if (currentSchedule === 'assembly') {
          displayName = getAssemblyPeriodName(assemblyLetter, periodName);
        }

        setCurrentPeriod(displayName);

        // Also map the next period name for assembly schedule
        let nextPeriodDisplayName = periods[i + 1].name;
        if (currentSchedule === 'assembly') {
          nextPeriodDisplayName = getAssemblyPeriodName(assemblyLetter, nextPeriodDisplayName);
        }

        setNextPeriodName(nextPeriodDisplayName);

        // Calculate time left and total time for progress
        const totalMs = nextPeriodStart.getTime() - currentPeriodStart.getTime();
        const elapsedMs = now.getTime() - currentPeriodStart.getTime();
        const remainingMs = nextPeriodStart.getTime() - now.getTime();

        setTimeLeftMs(remainingMs);
        setTotalTimeMs(totalMs);
        setProgress(Math.min(1, elapsedMs / totalMs));
        return;
      }
    }

    // If we reach here, we're in the last period or after all periods
    const lastPeriod = periods[periods.length - 1];

    // Map the last period name for assembly schedule
    let lastPeriodDisplayName = lastPeriod.name;
    if (currentSchedule === 'assembly') {
      lastPeriodDisplayName = getAssemblyPeriodName(assemblyLetter, lastPeriodDisplayName);
    }

    setCurrentPeriod(lastPeriodDisplayName);
    setNextPeriodName("Next School Day");
    setIsOutsideSchoolHours(true);
    setTimeLeftMs(calculateTimeUntilNextSchoolDay());
    setProgress(1); // Completed
  }, [activeSchedule, assemblyLetter, currentSchedule, parseTimeString, calculateTimeUntilNextSchoolDay]);

  useEffect(() => {
    if (!mounted) return;

    // Initialize once when mounted
    const now = new Date();
    setCurrentTime(now);
    findCurrentPeriod(now);

    // Update time every second (changed from 100ms back to 1000ms)
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      findCurrentPeriod(now);
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [findCurrentPeriod, mounted]);

  // Update countdown display when timeLeftMs changes
  useEffect(() => {
    updateCountdown();

    // Create interval for second updates (removed more frequent millisecond updates)
    const secInterval = setInterval(() => {
      if (timeLeftMs > 0 || isOutsideSchoolHours) {
        updateCountdown();
      }
    }, 1000); // Update every second

    return () => clearInterval(secInterval);
  }, [timeLeftMs, updateCountdown, isOutsideSchoolHours]);

  // Format time as HH:MM
  const formatTime = (date: Date): string => {
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // Get theme-specific classes
  const getTextClass = () => {
    return isLightTheme ? "text-[#333]" : "text-white";
  };

  const getSubTextClass = () => {
    return isLightTheme ? "text-[#333]/80" : "text-white/80";
  };

  const getLightTextClass = () => {
    return isLightTheme ? "text-[#555]" : "text-[#999]";
  };

  const getFooterClass = () => {
    return isLightTheme ? "text-[#333]/30" : "text-white/30";
  };

  const getProgressBgClass = () => {
    return isLightTheme ? "bg-[#333]/10" : "bg-white/10";
  };

  const getProgressFgClass = () => {
    return isLightTheme ? "bg-[#333]" : "bg-white";
  };

  const getUntilClass = () => {
    return isLightTheme ? "text-[#555]" : "text-gray-400";
  };

  // Apply light theme styles
  const applyLightTheme = useCallback(() => {
    document.documentElement.classList.add('light-theme');

    // Apply smooth transition to body background
    document.body.style.transition = 'background-color 0.8s cubic-bezier(0.34, 0.01, 0.24, 1.0)';
    document.body.style.backgroundColor = '#f0f2f5';

    // Handle grid background transition
    const gridBg = document.querySelector('.absolute.inset-0.z-\\[1\\]') as HTMLElement;
    if (gridBg) {
      gridBg.style.transition = 'opacity 0.8s cubic-bezier(0.34, 0.01, 0.24, 1.0), filter 0.8s cubic-bezier(0.34, 0.01, 0.24, 1.0)';
      gridBg.style.opacity = '0.05';
      gridBg.style.filter = 'invert(1)';
    }

    // Handle gradient background transition
    const gradientBg = document.querySelector('.absolute.inset-0.bg-gradient-to-r') as HTMLElement;
    if (gradientBg) {
      gradientBg.style.transition = 'background-color 0.8s cubic-bezier(0.34, 0.01, 0.24, 1.0)';
      gradientBg.classList.remove('from-[#151718]', 'to-[#292f33]');
      gradientBg.classList.add('from-[#f0f2f5]', 'to-[#e4e6eb]');
    }
  }, []);

  // Apply dark theme styles
  const applyDarkTheme = useCallback(() => {
    document.documentElement.classList.remove('light-theme');

    // Apply smooth transition to body background
    document.body.style.transition = 'background-color 0.8s cubic-bezier(0.34, 0.01, 0.24, 1.0)';
    document.body.style.backgroundColor = '#151718';

    // Handle grid background transition
    const gridBg = document.querySelector('.absolute.inset-0.z-\\[1\\]') as HTMLElement;
    if (gridBg) {
      gridBg.style.transition = 'opacity 0.8s cubic-bezier(0.34, 0.01, 0.24, 1.0), filter 0.8s cubic-bezier(0.34, 0.01, 0.24, 1.0)';
      gridBg.style.opacity = '0.05';
      gridBg.style.filter = 'none';
    }

    // Handle gradient background transition
    const gradientBg = document.querySelector('.absolute.inset-0.bg-gradient-to-r') as HTMLElement;
    if (gradientBg) {
      gradientBg.style.transition = 'background-color 0.8s cubic-bezier(0.34, 0.01, 0.24, 1.0)';
      gradientBg.classList.remove('from-[#f0f2f5]', 'to-[#e4e6eb]');
      gradientBg.classList.add('from-[#151718]', 'to-[#292f33]');
    }
  }, []);

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center min-h-screen w-full relative overflow-hidden font-mono"
      style={{ fontFamily: '"Fira Code", monospace' }}
    >
      {/* Schedule Selector */}
      <ScheduleSelector
        currentSchedule={currentSchedule}
        onScheduleChange={handleScheduleChange}
        onAssemblyLetterChange={handleAssemblyLetterChange}
      />

      {/* Minimal background gradient - changes with theme */}
      <div className={`absolute inset-0 bg-gradient-to-r ${isLightTheme
        ? 'from-[#f0f2f5] to-[#e4e6eb]'
        : 'from-[#151718] to-[#292f33]'
        } z-0`}></div>

      {/* Grid pattern overlay - changes with theme */}
      <div className={`absolute inset-0 z-[1] opacity-[0.05] ${isLightTheme ? 'filter invert' : ''}`}
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 0V20M0 1H20\' stroke=\'white\'/%3E%3C/svg%3E")',
          backgroundSize: '20px 20px'
        }}>
      </div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-xl mx-auto text-center">
        {/* Time Display - Now showing countdown first for better visibility */}
        <motion.div
          className="mb-12 text-center z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          {/* Countdown timer - Now showing first and always visible */}
          <div className="flex flex-col items-center space-y-4 mb-8">
            <div className="relative">
              {/* Ouroborus effect overlay */}
              {ouroborusEnabled && (
                <OuroborusEffect
                  preset={ouroborusPreset}
                  className="rounded-xl"
                />
              )}
              <motion.div
                className={`text-8xl font-bold ${getTextClass()} tracking-tighter relative z-10`}
                animate={{
                  scale: [1, 1.02, 1],
                  opacity: 1
                }}
                initial={{ opacity: 0 }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut",
                  opacity: { delay: 0.7 }
                }}
              >
                {formatCountdown()}
              </motion.div>
            </div>

            <motion.div
              className={`text-sm uppercase tracking-wider ${getUntilClass()} mb-5`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Until {nextPeriodName || "Next School Day"}
            </motion.div>

            {/* Progress bar */}
            <div className={`w-full h-2 ${getProgressBgClass()} rounded-full overflow-hidden mt-2`}>
              <motion.div
                className={`h-full ${getProgressFgClass()}`}
                style={{ width: `${progress * 100}%` }}
                animate={{
                  backgroundColor: isLightTheme
                    ? ['rgba(51,51,51,0.7)', 'rgba(51,51,51,0.5)', 'rgba(51,51,51,0.7)']
                    : ['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0.7)'],
                }}
                transition={{ repeat: Infinity, duration: 3 }}
              />
            </div>
          </div>

          {/* Current time - Now showing second */}
          <motion.h1
            className={`text-4xl font-bold ${getTextClass()} tracking-tighter mb-4`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {formatTime(currentTime)}
          </motion.h1>

          <motion.div
            className={`text-4xl font-medium ${getSubTextClass()} mb-2`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {currentPeriod}
          </motion.div>

          <motion.div
            className={`text-xl font-light ${getLightTextClass()} mb-8`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {scheduleName}
          </motion.div>
        </motion.div>

        {/* Simplified footer - year only */}
        <motion.div
          className={`absolute bottom-8 left-0 right-0 text-center ${getFooterClass()} text-xs tracking-widest uppercase`}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 4 }}
        >
          {currentTime.getFullYear()}
        </motion.div>
      </div>
    </div>
  );
}

export default BellTimer;
export { BellTimer };
