import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';

export function PublishNotification() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-5 right-5 z-50 bg-white rounded-lg shadow-lg p-1 flex items-center max-w-xs"
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
            delay: 0.8
          }}
        >
          <motion.a
            href="https://edit.bell.plus"
            target="_blank"
            className="px-3 py-2 text-black text-sm font-medium flex-1"
            whileHover={{
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              transition: { duration: 0.2 }
            }}
          >
            Publish your school's schedule
          </motion.a>

          <motion.button
            onClick={() => setIsVisible(false)}
            className="p-1 text-black/60 hover:text-black rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Dismiss"
          >
            <X size={16} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
