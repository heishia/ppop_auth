import React, { useState } from 'react';
import { motion } from 'motion/react';

interface FloatingInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  onClick?: () => void;
  onEnter?: () => void;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  placeholder, 
  autoFocus = false,
  readOnly = false,
  maxLength,
  onClick,
  onEnter
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEnter) {
      onEnter();
    }
  };
  
  return (
    <div className="relative mb-8" onClick={onClick}>
      <motion.label
        initial={{ y: 0, scale: 1 }}
        animate={{
          y: isFocused || value ? -28 : 0,
          scale: isFocused || value ? 0.85 : 1,
        }}
        className={`absolute left-0 top-3 origin-top-left pointer-events-none transition-colors duration-200 font-medium text-lg ${
          isFocused ? 'text-blue-600' : 'text-gray-400'
        }`}
      >
        {label}
      </motion.label>
      <div className="flex items-center border-b-2 transition-colors duration-300"
           style={{ borderColor: isFocused ? '#2563EB' : '#F3F4F6' }}>
        <input
          autoFocus={autoFocus}
          type={type}
          value={value}
          readOnly={readOnly}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          className="w-full py-4 bg-transparent outline-none text-2xl text-gray-900 font-bold placeholder:text-gray-300 placeholder:font-normal"
          placeholder={isFocused ? placeholder : ''}
        />
      </div>
    </div>
  );
};