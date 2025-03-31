'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';
import { useState } from 'react';

interface InfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Animation variants
const overlayVariants = {
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

const panelVariants = {
  open: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300
    }
  },
  closed: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2
    }
  }
};

export function InfoPanel({ isOpen, onClose }: InfoPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Darkened and blurred overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            onClick={onClose}
          />

          {/* Info panel */}
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md 
                      bg-[#1a1e20]/95 backdrop-blur-md shadow-2xl rounded-xl z-50 overflow-hidden"
            initial="closed"
            animate="open"
            exit="closed"
            variants={panelVariants}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h2 className="text-lg font-medium text-white/90" style={{ fontFamily: '"Fira Code", monospace' }}>
                Website Guide
              </h2>
              <motion.button
                onClick={onClose}
                className="p-2 rounded-full text-white/60 hover:bg-white/5 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-5 max-h-[70vh] overflow-y-auto font-mono text-white/80" 
                 style={{ fontFamily: '"Fira Code", monospace' }}>
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-md font-semibold text-blue-400">Timer</h3>
                  <p className="text-sm text-white/70">
                    The main timer displays the countdown to the next period or the next school day.
                    It automatically updates based on the current schedule.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-md font-semibold text-blue-400">Schedule</h3>
                  <p className="text-sm text-white/70">
                    Shows your current class schedule with period times. The current period is highlighted.
                    Scroll down or wait for the animation to see the schedule.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-md font-semibold text-blue-400">Settings Panel</h3>
                  <p className="text-sm text-white/70">
                    Access settings by clicking the gear icon in the header or pressing the 'S' key.
                    Customize theme, clock format, and font size.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-md font-semibold text-blue-400">Keyboard Shortcuts</h3>
                  <div className="space-y-2 text-sm text-white/70">
                    <div className="flex justify-between">
                      <span>Open/Close Settings</span>
                      <code className="bg-white/10 px-2 py-0.5 rounded">S</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Refresh Page</span>
                      <code className="bg-white/10 px-2 py-0.5 rounded">R</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Close Panels</span>
                      <code className="bg-white/10 px-2 py-0.5 rounded">Esc</code>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-white/50 italic">
                    There might be hidden features waiting to be discovered...
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function InfoButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-4 right-4 p-3 rounded-full bg-blue-500/80 text-white shadow-lg hover:bg-blue-600/80 transition-colors z-30"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
    >
      <Info size={20} />
    </motion.button>
  );
}
