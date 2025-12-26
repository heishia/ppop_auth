"use client";

import React from 'react';
import { motion } from 'motion/react';
import { Delete } from 'lucide-react';

interface SecureKeypadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
}

export const SecureKeypad: React.FC<SecureKeypadProps> = ({ onKeyPress, onDelete }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="grid grid-cols-3 gap-1 bg-gray-50 p-4 pb-8 rounded-t-[2.5rem]">
      {keys.map((key, index) => (
        <motion.button
          key={`${key}-${index}`}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (key === 'del') onDelete();
            else if (key) onKeyPress(key);
          }}
          className={`
            h-16 flex items-center justify-center rounded-2xl text-2xl font-semibold text-gray-800
            ${key === '' ? 'pointer-events-none' : 'active:bg-gray-200'}
          `}
        >
          {key === 'del' ? <Delete size={24} /> : key}
        </motion.button>
      ))}
    </div>
  );
};

