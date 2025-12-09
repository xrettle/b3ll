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
  const [showScheduleSelector, setShowScheduleSelector] = useState(true);

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

  // Parse time string in format "HH:MM" to Date object
  const parseTimeString = useCallback((timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }, []);

  // Function to calculate time values (hours, minutes, seconds) from milliseconds
  const setTimeValues = useCallback((timeLeftMs: number) => {
    setTimeLeftMs(timeLeftMs);
    
    // Calculate hours, minutes, seconds
    const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);
    
    setHours(hours);
    setMinutes(minutes);
    setSeconds(seconds);
    
    // Only show countdown animation if there's actually time left
    setShowCountdown(timeLeftMs > 0);
  }, []);

  // Improved function to calculate time until next school day
  const calculateTimeUntilNextSchoolDay = useCallback((): number => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
    
    // Calculate next school day with warning bell time (8:25 AM)
    const nextSchoolDay = new Date(now);
    
    // If it's already past school hours (after 3:03 PM), go to next day
    if (currentHour >= 15 || (currentHour === 15 && currentMinute >= 3)) {
      nextSchoolDay.setDate(nextSchoolDay.getDate() + 1);
    }
    
    // Set time to warning bell (8:25 AM for most days, 9:12 AM for Wednesday)
    // First determine what day we're calculating for
    const targetDay = nextSchoolDay.getDay();
    
    if (targetDay === 3) { // Wednesday
      // Wednesday warning bell is at 9:12 AM
      nextSchoolDay.setHours(9, 12, 0, 0);
    } else {
      // All other school days warning bell is at 8:25 AM
      nextSchoolDay.setHours(8, 25, 0, 0);
    }
    
    // Skip weekends
    if (targetDay === 0) { // Sunday, add 1 day
      nextSchoolDay.setDate(nextSchoolDay.getDate() + 1);
      // Reset to 8:25 AM since it's now Monday
      nextSchoolDay.setHours(8, 25, 0, 0);
    } else if (targetDay === 6) { // Saturday, add 2 days
      nextSchoolDay.setDate(nextSchoolDay.getDate() + 2);
      // Reset to 8:25 AM since it's now Monday
      nextSchoolDay.setHours(8, 25, 0, 0);
    }
    
    // Calculate milliseconds until next school day warning bell
    const timeUntilNextWarningBell = nextSchoolDay.getTime() - now.getTime();
    
    console.log(`Next warning bell: ${nextSchoolDay.toLocaleString()}`);
    console.log(`Time until next warning bell: ${Math.floor(timeUntilNextWarningBell / 1000 / 60)} minutes`);
    
    // For progress calculation, we need to determine the total time span
    let totalTimeSpan = 0;
    let elapsedTime = 0;
    
    // If we're outside school hours (after 3:03 PM or before 8:25 AM)
    if (currentHour >= 15 || (currentHour === 15 && currentMinute >= 3) || 
        currentHour < 8 || (currentHour === 8 && currentMinute < 25)) {
      
      // Calculate total time from end of school day (3:03 PM) to next warning bell
      if (currentHour >= 15 || (currentHour === 15 && currentMinute >= 3)) {
        // After 3:03 PM
        const endOfSchoolDay = new Date(now);
        endOfSchoolDay.setHours(15, 3, 0, 0);
        
        totalTimeSpan = nextSchoolDay.getTime() - endOfSchoolDay.getTime();
        elapsedTime = now.getTime() - endOfSchoolDay.getTime();
      } else {
        // Before 8:25 AM (or 9:12 AM on Wednesday)
        const previousDay = new Date(now);
        previousDay.setDate(previousDay.getDate() - 1);
        previousDay.setHours(15, 3, 0, 0);
        
        // Check if previous day was a weekend
        const prevDayOfWeek = previousDay.getDay();
        if (prevDayOfWeek === 0 || prevDayOfWeek === 6) {
          // If previous day was weekend, use Friday 3:03 PM
          previousDay.setDate(previousDay.getDate() - (prevDayOfWeek === 0 ? 2 : 1));
        }
        
        totalTimeSpan = nextSchoolDay.getTime() - previousDay.getTime();
        elapsedTime = now.getTime() - previousDay.getTime();
      }
    } else {
      // During school hours, use the first period start and last period end
      const firstPeriodStart = new Date(now);
      firstPeriodStart.setHours(currentDay === 3 ? 9 : 8, currentDay === 3 ? 12 : 25, 0, 0);
      
      const lastPeriodEnd = new Date(now);
      lastPeriodEnd.setHours(15, 3, 0, 0);
      
      totalTimeSpan = lastPeriodEnd.getTime() - firstPeriodStart.getTime();
      elapsedTime = now.getTime() - firstPeriodStart.getTime();
    }
    
    // Set total time for progress calculation
    setTotalTimeMs(totalTimeSpan);
    
    // Calculate progress (elapsed time / total time)
    const progressValue = Math.min(1, Math.max(0, elapsedTime / totalTimeSpan));
    setProgress(progressValue);
    
    return timeUntilNextWarningBell;
  }, []);

  // Function to find current period
  const findCurrentPeriod = useCallback((now: Date): void => {
    if (!activeSchedule || !activeSchedule.periods || activeSchedule.periods.length === 0) {
      console.error("No schedule available or schedule has no periods");
      setCurrentPeriod("No schedule available");
      setNextPeriodName("Next Warning Bell");
      setIsOutsideSchoolHours(true);
      
      // Set default countdown values
      const nextDayMs = calculateTimeUntilNextSchoolDay();
      console.log(`Time until next warning bell: ${nextDayMs}ms`);
      setTimeValues(nextDayMs);
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
        setNextPeriodName("Next Warning Bell");
        setIsOutsideSchoolHours(true);

        const nextDayMs = calculateTimeUntilNextSchoolDay();
        setTimeValues(nextDayMs);
        // Progress is now calculated in calculateTimeUntilNextSchoolDay
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
      setNextPeriodName("Next Warning Bell");
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

  // Handle schedule change from the schedule selector
  const handleScheduleChange = useCallback((scheduleName: string) => {
    console.log(`Changing schedule to: ${scheduleName}`);
    const newSchedule = schedules[scheduleName];
    if (newSchedule) {
      setActiveSchedule(newSchedule);
      setCurrentSchedule(scheduleName);
      setScheduleName(newSchedule.displayName);
      
      // Save the selected schedule to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('bell-timer-schedule', scheduleName);
      }
      
      // Recalculate current period with the new schedule
      const now = new Date();
      findCurrentPeriod(now);

      if (onScheduleUpdate) {
        onScheduleUpdate(newSchedule, assemblyLetter);
      }
    }
  }, [assemblyLetter, onScheduleUpdate, findCurrentPeriod]);

  // Handle assembly letter change
  const handleAssemblyLetterChange = useCallback((letter: string) => {
    setAssemblyLetter(letter);

    if (onScheduleUpdate && currentSchedule === 'assembly') {
      onScheduleUpdate(activeSchedule, letter);
    }
  }, [activeSchedule, currentSchedule, onScheduleUpdate]);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    // Define the check functions outside to avoid recreating them on each render
    const checkTheme = () => {
      const isLight = document.documentElement.classList.contains('light-theme');
      if (isLight !== isLightTheme) {
        setIsLightTheme(isLight);
      }
    };

    const checkClockFormat = () => {
      const use12Hour = localStorage.getItem('bell-timer-12hour') === 'true';
      if (use12Hour !== use12HourFormat) {
        setUse12HourFormat(use12Hour);
      }
    };

    // Initial checks
    checkTheme();
    checkClockFormat();

    // Set up observer for theme changes
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
  }, [isLightTheme, use12HourFormat]); // Add dependencies to fix the missing dependencies warning

  useEffect(() => {
    if (!mounted) return;
    
    console.log("Initializing timer with current schedule");

    const now = new Date();
    console.log(`Current time: ${now.toLocaleString()}`);
    setCurrentTime(now);

    // Try to get saved schedule from localStorage first
    let scheduleKey: string;
    if (typeof window !== 'undefined') {
      const savedSchedule = localStorage.getItem('bell-timer-schedule');
      if (savedSchedule && schedules[savedSchedule]) {
        console.log(`Using saved schedule from localStorage: ${savedSchedule}`);
        scheduleKey = savedSchedule;
      } else {
        // Fall back to current day if no saved schedule
        const dayOfWeek = now.getDay();
        switch (dayOfWeek) {
          case 0: scheduleKey = 'holiday'; break; // Sunday
          case 1: scheduleKey = 'monday'; break;
          case 2: scheduleKey = 'tuesday'; break;
          case 3: scheduleKey = 'wednesday'; break;
          case 4: scheduleKey = 'thursday'; break;
          case 5: scheduleKey = 'friday'; break;
          case 6: scheduleKey = 'holiday'; break; // Saturday
          default: scheduleKey = 'monday';
        }
        console.log(`No saved schedule, using day-based schedule: ${scheduleKey}`);
      }
    } else {
      // Server-side rendering fallback
      scheduleKey = 'monday';
    }

    console.log(`Setting initial schedule to: ${scheduleKey}`);

    const selectedSchedule = schedules[scheduleKey];

    setActiveSchedule(selectedSchedule);
    setCurrentSchedule(scheduleKey);
    setScheduleName(selectedSchedule.displayName);

    findCurrentPeriod(now);

    lastUpdateTimeRef.current = Date.now();

    updateFavicon(60, 0, false);

    if (onScheduleUpdate) {
      onScheduleUpdate(selectedSchedule);
    }
  }, [mounted, findCurrentPeriod, onScheduleUpdate]);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Hide schedule selector when scrolled more than 50% of the window height
        if (scrollPosition > windowHeight * 0.5) {
          setShowScheduleSelector(false);
        } else {
          setShowScheduleSelector(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mounted]);

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
  }, [hours, minutes, seconds]);

  // The updateCountdown function with improved timing
  const updateCountdown = useCallback(() => {
    // Get current time from system clock for accuracy
    const now = new Date();
    const currentTimeMs = now.getTime();
    const timeDiff = currentTimeMs - lastUpdateTimeRef.current;
    lastUpdateTimeRef.current = currentTimeMs;

    // Set current time for period calculations
    setCurrentTime(now);

    // Log current state for debugging
    console.log(`Current time: ${now.toLocaleTimeString()}`);
    console.log(`isOutsideSchoolHours: ${isOutsideSchoolHours}`);
    console.log(`timeLeftMs: ${timeLeftMs}`);
    console.log(`Current hours:minutes:seconds: ${hours}:${minutes}:${seconds}`);

    let remainingMs: number = 0;
    let nextEventName: string = nextPeriodName;
    
    if (isOutsideSchoolHours) {
      // Calculate time until next school day warning bell
      remainingMs = calculateTimeUntilNextSchoolDay();
      console.log(`Time until next warning bell: ${remainingMs}ms`);
      nextEventName = "Next Warning Bell";
    } else if (timeLeftMs > 0) {
      // Calculate remaining time based on actual system time, not the interval
      remainingMs = Math.max(0, timeLeftMs - timeDiff);
      console.log(`Remaining time in current period: ${remainingMs}ms`);
    } else {
      // If we're at the end of a period, find the next period
      console.log("End of period reached, finding next period");
      findCurrentPeriod(now);
      return; // findCurrentPeriod will set the time values
    }

    // Update time values
    const totalSeconds = Math.floor(remainingMs / 1000);
    const hoursValue = Math.floor(totalSeconds / 3600);
    const minutesValue = Math.floor((totalSeconds % 3600) / 60);
    const secondsValue = totalSeconds % 60;
    
    console.log(`Setting countdown to: ${hoursValue}:${minutesValue}:${secondsValue}`);
    
    // Update state
    setTimeLeftMs(remainingMs);
    setHours(hoursValue);
    setMinutes(minutesValue);
    setSeconds(secondsValue);
    setShowCountdown(remainingMs > 0);
    
    // Update document title
    if (mounted) {
      const formattedTime = `${hoursValue.toString().padStart(2, '0')}:${minutesValue.toString().padStart(2, '0')}:${secondsValue.toString().padStart(2, '0')}`;
      let titleText = "";
      
      if (isOutsideSchoolHours) {
        titleText = `${formattedTime} until Next Warning Bell`;
      } else {
        const periodDisplay = currentPeriod === "Free" ? "School Day" : currentPeriod;
        titleText = `${formattedTime} until ${nextEventName} | ${periodDisplay}`;
      }
      
      // Set the document title directly
      document.title = titleText;
    }
  }, [isOutsideSchoolHours, calculateTimeUntilNextSchoolDay, mounted, currentPeriod,
      nextPeriodName, timeLeftMs, findCurrentPeriod, hours, minutes, seconds]);

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
      updateCountdown();
    }, 1000);
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When tab becomes visible again, update immediately
        updateCountdown();
        animationFrameId = requestAnimationFrame(updateFrame);
      } else {
        // When tab is hidden, cancel animation frame to save resources
        cancelAnimationFrame(animationFrameId);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
      clearInterval(backupIntervalId);
    };
  }, [mounted, updateCountdown]);

  // This effect runs when the current time changes to update the period
  useEffect(() => {
    if (mounted) {
      // Use a ref to track the last update time to prevent excessive updates
      const now = new Date();
      const lastUpdateTime = lastUpdateTimeRef.current;
      const timeDiff = now.getTime() - lastUpdateTime;
      
      // Only update if at least 500ms have passed since the last update
      if (timeDiff > 500) {
        findCurrentPeriod(currentTime);
      }
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
      document.title = "b3ll";
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
      {showScheduleSelector && (
        <ScheduleSelector
          currentSchedule={currentSchedule}
          onScheduleChange={handleScheduleChange}
          onAssemblyLetterChange={handleAssemblyLetterChange}
        />
      )}

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
              Until {nextPeriodName || "Next Warning Bell"}
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
