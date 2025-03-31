'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { schedules, Schedule, Period, getCurrentDaySchedule, assemblyToPeriodMap, getAssemblyPeriodName } from '@/data/schedules';
import { ScheduleSelector } from './ScheduleSelector';
import { updateFavicon } from '@/lib/favicons';

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

  // Ref for tracking the last time update
  const lastUpdateTimeRef = useRef<number>(Date.now());
  // Use ref for storing the countdown interval ID
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // State for countdown display
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [showCountdown, setShowCountdown] = useState<boolean>(false);
  const [isOutsideSchoolHours, setIsOutsideSchoolHours] = useState<boolean>(false);

  // Set mounted state to true when component mounts
  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

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

  // Function to parse time string to Date object
  const parseTimeString = useCallback((timeStr: string): Date => {
    const now = new Date();
    const isPM = timeStr.toLowerCase().includes('pm');
    const isAM = timeStr.toLowerCase().includes('am');

    // Remove AM/PM indicators for parsing
    let cleanTimeStr = timeStr.replace(/\s*(am|pm)\s*/i, '');

    const [hoursStr, minutesStr] = cleanTimeStr.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    // Handle 12-hour format conversion
    if (isPM && hours < 12) {
      hours += 12;
    } else if (isAM && hours === 12) {
      hours = 0;
    }

    // Handle special case for school schedule: when hours are less than 8, assume PM
    // e.g., "1:28" should be interpreted as 13:28
    if (!isPM && !isAM && hours < 8 && hours !== 0) {
      hours += 12;
    }

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }, []);

  // Function to set time values without depending on the existing values
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

  // Calculate time until next school day at 8:25 AM if outside school hours
  const calculateTimeUntilNextSchoolDay = useCallback(() => {
    const now = new Date();
    console.log(`Calculating time until next school day from ${now.toLocaleString()}`);

    // Clone current date for tomorrow
    const tomorrow = new Date(now);

    // Move to next day
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Set to 8:25 AM (school start time)
    tomorrow.setHours(8, 25, 0, 0);

    // Skip weekends
    const tomorrowDay = tomorrow.getDay();
    if (tomorrowDay === 0) { // Sunday
      console.log("Tomorrow is Sunday, skipping to Monday");
      tomorrow.setDate(tomorrow.getDate() + 1); // Move to Monday
    } else if (tomorrowDay === 6) { // Saturday
      console.log("Tomorrow is Saturday, skipping to Monday");
      tomorrow.setDate(tomorrow.getDate() + 2); // Move to Monday
    }

    // Special case: If it's already past the start time today, use that time
    if (now.getHours() < 8 || (now.getHours() === 8 && now.getMinutes() < 25)) {
      // It's before 8:25 AM today, use today's start time instead
      const todayStart = new Date(now);
      todayStart.setHours(8, 25, 0, 0);

      // Only use today's start time if it's a weekday
      const todayDay = now.getDay();
      if (todayDay >= 1 && todayDay <= 5) { // Monday to Friday
        console.log(`It's before school hours today (weekday), using today's start time: ${todayStart.toLocaleString()}`);
        tomorrow.setTime(todayStart.getTime());
      }
    }

    // Calculate time difference
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

      // Log for debugging
      console.log(`Finding period for ${now.toLocaleTimeString()} in schedule: ${activeSchedule.displayName}`);

      // Get the first and last periods for boundary checks
      const firstPeriodStart = parseTimeString(periods[0].startTime);
      const lastPeriodEnd = parseTimeString(periods[periods.length - 1].endTime);

      // For debugging
      console.log(`School hours: ${firstPeriodStart.toLocaleTimeString()} to ${lastPeriodEnd.toLocaleTimeString()}`);
      console.log(`Current time: ${now.toLocaleTimeString()}`);

      // Check if we're outside of school hours
      if (now < firstPeriodStart || now >= lastPeriodEnd) {
        console.log("Outside school hours, setting to Free period");
        setCurrentPeriod("Free");
        setNextPeriodName("Next School Day");
        setIsOutsideSchoolHours(true);

        // Calculate time until next school day
        const nextDayMs = calculateTimeUntilNextSchoolDay();
        // Use the separate function to set time values without creating dependency loops
        setTimeValues(nextDayMs);
        setProgress(1); // Completed current day
        return;
      }

      setIsOutsideSchoolHours(false);

      // Loop through periods to find current one
      for (let i = 0; i < periods.length - 1; i++) {
        const currentPeriodStart = parseTimeString(periods[i].startTime);
        const nextPeriodStart = parseTimeString(periods[i + 1].startTime);

        // For debugging
        console.log(`Period ${periods[i].name}: ${currentPeriodStart.toLocaleTimeString()} to ${nextPeriodStart.toLocaleTimeString()}`);

        if (now >= currentPeriodStart && now < nextPeriodStart) {
          const periodName = periods[i].name;
          let displayName = periodName;

          // For assembly schedule, map letters to period names
          if (currentSchedule === 'assembly') {
            displayName = getAssemblyPeriodName(assemblyLetter, periodName);
          }

          console.log(`Found period: ${displayName}`);
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

          console.log(`Time remaining: ${Math.floor(remainingMs / 1000)} seconds`);

          // Use the separate function to set time values
          setTimeValues(remainingMs);
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

      console.log(`In last period: ${lastPeriodDisplayName}`);
      setCurrentPeriod(lastPeriodDisplayName);
      setNextPeriodName("Next School Day");
      setIsOutsideSchoolHours(true);

      // Calculate time until next school day
      const nextDayMs = calculateTimeUntilNextSchoolDay();
      // Use the separate function to set time values
      setTimeValues(nextDayMs);
      setProgress(1); // Completed
    } catch (error) {
      console.error("Error finding current period:", error);
      // Fallback to a safe state
      setCurrentPeriod("Error");
      setNextPeriodName("Unable to determine");
      setIsOutsideSchoolHours(true);
    }
  }, [activeSchedule, assemblyLetter, currentSchedule, parseTimeString, calculateTimeUntilNextSchoolDay, setTimeValues]);

  // Initialize the timer with the current schedule
  useEffect(() => {
    if (!mounted) return;

    console.log("Initializing timer with current schedule");

    // Get the current time and day
    const now = new Date();
    console.log(`Current time: ${now.toLocaleString()}`);
    setCurrentTime(now);

    // Initialize with current day's schedule based on actual day of the week
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.

    // Map day number to schedule name
    let scheduleKey: string;
    switch (dayOfWeek) {
      case 0: scheduleKey = 'sunday'; break;
      case 1: scheduleKey = 'monday'; break;
      case 2: scheduleKey = 'tuesday'; break;
      case 3: scheduleKey = 'wednesday'; break;
      case 4: scheduleKey = 'thursday'; break;
      case 5: scheduleKey = 'friday'; break;
      case 6: scheduleKey = 'saturday'; break;
      default: scheduleKey = 'monday'; // Fallback (should never happen)
    }

    console.log(`Setting initial schedule to: ${scheduleKey}`);

    // Get the schedule for today
    const todaySchedule = schedules[scheduleKey];

    // Update state with the correct schedule
    setActiveSchedule(todaySchedule);
    setCurrentSchedule(scheduleKey);
    setScheduleName(todaySchedule.displayName);

    // Find the current period right away
    findCurrentPeriod(now);

    // Initialize the last update time reference
    lastUpdateTimeRef.current = Date.now();

    // Initialize the favicon with a default
    updateFavicon(60, 0, false);

    // Notify parent component of the schedule change
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

  // Format time as HH:MM with proper formatting
  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Function to format time as HH:MM:SS (removed milliseconds)
  const formatCountdown = useCallback(() => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [hours, minutes, seconds]);

  const updateCountdown = useCallback(() => {
    // Get current time to calculate exact difference from last update
    const now = Date.now();
    const timeDiff = now - lastUpdateTimeRef.current;
    lastUpdateTimeRef.current = now;

    // Calculate remaining time more accurately
    let remainingMs: number;
    if (isOutsideSchoolHours) {
      // For outside school hours, recalculate the full time until next day
      remainingMs = calculateTimeUntilNextSchoolDay();
    } else if (timeLeftMs > 0) {
      // Subtract the exact time elapsed since last update (not just 1000ms)
      remainingMs = Math.max(0, timeLeftMs - timeDiff);
    } else {
      remainingMs = 0;
    }

    // Calculate hours, minutes, seconds with precise values
    const hrs = Math.floor(remainingMs / 3600000);
    const mins = Math.floor((remainingMs % 3600000) / 60000);
    const secs = Math.floor((remainingMs % 60000) / 1000);

    // Batch state updates to prevent excessive re-renders
    const shouldUpdateTimeLeft = remainingMs !== timeLeftMs;
    const shouldUpdateHours = hrs !== hours;
    const shouldUpdateMinutes = mins !== minutes;
    const shouldUpdateSeconds = secs !== seconds;
    const shouldUpdateCountdownVisibility = !showCountdown;

    if (shouldUpdateTimeLeft || shouldUpdateHours || shouldUpdateMinutes ||
        shouldUpdateSeconds || shouldUpdateCountdownVisibility) {
      // Update all time-related states at once to avoid multiple re-renders
      if (shouldUpdateTimeLeft) setTimeLeftMs(remainingMs);
      if (shouldUpdateHours) setHours(hrs);
      if (shouldUpdateMinutes) setMinutes(mins);
      if (shouldUpdateSeconds) setSeconds(secs);
      if (shouldUpdateCountdownVisibility) setShowCountdown(true);
    }

    // Update the favicon based on remaining time
    try {
      updateFavicon(mins, secs, isOutsideSchoolHours);
    } catch (error) {
      console.error("Favicon update error:", error);
    }

    // Also update the tab title immediately after updating the time values
    // This ensures the tab title and countdown display stay perfectly in sync
    if (mounted && currentPeriod !== 'Loading...') {
      let titleText = '';
      let displayPeriod = currentPeriod;

      // For assembly schedule, make period display clearer
      if (currentSchedule === 'assembly') {
        // If the current period is just a letter (A-H), add context
        if (/^[A-H]$/.test(currentPeriod)) {
          // Check if it's the assembly period
          if (currentPeriod === assemblyLetter) {
            displayPeriod = 'Assembly';
          } else {
            // Convert to regular period name
            displayPeriod = assemblyToPeriodMap[currentPeriod] || currentPeriod;
          }
        }
      }

      // Handle the case when outside school hours or in "Free" period
      if (isOutsideSchoolHours || currentPeriod === 'Free') {
        if (hrs > 0) {
          // Format as HH:MM:SS if more than an hour
          titleText = `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
          // Format as MM:SS if less than an hour
          titleText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        // Use more descriptive text for the "next" item
        let nextDisplay = nextPeriodName;
        if (nextPeriodName === 'Next School Day') {
          nextDisplay = 'Next Day';
        } else if (currentSchedule === 'assembly' && /^[A-H]$/.test(nextPeriodName)) {
          // Convert next period to regular period name for assembly schedule
          if (nextPeriodName === assemblyLetter) {
            nextDisplay = 'Assembly';
          } else {
            nextDisplay = assemblyToPeriodMap[nextPeriodName] || nextPeriodName;
          }
        }

        titleText += ` | ${nextDisplay}`;
      } else {
        // Regular period within school hours
        if (hrs > 0) {
          // Format as HH:MM:SS if more than an hour
          titleText = `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
          // Format as MM:SS if less than an hour
          titleText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        titleText += ` | ${displayPeriod}`;
      }

      // Update the document title
      document.title = titleText;
    }
  // Important: Remove timeLeftMs from dependencies to prevent infinite loops
  }, [isOutsideSchoolHours, calculateTimeUntilNextSchoolDay, mounted, currentPeriod,
      currentSchedule, assemblyLetter, nextPeriodName, hours, minutes, seconds, showCountdown]);

  // Ensure time is correctly displayed when rendered
  useEffect(() => {
    if (mounted) {
      // Check if we need to update the current period
      findCurrentPeriod(currentTime);
    }
  }, [currentTime, findCurrentPeriod, mounted]);

  // Update countdown display with precise timing
  useEffect(() => {
    if (!mounted) return;

    // Initial update
    updateCountdown();

    // Create a reliable interval that updates every second
    const intervalId = setInterval(() => {
      updateCountdown();
    }, 1000);

    // Clear on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [updateCountdown, mounted]);

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

  useEffect(() => {
    if (!mounted) return;

    // Initialize on mount
    const now = new Date();
    setCurrentTime(now);
    findCurrentPeriod(now);
    lastUpdateTimeRef.current = Date.now();

    // Update time every second
    const timeInterval = setInterval(() => {
      const currentTime = new Date();
      setCurrentTime(currentTime);
      findCurrentPeriod(currentTime);
    }, 1000);

    return () => {
      clearInterval(timeInterval);
    };
  }, [findCurrentPeriod, mounted]);

  // Cleanup function for document title when component unmounts
  useEffect(() => {
    return () => {
      // Reset document title on unmount
      document.title = "Bell Timer";

      // Reset favicon to default
      updateFavicon(60, 0, true); // Use outside school hours mode for default
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
      {/* Schedule Selector */}
      <ScheduleSelector
        currentSchedule={currentSchedule}
        onScheduleChange={handleScheduleChange}
        onAssemblyLetterChange={handleAssemblyLetterChange}
      />

      {/* Minimal background gradient - changes with theme */}
      <div className={`absolute inset-0 bg-gradient-to-r ${
        isLightTheme
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
