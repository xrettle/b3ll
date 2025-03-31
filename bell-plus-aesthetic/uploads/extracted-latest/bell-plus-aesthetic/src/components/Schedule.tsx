'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Schedule as ScheduleType, Period, getCurrentDaySchedule, assemblyToPeriodMap, getAssemblyPeriodName } from '@/data/schedules';

interface ScheduleProps {
  activeSchedule?: ScheduleType;
  assemblyLetter?: string;
}

function Schedule({ activeSchedule, assemblyLetter = 'B' }: ScheduleProps) {
  const [mounted, setMounted] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<ScheduleType | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<string>('');
  const [isLightTheme, setIsLightTheme] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if light theme is active
    const checkTheme = () => {
      const isLight = document.documentElement.classList.contains('light-theme');
      setIsLightTheme(isLight);
    };

    // Set current schedule
    if (activeSchedule) {
      setCurrentSchedule(activeSchedule);
    } else {
      // If no schedule is provided, use the current day's schedule
      setCurrentSchedule(getCurrentDaySchedule());
    }

    // Initial checks
    checkTheme();

    // Set up interval for theme checks only
    const themeInterval = setInterval(() => {
      checkTheme();
    }, 1000);

    return () => clearInterval(themeInterval);
  }, [activeSchedule]);

  // Separate useEffect to handle period finding to avoid dependency issues
  useEffect(() => {
    if (!currentSchedule || !mounted) return;

    // Find current period
    const findCurrentPeriod = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeStr = `${currentHour}:${currentMinute.toString().padStart(2, '0')}`;

      for (let i = 0; i < currentSchedule.periods.length - 1; i++) {
        const periodStart = timeToMinutes(currentSchedule.periods[i].startTime);
        const periodEnd = timeToMinutes(currentSchedule.periods[i + 1].startTime);
        const currentTimeMinutes = timeToMinutes(currentTimeStr);

        if (currentTimeMinutes >= periodStart && currentTimeMinutes < periodEnd) {
          setCurrentPeriod(currentSchedule.periods[i].name);
          break;
        }
      }
    };

    // Initial find
    findCurrentPeriod();

    // Update period every minute
    const periodInterval = setInterval(findCurrentPeriod, 60000);

    return () => clearInterval(periodInterval);
  }, [currentSchedule, mounted]);

  if (!mounted || !currentSchedule) {
    return <div className="w-full max-w-xl h-96 bg-white/5 backdrop-blur-md rounded-2xl"></div>;
  }

  // Get theme-specific classes
  const getBgClasses = () => {
    return isLightTheme
      ? "w-full max-w-xl bg-[#f0f2f5]/80 backdrop-blur-md rounded-xl border border-[#333]/10 p-8 text-[#333]/70 overflow-hidden font-mono"
      : "w-full max-w-xl bg-[#1a1e20]/90 backdrop-blur-md rounded-xl border border-white/20 p-8 text-white/90 overflow-hidden font-mono";
  };

  const getHeaderClasses = () => {
    return isLightTheme
      ? "text-lg schedule-text uppercase tracking-widest text-[#333]/60"
      : "text-lg schedule-text uppercase tracking-widest text-white/80";
  };

  const getSubheaderClasses = () => {
    return isLightTheme
      ? "text-xs schedule-text text-[#333]/50 tracking-wider uppercase"
      : "text-xs schedule-text text-white/60 tracking-wider uppercase";
  };

  const getFooterClasses = () => {
    return isLightTheme
      ? "mt-10 pt-6 border-t border-[#333]/10 text-xs schedule-text text-[#333]/30 tracking-widest uppercase flex justify-between items-center"
      : "mt-10 pt-6 border-t border-white/10 text-xs schedule-text text-white/40 tracking-widest uppercase flex justify-between items-center";
  };

  return (
    <motion.div
      className={getBgClasses()}
      style={{ fontFamily: '"Fira Code", monospace' }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {/* Schedule Title */}
        <motion.h2
          className={`text-2xl font-bold mb-2 schedule-text ${isLightTheme ? 'text-[#333]' : 'text-white'}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {currentSchedule?.displayName}
        </motion.h2>
        <div className={getSubheaderClasses()}>
          {currentSchedule.displayName}
        </div>
      </motion.div>

      <motion.div
        className="space-y-4"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.07
            }
          }
        }}
        initial="hidden"
        animate="show"
      >
        {currentSchedule.periods.map((period, index) => {
          // Skip the last "Free" period if it exists
          if (index === currentSchedule.periods.length - 1 && period.name === "Free") {
            return null;
          }

          // Determine if this period is complete, current, or upcoming
          const now = new Date();
          const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
          const periodStartTime = timeToMinutes(period.startTime);

          let periodEndTime = 23 * 60 + 59; // Default to end of day
          if (index < currentSchedule.periods.length - 1) {
            periodEndTime = timeToMinutes(currentSchedule.periods[index + 1].startTime);
          }

          const isComplete = currentTime > periodEndTime;
          const isCurrent = currentTime >= periodStartTime && currentTime < periodEndTime;

          // For assembly schedule, adjust the display name
          let displayName = period.name;
          if (activeSchedule?.name === 'assembly') {
            // Use the helper function to get the correct period name
            displayName = getAssemblyPeriodName(assemblyLetter, period.name);
          }

          // Check if this is a break period that should always be shown
          const isBreakPeriod = period.name === 'Brunch' || period.name === 'Lunch';

          return (
            <ScheduleRow
              key={index}
              period={period}
              displayName={displayName}
              isComplete={isComplete}
              isCurrent={isCurrent}
              isPassing={period.name.toLowerCase().includes('passing') || period.name === 'Break'}
              isLightTheme={isLightTheme}
              isBreakPeriod={isBreakPeriod}
            />
          );
        })}
      </motion.div>

      <motion.div
        className={getFooterClasses()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <span>Bell System</span>
        <span>{new Date().getFullYear()}</span>
      </motion.div>
    </motion.div>
  );
}

function ScheduleRow({
  period,
  displayName,
  isComplete,
  isCurrent,
  isPassing,
  isLightTheme,
  isBreakPeriod
}: {
  period: Period,
  displayName: string,
  isComplete: boolean,
  isCurrent: boolean,
  isPassing?: boolean,
  isLightTheme: boolean,
  isBreakPeriod?: boolean
}) {
  // Define style based on status and theme
  const getRowClass = () => {
    if (isLightTheme) {
      if (isCurrent) return "text-[#333] border-l-[#333]";
      if (isComplete) return "text-[#333]/40 border-l-[#333]/30";
      return "text-[#333]/70 border-l-[#333]/20"; // Future items
    } else {
      if (isCurrent) return "text-white border-l-white";
      if (isComplete) return "text-white/60 border-l-white/40";
      return "text-white/80 border-l-white/30"; // Future items
    }
  };

  // Special styling for break periods
  const getBreakPeriodClass = () => {
    if (isBreakPeriod) {
      return isLightTheme
        ? "bg-[#f0f2f5]/40 border-l-[#6b7280]"
        : "bg-[#2a2e32]/40 border-l-[#6b7280]";
    }
    return "";
  };

  // Get hover background based on theme
  const getHoverBg = () => {
    if (isLightTheme) {
      return isCurrent ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0.02)";
    } else {
      return isCurrent ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.02)";
    }
  };

  return (
    <motion.div
      className={`flex items-center py-3 px-4 rounded-sm border-l-2 ${getRowClass()} ${getBreakPeriodClass()}`}
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
      }}
      whileHover={{
        backgroundColor: getHoverBg()
      }}
    >
      <div className="flex-shrink-0 w-16 font-mono text-sm schedule-text">{period.startTime}</div>
      <div className="flex-grow font-medium tracking-wide schedule-text">
        {displayName}
        {period.duration && (
          <span className={`ml-2 text-xs ${isLightTheme ? 'opacity-50' : 'opacity-70'} schedule-text`}>{period.duration}</span>
        )}
        {isPassing && (
          <motion.span
            className={`ml-2 inline-block w-2 h-2 rounded-full ${isLightTheme ? 'bg-[#333]/50' : 'bg-white/50'}`}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              repeat: Infinity,
              duration: 2
            }}
          />
        )}
        {isBreakPeriod && (
          <motion.span
            className={`ml-2 inline-block px-2 py-0.5 text-xs rounded-full schedule-text ${isLightTheme ? 'bg-[#e5e7eb] text-[#374151]' : 'bg-[#374151] text-white/80'}`}
          >
            break
          </motion.span>
        )}
      </div>

      {isCurrent && (
        <motion.div
          className={`w-2 h-2 rounded-full ${isLightTheme ? 'bg-[#333]' : 'bg-white'}`}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}
    </motion.div>
  );
}

// Helper function to convert time string to minutes since midnight
function timeToMinutes(timeStr: string): number {
  const [hourStr, minuteStr] = timeStr.split(':');
  let hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);

  // Handle 12-hour format if needed (PM times)
  if (hours < 8 && minuteStr.includes('PM')) {
    hours += 12;
  }

  // Handle edge case for noon (12 PM)
  if (hours === 12 && minuteStr.includes('PM')) {
    hours = 12; // 12 PM is already correct
  }

  // Handle edge case for midnight (12 AM)
  if (hours === 12 && minuteStr.includes('AM')) {
    hours = 0; // 12 AM = 0 hours
  }

  return hours * 60 + minutes;
}

export default Schedule;
export { Schedule };
