"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface MascotProps {
  size?: 'small' | 'medium' | 'large';
  mood?: 'normal' | 'blink' | 'happy' | 'excited';
}

export const Mascot: React.FC<MascotProps> = ({ 
  size = 'medium',
}) => {
  const [isBarking, setIsBarking] = useState(false);

  const handleClick = () => {
    setIsBarking(true);
    setTimeout(() => {
      setIsBarking(false);
    }, 1000);
  };

  // Size mapping
  const sizeMap = {
    small: 'w-20 h-20',
    medium: 'w-28 h-28',
    large: 'w-36 h-36'
  };

  // Breathing animation for idle state
  const breathingAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center cursor-pointer select-none relative"
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Bark Effect */}
      <AnimatePresence>
        {isBarking && (
          <motion.div
            className="absolute -top-2 left-1/2 -translate-x-1/2 font-bold text-gray-800 whitespace-nowrap text-xs z-10"
            initial={{ opacity: 0, y: 5, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            woof!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dog - Simple SVG placeholder */}
      <motion.div
        className={`${sizeMap[size]} flex items-center justify-center text-6xl select-none`}
        animate={
          isBarking 
            ? { 
                rotate: [0, -5, 5, -3, 3, 0],
                transition: { duration: 0.5, ease: "easeInOut" } 
              }
            : breathingAnimation
        }
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Simple dog face SVG */}
          <circle cx="50" cy="50" r="40" fill="#FFD93D" />
          <circle cx="35" cy="40" r="8" fill="#333" />
          <circle cx="65" cy="40" r="8" fill="#333" />
          <circle cx="35" cy="38" r="3" fill="#fff" />
          <circle cx="65" cy="38" r="3" fill="#fff" />
          <ellipse cx="50" cy="55" rx="8" ry="6" fill="#333" />
          <path d="M 42 65 Q 50 75 58 65" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="25" cy="25" rx="12" ry="18" fill="#FFD93D" transform="rotate(-20 25 25)" />
          <ellipse cx="75" cy="25" rx="12" ry="18" fill="#FFD93D" transform="rotate(20 75 25)" />
        </svg>
      </motion.div>
    </motion.div>
  );
};

