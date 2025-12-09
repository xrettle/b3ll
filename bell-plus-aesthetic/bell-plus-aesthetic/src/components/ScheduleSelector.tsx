'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Minimize2, Theater, Sun, Book, Cpu, Monitor, Keyboard, Coffee, Home } from 'lucide-react';
import { assemblyToPeriodMap, getAssemblyPeriodName } from '@/data/schedules';

interface ScheduleSelectorProps {
  currentSchedule: string;
  onScheduleChange: (scheduleName: string) => void;
  onAssemblyLetterChange: (letter: string) => void;
}

export function ScheduleSelector({
  currentSchedule,
  onScheduleChange,
  onAssemblyLetterChange
}: ScheduleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [assemblyLetter, setAssemblyLetter] = useState(() => {
    // Try to get saved assembly letter from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bell-timer-assembly-letter') || 'B';
    }
    return 'B';
  });
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [selectedDaySchedule, setSelectedDaySchedule] = useState(() => {
    // Try to get saved schedule from localStorage, default to current day
    if (typeof window !== 'undefined') {
      const savedSchedule = localStorage.getItem('bell-timer-schedule');
      if (savedSchedule) {
        return savedSchedule;
      }
    }
    return getCurrentDayScheduleName();
  });

  // Add state to track which menu section is active
  const [activeMenuSection, setActiveMenuSection] = useState<string>('main'); // 'main', 'days', or 'assembly'

  // Enhanced theme detection
  const checkTheme = useCallback(() => {
    const isLight = document.documentElement.classList.contains('light-theme');
    setIsLightTheme(isLight);
  }, []);

  // Check for theme changes
  useEffect(() => {
    // Initial check
    checkTheme();

    // Check theme on interval as a fallback
    const intervalCheck = setInterval(checkTheme, 500);

    // Set up a mutation observer to detect class changes on documentElement
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
      clearInterval(intervalCheck);
    };
  }, [checkTheme]);

  // Persist schedule selection
  useEffect(() => {
    if (typeof window !== 'undefined' && currentSchedule) {
      localStorage.setItem('bell-timer-schedule', currentSchedule);
    }
  }, [currentSchedule]);

  // Persist assembly letter selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bell-timer-assembly-letter', assemblyLetter);
    }
  }, [assemblyLetter]);

  const handleScheduleChange = (schedule: string) => {
    if (schedule === 'assembly') {
      // If assembly is selected, open the assembly letter selection
      setActiveMenuSection('assembly');
    } else if (schedule === 'selectDay') {
      // If "Select Day" option is clicked, show day selection menu
      setActiveMenuSection('days');
    } else {
      // For other schedule types, close the menu
      onScheduleChange(schedule);
      setIsOpen(false);
      setActiveMenuSection('main');
    }
  };

  const handleDayScheduleChange = (day: string) => {
    setSelectedDaySchedule(day);
    onScheduleChange(day);
    setIsOpen(false);
    setActiveMenuSection('main');
  };

  const handleAssemblyLetterChange = (letter: string) => {
    setAssemblyLetter(letter);
    onAssemblyLetterChange(letter);
  };

  const handleBackToMain = () => {
    setActiveMenuSection('main');
  };

  const handleConfirmAssembly = () => {
    onScheduleChange('assembly');
    setIsOpen(false);
    setActiveMenuSection('main');
  };

  // Get menu styling based on theme
  const getMenuStyle = () => {
    return isLightTheme
      ? "absolute top-full right-0 mt-2 w-64 bg-[#f0f2f5]/95 border border-[#333]/10 rounded-xl shadow-lg overflow-hidden"
      : "absolute top-full right-0 mt-2 w-64 bg-[#1a1e20]/95 border border-white/10 rounded-xl shadow-lg overflow-hidden";
  };

  const getHeaderStyle = () => {
    return isLightTheme
      ? "p-3 border-b border-[#333]/5"
      : "p-3 border-b border-white/5";
  };

  const getHeaderTextStyle = () => {
    return isLightTheme
      ? "text-[#333]/70 text-xs uppercase tracking-wider"
      : "text-white/70 text-xs uppercase tracking-wider";
  };

  const getDividerStyle = () => {
    return isLightTheme
      ? "mt-4 pt-4 border-t border-[#333]/5"
      : "mt-4 pt-4 border-t border-white/5";
  };

  const getSubheaderStyle = () => {
    return isLightTheme
      ? "text-[#333]/60 text-xs mb-2"
      : "text-white/60 text-xs mb-2";
  };

  // Get display name for the current schedule
  const getScheduleDisplayName = () => {
    if (currentSchedule === 'assembly') {
      return `Assembly ${assemblyLetter}`;
    } else if (currentSchedule === 'minimumDay') {
      return 'Minimum Day';
    } else if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'holiday'].includes(currentSchedule)) {
      // Capitalize first letter of day
      return currentSchedule.charAt(0).toUpperCase() + currentSchedule.slice(1);
    } else {
      return 'Regular Schedule';
    }
  };

  // Get icon for day of week
  const getDayIcon = (day: string) => {
    switch(day) {
      case 'monday': return <Sun size={12} />;
      case 'tuesday': return <Book size={12} />;
      case 'wednesday': return <Cpu size={12} />;
      case 'thursday': return <Monitor size={12} />;
      case 'friday': return <Keyboard size={12} />;
      case 'holiday': return <Coffee size={12} />;
      default: return <Calendar size={12} />;
    }
  };

  // Get today's day name
  const getTodayName = () => {
    const now = new Date();
    const day = now.getDay();
    switch(day) {
      case 1: return 'Monday';
      case 2: return 'Tuesday';
      case 3: return 'Wednesday';
      case 4: return 'Thursday';
      case 5: return 'Friday';
      case 0:
      case 6: return 'Holiday';
      default: return 'Today';
    }
  };

  return (
    <motion.div
      className="fixed top-16 right-6 z-40 font-mono"
      style={{ fontFamily: '"Fira Code", monospace' }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="relative">
        {/* Using the global CSS class for theme styling */}
        <motion.button
          className="schedule-button px-4 py-2 text-xs tracking-wider flex items-center gap-2 rounded-xl font-mono"
          onClick={() => setIsOpen(!isOpen)}
          whileTap={{ scale: 0.98 }}
        >
          <Clock size={12} />
          <span className="uppercase">
            {getScheduleDisplayName()}
          </span>
        </motion.button>

        {isOpen && (
          <motion.div
            className={getMenuStyle()}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header with back button for submenus */}
            <div className={getHeaderStyle()}>
              <div className="flex items-center justify-between">
                {activeMenuSection !== 'main' && (
                  <button
                    className={`mr-2 p-1 rounded-full ${isLightTheme ? 'hover:bg-[#333]/10' : 'hover:bg-white/10'}`}
                    onClick={handleBackToMain}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
                <h3 className={getHeaderTextStyle()}>
                  {activeMenuSection === 'main' && "Schedule Options"}
                  {activeMenuSection === 'days' && "Select Day"}
                  {activeMenuSection === 'assembly' && "Assembly Period"}
                </h3>
                {activeMenuSection === 'assembly' && (
                  <button
                    className={`ml-auto p-1 rounded ${isLightTheme ? 'bg-[#333]/10 hover:bg-[#333]/20 text-[#333]' : 'bg-white/10 hover:bg-white/20 text-white'} text-xs`}
                    onClick={handleConfirmAssembly}
                  >
                    Done
                  </button>
                )}
              </div>
            </div>

            <div className="p-3 space-y-2">
              {/* Main Schedule Types */}
              {activeMenuSection === 'main' && (
                <div className="space-y-2">
                  <h4 className={getSubheaderStyle()}>Schedule Type</h4>
                  <ScheduleOption
                    icon={<Calendar size={12} />}
                    label={`Today (${getTodayName()})`}
                    isActive={['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'holiday'].includes(currentSchedule) && currentSchedule === getCurrentDayScheduleName()}
                    onClick={() => handleScheduleChange(getCurrentDayScheduleName())}
                    isLightTheme={isLightTheme}
                  />

                  <ScheduleOption
                    icon={<Calendar size={12} />}
                    label="Select Day..."
                    isActive={['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'holiday'].includes(currentSchedule) && currentSchedule !== getCurrentDayScheduleName()}
                    onClick={() => handleScheduleChange('selectDay')}
                    isLightTheme={isLightTheme}
                  />

                  <ScheduleOption
                    icon={<Theater size={12} />}
                    label="Assembly Schedule"
                    isActive={currentSchedule === 'assembly'}
                    onClick={() => handleScheduleChange('assembly')}
                    isLightTheme={isLightTheme}
                  />

                  <ScheduleOption
                    icon={<Minimize2 size={12} />}
                    label="Minimum Day"
                    isActive={currentSchedule === 'minimumDay'}
                    onClick={() => handleScheduleChange('minimumDay')}
                    isLightTheme={isLightTheme}
                  />
                </div>
              )}

              {/* Day Schedule Selector - Only shown when "Select Day" is chosen */}
              {activeMenuSection === 'days' && (
                <div className="space-y-2">
                  <ScheduleOption
                    icon={getDayIcon('monday')}
                    label="Monday"
                    isActive={currentSchedule === 'monday'}
                    onClick={() => handleDayScheduleChange('monday')}
                    isLightTheme={isLightTheme}
                  />

                  <ScheduleOption
                    icon={getDayIcon('tuesday')}
                    label="Tuesday"
                    isActive={currentSchedule === 'tuesday'}
                    onClick={() => handleDayScheduleChange('tuesday')}
                    isLightTheme={isLightTheme}
                  />

                  <ScheduleOption
                    icon={getDayIcon('wednesday')}
                    label="Wednesday Block"
                    isActive={currentSchedule === 'wednesday'}
                    onClick={() => handleDayScheduleChange('wednesday')}
                    isLightTheme={isLightTheme}
                  />

                  <ScheduleOption
                    icon={getDayIcon('thursday')}
                    label="Thursday Block"
                    isActive={currentSchedule === 'thursday'}
                    onClick={() => handleDayScheduleChange('thursday')}
                    isLightTheme={isLightTheme}
                  />

                  <ScheduleOption
                    icon={getDayIcon('friday')}
                    label="Friday"
                    isActive={currentSchedule === 'friday'}
                    onClick={() => handleDayScheduleChange('friday')}
                    isLightTheme={isLightTheme}
                  />

                  <ScheduleOption
                    icon={getDayIcon('holiday')}
                    label="Holiday"
                    isActive={currentSchedule === 'holiday'}
                    onClick={() => handleDayScheduleChange('holiday')}
                    isLightTheme={isLightTheme}
                  />
                </div>
              )}

              {/* Assembly Letter Selector - Only shown when assembly is selected */}
              {activeMenuSection === 'assembly' && (
                <div>
                  <div className="text-xs mb-4 opacity-70">
                    Select which period will be replaced by the assembly:
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.keys(assemblyToPeriodMap).map((letter) => (
                      <button
                        key={letter}
                        className={`text-xs py-2 rounded-lg transition-colors ${
                          assemblyLetter === letter
                            ? isLightTheme
                              ? 'bg-[#333]/20 text-[#333] font-bold'
                              : 'bg-white/20 text-white font-bold'
                            : isLightTheme
                              ? 'text-[#333]/60 hover:bg-[#333]/10 hover:text-[#333]/80'
                              : 'text-white/60 hover:bg-white/10 hover:text-white/80'
                        }`}
                        onClick={() => handleAssemblyLetterChange(letter)}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>

                  {/* Assembly schedule explanation */}
                  <div className={`mt-4 pt-4 border-t ${isLightTheme ? 'border-[#333]/10' : 'border-white/10'} text-xs opacity-60`}>
                    <p className="mb-2">Period mapping for Assembly {assemblyLetter}:</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {Object.keys(assemblyToPeriodMap).map((letter) => (
                        <div key={letter} className="flex justify-between">
                          <span>{letter}:</span>
                          <span>{letter === assemblyLetter ? "Assembly" : assemblyToPeriodMap[letter]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Helper component for schedule option
function ScheduleOption({ icon, label, isActive, onClick, isLightTheme }: {
  icon: React.ReactNode,
  label: string,
  isActive: boolean,
  onClick: () => void,
  isLightTheme: boolean
}) {
  // Theme-based classes
  const getOptionClasses = () => {
    if (isLightTheme) {
      return isActive
        ? 'bg-[#333]/10 text-[#333]'
        : 'text-[#333]/70 hover:bg-[#333]/5';
    } else {
      return isActive
        ? 'bg-white/10 text-white'
        : 'text-white/60 hover:bg-white/5';
    }
  };

  return (
    <motion.button
      className={`w-full flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors ${getOptionClasses()}`}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
    >
      <span className={isLightTheme ? "text-[#333]/70" : "text-white/70"}>
        {icon}
      </span>
      <span>{label}</span>
    </motion.button>
  );
}

// Helper function to get the current day's schedule name
function getCurrentDayScheduleName(): string {
  const now = new Date();
  const day = now.getDay();
  
  switch(day) {
    case 0: // Sunday
    case 6: // Saturday
      return 'holiday';
    case 1:
      return 'monday';
    case 2:
      return 'tuesday';
    case 3:
      return 'wednesday';
    case 4:
      return 'thursday';
    case 5:
      return 'friday';
    default:
      return 'monday';
  }
}
