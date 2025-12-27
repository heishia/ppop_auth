import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 z-40 backdrop-blur-[2px]"
        />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] z-50 p-8 pb-12 shadow-2xl"
        >
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
          {title && <h3 className="text-xl font-bold mb-6 text-gray-800">{title}</h3>}
          <div className="max-h-[60vh] overflow-y-auto space-y-3 scrollbar-hide">
            {children}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);
