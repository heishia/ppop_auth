"use client";

import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => (
  <div className="w-full h-1 bg-gray-100 sticky top-0 z-20">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${(current / total) * 100}%` }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="h-full bg-blue-600"
    />
  </div>
);

