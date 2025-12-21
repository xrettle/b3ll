'use client';

import React, { ReactNode, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Globe, Keyboard as KeyboardIcon } from 'lucide-react';

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
  const isLightTheme = theme === 'light';

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const currentLabel = options.find(option => option.value === value)?.label || value;

  // Theme-specific styles
  const getButtonStyle = () => {
    return isLightTheme
      ? "w-full h-10 bg-[#333]/10 rounded-xl flex items-center justify-between px-3 hover:bg-[#333]/15 transition-colors"
      : "w-full h-10 bg-white/10 rounded-xl flex items-center justify-between px-3 hover:bg-white/15 transition-colors";
  };

  const getDropdownStyle = () => {
    return isLightTheme
      ? "absolute top-full left-0 right-0 mt-1 bg-[#f0f2f5] border border-[#333]/10 rounded-xl shadow-lg z-10 overflow-hidden"
      : "absolute top-full left-0 right-0 mt-1 bg-[#1e2224] border border-white/10 rounded-xl shadow-lg z-10 overflow-hidden";
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
      <div className="relative">
        <motion.button
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

        {isOpen && (
          <motion.div
            className={getDropdownStyle()}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
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
          </motion.div>
        )}
      </div>
    </div>
  );
}

// KeybindRecorder component to record keyboard shortcuts
function KeybindRecorder({
  value,
  onChange,
  theme
}: {
  value: string;
  onChange: (value: string) => void;
  theme: string;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [currentKey, setCurrentKey] = useState(value || 'None');
  const [pressedModifiers, setPressedModifiers] = useState({
    ctrl: false,
    alt: false,
    shift: false,
    meta: false
  });
  const isLightTheme = theme === 'light';

  // Start recording when button is clicked
  const startRecording = () => {
    setIsRecording(true);
    // Reset pressed modifiers
    setPressedModifiers({
      ctrl: false,
      alt: false,
      shift: false,
      meta: false
    });
  };

  // Stop recording without saving
  const cancelRecording = () => {
    setIsRecording(false);
  };

  // Track modifier key states
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isRecording) return;

    // Update pressed modifiers
    setPressedModifiers({
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey,
      meta: e.metaKey
    });

    // Skip if only modifier keys are pressed
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
      return;
    }

    // Prevent default browser actions
    e.preventDefault();
    e.stopPropagation();

    // Format the key combination
    let keyCombo = '';
    if (e.ctrlKey) keyCombo += 'Ctrl+';
    if (e.altKey) keyCombo += 'Alt+';
    if (e.shiftKey) keyCombo += 'Shift+';
    if (e.metaKey) keyCombo += 'Meta+';
    keyCombo += e.key.length === 1 ? e.key.toUpperCase() : e.key;

    // Update the keybinding
    setCurrentKey(keyCombo);
    onChange(keyCombo);
    setIsRecording(false);
  };

  // Format current key display in the modal
  const formatKeyDisplay = () => {
    const isMac = navigator.userAgent.indexOf('Mac') !== -1;

    const modifiers = [];
    if (pressedModifiers.ctrl) modifiers.push(isMac ? '⌃ Control' : 'Ctrl');
    if (pressedModifiers.alt) modifiers.push(isMac ? '⌥ Option' : 'Alt');
    if (pressedModifiers.shift) modifiers.push(isMac ? '⇧ Shift' : 'Shift');
    if (pressedModifiers.meta) modifiers.push(isMac ? '⌘ Command' : 'Win');

    return modifiers.length === 0 ? [] : modifiers;
  };

  // Create a reference to document click handler
  const documentClickRef = useRef<((e: MouseEvent) => void) | null>(null);

  // Add/remove global event listeners when recording state changes
  useEffect(() => {
    if (isRecording) {
      // Add keyboard event listeners
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', (e) => {
        // Update modifier states on key up
        setPressedModifiers(prev => ({
          ...prev,
          ctrl: e.ctrlKey,
          alt: e.altKey,
          shift: e.shiftKey,
          meta: e.metaKey
        }));
      });

      // Create document click handler that will close the modal
      // We need to do this with a slight delay to prevent the click that opened
      // the modal from immediately closing it
      setTimeout(() => {
        const clickHandler = (e: MouseEvent) => {
          // Find modal content element
          const modalContent = document.querySelector('[data-keybind-modal]');
          if (!modalContent || !modalContent.contains(e.target as Node)) {
            cancelRecording();
          }
        };

        // Save the handler reference so we can remove it later
        documentClickRef.current = clickHandler;
        document.addEventListener('click', clickHandler);
      }, 100);
    } else {
      // Remove all event listeners
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', () => { });

      // Remove document click handler if it exists
      if (documentClickRef.current) {
        document.removeEventListener('click', documentClickRef.current);
        documentClickRef.current = null;
      }
    }

    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', () => { });

      // Remove document click handler if it exists
      if (documentClickRef.current) {
        document.removeEventListener('click', documentClickRef.current);
      }
    };
  }, [isRecording]);

  // Add key events to handle Escape key as a way to cancel
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRecording) {
        cancelRecording();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isRecording]);

  return (
    <>
      {/* Button to start recording */}
      <button
        className={`w-full h-10 ${isLightTheme
          ? 'bg-[#333]/10 text-[#333] hover:bg-[#333]/15'
          : 'bg-white/10 text-white hover:bg-white/15'
          } rounded-xl flex items-center justify-between px-3 transition-colors`}
        onClick={startRecording}
      >
        <span className="flex items-center">
          <KeyboardIcon size={14} className="mr-2 opacity-70" />
          {currentKey}
        </span>
        <span className={`text-xs ${isLightTheme ? 'text-[#333]/60' : 'text-white/60'}`}>
          Click to change
        </span>
      </button>

      {/* Full-screen modal for key recording */}
      <AnimatePresence>
        {isRecording && (
          <>
            {/* Backdrop - removed onClick handler here */}
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Central content - added data attribute for reference */}
              <motion.div
                data-keybind-modal
                className={`text-center p-10 rounded-xl ${isLightTheme ? 'bg-white/20 text-white' : 'bg-black/40 text-white'
                  } max-w-md`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                {/* Added a Cancel button */}
                <button
                  className="absolute top-2 right-2 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  onClick={cancelRecording}
                >
                  <X size={16} />
                </button>

                <KeyboardIcon size={48} className="mx-auto mb-4 opacity-70" />
                <h2 className="text-2xl font-bold mb-2">Record Shortcut</h2>
                <p className="text-sm opacity-70 mb-6">
                  Press any key or key combination to set as your redirect shortcut
                </p>

                {/* Key display with individual key styling */}
                <div className="space-y-3 mb-6">
                  {formatKeyDisplay().length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-2">
                      {formatKeyDisplay().map((mod, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 bg-white/20 border border-white/30 rounded-md shadow-lg text-sm font-bold"
                        >
                          {mod}
                        </div>
                      ))}
                      <div className="px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-lg text-sm opacity-60">
                        + press a key
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      className="text-xl p-4"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      Press any key...
                    </motion.div>
                  )}
                </div>

                <p className="text-xs opacity-60">
                  Click anywhere to cancel or press Escape
                </p>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
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
      return localStorage.getItem('bell-timer-redirect-key') || 'None';
    }
    return 'None';
  });

  const [redirectUrl, setRedirectUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bell-timer-redirect-url') || '';
    }
    return '';
  });

  // Konami code state - don't show any evidence of this in the UI
  const [konamiActivated, setKonamiActivated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bell-timer-konami-activated') === 'true';
    }
    return false;
  });

  // Visual effects state
  const [flickeringGridEnabled, setFlickeringGridEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bell-timer-effect-flickering-grid') === 'true';
    }
    return false;
  });

  const [gradientBgEnabled, setGradientBgEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bell-timer-effect-gradient-bg') === 'true';
    }
    return false;
  });

  const [fluidAnimEnabled, setFluidAnimEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bell-timer-effect-fluid-anim') === 'true';
    }
    return false;
  });

  const [snowEffectEnabled, setSnowEffectEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bell-timer-effect-snow') === 'true';
    }
    return false;
  });

  // Favicon shape setting
  const [faviconShape, setFaviconShape] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bell-timer-favicon-shape') || 'rounded-square';
    }
    return 'rounded-square';
  });

  const [konamiSequence, setKonamiSequence] = useState<string[]>([]);

  // The Konami code sequence
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  // Track key presses for Konami code with fixed equality check
  useEffect(() => {
    if (!isOpen) return; // Only listen when settings panel is open

    const handleKeyDown = (e: KeyboardEvent) => {
      // Update sequence with the new key
      const updatedSequence = [...konamiSequence, e.key];

      // Keep only the last N keys where N is the length of the Konami code
      if (updatedSequence.length > konamiCode.length) {
        updatedSequence.shift();
      }

      setKonamiSequence(updatedSequence);

      // Check if the sequence matches the Konami code
      const isKonamiCode = updatedSequence.length === konamiCode.length &&
        updatedSequence.every((k, i) => {
          // Case-insensitive comparison for letters
          return k.toLowerCase() === konamiCode[i].toLowerCase();
        });

      if (isKonamiCode && !konamiActivated) {
        // Activate the secret feature!
        setKonamiActivated(true);

        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('bell-timer-konami-activated', 'true');

          // Play a success sound if possible
          try {
            const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAeAAA2KgAkJCQkJCQkJCQkPDw8PDw8PDw8PFRUVFRUVFRUVFRra2tra2tra2trg4ODg4ODg4ODg5mZmZmZmZmZmZmxsbGxsbGxsbGxycnJycnJycnJyeDg4ODg4ODg4OD5+fn5+fn5+fn5////////////////////AAAAAExhdmYAAAAAAAAAAAAAAAAAAAAAACQAAAAAAAAAADYqayZtTwAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBkGY/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZEQP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBkWg/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==');
            audio.play();
          } catch (e) {
            console.log('Audio not supported');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, konamiSequence, konamiActivated, konamiCode]);

  // Apply saved settings on initial mount - only runs once intentionally
  useEffect(() => {
    if (theme === 'light') {
      applyLightTheme();
    } else {
      applyDarkTheme();
    }

    applyFontSize(fontSize);
    // We intentionally only want this to run once on mount,
    // and these functions are defined inside the component
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set up event listener for the redirect key
  const handleRedirectKeyChange = useCallback((newKey: string) => {
    setRedirectKey(newKey);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('bell-timer-redirect-key', newKey);
    }
  }, []);

  // Handle redirect URL change
  const handleRedirectUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setRedirectUrl(newUrl);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('bell-timer-redirect-url', newUrl);
    }
  }, []);

  useEffect(() => {
    if (redirectKey === 'None' || !redirectUrl) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Parse the key combination
      const parts = redirectKey.split('+');
      const key = parts.pop() || '';
      const hasCtrl = parts.includes('Ctrl');
      const hasAlt = parts.includes('Alt');
      const hasShift = parts.includes('Shift');
      const hasMeta = parts.includes('Meta');

      // Check if the pressed key matches the redirect key
      if (
        (e.key.toUpperCase() === key.toUpperCase() || e.key === key) &&
        e.ctrlKey === hasCtrl &&
        e.altKey === hasAlt &&
        e.shiftKey === hasShift &&
        e.metaKey === hasMeta
      ) {
        // Redirect to the specified URL
        window.location.href = redirectUrl.startsWith('http')
          ? redirectUrl
          : `https://${redirectUrl}`;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [redirectKey, redirectUrl]);

  const themeOptions = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' }
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  // Apply light theme styles with smooth transitions
  const applyLightTheme = () => {
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
  };

  // Apply dark theme styles with smooth transitions
  const applyDarkTheme = () => {
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
  };

  // Apply font size based on selection
  const applyFontSize = (size: string) => {
    // Get the root element to apply font size
    const root = document.documentElement;

    // Apply font size based on selection
    switch (size) {
      case 'small':
        root.style.setProperty('--font-size-multiplier', '0.85');
        break;
      case 'medium':
        root.style.setProperty('--font-size-multiplier', '1');
        break;
      case 'large':
        root.style.setProperty('--font-size-multiplier', '1.2');
        break;
    }

    // Apply to countdown size
    const countdownElement = document.querySelector('.text-8xl') as HTMLElement;
    if (countdownElement) {
      if (size === 'small') {
        countdownElement.classList.remove('text-8xl');
        countdownElement.classList.add('text-7xl');
      } else if (size === 'medium') {
        countdownElement.classList.remove('text-7xl', 'text-9xl');
        countdownElement.classList.add('text-8xl');
      } else if (size === 'large') {
        countdownElement.classList.remove('text-8xl');
        countdownElement.classList.add('text-9xl');
      }
    }
  };

  // Apply theme changes
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('bell-timer-theme', newTheme);
    }

    // Apply theme changes to document
    if (newTheme === 'light') {
      applyLightTheme();
    } else {
      applyDarkTheme();
    }
  };

  // Apply font size changes
  const handleFontSizeChange = (newSize: string) => {
    setFontSize(newSize);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('bell-timer-font-size', newSize);
    }

    applyFontSize(newSize);
  };

  // Visual effects handlers
  const handleFlickeringGridToggle = useCallback((enabled: boolean) => {
    setFlickeringGridEnabled(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bell-timer-effect-flickering-grid', enabled.toString());
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('visual-effects-change'));
    }
  }, []);

  const handleGradientBgToggle = useCallback((enabled: boolean) => {
    setGradientBgEnabled(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bell-timer-effect-gradient-bg', enabled.toString());
      window.dispatchEvent(new CustomEvent('visual-effects-change'));
    }
  }, []);

  const handleFluidAnimToggle = useCallback((enabled: boolean) => {
    setFluidAnimEnabled(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bell-timer-effect-fluid-anim', enabled.toString());
      window.dispatchEvent(new CustomEvent('visual-effects-change'));
    }
  }, []);

  const handleSnowEffectToggle = useCallback((enabled: boolean) => {
    setSnowEffectEnabled(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bell-timer-effect-snow', enabled.toString());
      window.dispatchEvent(new CustomEvent('visual-effects-change'));
    }
  }, []);

  const handleFaviconShapeChange = useCallback((shape: string) => {
    setFaviconShape(shape);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bell-timer-favicon-shape', shape);
    }
  }, []);

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
            className={`fixed top-0 right-0 bottom-0 w-80 backdrop-blur-sm z-50 shadow-xl will-change-transform ${theme === 'light' ? 'bg-[#f0f2f5]/90' : 'bg-[#1a1e20]/90'
              }`}
            initial="closed"
            animate="open"
            exit="closed"
            variants={panelVariants}
          >
            {/* Header */}
            <div className={`flex justify-between items-center p-4 border-b ${theme === 'light' ? 'border-[#333]/10' : 'border-white/10'
              }`}>
              <h2 className={`text-lg font-medium ${theme === 'light' ? 'text-[#333]/90' : 'text-white/90'
                }`} style={{ fontFamily: '"Fira Code", monospace' }}>Settings</h2>
              <motion.button
                onClick={onClose}
                className={`p-2 rounded-full transition-colors ${theme === 'light'
                  ? 'text-[#333]/60 hover:bg-[#333]/5'
                  : 'text-white/60 hover:bg-white/5'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Content */}
            <motion.div
              className={`p-4 font-mono ${theme === 'light' ? 'text-[#333]/80' : 'text-white/80'
                } overflow-y-auto max-h-[calc(100vh-60px)]`}
              style={{ fontFamily: '"Fira Code", monospace' }}
              variants={contentVariants}
            >
              {children || (
                <div className="space-y-6">
                  <motion.p
                    className={theme === 'light' ? 'text-sm text-[#333]/60' : 'text-sm text-white/60'}
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

                    {/* Font Size Dropdown */}
                    <motion.div variants={itemVariants}>
                      <SettingsDropdown
                        label="Font Size"
                        options={fontSizeOptions}
                        value={fontSize}
                        onChange={handleFontSizeChange}
                        theme={theme}
                      />
                    </motion.div>

                    {/* Visual Effects Section */}
                    <motion.div
                      variants={itemVariants}
                      className={`pt-4 border-t ${theme === 'light' ? 'border-[#333]/10' : 'border-white/10'}`}
                    >
                      <label className={`text-xs uppercase tracking-wider ${theme === 'light' ? 'text-[#333]/50' : 'text-white/50'} block mb-3`}>
                        Visual Effects
                      </label>

                      <div className="space-y-3">
                        {/* Flickering Grid Toggle */}
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${theme === 'light' ? 'text-[#333]/70' : 'text-white/70'}`}>
                            Flickering Grid
                          </span>
                          <button
                            onClick={() => handleFlickeringGridToggle(!flickeringGridEnabled)}
                            className={`w-10 h-6 rounded-full transition-colors relative ${flickeringGridEnabled
                              ? theme === 'light' ? 'bg-[#333]' : 'bg-white'
                              : theme === 'light' ? 'bg-[#333]/20' : 'bg-white/20'
                              }`}
                          >
                            <span
                              className={`absolute top-1 w-4 h-4 rounded-full transition-all ${flickeringGridEnabled
                                ? `right-1 ${theme === 'light' ? 'bg-white' : 'bg-[#1a1e20]'}`
                                : `left-1 ${theme === 'light' ? 'bg-white' : 'bg-white/60'}`
                                }`}
                            />
                          </button>
                        </div>

                        {/* Gradient Background Toggle */}
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${theme === 'light' ? 'text-[#333]/70' : 'text-white/70'}`}>
                            Gradient Background
                          </span>
                          <button
                            onClick={() => handleGradientBgToggle(!gradientBgEnabled)}
                            className={`w-10 h-6 rounded-full transition-colors relative ${gradientBgEnabled
                              ? theme === 'light' ? 'bg-[#333]' : 'bg-white'
                              : theme === 'light' ? 'bg-[#333]/20' : 'bg-white/20'
                              }`}
                          >
                            <span
                              className={`absolute top-1 w-4 h-4 rounded-full transition-all ${gradientBgEnabled
                                ? `right-1 ${theme === 'light' ? 'bg-white' : 'bg-[#1a1e20]'}`
                                : `left-1 ${theme === 'light' ? 'bg-white' : 'bg-white/60'}`
                                }`}
                            />
                          </button>
                        </div>

                        {/* Fluid Animation Toggle */}
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${theme === 'light' ? 'text-[#333]/70' : 'text-white/70'}`}>
                            Fluid Animation
                          </span>
                          <button
                            onClick={() => handleFluidAnimToggle(!fluidAnimEnabled)}
                            className={`w-10 h-6 rounded-full transition-colors relative ${fluidAnimEnabled
                              ? theme === 'light' ? 'bg-[#333]' : 'bg-white'
                              : theme === 'light' ? 'bg-[#333]/20' : 'bg-white/20'
                              }`}
                          >
                            <span
                              className={`absolute top-1 w-4 h-4 rounded-full transition-all ${fluidAnimEnabled
                                ? `right-1 ${theme === 'light' ? 'bg-white' : 'bg-[#1a1e20]'}`
                                : `left-1 ${theme === 'light' ? 'bg-white' : 'bg-white/60'}`
                                }`}
                            />
                          </button>
                        </div>

                        {/* Snow Effect Toggle */}
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${theme === 'light' ? 'text-[#333]/70' : 'text-white/70'}`}>
                            ❄️ Snow Effect
                          </span>
                          <button
                            onClick={() => handleSnowEffectToggle(!snowEffectEnabled)}
                            className={`w-10 h-6 rounded-full transition-colors relative ${snowEffectEnabled
                              ? theme === 'light' ? 'bg-[#333]' : 'bg-white'
                              : theme === 'light' ? 'bg-[#333]/20' : 'bg-white/20'
                              }`}
                          >
                            <span
                              className={`absolute top-1 w-4 h-4 rounded-full transition-all ${snowEffectEnabled
                                ? `right-1 ${theme === 'light' ? 'bg-white' : 'bg-[#1a1e20]'}`
                                : `left-1 ${theme === 'light' ? 'bg-white' : 'bg-white/60'}`
                                }`}
                            />
                          </button>
                        </div>

                        {/* Favicon Shape Selector */}
                        <div className="space-y-2">
                          <span className={`text-sm ${theme === 'light' ? 'text-[#333]/70' : 'text-white/70'}`}>
                            Favicon Shape
                          </span>
                          <div className="flex gap-2">
                            {[
                              { id: 'rounded-square', icon: '▢', label: 'Rounded' },
                              { id: 'square', icon: '◼', label: 'Square' },
                              { id: 'circle', icon: '●', label: 'Circle' },
                              { id: 'star', icon: '★', label: 'Star' },
                            ].map((shape) => (
                              <button
                                key={shape.id}
                                onClick={() => handleFaviconShapeChange(shape.id)}
                                className={`flex-1 py-2 px-1 rounded-lg text-center transition-all ${faviconShape === shape.id
                                    ? theme === 'light'
                                      ? 'bg-[#333] text-white'
                                      : 'bg-white text-[#1a1e20]'
                                    : theme === 'light'
                                      ? 'bg-[#333]/10 text-[#333]/70 hover:bg-[#333]/20'
                                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                                  }`}
                                title={shape.label}
                              >
                                <span className="text-lg">{shape.icon}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Redirect Key Section - only shown after Konami code */}
                    {konamiActivated && (
                      <motion.div
                        variants={itemVariants}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className={`pt-4 border-t ${theme === 'light' ? 'border-[#333]/10' : 'border-white/10'
                          }`}
                      >
                        <label className={`text-xs uppercase tracking-wider ${theme === 'light' ? 'text-[#333]/50' : 'text-white/50'
                          } block mb-2`}>
                          Redirect Key
                        </label>

                        <div className="space-y-3">
                          {/* Keybind Recorder */}
                          <div className="space-y-1">
                            <label className={`text-xs ${theme === 'light' ? 'text-[#333]/60' : 'text-white/60'
                              }`}>
                              Shortcut:
                            </label>
                            <KeybindRecorder
                              value={redirectKey}
                              onChange={handleRedirectKeyChange}
                              theme={theme}
                            />
                          </div>

                          {/* URL Input */}
                          <div className="space-y-1">
                            <label className={`text-xs ${theme === 'light' ? 'text-[#333]/60' : 'text-white/60'
                              }`}>
                              Redirect URL:
                            </label>
                            <div className="flex items-center">
                              <div className={`h-10 px-3 flex items-center ${theme === 'light'
                                ? 'bg-[#333]/5 text-[#333]/60'
                                : 'bg-white/5 text-white/60'
                                } rounded-l-xl`}>
                                <Globe size={14} />
                              </div>
                              <input
                                type="text"
                                value={redirectUrl}
                                onChange={handleRedirectUrlChange}
                                placeholder="Enter URL (e.g., google.com)"
                                className={`w-full h-10 px-2 focus:outline-none ${theme === 'light'
                                  ? 'bg-[#333]/10 text-[#333] placeholder-[#333]/40'
                                  : 'bg-white/10 text-white placeholder-white/40'
                                  } rounded-r-xl`}
                              />
                            </div>
                            <p className={`text-xs mt-1 ${theme === 'light' ? 'text-[#333]/50' : 'text-white/50'
                              }`}>
                              {redirectKey !== 'None' && redirectUrl
                                ? `Press ${redirectKey} to go to ${redirectUrl}`
                                : 'Set a key and URL to enable quick redirection'
                              }
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <motion.div
                    variants={itemVariants}
                    className={`pt-4 border-t ${theme === 'light' ? 'border-[#333]/10' : 'border-white/10'
                      }`}
                  >
                    <p className={theme === 'light' ? 'text-xs text-[#333]/40' : 'text-xs text-white/40'}>
                      Version 1.0
                    </p>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
