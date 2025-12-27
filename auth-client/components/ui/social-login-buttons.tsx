"use client";

import React from 'react';
import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';

import { API_URL } from '@/lib/api';

// 소셜 로그인 리다이렉트 핸들러
const handleSocialLogin = (provider: 'kakao' | 'naver' | 'google') => {
  // 소셜 로그인 엔드포인트로 리다이렉트
  window.location.href = `${API_URL}/api/auth/social/${provider}`;
};

interface SocialLoginButtonsProps {
  onKakaoClick?: () => void;
  onNaverClick?: () => void;
  onGoogleClick?: () => void;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onKakaoClick,
  onNaverClick,
  onGoogleClick,
}) => {
  return (
    <div className="space-y-3 w-full">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onKakaoClick || (() => handleSocialLogin('kakao'))}
        className="w-full flex items-center justify-center gap-2 bg-[#FEE500] text-[#191919] py-4 rounded-2xl font-bold text-base mt-[25px] mr-[0px] mb-[12px] ml-[0px]"
      >
        <MessageCircle size={20} fill="#191919" />
        카카오로 로그인
      </motion.button>
      
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onNaverClick || (() => handleSocialLogin('naver'))}
        className="w-full flex items-center justify-center gap-2 bg-[#03C75A] text-white py-4 rounded-2xl font-bold text-base"
      >
        <span className="font-black text-lg">N</span>
        네이버로 로그인
      </motion.button>
      
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onGoogleClick || (() => handleSocialLogin('google'))}
        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 py-4 rounded-2xl font-bold text-base"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        구글로 시작하기
      </motion.button>
    </div>
  );
};
