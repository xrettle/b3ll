'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Globe, Keyboard as KeyboardIcon, Palette, ExternalLink } from 'lucide-react';
import { ReactNode, useState, useEffect, useRef, KeyboardEvent, useCallback } from 'react';
import { useTheme } from '@/lib/ThemeContext';
import { Schedule as ScheduleType, schedules } from '@/data/schedules';
import { Theme } from '@/lib/theme';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleChange: (schedule: ScheduleType) => void;
  activeSchedule: ScheduleType | null;
}

// Optimized animation variants with simpler transitions
const panelVariants = {
  open: {
    x: 0,
    transition: {
      type: "tween",
      duration: 0.3, // Shorter duration for better performance
      ease: "easeOut" // Simplified easing function
    }
  },
  closed: {
    x: "100%",
    transition: {
      type: "tween",
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

// Backdrop animation variants - simplified
const backdropVariants = {
  open: {
    opacity: 1,
    transition: {
      duration: 0.3,
    }
  },
  closed: {
    opacity: 0,
    transition: {
      duration: 0.2,
    }
  }
};

// Simplified content variants
const contentVariants = {
  open: {
    opacity: 1,
    transition: {
      delay: 0.1,
      duration: 0.3
    }
  },
  closed: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

// Simplified item variants
const itemVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2
    }
  },
  closed: {
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.1
    }
  }
};

// Dropdown component for select menus
function SettingsDropdown({ label, options, value, onChange, theme }: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  theme: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  const isLightTheme = theme.includes('light');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Calculate dropdown position based on available space
  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const spaceBelow = windowHeight - buttonRect.bottom;
    const dropdownHeight = options.length * 40; // Approximate height based on each option being ~40px

    // If space below is less than dropdown height, position above if there's enough space
    if (spaceBelow < dropdownHeight && buttonRect.top > dropdownHeight) {
      setDropdownPosition('top');
    } else {
      setDropdownPosition('bottom');
    }
  }, [options.length]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    if (!isOpen) {
      calculatePosition(); // Calculate position when opening
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Update position when window is resized
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => calculatePosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, calculatePosition]);

  const currentLabel = options.find(option => option.value === value)?.label || value;

  // Theme-specific styles
  const getButtonStyle = () => {
    return isLightTheme
      ? "w-full h-10 bg-[#333]/10 rounded-xl flex items-center justify-between px-3 hover:bg-[#333]/15 transition-colors"
      : "w-full h-10 bg-white/10 rounded-xl flex items-center justify-between px-3 hover:bg-white/15 transition-colors";
  };

  const getDropdownStyle = () => {
    const baseStyle = isLightTheme
      ? "absolute left-0 right-0 mt-1 bg-[#f0f2f5] border border-[#333]/10 rounded-xl shadow-lg z-[200] overflow-hidden"
      : "absolute left-0 right-0 mt-1 bg-[#1e2224] border border-white/10 rounded-xl shadow-lg z-[200] overflow-hidden";

    return dropdownPosition === 'bottom'
      ? `${baseStyle} top-full`
      : `${baseStyle} bottom-full mb-1`;
  };

  const getOptionStyle = (optionValue: string) => {
    if (isLightTheme) {
      return optionValue === value
        ? 'bg-[#333]/10 text-[#333]'
        : 'hover:bg-[#333]/5 text-[#333]/90';
    } else {
      return optionValue === value
        ? 'bg-white/10 text-white'
        : 'hover:bg-white/10 text-white/90';
    }
  };

  return (
    <div className="space-y-2">
      <label className={isLightTheme ? "text-xs uppercase tracking-wider text-[#333]/50" : "text-xs uppercase tracking-wider text-white/50"}>
        {label}
      </label>
      <div className="relative" ref={dropdownRef}>
        <motion.button
          ref={buttonRef}
          className={getButtonStyle()}
          onClick={toggleDropdown}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <span>{currentLabel}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={16} className={isLightTheme ? "text-[#333]/70" : "text-white/70"} />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className={getDropdownStyle()}
              initial={{ opacity: 0, y: dropdownPosition === 'bottom' ? -10 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: dropdownPosition === 'bottom' ? -10 : 10 }}
            >
              <div className="max-h-[200px] overflow-y-auto">
                {options.map((option) => (
                  <motion.div
                    key={option.value}
                    className={`px-3 py-2 cursor-pointer transition-colors ${getOptionStyle(option.value)}`}
                    onClick={() => handleSelect(option.value)}
                    whileHover={{ x: 4 }}
                  >
                    {option.label}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Utility to generate and download a minimal offline HTML version of the timer
export function downloadOfflineHtml(): void {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>B3ll Timer (Offline)</title>
  <style>
    body { background: #151718; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .timer { font-size: 3em; font-weight: bold; }
    .period { font-size: 1.5em; margin-top: 0.5em; }
    .next { font-size: 1em; margin-top: 0.5em; color: #aaa; }
  </style>
</head>
<body>
  <div class="timer" id="countdown">00:00:00</div>
  <div class="period" id="period">Loading...</div>
  <div class="next" id="next">Until Next Warning Bell</div>
  <script>
    // Minimal timer logic for offline
    function pad(n) { return n.toString().padStart(2, '0'); }
    function formatCountdown(h, m, s) { return \`\${pad(h)}:\${pad(m)}:\${pad(s)}\`; }
    function update() {
      const now = new Date();
      document.getElementById('countdown').textContent = formatCountdown(now.getHours(), now.getMinutes(), now.getSeconds());
      document.getElementById('period').textContent = 'Offline Mode';
      document.getElementById('next').textContent = 'Timer works without wifi';
    }
    setInterval(update, 1000);
    update();
  </script>
</body>
</html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'b3ll-timer-offline.html';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

export function SettingsPanel({ isOpen, onClose, onScheduleChange, activeSchedule }: SettingsPanelProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const themeOptions: { value: Theme; label: string }[] = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
    { value: 'slate-blue', label: 'Slate Blue' },
    { value: 'rose-red', label: 'Rose Red' },
    { value: 'sunset-orange', label: 'Sunset Orange' },
    { value: 'forest-green', label: 'Forest Green' },
    { value: 'violet-purple', label: 'Violet Purple' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-80 bg-background/80 backdrop-blur-sm border-l border-border z-50"
        >
          <div className="p-6 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium">Settings</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Theme</h3>
              <div className="grid grid-cols-2 gap-2">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={`p-3 rounded-lg border ${
                      theme === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    } transition-colors`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Schedule</h3>
              <div className="space-y-2">
                {Object.values(schedules).map((schedule) => (
                  <button
                    key={schedule.name}
                    onClick={() => onScheduleChange(schedule)}
                    className={`w-full p-3 rounded-lg border text-left ${
                      activeSchedule?.name === schedule.name
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    } transition-colors`}
                  >
                    {schedule.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

