"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

interface MascotProps {
  size?: 'small' | 'medium' | 'large';
  mood?: 'normal' | 'blink' | 'happy' | 'excited';
}

export const Mascot: React.FC<MascotProps> = ({ 
  size = 'medium',
}) => {
  const [isBarking, setIsBarking] = useState(false);
  const [currentGif, setCurrentGif] = useState('/정면.gif');

  const handleClick = () => {
    setIsBarking(true);
    setCurrentGif('/후면.gif');
    setTimeout(() => {
      setIsBarking(false);
      setCurrentGif('/정면.gif');
    }, 1000);
  };

  // Size mapping
  const sizeMap = {
    small: { width: 80, height: 80, className: 'w-20 h-20' },
    medium: { width: 112, height: 112, className: 'w-28 h-28' },
    large: { width: 144, height: 144, className: 'w-36 h-36' }
  };

  // Breathing animation for idle state
  const breathingAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const
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
            왈왈!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dog GIF */}
      <motion.div
        className={`${sizeMap[size].className} relative select-none`}
        animate={
          isBarking 
            ? { 
                rotate: [0, -5, 5, -3, 3, 0],
                transition: { duration: 0.5, ease: "easeInOut" } 
              }
            : breathingAnimation
        }
      >
        <Image
          src={currentGif}
          alt="PPOP mascot"
          width={sizeMap[size].width}
          height={sizeMap[size].height}
          className="object-contain pointer-events-none drop-shadow-lg"
          unoptimized
          priority
        />
      </motion.div>
    </motion.div>
  );
};
