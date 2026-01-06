"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronLeft,
  X,
  Check,
  User,
  Lock,
  Mail,
  Gift,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { Mascot } from "@/components/ui/mascot";
import { FloatingInput } from "@/components/ui/floating-input";
import { SocialLoginButtons } from "@/components/ui/social-login-buttons";
import { ProgressBar } from "@/components/ui/progress-bar";
import { registerExtended, resendVerificationEmail } from "@/lib/api";
import { saveTokens, getTokens } from "@/lib/auth";

function useKeyboardOpen() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialHeight = window.visualViewport?.height || window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDiff = initialHeight - currentHeight;
      setIsKeyboardOpen(heightDiff > 150);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      return () => window.visualViewport?.removeEventListener("resize", handleResize);
    } else {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return isKeyboardOpen;
}

function EmailVerificationStep({ name, email }: { name: string; email: string }) {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);
    
    try {
      const { accessToken } = getTokens();
      if (!accessToken) {
        setResendError("로그인이 필요합니다");
        return;
      }
      await resendVerificationEmail(accessToken);
      setResendSuccess(true);
      setCooldown(60);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setResendError(error.message || "이메일 발송에 실패했습니다");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full pb-32">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          delay: 0.2,
        }}
        className="mb-8"
      >
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
          <Mail size={40} className="text-blue-600" />
        </div>
      </motion.div>
      
      <h2 className="text-[24px] font-bold mb-4 text-center leading-[32px]">
        이메일 인증을 완료해주세요
      </h2>
      
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6 max-w-[320px] w-full">
        <p className="text-blue-800 text-sm font-medium text-center leading-relaxed">
          <span className="font-bold">{email}</span>
          <br />
          으로 인증 메일을 발송했습니다.
        </p>
      </div>

      <p className="text-gray-500 text-sm leading-[22px] text-center break-keep max-w-[280px] mb-6">
        <span className="text-blue-600 font-semibold">{name}</span>님,
        메일함을 확인하고 인증 링크를 클릭해주세요.
      </p>

      {resendSuccess && (
        <p className="text-green-600 text-sm mb-4">
          ✓ 인증 메일을 다시 발송했습니다
        </p>
      )}
      
      {resendError && (
        <p className="text-red-500 text-sm mb-4">
          {resendError}
        </p>
      )}

      <button
        onClick={handleResend}
        disabled={isResending || cooldown > 0}
        className="text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors disabled:opacity-50"
      >
        {isResending ? "발송 중..." : cooldown > 0 ? `${cooldown}초 후 재발송 가능` : "인증 메일 재발송"}
      </button>
    </div>
  );
}

interface FormData {
  agreeAll: boolean;
  agreeMarketing: boolean;
  name: string;
  birthdate: string;
  email: string;
  password: string;
}

export default function SignupPage() {
  const router = useRouter();
  const isKeyboardOpen = useKeyboardOpen();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    agreeAll: false,
    agreeMarketing: false,
    name: "",
    birthdate: "",
    email: "",
    password: "",
  });
  const [showMarketingModal, setShowMarketingModal] = useState(false);

  const isNextDisabled = useMemo(() => {
    switch (step) {
      case 0:
        return false;
      case 1:
        return !formData.agreeAll;
      case 2:
        return formData.name.length < 2;
      case 3:
        return formData.birthdate.length < 6;
      case 4:
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      case 5:
        return formData.password.length < 8;
      default:
        return false;
    }
  }, [step, formData]);

  // Handlers
  const nextStep = useCallback(() => {
    setDirection(1);
    setStep((prev) => prev + 1);
    setError(null);
  }, []);

  const prevStep = useCallback(() => {
    setDirection(-1);
    setStep((prev) => prev - 1);
    setError(null);
  }, []);

  const handleRegister = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await registerExtended({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        birthdate: formData.birthdate,
      });
      
      saveTokens(response.accessToken, response.refreshToken);
      setDirection(1);
      setStep(7);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "회원가입에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  // Animation Variants - smooth fade transition
  const variants = {
    enter: () => ({
      opacity: 0,
      y: 8,
    }),
    center: { 
      opacity: 1, 
      y: 0,
    },
    exit: () => ({
      opacity: 0,
      y: -8,
    }),
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
      
      <div className="min-h-[100dvh] w-full bg-white md:bg-transparent flex items-center justify-center font-sans">
        <div className="w-full h-[100dvh] max-w-full md:max-w-[480px] bg-white md:bg-transparent text-gray-900 flex flex-col relative overflow-y-auto overflow-x-hidden">
          {step !== 0 && step !== 6 && step !== 7 && !isKeyboardOpen && <ProgressBar current={step} total={6} />}

          {step !== 0 && !isKeyboardOpen && (
            <header className="w-full px-6 py-4 flex items-center justify-between bg-white md:bg-transparent z-10 flex-shrink-0">
              {step > 0 && step < 7 ? (
                <button
                  onClick={prevStep}
                  className="p-2 -ml-2 rounded-full active:bg-gray-100 transition-colors text-gray-800"
                >
                  <ChevronLeft size={28} />
                </button>
              ) : (
                <div className="w-10" />
              )}
              <Image 
                src="/logo-2.png" 
                alt="PPOP" 
                width={96}
                height={32}
                className="h-8 w-auto"
              />
              <button 
                onClick={() => router.push("/")}
                className="p-2 -mr-2 rounded-full active:bg-gray-100 transition-colors text-gray-800"
              >
                <X size={28} />
              </button>
            </header>
          )}

          {/* Error Message */}
          {error && (
            <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <main className="flex-1 flex flex-col relative">
            <div className={`flex-1 px-6 overflow-y-auto scrollbar-hide overscroll-none ${isKeyboardOpen ? "pt-2 pb-14" : "pt-4 pb-28"}`}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.25,
                    ease: "easeOut",
                  }}
                  className="flex flex-col h-full max-w-[600px] mx-auto"
                >
                  {/* Step 0: Welcome */}
                  {step === 0 && (
                    <div className="flex flex-col h-full justify-between pt-2 px-2">
                      <div className="text-center px-4 flex-1 flex flex-col justify-center items-center">
                        <div className="mb-3">
                          <Mascot size="large" />
                        </div>
                        <h2 className="text-[30px] font-bold mb-3 leading-[41px] text-gray-900 break-keep m-[0px]">
                          <span className="text-[#155DFC]">PPOP</span> 하나로 모든걸
                        </h2>
                        <p className="text-[#6A7282] text-base break-keep leading-[26px]">
                          모든 인프라를 통합 아이디로<br />
                          한번에 이용해보세요.
                        </p>
                      </div>

                      <div className="space-y-4 mb-6">
                        <SocialLoginButtons />

                        <div className="relative py-6">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-[#F3F4F6]" />
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white md:bg-transparent text-[#99A1AF] text-base">
                              또는
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={nextStep}
                          className="w-full py-4 rounded-2xl bg-[#F9FAFB] text-[#4A5565] font-bold text-base hover:bg-gray-100 transition-colors"
                        >
                          이메일로 시작하기
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Terms */}
                  {step === 1 && (
                    <div className="pt-8 px-2">
                      <div className="flex justify-center mb-6">
                        <Mascot mood="blink" />
                      </div>
                      <h2 className="text-2xl font-bold mb-10 leading-snug text-center break-keep">
                        원활한 서비스 이용을 위해
                        <br />
                        약관에 동의해주세요
                      </h2>
                      <div className="space-y-6">
                        <button
                          onClick={() => {
                            const newAgreeAll = !formData.agreeAll;
                            setFormData({
                              ...formData,
                              agreeAll: newAgreeAll,
                              agreeMarketing: newAgreeAll,
                            });
                          }}
                          className={`w-full flex items-center p-5 rounded-3xl border transition-all duration-200 shadow-sm ${formData.agreeAll ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500" : "border-gray-200 hover:bg-gray-50"}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 transition-colors flex-shrink-0 ${formData.agreeAll ? "bg-blue-600 text-white" : "bg-gray-200 text-white"}`}
                          >
                            <Check size={20} strokeWidth={3} />
                          </div>
                          <span
                            className={`font-bold text-lg ${formData.agreeAll ? "text-blue-700" : "text-gray-600"}`}
                          >
                            전체 동의하기
                          </span>
                        </button>
                        <div className="px-4 space-y-4 pt-4">
                          {[
                            { label: "PPOP 통합 서비스 이용약관", required: true, path: "/terms/service" },
                            { label: "개인정보 수집 및 이용", required: true, path: "/terms/privacy" },
                          ].map((term, i) => (
                            <button
                              key={i}
                              onClick={() => router.push(term.path)}
                              className="w-full flex items-center justify-between text-gray-500 group cursor-pointer hover:text-gray-800 transition-colors py-1"
                            >
                              <div className="flex items-center flex-1">
                                <Check
                                  size={22}
                                  className={`mr-4 transition-colors flex-shrink-0 ${formData.agreeAll ? "text-blue-500" : "text-gray-300"}`}
                                />
                                <span className="text-base text-left">{term.label}</span>
                                <span className="text-blue-500 text-sm ml-1">(필수)</span>
                              </div>
                              <ChevronLeft
                                size={20}
                                className="rotate-180 text-gray-300 group-hover:text-gray-500"
                              />
                            </button>
                          ))}
                          
                          <div className="flex items-center justify-between text-gray-500 group py-1">
                            <div className="flex items-center flex-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (formData.agreeMarketing) {
                                    setShowMarketingModal(true);
                                  } else {
                                    setFormData({ ...formData, agreeMarketing: true });
                                  }
                                }}
                                className={`w-[22px] h-[22px] rounded-md border-2 mr-4 flex items-center justify-center transition-all flex-shrink-0 ${
                                  formData.agreeMarketing 
                                    ? "bg-purple-500 border-purple-500" 
                                    : "border-gray-300 hover:border-purple-400"
                                }`}
                              >
                                {formData.agreeMarketing && <Check size={14} className="text-white" strokeWidth={3} />}
                              </button>
                              <button
                                onClick={() => router.push("/terms/marketing")}
                                className="flex items-center hover:text-gray-800 transition-colors"
                              >
                                <span className="text-base">마케팅 정보 수신 동의</span>
                                <span className="text-gray-400 text-sm ml-1">(선택)</span>
                              </button>
                            </div>
                            <button
                              onClick={() => router.push("/terms/marketing")}
                              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <ChevronLeft
                                size={20}
                                className="rotate-180 text-gray-300 group-hover:text-gray-500"
                              />
                            </button>
                          </div>
                          
                          {formData.agreeMarketing && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="ml-9 bg-purple-50 border border-purple-100 rounded-xl p-3"
                            >
                              <div className="flex items-center gap-2 text-purple-700 text-sm">
                                <Gift size={16} className="flex-shrink-0" />
                                <span>비공개 베타 툴을 먼저 받아볼 수 있어요!</span>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Name */}
                  {step === 2 && (
                    <div className="pt-8 px-2">
                      <div className="mb-8 w-16 h-16 bg-blue-50 rounded-[20px] flex items-center justify-center text-blue-600 mx-auto">
                        <User size={32} strokeWidth={2.5} />
                      </div>
                      <h2 className="text-2xl font-bold mb-12 leading-snug text-center break-keep">
                        반가워요!
                        <br />
                        어떤 이름으로 불러드릴까요?
                      </h2>
                      <div className="px-2">
                        <FloatingInput
                          autoFocus
                          label="이름"
                          placeholder="홍길동"
                          value={formData.name}
                          onChange={(val) =>
                            setFormData({ ...formData, name: val })
                          }
                          onEnter={() => {
                            if (formData.name.length >= 2) {
                              nextStep();
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Birthdate */}
                  {step === 3 && (
                    <div className="pt-8 px-2">
                      <div className="mb-8 w-16 h-16 bg-blue-50 rounded-[20px] flex items-center justify-center text-blue-600 mx-auto">
                        <User size={32} strokeWidth={2.5} />
                      </div>
                      <h2 className="text-2xl font-bold mb-12 leading-snug text-center break-keep">
                        본인 확인을 위해
                        <br />
                        생년월일을 입력해주세요
                      </h2>

                      <div className="px-2">
                        <FloatingInput
                          autoFocus
                          label="생년월일 (6자리)"
                          placeholder="990101"
                          maxLength={6}
                          type="tel"
                          value={formData.birthdate}
                          onChange={(val) =>
                            setFormData({
                              ...formData,
                              birthdate: val.replace(/[^0-9]/g, ""),
                            })
                          }
                          onEnter={() => {
                            if (formData.birthdate.length >= 6) {
                              nextStep();
                            }
                          }}
                        />
                        <div className="mt-5 p-4 bg-gray-50 rounded-2xl flex items-start gap-3 text-gray-500 text-sm leading-relaxed">
                          <Lock
                            size={16}
                            className="mt-0.5 flex-shrink-0 text-gray-400"
                          />
                          <span>
                            입력하신 정보는 안전하게 암호화되어 처리됩니다.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Email */}
                  {step === 4 && (
                    <div className="pt-8 px-2">
                      <div className="mb-8 w-16 h-16 bg-blue-50 rounded-[20px] flex items-center justify-center text-blue-600 mx-auto">
                        <Mail size={32} strokeWidth={2.5} />
                      </div>
                      <h2 className="text-2xl font-bold mb-12 leading-snug text-center break-keep">
                        사용하실 이메일 주소를
                        <br />
                        입력해주세요
                      </h2>

                      <div className="px-2">
                        <FloatingInput
                          autoFocus
                          label="이메일 주소"
                          placeholder="name@example.com"
                          type="email"
                          value={formData.email}
                          onChange={(val) =>
                            setFormData({
                              ...formData,
                              email: val,
                            })
                          }
                          onEnter={() => {
                            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                              nextStep();
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 5: Password */}
                  {step === 5 && (
                    <div className="pt-8 px-2">
                      <div className="mb-8 w-16 h-16 bg-blue-50 rounded-[20px] flex items-center justify-center text-blue-600 mx-auto">
                        <Lock size={32} strokeWidth={2.5} />
                      </div>
                      <h2 className="text-2xl font-bold mb-12 leading-snug text-center break-keep">
                        로그인에 사용할
                        <br />
                        비밀번호를 설정해주세요
                      </h2>
                      <div className="px-2">
                        <FloatingInput
                          autoFocus
                          type="password"
                          label="비밀번호"
                          placeholder="8자 이상"
                          value={formData.password}
                          onChange={(val) =>
                            setFormData({
                              ...formData,
                              password: val,
                            })
                          }
                          onEnter={() => {
                            if (formData.password.length >= 8) {
                              nextStep();
                            }
                          }}
                        />
                        <p className="text-gray-400 text-sm mt-4 px-1">
                          영문, 숫자, 특수문자를 조합하여 8자 이상 입력해주세요
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 6: Phone Verification Benefit Page (Disabled) */}
                  {step === 6 && (
                    <div className="flex flex-col h-full justify-between pt-10 px-2 pb-6">
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="mb-8">
                          <Mascot size="large" />
                        </div>
                        <div className="text-center px-4 max-w-md">
                          <h2 className="font-bold mb-3 leading-[33px] text-[#155DFC] break-keep text-4xl">
                            PPOP
                          </h2>
                          <p className="text-[#101828] font-semibold text-[24px] leading-[33px] mb-6">
                            거의 다 되었어요!
                          </p>
                          <div className="bg-gradient-to-r from-[#f3f4f6] to-[#e5e7eb] rounded-[16px] border border-[#d1d5db] p-4 flex items-center gap-3 mb-4">
                            <div className="text-center flex-1">
                              <p className="font-medium text-[16px] leading-[24px] text-[#6b7280] m-0">
                                전화번호 인증은<br />
                                아직 지원되지 않습니다
                              </p>
                            </div>
                          </div>
                          <p className="text-[#9ca3af] text-[14px] leading-[20px]">
                            곧 서비스될 예정입니다
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 px-2">
                        <button
                          onClick={handleRegister}
                          disabled={isLoading}
                          className="w-full py-4 rounded-[16px] bg-[#155dfc] text-white font-semibold text-[16px] hover:bg-blue-700 transition-colors shadow-[0px_10px_15px_-3px_#bedbff,0px_4px_6px_-4px_#bedbff] disabled:opacity-50"
                        >
                          {isLoading ? "처리 중..." : "가입 완료하기"}
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 7 && (
                    <EmailVerificationStep 
                      name={formData.name} 
                      email={formData.email}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          {step !== 0 && step !== 6 && step !== 7 && (
            <div className={`absolute bottom-0 left-0 right-0 z-30 flex-shrink-0 transition-all duration-200 ${isKeyboardOpen ? "px-4 py-2 bg-white" : "p-6 pb-8 bg-gradient-to-t from-white via-white to-transparent md:from-transparent md:via-transparent"}`}>
              <div className="max-w-[600px] mx-auto">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  disabled={isNextDisabled || isLoading}
                  onClick={() => nextStep()}
                  className={`w-full py-4 rounded-[2rem] text-lg font-bold shadow-lg transition-all duration-300 ${
                    isNextDisabled || isLoading
                      ? "bg-gray-100 text-gray-300 cursor-not-allowed shadow-none"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 shadow-xl"
                  }`}
                >
                  {isLoading ? "처리 중..." : "다음"}
                </motion.button>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className={`absolute bottom-0 left-0 right-0 z-30 flex-shrink-0 transition-all duration-200 ${isKeyboardOpen ? "px-4 py-2 bg-white" : "p-6 pb-8 bg-gradient-to-t from-white via-white to-transparent md:from-transparent md:via-transparent"}`}>
              <div className="max-w-[600px] mx-auto">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/")}
                  className="w-full py-4 rounded-[2rem] text-lg font-bold shadow-lg transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 shadow-xl"
                >
                  로그인하기
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showMarketingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
            onClick={() => setShowMarketingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center">
                  <Sparkles size={32} className="text-purple-600" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                잠깐만요!
              </h3>
              
              <p className="text-gray-600 text-center text-sm leading-relaxed mb-6">
                마케팅 정보 수신에 동의하시면
                <br />
                <span className="text-purple-600 font-semibold">PPOP의 비공개 베타 툴</span>들을
                <br />
                누구보다 먼저 받아볼 수 있어요!
              </p>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Gift size={18} className="text-purple-500" />
                  <span className="font-semibold text-gray-800 text-sm">동의 시 혜택</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1.5 ml-7">
                  <li>• 신규 베타 서비스 우선 체험</li>
                  <li>• 한정 이벤트 및 프로모션 안내</li>
                  <li>• 특별 할인 쿠폰 지급</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setFormData({ ...formData, agreeMarketing: false, agreeAll: false });
                    setShowMarketingModal(false);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition-colors"
                >
                  해제할게요
                </button>
                <button
                  onClick={() => setShowMarketingModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition-colors"
                >
                  동의 유지
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
