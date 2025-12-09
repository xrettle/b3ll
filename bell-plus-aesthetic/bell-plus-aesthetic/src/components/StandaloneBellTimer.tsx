'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { schedules, getCurrentDaySchedule, getAssemblyPeriodName } from '@/data/schedules';

// This is a simplified version of the BellTimer that can work independently
// even if other parts of the application fail
export default function StandaloneBellTimer() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [currentPeriod, setCurrentPeriod] = useState<string>('Loading...');
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const [nextPeriodName, setNextPeriodName] = useState<string>("");
  const lastUpdateTimeRef = useRef<number>(Date.now());

  // Parse time string in format "HH:MM" to Date object
  const parseTimeString = useCallback((timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }, []);

  // Function to calculate time values from milliseconds
  const setTimeValues = useCallback((timeLeftMs: number) => {
    setTimeLeftMs(timeLeftMs);
    
    // Calculate hours, minutes, seconds
    const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);
    
    setHours(hours);
    setMinutes(minutes);
    setSeconds(seconds);
  }, []);

  // Simplified function to calculate time until next school day
  const calculateTimeUntilNextSchoolDay = useCallback((): number => {
    const now = new Date();
    const nextSchoolDay = new Date(now);
    
    // If it's already past school hours (after 3:03 PM), go to next day
    if (now.getHours() >= 15 || (now.getHours() === 15 && now.getMinutes() >= 3)) {
      nextSchoolDay.setDate(nextSchoolDay.getDate() + 1);
    }
    
    // Set time to warning bell (8:25 AM for most days, 9:12 AM for Wednesday)
    const targetDay = nextSchoolDay.getDay();
    
    if (targetDay === 3) { // Wednesday
      nextSchoolDay.setHours(9, 12, 0, 0);
    } else {
      nextSchoolDay.setHours(8, 25, 0, 0);
    }
    
    // Skip weekends
    if (targetDay === 0) { // Sunday, add 1 day
      nextSchoolDay.setDate(nextSchoolDay.getDate() + 1);
      nextSchoolDay.setHours(8, 25, 0, 0);
    } else if (targetDay === 6) { // Saturday, add 2 days
      nextSchoolDay.setDate(nextSchoolDay.getDate() + 2);
      nextSchoolDay.setHours(8, 25, 0, 0);
    }
    
    // Calculate milliseconds until next school day warning bell
    return nextSchoolDay.getTime() - now.getTime();
  }, []);

  // Simplified function to find current period
  const findCurrentPeriod = useCallback((now: Date): void => {
    try {
      const activeSchedule = getCurrentDaySchedule();
      if (!activeSchedule || !activeSchedule.periods || activeSchedule.periods.length === 0) {
        setCurrentPeriod("No schedule available");
        setNextPeriodName("Next Warning Bell");
        const nextDayMs = calculateTimeUntilNextSchoolDay();
        setTimeValues(nextDayMs);
        return;
      }

      const periods = activeSchedule.periods;
      const firstPeriodStart = parseTimeString(periods[0].startTime);
      const lastPeriodEnd = parseTimeString(periods[periods.length - 1].endTime);

      if (now < firstPeriodStart || now >= lastPeriodEnd) {
        setCurrentPeriod("Free");
        setNextPeriodName("Next Warning Bell");
        const nextDayMs = calculateTimeUntilNextSchoolDay();
        setTimeValues(nextDayMs);
        return;
      }

      for (let i = 0; i < periods.length - 1; i++) {
        if (periods[i].name === "Warning Bell") continue;

        const currentPeriodStart = parseTimeString(periods[i].startTime);
        const currentPeriodEnd = parseTimeString(periods[i].endTime);
        const nextPeriodStart = parseTimeString(periods[i + 1].startTime);

        if (now >= currentPeriodStart && now < currentPeriodEnd) {
          setCurrentPeriod(periods[i].name);
          setNextPeriodName(periods[i + 1].name);
          const remainingMs = currentPeriodEnd.getTime() - now.getTime();
          setTimeValues(remainingMs);
          return;
        }

        if (now >= currentPeriodEnd && now < nextPeriodStart) {
          setCurrentPeriod("Passing");
          setNextPeriodName(periods[i + 1].name);
          const remainingPassingMs = nextPeriodStart.getTime() - now.getTime();
          setTimeValues(remainingPassingMs);
          return;
        }
      }

      // Check last period
      const lastPeriod = periods[periods.length - 1];
      const lastPeriodStart = parseTimeString(lastPeriod.startTime);
      const finalPeriodEnd = parseTimeString(lastPeriod.endTime);

      if (now >= lastPeriodStart && now < finalPeriodEnd) {
        setCurrentPeriod(lastPeriod.name);
        setNextPeriodName("Free");
        const remainingMs = finalPeriodEnd.getTime() - now.getTime();
        setTimeValues(remainingMs);
        return;
      }

      // Fallback
      setCurrentPeriod("Free");
      setNextPeriodName("Next Warning Bell");
      const nextDayMs = calculateTimeUntilNextSchoolDay();
      setTimeValues(nextDayMs);
    } catch (error) {
      console.error("Error finding current period:", error);
      setCurrentPeriod("Error");
      setNextPeriodName("Unable to determine");
    }
  }, [calculateTimeUntilNextSchoolDay, parseTimeString, setTimeValues]);

  // Format countdown display
  const formatCountdown = useCallback(() => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [hours, minutes, seconds]);

  // Update countdown function
  const updateCountdown = useCallback(() => {
    const now = new Date();
    const currentTimeMs = now.getTime();
    const timeDiff = currentTimeMs - lastUpdateTimeRef.current;
    lastUpdateTimeRef.current = currentTimeMs;

    setCurrentTime(now);

    if (timeLeftMs > 0) {
      const remainingMs = Math.max(0, timeLeftMs - timeDiff);
      const totalSeconds = Math.floor(remainingMs / 1000);
      const hoursValue = Math.floor(totalSeconds / 3600);
      const minutesValue = Math.floor((totalSeconds % 3600) / 60);
      const secondsValue = totalSeconds % 60;
      
      setTimeLeftMs(remainingMs);
      setHours(hoursValue);
      setMinutes(minutesValue);
      setSeconds(secondsValue);
    } else {
      findCurrentPeriod(now);
    }

    // Update document title
    if (mounted) {
      const formattedTime = formatCountdown();
      document.title = `${formattedTime} | ${currentPeriod}`;
    }
  }, [timeLeftMs, findCurrentPeriod, mounted, currentPeriod, formatCountdown]);

  // Initialize component
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Set up timer
  useEffect(() => {
    if (!mounted) return;

    const now = new Date();
    setCurrentTime(now);
    findCurrentPeriod(now);
    lastUpdateTimeRef.current = Date.now();

    const intervalId = setInterval(() => {
      updateCountdown();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [mounted, findCurrentPeriod, updateCountdown]);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-[#151718] text-white rounded-lg shadow-lg">
      <div className="text-4xl font-bold mb-2">{formatCountdown()}</div>
      <div className="text-xl mb-1">{currentPeriod}</div>
      <div className="text-sm text-gray-400">Until {nextPeriodName}</div>
      <div className="text-xs mt-4 text-gray-500">{currentTime.toLocaleTimeString()}</div>
    </div>
  );
}
