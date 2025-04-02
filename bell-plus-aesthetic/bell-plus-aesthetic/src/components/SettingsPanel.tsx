'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Globe, Keyboard as KeyboardIcon, Palette, ExternalLink } from 'lucide-react';
import { ReactNode, useState, useEffect, useRef, KeyboardEvent, useCallback } from 'react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
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

export function SettingsPanel({ isOpen, onClose, children }: SettingsPanelProps) {
  // Use local storage for persistent settings across refreshes
  const [theme, setTheme] = useState<string>(() => {
    // Try to get saved theme from localStorage, default to 'dark'
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bell-timer-theme') || 'dark';
    }
    return 'dark';
  });

  const [fontSize, setFontSize] = useState<string>(() => {
    // Try to get saved font size from localStorage, default to 'medium'
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bell-timer-font-size') || 'medium';
    }
    return 'medium';
  });

  // Redirect key settings
  const [redirectKey, setRedirectKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bell-timer-redirect-key') || 'F8';
    }
    return 'F8';
  });
  const [redirectUrl, setRedirectUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bell-timer-redirect-url') || 'https://google.com';
    }
    return 'https://google.com';
  });
  const [listeningForKey, setListeningForKey] = useState(false);

  // Check if theme is light
  const isLightTheme = theme.includes('light');

  // Clock format state
  const [use12HourClock, setUse12HourClock] = useState(false);

  // Apply saved settings on initial mount - only runs once intentionally
  useEffect(() => {
    // Check for saved settings in localStorage
    if (typeof window !== 'undefined') {
      try {
        // Get clock format preference
        const savedClockFormat = localStorage.getItem('bell-timer-12hour-clock') === 'true';
        setUse12HourClock(savedClockFormat);
      } catch (error) {
        console.error('Error loading settings from localStorage:', error);
      }
    }
  }, []);

  // Add event listener for the redirect key
  useEffect(() => {
    if (!redirectKey || !isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (listeningForKey) {
        // If we're listening for a key for the redirect shortcut
        e.preventDefault();
        setRedirectKey(e.key);
        setListeningForKey(false);
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('bell-timer-redirect-key', e.key);
        }
        return;
      }
      
      if (e.key === redirectKey) {
        // Redirect to the specified URL
        window.location.href = redirectUrl;
      }
    };

    // Add global event listener with proper typing
    window.addEventListener('keydown', handleKeyDown as unknown as EventListener);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown as unknown as EventListener);
    };
  }, [redirectKey, redirectUrl, isOpen, listeningForKey]);

  const themeOptions = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' }
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  // Add handler for clock format change
  const handleClockFormatChange = (use12Hour: boolean) => {
    setUse12HourClock(use12Hour);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('bell-timer-12hour-clock', use12Hour.toString());

      // Dispatch event to notify BellTimer that the clock format has changed
      window.dispatchEvent(new Event('clockFormatChanged'));
    }
  };

  // Apply theme changes
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('bell-timer-theme', newTheme);
    }
  };

  // Apply font size changes
  const handleFontSizeChange = (newSize: string) => {
    setFontSize(newSize);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('bell-timer-font-size', newSize);
    }
  };

  return (
    <>
      {/* Backdrop with AnimatePresence for clean exit */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 z-40"
            initial="closed"
            animate="open"
            exit="closed"
            variants={backdropVariants}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Settings Panel with optimized animations */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed top-0 right-0 bottom-0 w-80 backdrop-blur-sm z-50 shadow-xl will-change-transform flex flex-col ${
                isLightTheme ? 'bg-[#f0f2f5]/90' : 'bg-[#1a1e20]/90'
              }`}
            initial="closed"
            animate="open"
            exit="closed"
            variants={panelVariants}
          >
            {/* Header - Fixed at top */}
            <div className={`flex justify-between items-center p-4 border-b ${
              isLightTheme ? 'border-[#333]/10' : 'border-white/10'
            }`}>
              <h2 className={`text-lg font-medium ${
                isLightTheme ? 'text-[#333]/90' : 'text-white/90'
              }`} style={{ fontFamily: '"Fira Code", monospace' }}>Settings</h2>
              <motion.button
                onClick={onClose}
                className={`p-2 rounded-full transition-colors ${
                  isLightTheme
                    ? 'text-[#333]/60 hover:bg-[#333]/5'
                    : 'text-white/60 hover:bg-white/5'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Content - Scrollable */}
            <motion.div
              className={`flex-1 p-4 font-mono ${
                isLightTheme ? 'text-[#333]/80' : 'text-white/80'
              } overflow-y-auto`}
              style={{ fontFamily: '"Fira Code", monospace' }}
              variants={contentVariants}
            >
              {children || (
                <div className="space-y-6">
                  <motion.p
                    className={isLightTheme ? 'text-sm text-[#333]/60' : 'text-sm text-white/60'}
                    variants={itemVariants}
                  >
                    Configure your bell timer settings
                  </motion.p>

                  {/* Settings Content */}
                  <div className="space-y-4">
                    {/* Theme Dropdown */}
                    <motion.div variants={itemVariants}>
                      <SettingsDropdown
                        label="App Theme"
                        options={themeOptions}
                        value={theme}
                        onChange={handleThemeChange}
                        theme={theme}
                      />
                    </motion.div>

                    {/* Clock Format Toggle */}
                    <motion.div variants={itemVariants} className="mt-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className={`text-xs uppercase tracking-wider ${
                            isLightTheme ? 'text-[#333]/50' : 'text-white/50'
                          }`}>
                            Clock Format
                          </label>
                        </div>

                        <div className={`w-full h-10 ${
                          isLightTheme
                            ? 'bg-[#333]/10 text-[#333]'
                            : 'bg-white/10 text-white'
                        } rounded-xl flex items-center justify-between px-3`}>
                          <div className="flex items-center space-x-2">
                            <button
                              className={`px-3 py-1 rounded ${
                                !use12HourClock
                                  ? isLightTheme
                                    ? 'bg-[#333]/20 text-[#333]'
                                    : 'bg-white/20 text-white'
                                  : isLightTheme
                                    ? 'text-[#333]/70 hover:text-[#333]/90 hover:bg-[#333]/10'
                                    : 'text-white/70 hover:text-white/90 hover:bg-white/10'
                              } transition-colors text-sm`}
                              onClick={() => handleClockFormatChange(false)}
                            >
                              24h
                            </button>
                            <button
                              className={`px-3 py-1 rounded ${
                                use12HourClock
                                  ? isLightTheme
                                    ? 'bg-[#333]/20 text-[#333]'
                                    : 'bg-white/20 text-white'
                                  : isLightTheme
                                    ? 'text-[#333]/70 hover:text-[#333]/90 hover:bg-[#333]/10'
                                    : 'text-white/70 hover:text-white/90 hover:bg-white/10'
                              } transition-colors text-sm`}
                              onClick={() => handleClockFormatChange(true)}
                            >
                              12h
                            </button>
                          </div>
                          <span className={`text-xs ${isLightTheme ? 'text-[#333]/60' : 'text-white/60'}`}>
                            {use12HourClock ? '1:30 PM' : '13:30'}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Font Size Dropdown */}
                    <motion.div variants={itemVariants} className="mt-4">
                      <SettingsDropdown
                        label="Font Size"
                        options={fontSizeOptions}
                        value={fontSize}
                        onChange={handleFontSizeChange}
                        theme={theme}
                      />
                    </motion.div>

                    {/* Redirect Key Settings */}
                    <motion.div 
                      variants={itemVariants} 
                      className="mt-8 pt-6 border-t border-dashed"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <ExternalLink size={16} className={isLightTheme ? "text-[#333]" : "text-white"} />
                          <h3 className={`text-md font-semibold ${isLightTheme ? "text-[#333]" : "text-white"}`}>
                            Redirect Key
                          </h3>
                        </div>
                        
                        <p className={`text-xs ${isLightTheme ? "text-[#333]/60" : "text-white/60"}`}>
                          Configure a key to quickly redirect to any website.
                        </p>

                        {/* Redirect Key Setting */}
                        <div className="space-y-2 mt-4">
                          <label className={`text-xs uppercase tracking-wider ${
                            isLightTheme ? 'text-[#333]/50' : 'text-white/50'
                          }`}>
                            Shortcut Key
                          </label>
                          <button
                            onClick={() => setListeningForKey(true)}
                            className={`w-full h-10 ${
                              isLightTheme
                                ? 'bg-[#333]/10 hover:bg-[#333]/15 text-[#333]'
                                : 'bg-white/10 hover:bg-white/15 text-white'
                            } rounded-xl flex items-center justify-between px-3 transition-colors`}
                          >
                            <span>{listeningForKey ? "Press any key..." : redirectKey}</span>
                            <KeyboardIcon size={16} className={isLightTheme ? "text-[#333]/60" : "text-white/60"} />
                          </button>
                        </div>

                        {/* Redirect URL Setting */}
                        <div className="space-y-2 mt-4">
                          <label className={`text-xs uppercase tracking-wider ${
                            isLightTheme ? 'text-[#333]/50' : 'text-white/50'
                          }`}>
                            Redirect URL
                          </label>
                          <div className={`w-full h-10 ${
                            isLightTheme
                              ? 'bg-[#333]/10 text-[#333]'
                              : 'bg-white/10 text-white'
                          } rounded-xl flex items-center px-3`}>
                            <input
                              type="url"
                              value={redirectUrl}
                              onChange={(e) => {
                                setRedirectUrl(e.target.value);
                                if (typeof window !== 'undefined') {
                                  localStorage.setItem('bell-timer-redirect-url', e.target.value);
                                }
                              }}
                              placeholder="https://example.com"
                              className={`w-full bg-transparent outline-none text-sm ${
                                isLightTheme ? 'placeholder-[#333]/40' : 'placeholder-white/40'
                              }`}
                            />
                            <Globe size={16} className={isLightTheme ? "text-[#333]/60" : "text-white/60"} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
