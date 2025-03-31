'use client';

import { useEffect, useState, useCallback, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { schedules, Schedule, Period, getCurrentDaySchedule, assemblyToPeriodMap, getAssemblyPeriodName } from '@/data/schedules';
import { ScheduleSelector } from './ScheduleSelector';
import { updateFavicon } from '@/lib/favicons';

interface BellTimerProps {
  onScheduleUpdate?: (schedule: Schedule, assemblyLetter?: string) => void;
}

// Export the BellTimer component wrapped with memo for performance optimization
export const BellTimer = memo(function BellTimer({ onScheduleUpdate }: BellTimerProps) {
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
  const [use12HourFormat, setUse12HourFormat] = useState(false);

  // We'll use these refs to improve timing precision
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const lastFaviconUpdateRef = useRef<number>(0);
  const lastTitleUpdateRef = useRef<number>(0);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [showCountdown, setShowCountdown] = useState<boolean>(false);
  const [isOutsideSchoolHours, setIsOutsideSchoolHours] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    const checkTheme = () => {
      const isLight = document.documentElement.classList.contains('light-theme');
      setIsLightTheme(isLight);
    };

    const checkClockFormat = () => {
      const use12Hour = localStorage.getItem('bell-timer-12hour-clock') === 'true';
      setUse12HourFormat(use12Hour);
    };

    checkTheme();
    checkClockFormat();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    const handleClockFormatChange = () => {
      checkClockFormat();
    };

    window.addEventListener('clockFormatChanged', handleClockFormatChange);

    return () => {
      observer.disconnect();
      window.removeEventListener('clockFormatChanged', handleClockFormatChange);
    };
  }, []);

  const parseTimeString = useCallback((timeStr: string): Date => {
    const now = new Date();
    const isPM = timeStr.toLowerCase().includes('pm');
    const isAM = timeStr.toLowerCase().includes('am');

    const cleanTimeStr = timeStr.replace(/\s*(am|pm)\s*/i, '');

    const [hoursStr, minutesStr] = cleanTimeStr.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (isPM && hours < 12) {
      hours += 12;
    } else if (isAM && hours === 12) {
      hours = 0;
    }

    if (!isPM && !isAM) {
      if ((hours >= 1 && hours <= 6) || hours === 12) {
        if (hours !== 12) hours += 12;
      }
    }

    const date = new Date(now);
    date.setHours(hours, minutes, 0, 0);

    return date;
  }, []);

  const setTimeValues = useCallback((remainingMs: number) => {
    const hrs = Math.floor(remainingMs / 3600000);
    const mins = Math.floor((remainingMs % 3600000) / 60000);
    const secs = Math.floor((remainingMs % 60000) / 1000);

    setTimeLeftMs(remainingMs);
    setHours(hrs);
    setMinutes(mins);
    setSeconds(secs);
    setShowCountdown(true);
  }, []);

  const calculateTimeUntilNextSchoolDay = useCallback(() => {
    const now = new Date();
    console.log(`Calculating time until next school day from ${now.toLocaleString()}`);

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 25, 0, 0);

    const tomorrowDay = tomorrow.getDay();
    if (tomorrowDay === 0) {
      console.log("Tomorrow is Sunday, skipping to Monday");
      tomorrow.setDate(tomorrow.getDate() + 1);
    } else if (tomorrowDay === 6) {
      console.log("Tomorrow is Saturday, skipping to Monday");
      tomorrow.setDate(tomorrow.getDate() + 2);
    }

    if (now.getHours() < 8 || (now.getHours() === 8 && now.getMinutes() < 25)) {
      const todayStart = new Date(now);
      todayStart.setHours(8, 25, 0, 0);
      const todayDay = now.getDay();
      if (todayDay >= 1 && todayDay <= 5) {
        console.log(`It's before school hours today (weekday), using today's start time: ${todayStart.toLocaleString()}`);
        tomorrow.setTime(todayStart.getTime());
      }
    }

    const timeLeftMs = tomorrow.getTime() - now.getTime();
    console.log(`Next school day at: ${tomorrow.toLocaleString()}`);
    console.log(`Time until next school day: ${Math.floor(timeLeftMs / 1000 / 60)} minutes`);

    return timeLeftMs;
  }, []);

  // Function to find current period based on time
  const findCurrentPeriod = useCallback((now: Date): void => {
    if (!activeSchedule || !activeSchedule.periods || activeSchedule.periods.length === 0) {
      console.error("No schedule available or schedule has no periods");
      setCurrentPeriod("No schedule available");
      return;
    }

    try {
      const periods = activeSchedule.periods;

      console.log(`Finding period for ${now.toLocaleTimeString()} in schedule: ${activeSchedule.displayName}`);

      // Check for warning bell separately - it's a special case with no duration
      for (let i = 0; i < periods.length; i++) {
        if (periods[i].name === "Warning Bell") {
          const warningBellTime = parseTimeString(periods[i].startTime);
          const endWarningBellTime = parseTimeString(periods[i].endTime);

          // If current time is at warning bell time (within a minute window)
          if (now >= warningBellTime && now < endWarningBellTime) {
            console.log("Currently at Warning Bell");
            setCurrentPeriod("Warning Bell");

            // Set next period
            if (i < periods.length - 1) {
              setNextPeriodName(periods[i + 1].name);

              // Calculate remaining time
              const nextPeriodStart = parseTimeString(periods[i + 1].startTime);
              const remainingMs = nextPeriodStart.getTime() - now.getTime();
              setTimeValues(remainingMs);
              setProgress(0);
            }
            return;
          }
        }
      }

      const firstPeriodStart = parseTimeString(periods[0].startTime);
      const lastPeriodEnd = parseTimeString(periods[periods.length - 1].endTime);

      console.log(`School hours: ${firstPeriodStart.toLocaleTimeString()} to ${lastPeriodEnd.toLocaleTimeString()}`);
      console.log(`Current time: ${now.toLocaleTimeString()}`);

      if (now < firstPeriodStart || now >= lastPeriodEnd) {
        console.log("Outside school hours, setting to Free period");
        setCurrentPeriod("Free");
        setNextPeriodName("Next School Day");
        setIsOutsideSchoolHours(true);

        const nextDayMs = calculateTimeUntilNextSchoolDay();
        setTimeValues(nextDayMs);
        setProgress(1);
        return;
      }

      setIsOutsideSchoolHours(false);

      for (let i = 0; i < periods.length - 1; i++) {
        if (periods[i].name === "Warning Bell") continue;

        const currentPeriodStart = parseTimeString(periods[i].startTime);
        const currentPeriodEnd = parseTimeString(periods[i].endTime);
        const nextPeriodStart = parseTimeString(periods[i + 1].startTime);

        console.log(`Checking ${periods[i].name}: ${currentPeriodStart.toLocaleTimeString()} to ${currentPeriodEnd.toLocaleTimeString()}`);

        if (now >= currentPeriodStart && now < currentPeriodEnd) {
          const periodName = periods[i].name;
          let displayName = periodName;

          if (currentSchedule === 'assembly') {
            displayName = getAssemblyPeriodName(assemblyLetter, periodName);
          }

          console.log(`Found period: ${displayName}`);
          setCurrentPeriod(displayName);

          let nextPeriodDisplayName = periods[i + 1].name;
          if (currentSchedule === 'assembly' && nextPeriodDisplayName !== "Free") {
            nextPeriodDisplayName = getAssemblyPeriodName(assemblyLetter, nextPeriodDisplayName);
          }

          setNextPeriodName(nextPeriodDisplayName);

          const totalMs = currentPeriodEnd.getTime() - currentPeriodStart.getTime();
          const elapsedMs = now.getTime() - currentPeriodStart.getTime();
          const remainingMs = currentPeriodEnd.getTime() - now.getTime();

          console.log(`Time remaining in period: ${Math.floor(remainingMs / 1000)} seconds`);

          setTimeValues(remainingMs);
          setTotalTimeMs(totalMs);
          setProgress(Math.min(1, elapsedMs / totalMs));
          return;
        }

        if (now >= currentPeriodEnd && now < nextPeriodStart) {
          console.log(`In passing period between ${periods[i].name} and ${periods[i + 1].name}`);

          setCurrentPeriod("Passing");

          let nextPeriodDisplayName = periods[i + 1].name;
          if (currentSchedule === 'assembly' && nextPeriodDisplayName !== "Free") {
            nextPeriodDisplayName = getAssemblyPeriodName(assemblyLetter, nextPeriodDisplayName);
          }

          setNextPeriodName(nextPeriodDisplayName);

          const totalPassingMs = nextPeriodStart.getTime() - currentPeriodEnd.getTime();
          const elapsedPassingMs = now.getTime() - currentPeriodEnd.getTime();
          const remainingPassingMs = nextPeriodStart.getTime() - now.getTime();

          setTimeValues(remainingPassingMs);
          setTotalTimeMs(totalPassingMs);
          setProgress(Math.min(1, elapsedPassingMs / totalPassingMs));
          return;
        }
      }

      const lastPeriod = periods[periods.length - 1];
      let lastPeriodDisplayName = lastPeriod.name;
      if (currentSchedule === 'assembly' && lastPeriodDisplayName !== "Free") {
        lastPeriodDisplayName = getAssemblyPeriodName(assemblyLetter, lastPeriodDisplayName);
      }

      const lastPeriodStart = parseTimeString(lastPeriod.startTime);
      const finalPeriodEnd = parseTimeString(lastPeriod.endTime);

      if (now >= lastPeriodStart && now < finalPeriodEnd) {
        console.log(`In last period: ${lastPeriodDisplayName}`);
        setCurrentPeriod(lastPeriodDisplayName);
        setNextPeriodName("Free");

        const totalMs = finalPeriodEnd.getTime() - lastPeriodStart.getTime();
        const elapsedMs = now.getTime() - lastPeriodStart.getTime();
        const remainingMs = finalPeriodEnd.getTime() - now.getTime();

        setTimeValues(remainingMs);
        setTotalTimeMs(totalMs);
        setProgress(Math.min(1, elapsedMs / totalMs));
        return;
      }

      console.error("Could not determine current period with precision");
      setCurrentPeriod("Free");
      setNextPeriodName("Next School Day");
      setIsOutsideSchoolHours(true);
      const nextDayMs = calculateTimeUntilNextSchoolDay();
      setTimeValues(nextDayMs);
      setProgress(1);

    } catch (error) {
      console.error("Error finding current period:", error);
      setCurrentPeriod("Error");
      setNextPeriodName("Unable to determine");
      setIsOutsideSchoolHours(true);
    }
  }, [activeSchedule, assemblyLetter, currentSchedule, parseTimeString, calculateTimeUntilNextSchoolDay, setTimeValues]);

  useEffect(() => {
    if (!mounted) return;

    console.log("Initializing timer with current schedule");

    const now = new Date();
    console.log(`Current time: ${now.toLocaleString()}`);
    setCurrentTime(now);

    const dayOfWeek = now.getDay();
    let scheduleKey: string;
    switch (dayOfWeek) {
      case 0: scheduleKey = 'sunday'; break;
      case 1: scheduleKey = 'monday'; break;
      case 2: scheduleKey = 'tuesday'; break;
      case 3: scheduleKey = 'wednesday'; break;
      case 4: scheduleKey = 'thursday'; break;
      case 5: scheduleKey = 'friday'; break;
      case 6: scheduleKey = 'saturday'; break;
      default: scheduleKey = 'monday';
    }

    console.log(`Setting initial schedule to: ${scheduleKey}`);

    const todaySchedule = schedules[scheduleKey];

    setActiveSchedule(todaySchedule);
    setCurrentSchedule(scheduleKey);
    setScheduleName(todaySchedule.displayName);

    findCurrentPeriod(now);

    lastUpdateTimeRef.current = Date.now();

    updateFavicon(60, 0, false);

    if (onScheduleUpdate) {
      onScheduleUpdate(todaySchedule);
    }
  }, [mounted, findCurrentPeriod, onScheduleUpdate]);

  const handleScheduleChange = useCallback((scheduleName: string) => {
    const newSchedule = schedules[scheduleName];
    if (newSchedule) {
      setActiveSchedule(newSchedule);
      setCurrentSchedule(scheduleName);
      setScheduleName(newSchedule.displayName);

      if (onScheduleUpdate) {
        onScheduleUpdate(newSchedule, assemblyLetter);
      }
    }
  }, [assemblyLetter, onScheduleUpdate]);

  const handleAssemblyLetterChange = useCallback((letter: string) => {
    setAssemblyLetter(letter);

    if (onScheduleUpdate && currentSchedule === 'assembly') {
      onScheduleUpdate(activeSchedule, letter);
    }
  }, [activeSchedule, currentSchedule, onScheduleUpdate]);

  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    if (use12HourFormat) {
      const hour12 = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } else {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  };

  const formatCountdown = useCallback(() => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []); // Remove unnecessary dependencies

  // The updateCountdown function with improved timing
  const updateCountdown = useCallback(() => {
    // Get current time from system clock for accuracy
    const now = new Date();
    const currentTimeMs = now.getTime();
    const timeDiff = currentTimeMs - lastUpdateTimeRef.current;
    lastUpdateTimeRef.current = currentTimeMs;

    // Set current time for period calculations
    setCurrentTime(now);

    let remainingMs: number = 0;
    let nextEventName: string = nextPeriodName;
    
    if (isOutsideSchoolHours) {
      remainingMs = calculateTimeUntilNextSchoolDay();
      nextEventName = "Next School Day";
    } else if (timeLeftMs > 0) {
      // Calculate remaining time based on actual system time, not the interval
      remainingMs = Math.max(0, timeLeftMs - timeDiff);
    } else if (activeSchedule && activeSchedule.periods) {
      // If we're at the end of a period, find the next period
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeMinutes = currentHour * 60 + currentMinute;
      
      // Find the next period that hasn't started yet
      let foundNextPeriod = false;
      for (let i = 0; i < activeSchedule.periods.length - 1; i++) {
        const periodStart = parseTimeString(activeSchedule.periods[i].startTime);
        const periodStartMinutes = periodStart.getHours() * 60 + periodStart.getMinutes();
        
        if (currentTimeMinutes < periodStartMinutes) {
          // Found the next period
          remainingMs = periodStart.getTime() - now.getTime();
          nextEventName = activeSchedule.periods[i].name;
          setNextPeriodName(nextEventName);
          foundNextPeriod = true;
          break;
        }
      }
      
      // If no next period found, use end of day
      if (!foundNextPeriod) {
        remainingMs = calculateTimeUntilNextSchoolDay();
        nextEventName = "Next School Day";
        setNextPeriodName(nextEventName);
      }
    }

    // Calculate exact seconds without rounding for more accurate display
    const totalSeconds = Math.floor(remainingMs / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    // Always update time values to ensure accuracy
    setTimeLeftMs(remainingMs);
    setHours(hrs);
    setMinutes(mins);
    setSeconds(secs);
    
    if (!showCountdown) {
      setShowCountdown(true);
    }

    // Update progress bar
    if (totalTimeMs > 0) {
      const newProgress = Math.max(0, Math.min(100, 100 - (remainingMs / totalTimeMs) * 100));
      setProgress(newProgress);
    }

    try {
      // Always update favicon to ensure consistency
      updateFavicon(mins, secs, isOutsideSchoolHours);
    } catch (error) {
      console.error("Favicon update error:", error);
    }

    // Update the document title immediately
    if (mounted && currentPeriod !== 'Loading...') {
      let titleText = '';
      let displayPeriod = currentPeriod;

      if (currentSchedule === 'assembly') {
        if (/^[A-H]$/.test(currentPeriod)) {
          if (currentPeriod === assemblyLetter) {
            displayPeriod = 'Assembly';
          } else {
            displayPeriod = assemblyToPeriodMap[currentPeriod] || currentPeriod;
          }
        }
      }

      // Format the countdown for the title
      if (hrs > 0) {
        titleText = `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      } else {
        titleText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      
      // Add the next event information
      let displayNextEvent = nextEventName;
      if (nextEventName === 'Next School Day') {
        displayNextEvent = 'Next Day';
      } else if (currentSchedule === 'assembly' && /^[A-H]$/.test(nextEventName)) {
        if (nextEventName === assemblyLetter) {
          displayNextEvent = 'Assembly';
        } else {
          displayNextEvent = assemblyToPeriodMap[nextEventName] || nextEventName;
        }
      }
      
      titleText += ` | ${displayNextEvent}`;
      
      // Set the document title directly without checking if it's changed
      document.title = titleText;
    }
  }, [isOutsideSchoolHours, calculateTimeUntilNextSchoolDay, mounted, currentPeriod,
      currentSchedule, assemblyLetter, nextPeriodName, hours, minutes, seconds, showCountdown, timeLeftMs, totalTimeMs, activeSchedule, parseTimeString]);

  // Replace the setInterval effect with requestAnimationFrame for smoother updates
  useEffect(() => {
    if (!mounted) return;

    // Initial update
    updateCountdown();

    // Use requestAnimationFrame for smoother animation
    let animationFrameId: number;
    let lastSecond = -1;
    
    const updateFrame = () => {
      const now = new Date();
      const currentSecond = now.getSeconds();
      
      // Only update when the second changes
      if (currentSecond !== lastSecond) {
        lastSecond = currentSecond;
        updateCountdown();
      }
      
      // Request next frame
      animationFrameId = requestAnimationFrame(updateFrame);
    };
    
    // Start animation loop
    animationFrameId = requestAnimationFrame(updateFrame);
    
    // Backup interval to ensure updates even when tab is inactive
    const backupIntervalId = setInterval(() => {
      const now = new Date();
      const currentSecond = now.getSeconds();
      
      // If the second has changed since our last update, force an update
      if (currentSecond !== lastSecond) {
        lastSecond = currentSecond;
        updateCountdown();
      }
    }, 100); // Check frequently to catch any missed seconds
    
    return () => {
      // Clean up all timers
      cancelAnimationFrame(animationFrameId);
      clearInterval(backupIntervalId);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [updateCountdown, mounted]);

  // This effect runs when the current time changes to update the period
  useEffect(() => {
    if (mounted) {
      findCurrentPeriod(currentTime);
    }
  }, [currentTime, findCurrentPeriod, mounted]);

  // Add visibility change detection to ensure timer accuracy when tab becomes active again
  useEffect(() => {
    if (!mounted) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Force an immediate update when tab becomes visible again
        updateCountdown();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mounted, updateCountdown]);

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

  const applyLightTheme = useCallback(() => {
    document.documentElement.classList.add('light-theme');

    document.body.style.transition = 'background-color 0.8s cubic-bezier(0.34, 0.01, 0.24, 1.0)';
    document.body.style.backgroundColor = '#f0f2f5';

    const gridBg = document.querySelector('.absolute.inset-0.z-\\[1\\]') as HTMLElement;
    if (gridBg) {
      gridBg.style.transition = 'opacity 0.8s cubic-bezier(0.34, 0.01, 0.24, 1.0), filter 0.8s cubic-bezier(0.34, 0.01, 0.24, 1.0)';
      gridBg.style.opacity = '0.05';
      gridBg.style.filter = 'invert(1)';
    }

    const gradientBg = document.querySelector('.absolute.inset-0.bg-gradient-to-r') as HTMLElement;
    if (gradientBg) {
      gradientBg.style.transition = 'background-color 0.8s cubic-bezier(0.34, 0.01, 0.24, 1.0)';
      gradientBg.classList.remove('from-[#151718]', 'to-[#292f33]');
      gradientBg.classList.add('from-[#f0f2f5]', 'to-[#e4e6eb]');
    }
  }, []);

  const applyDarkTheme = useCallback(() => {
    document.documentElement.classList.remove('light-theme');

    document.body.style.transition = 'background-color 0.8s cubic-bezier(0.34, 0.01, 0.24, 1.0)';
    document.body.style.backgroundColor = '#151718';

    const gridBg = document.querySelector('.absolute.inset-0.z-\\[1\\]') as HTMLElement;
    if (gridBg) {
      gridBg.style.transition = 'opacity 0.8s cubic-bezier(0.34, 0.01, 0.24, 1.0), filter 0.8s cubic-bezier(0.34, 0.01, 0.24, 1.0)';
      gridBg.style.opacity = '0.05';
      gridBg.style.filter = 'none';
    }

    const gradientBg = document.querySelector('.absolute.inset-0.bg-gradient-to-r') as HTMLElement;
    if (gradientBg) {
      gradientBg.style.transition = 'background-color 0.8s cubic-bezier(0.34, 0.01, 0.24, 1.0)';
      gradientBg.classList.remove('from-[#f0f2f5]', 'to-[#e4e6eb]');
      gradientBg.classList.add('from-[#151718]', 'to-[#292f33]');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const now = new Date();
    setCurrentTime(now);
    findCurrentPeriod(now);
    lastUpdateTimeRef.current = Date.now();

    const timeInterval = setInterval(() => {
      const currentTime = new Date();
      setCurrentTime(currentTime);
      findCurrentPeriod(currentTime);
    }, 1000);

    return () => {
      clearInterval(timeInterval);
    };
  }, [findCurrentPeriod, mounted]);

  useEffect(() => {
    return () => {
      document.title = "Bell Timer";
      updateFavicon(60, 0, true);
    };
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
      <ScheduleSelector
        currentSchedule={currentSchedule}
        onScheduleChange={handleScheduleChange}
        onAssemblyLetterChange={handleAssemblyLetterChange}
      />

      <div className={`absolute inset-0 bg-gradient-to-r ${
        isLightTheme
          ? 'from-[#f0f2f5] to-[#e4e6eb]'
          : 'from-[#151718] to-[#292f33]'
      } z-0`}></div>

      <div className={`absolute inset-0 z-[1] opacity-[0.05] ${isLightTheme ? 'filter invert' : ''}`}
           style={{
             backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 0V20M0 1H20\' stroke=\'white\'/%3E%3C/svg%3E")',
             backgroundSize: '20px 20px'
           }}>
      </div>

      <div className="relative z-10 w-full max-w-xl mx-auto text-center">
        <motion.div
          className="mb-12 text-center z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <div className="flex flex-col items-center space-y-4 mb-8">
            <motion.div
              className={`text-8xl font-bold ${getTextClass()} tracking-tighter countdown-timer`}
              animate={{
                scale: showCountdown ? [1, 1.02, 1] : 1,
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

            <motion.div
              className={`text-sm uppercase tracking-wider ${getUntilClass()} mb-5`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Until {nextPeriodName || "Next School Day"}
            </motion.div>

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
});

// Add displayName for better debugging
BellTimer.displayName = 'BellTimer';

export default BellTimer;
