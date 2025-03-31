'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

interface HeaderProps {
  onSettingsClick?: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Hide header on scroll down, show on scroll up
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    // Clear any existing timeout
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }

    if (currentScrollY > lastScrollY) {
      // Scrolling down - hide header
      setIsVisible(false);
    } else {
      // Scrolling up - show header
      setIsVisible(true);
    }

    // Auto-hide header after 3 seconds of no scrolling
    scrollTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    // Clear timeout when component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, [handleScroll]);

  return (
    <motion.header
      className="fixed w-full top-0 z-30 px-6 py-4 flex justify-between items-center"
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: isVisible ? 0 : -100, opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="text-white/80 text-sm tracking-widest font-mono"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        EGAN JUNIOR HIGH SCHOOL
      </motion.div>

      <motion.div
        className="flex items-center space-x-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
          onClick={onSettingsClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings size={16} className="text-white/80" />
        </motion.button>
      </motion.div>
    </motion.header>
  );
}
