import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// GIF 에셋 import
import dogIdleGif from 'figma:asset/9f26dc55e04db8c579e04dae24b06c79413e09cd.png';
import dogActiveGif from 'figma:asset/7476b133e9e6d2496b76ebbaad2d25da81a5cf42.png';

interface MascotProps {
  size?: 'small' | 'medium' | 'large';
  mood?: 'normal' | 'blink' | 'happy' | 'excited';
}

type Action = 'idle' | 'walking' | 'running' | 'jumping' | 'sitting';

export const Mascot: React.FC<MascotProps> = ({ 
  size = 'medium',
  mood = 'normal' 
}) => {
  const [action, setAction] = useState<Action>('idle');
  const [isBarking, setIsBarking] = useState(false);
  const [currentGif, setCurrentGif] = useState(dogIdleGif);

  const handleClick = () => {
    setIsBarking(true);
    setAction('idle'); // 점프 제거
    setCurrentGif(dogActiveGif);
    setTimeout(() => {
      setIsBarking(false);
      setAction('idle');
      setCurrentGif(dogIdleGif);
    }, 1000);
  };

  // Size mapping
  const sizeMap = {
    small: 'w-20 h-20',
    medium: 'w-28 h-28',
    large: 'w-36 h-36'
  };

  // Movement animations based on action
  const getMovementAnimation = () => {
    switch (action) {
      case 'jumping':
        return { 
          y: [0, -30, 0],
          transition: { duration: 0.6, ease: "easeOut" } 
        };
      default:
        return {};
    }
  };

  // Breathing animation for idle state
  const breathingAnimation = action === 'idle' ? {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};

  return (
    <motion.div
      className="flex flex-col items-center justify-center cursor-pointer select-none relative"
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Bark Effect - 강아지 바로 위에 */}
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

      {/* Main Dog GIF - 클릭 시 약간 흔들림 */}
      <motion.img
        key={currentGif}
        src={currentGif}
        alt="ppop dog mascot"
        className={`${sizeMap[size]} object-contain select-none pointer-events-none`}
        draggable={false}
        animate={
          isBarking 
            ? { 
                rotate: [0, -5, 5, -3, 3, 0],
                transition: { duration: 0.5, ease: "easeInOut" } 
              }
            : breathingAnimation
        }
        style={{
          imageRendering: 'pixelated',
          filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.25))',
          objectFit: 'contain',
          objectPosition: 'center',
        }}
      />
    </motion.div>
  );
};