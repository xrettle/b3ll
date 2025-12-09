'use client';

import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { useState } from 'react';
import { SettingsPanel } from './SettingsPanel';

export function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 py-4 px-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="flex justify-between items-center font-mono" style={{ fontFamily: '"Fira Code", monospace' }}>
          <motion.a
            href="#"
            className="flex items-center space-x-2 text-white/70 text-sm tracking-widest uppercase"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SchoolIcon />
            <span>Egan Junior High School</span>
          </motion.a>

          <motion.button
            onClick={handleOpenSettings}
            className="text-white/60 p-2 rounded-full hover:bg-white/5 transition-colors"
            whileHover={{
              scale: 1.05,
              rotate: 180,
              transition: {
                duration: 0.4,
                ease: "easeInOut"
              }
            }}
            whileTap={{
              scale: 0.95,
              rotate: 180,
              transition: {
                duration: 0.2
              }
            }}
          >
            <Settings size={16} />
          </motion.button>
        </div>
      </motion.header>

      {/* Settings Panel */}
      <SettingsPanel isOpen={isSettingsOpen} onClose={handleCloseSettings} />
    </>
  );
}

// Simple school icon
function SchoolIcon() {
  return (
    <motion.svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: 0.5
      }}
    >
      <motion.path
        d="M12 3L1 9L5 11.18V17.18L12 21L19 17.18V11.18L21 10.09V17H23V9L12 3Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.6 }}
      />
    </motion.svg>
  );
}
