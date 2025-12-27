"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { FloatingInput } from "@/components/ui/floating-input";
import { SocialLoginButtons } from "@/components/ui/social-login-buttons";
import { login, ApiError } from "@/lib/api";
import { saveTokens, getRedirectUrl } from "@/lib/auth";
import Image from "next/image";
import { Suspense } from "react";

// 로그인 폼 컴포넌트 (searchParams 사용)
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSocialLoginModalOpen, setIsSocialLoginModalOpen] = useState(false);

  // 이메일 유효성 검사
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = isValidEmail && password.length >= 8;

  const handleSubmit = async () => {
    if (!isFormValid) return;
    
    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);
      
      // 토큰 저장
      saveTokens(response.accessToken, response.refreshToken);

      // OAuth 리다이렉트 처리
      const redirectUri = searchParams.get("redirect_uri");
      const state = searchParams.get("state");
      const clientId = searchParams.get("client_id");

      if (redirectUri && clientId) {
        // OAuth 흐름: authorize 페이지로 리다이렉트
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: "code",
          ...(state && { state }),
        });
        router.push(`/oauth/authorize?${params.toString()}`);
      } else {
        // 일반 로그인: 저장된 리다이렉트 URL 또는 홈으로
        const savedRedirect = getRedirectUrl();
        router.push(savedRedirect || "/");
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          .scrollbar-hide::-webkit-scrollbar {
              display: none;
          }
          .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
          }
        `}
      </style>
      
      <div className="min-h-[100dvh] max-h-[100dvh] w-full bg-white flex items-center justify-center font-sans overflow-hidden">
        <div className="w-full h-[100dvh] max-w-full bg-white text-gray-900 flex flex-col relative overflow-hidden">
          <main className="flex-1 flex flex-col relative overflow-hidden">
            <div className="flex-1 px-6 pt-4 pb-28 overflow-y-auto scrollbar-hide overscroll-none">
              <div className="flex flex-col h-full max-w-[600px] mx-auto">
                {/* 로그인 화면 */}
                <div className="flex flex-col h-full justify-center px-6">
                  <div className="text-center mb-10">
                    <Image 
                      src="/로고 2.png" 
                      alt="PPOP" 
                      width={120}
                      height={40}
                      className="h-8 w-auto mx-auto mb-6"
                    />
                    <h2 className="text-2xl font-bold leading-snug text-gray-900 break-keep">
                      다시 만나서 반가워요!
                    </h2>
                  </div>

                  {/* 에러 메시지 */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-6 mb-8">
                    <FloatingInput
                      autoFocus
                      label="이메일 주소"
                      placeholder="name@example.com"
                      type="email"
                      value={email}
                      onChange={(val) => setEmail(val)}
                      onEnter={handleSubmit}
                    />
                    
                    <FloatingInput
                      type="password"
                      label="비밀번호"
                      placeholder="비밀번호 입력"
                      value={password}
                      onChange={(val) => setPassword(val)}
                      onEnter={handleSubmit}
                    />

                    <div className="flex justify-between items-center px-1 text-sm">
                      <label className="flex items-center gap-2 text-[#6A7282] cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-blue-600"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span className="text-base font-medium">로그인 유지</span>
                      </label>
                      <button className="text-[#99A1AF] text-base font-medium hover:text-gray-600 transition-colors">
                        비밀번호 찾기
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      disabled={!isFormValid || loading}
                      onClick={handleSubmit}
                      className={`w-full py-4 rounded-2xl font-bold text-base transition-colors border ${
                        !isFormValid || loading
                          ? "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200"
                          : "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                      }`}
                    >
                      {loading ? "로그인 중..." : "로그인하기"}
                    </motion.button>

                    <button
                      onClick={() => setIsSocialLoginModalOpen(true)}
                      className="w-full py-4 rounded-2xl bg-[#F9FAFB] text-[#4A5565] font-bold text-base hover:bg-gray-100 transition-colors border border-[#E5E7EB]"
                    >
                      소셜 계정으로 로그인
                    </button>

                    <Link
                      href="/signup"
                      className="block w-full py-3 text-center text-[#99a1af] font-medium text-[14px] hover:text-gray-600 transition-colors"
                    >
                      아직 계정이 없으신가요? <span className="text-[#155DFC] font-semibold">회원가입</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* 소셜 로그인 모달 */}
          <AnimatePresence>
            {isSocialLoginModalOpen && (
              <>
                {/* 배경 오버레이 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSocialLoginModalOpen(false)}
                  className="fixed inset-0 bg-black/50 z-[60]"
                />
                
                {/* 모달 */}
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-[2rem] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">소셜 계정으로 로그인</h3>
                      <button
                        onClick={() => setIsSocialLoginModalOpen(false)}
                        className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <X size={24} className="text-gray-500" />
                      </button>
                    </div>
                    
                    <SocialLoginButtons />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

// 메인 페이지 컴포넌트
export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
