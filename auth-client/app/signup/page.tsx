"use client";

import React, { useState, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronLeft,
  X,
  Check,
  User,
  Phone,
  ShieldCheck,
  Lock,
  ChevronDown,
  Mail,
} from "lucide-react";
import { Mascot } from "@/components/ui/mascot";
import { FloatingInput } from "@/components/ui/floating-input";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { SocialLoginButtons } from "@/components/ui/social-login-buttons";
import { ProgressBar } from "@/components/ui/progress-bar";
import { registerExtended, sendSms, verifySms } from "@/lib/api";

// --- Types & Constants ---
const CARRIERS = [
  "SKT",
  "KT",
  "LG U+",
  "SKT 알뜰폰",
  "KT 알뜰폰",
  "LG U+ 알뜰폰",
];

interface FormData {
  agreeAll: boolean;
  name: string;
  birthdate: string;
  email: string;
  phone: string;
  carrier: string;
  code: string;
  password: string;
  skipPhoneVerification: boolean;
  smsVerificationId: string;
}

export default function SignupPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isCarrierSheetOpen, setIsCarrierSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [smsTimer, setSmsTimer] = useState(180); // 3 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Form Data
  const [formData, setFormData] = useState<FormData>({
    agreeAll: false,
    name: "",
    birthdate: "",
    email: "",
    phone: "",
    carrier: "",
    code: "",
    password: "",
    skipPhoneVerification: false,
    smsVerificationId: "",
  });

  // Timer for SMS
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && smsTimer > 0) {
      interval = setInterval(() => {
        setSmsTimer((prev) => prev - 1);
      }, 1000);
    } else if (smsTimer === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, smsTimer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Validation
  const isNextDisabled = useMemo(() => {
    switch (step) {
      case 0:
        return false; // Welcome
      case 1:
        return !formData.agreeAll; // Terms
      case 2:
        return formData.name.length < 2; // Name
      case 3:
        return formData.birthdate.length < 6; // Birthdate
      case 4:
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email); // Email
      case 5:
        return formData.password.length < 6; // Password
      case 6:
        return false; // Phone verification benefit page
      case 7:
        return formData.phone.length < 10 || !formData.carrier; // Phone/Carrier
      case 8:
        return formData.code.length < 6; // Code
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

  // Send SMS verification code
  const handleSendSms = useCallback(async () => {
    if (formData.phone.length < 10) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await sendSms(formData.phone);
      setSmsTimer(180);
      setIsTimerRunning(true);
      nextStep();
    } catch (err: any) {
      setError(err.message || "Failed to send SMS");
    } finally {
      setIsLoading(false);
    }
  }, [formData.phone, nextStep]);

  // Verify SMS code
  const handleVerifySms = useCallback(async () => {
    if (formData.code.length < 6) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await verifySms(formData.phone, formData.code);
      setFormData((prev) => ({
        ...prev,
        smsVerificationId: result.verificationId,
      }));
      nextStep();
    } catch (err: any) {
      setError(err.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  }, [formData.phone, formData.code, nextStep]);

  // Complete registration
  const handleRegister = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await registerExtended({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        birthdate: formData.birthdate,
        phone: formData.skipPhoneVerification ? undefined : formData.phone,
        smsVerificationId: formData.skipPhoneVerification ? undefined : formData.smsVerificationId,
      });
      nextStep();
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }, [formData, nextStep]);

  // Animation Variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
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
      
      <div className="min-h-[100dvh] max-h-[100dvh] w-full bg-white flex items-center justify-center font-sans overflow-hidden">
        <div className="w-full h-[100dvh] max-w-full bg-white text-gray-900 flex flex-col relative overflow-hidden">
          <ProgressBar current={step} total={9} />

          <header className="w-full px-6 py-4 flex items-center justify-between bg-white z-10 flex-shrink-0">
            {step > 0 && step < 9 ? (
              <button
                onClick={prevStep}
                className="p-2 -ml-2 rounded-full active:bg-gray-100 transition-colors text-gray-800"
              >
                <ChevronLeft size={28} />
              </button>
            ) : (
              <div className="w-10" />
            )}
            <span className="text-xl font-bold text-blue-600">PPOP</span>
            <button className="p-2 -mr-2 rounded-full active:bg-gray-100 transition-colors text-gray-800">
              <X size={28} />
            </button>
          </header>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <main className="flex-1 flex flex-col relative overflow-hidden">
            <div className="flex-1 px-6 pt-4 pb-28 overflow-y-auto scrollbar-hide overscroll-none">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.35,
                    type: "spring",
                    bounce: 0,
                    damping: 20,
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
                            <span className="px-3 bg-white text-[#99A1AF] text-base">
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
                          onClick={() =>
                            setFormData({
                              ...formData,
                              agreeAll: !formData.agreeAll,
                            })
                          }
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
                        <div className="px-4 space-y-5 pt-4">
                          {[
                            "ppop 통합 서비스 이용약관 (필수)",
                            "개인정보 수집 및 이용 (필수)",
                            "마케팅 정보 수신 동의 (선택)",
                          ].map((term, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between text-gray-500 group cursor-pointer hover:text-gray-800 transition-colors"
                            >
                              <div className="flex items-center">
                                <Check
                                  size={22}
                                  className={`mr-4 transition-colors ${formData.agreeAll ? "text-blue-500" : "text-gray-300"}`}
                                />
                                <span className="text-base">{term}</span>
                              </div>
                              <ChevronLeft
                                size={20}
                                className="rotate-180 text-gray-300 group-hover:text-gray-500"
                              />
                            </div>
                          ))}
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
                          placeholder="6자 이상"
                          value={formData.password}
                          onChange={(val) =>
                            setFormData({
                              ...formData,
                              password: val,
                            })
                          }
                          onEnter={() => {
                            if (formData.password.length >= 6) {
                              nextStep();
                            }
                          }}
                        />
                        <p className="text-gray-400 text-sm mt-4 px-1">
                          영문, 숫자, 특수문자를 조합하여 6자 이상 입력해주세요
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 6: Phone Verification Benefit Page */}
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
                            전화번호를 인증하면
                          </p>
                          <div className="bg-gradient-to-r from-[#eff6ff] to-[#eef2ff] rounded-[16px] border border-[#dbeafe] p-4 flex items-center gap-3 mb-8">
                            <div className="text-center flex-1">
                              <p className="font-semibold text-[18px] leading-[28px] text-[#1447e6] m-0">
                                Pro Plan 선택<br />
                                서비스 1개월 제공
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 px-2">
                        <button
                          onClick={() => {
                            setFormData({ ...formData, skipPhoneVerification: false });
                            nextStep();
                          }}
                          className="w-full py-4 rounded-[16px] bg-[#155dfc] text-white font-semibold text-[16px] hover:bg-blue-700 transition-colors shadow-[0px_10px_15px_-3px_#bedbff,0px_4px_6px_-4px_#bedbff]"
                        >
                          인증하기
                        </button>
                        <button
                          onClick={async () => {
                            setFormData({ ...formData, skipPhoneVerification: true });
                            await handleRegister();
                          }}
                          disabled={isLoading}
                          className="w-full py-3 text-[#99a1af] font-medium text-[14px] hover:text-gray-600 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? "처리 중..." : "인증하지 않고 진행하기"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 7: Phone & Carrier */}
                  {step === 7 && (
                    <div className="pt-8 px-2">
                      <div className="mb-8 w-16 h-16 bg-blue-50 rounded-[20px] flex items-center justify-center text-blue-600 mx-auto">
                        <Phone size={32} strokeWidth={2.5} />
                      </div>
                      <h2 className="text-2xl font-bold mb-12 leading-snug text-center break-keep">
                        본인 명의의
                        <br />
                        휴대폰 번호를 입력해주세요
                      </h2>
                      <div className="space-y-6 px-2">
                        <div
                          onClick={() => setIsCarrierSheetOpen(true)}
                          className="flex items-center justify-between py-4 border-b-2 border-gray-100 cursor-pointer active:bg-gray-50 transition-colors group"
                        >
                          <span
                            className={`text-lg font-semibold transition-colors ${formData.carrier ? "text-gray-900" : "text-gray-300"}`}
                          >
                            {formData.carrier || "통신사 선택"}
                          </span>
                          <ChevronDown className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </div>
                        <FloatingInput
                          label="휴대폰 번호"
                          placeholder="01012345678"
                          type="tel"
                          value={formData.phone}
                          onChange={(val) =>
                            setFormData({
                              ...formData,
                              phone: val.replace(/[^0-9]/g, ""),
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 8: Verification Code */}
                  {step === 8 && (
                    <div className="pt-8 px-2">
                      <div className="mb-8 w-16 h-16 bg-blue-50 rounded-[20px] flex items-center justify-center text-blue-600 mx-auto">
                        <ShieldCheck size={32} strokeWidth={2.5} />
                      </div>
                      <h2 className="text-2xl font-bold mb-5 leading-snug text-center break-keep">
                        문자로 발송된
                        <br />
                        인증번호 6자리를 입력해주세요
                      </h2>
                      <p className="text-gray-400 mb-10 text-center text-base">
                        {formData.phone}
                      </p>

                      <div className="px-2">
                        <FloatingInput
                          autoFocus
                          label="인증번호"
                          placeholder="000000"
                          type="tel"
                          maxLength={6}
                          value={formData.code}
                          onChange={(val) =>
                            setFormData({
                              ...formData,
                              code: val.slice(0, 6).replace(/[^0-9]/g, ""),
                            })
                          }
                          onEnter={() => {
                            if (formData.code.length >= 6) {
                              handleVerifySms();
                            }
                          }}
                        />
                        <div className="flex justify-between items-center px-1 mt-4">
                          <span className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-lg">
                            {formatTimer(smsTimer)}
                          </span>
                          <button 
                            onClick={handleSendSms}
                            disabled={isTimerRunning && smsTimer > 120}
                            className="text-gray-400 text-sm font-medium border-b border-gray-300 pb-0.5 hover:text-gray-600 hover:border-gray-500 transition-colors disabled:opacity-50"
                          >
                            인증번호 재전송
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 9: Success */}
                  {step === 9 && (
                    <div className="flex flex-col items-center justify-center h-full pb-32">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          delay: 0.2,
                        }}
                        className="mb-10"
                      >
                        <svg width="47" height="47" viewBox="0 0 42.6684 42.6683" fill="none">
                          <path d="M17.3297 28.1222C17.1565 27.451 16.8067 26.8385 16.3166 26.3483C15.8264 25.8582 15.2139 25.5084 14.5427 25.3352L2.64436 22.267C2.44136 22.2094 2.2627 22.0872 2.13548 21.9188C2.00826 21.7504 1.93943 21.5452 1.93943 21.3342C1.93943 21.1232 2.00826 20.9179 2.13548 20.7495C2.2627 20.5812 2.44136 20.4589 2.64436 20.4013L14.5427 17.3312C15.2137 17.1582 15.826 16.8087 16.3162 16.3189C16.8063 15.8291 17.1562 15.217 17.3297 14.5462L20.3979 2.6478C20.4549 2.444 20.577 2.26446 20.7456 2.13656C20.9143 2.00866 21.1201 1.93943 21.3317 1.93943C21.5433 1.93943 21.7491 2.00866 21.9178 2.13656C22.0864 2.26446 22.2085 2.444 22.2655 2.6478L25.3318 14.5462C25.5049 15.2174 25.8548 15.8299 26.3449 16.32C26.835 16.8101 27.4475 17.16 28.1187 17.3331L40.0171 20.3994C40.2217 20.4558 40.4021 20.5778 40.5307 20.7467C40.6593 20.9155 40.729 21.1219 40.729 21.3342C40.729 21.5464 40.6593 21.7528 40.5307 21.9217C40.4021 22.0905 40.2217 22.2125 40.0171 22.269L28.1187 25.3352C27.4475 25.5084 26.835 25.8582 26.3449 26.3483C25.8548 26.8385 25.5049 27.451 25.3318 28.1222L22.2636 40.0205C22.2066 40.2243 22.0844 40.4039 21.9158 40.5318C21.7472 40.6597 21.5414 40.7289 21.3298 40.7289C21.1181 40.7289 20.9123 40.6597 20.7437 40.5318C20.5751 40.4039 20.453 40.2243 20.3959 40.0205L17.3297 28.1222Z" stroke="#FDC700" strokeWidth="3.87885" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M33.2628 4.88107V11.6316" stroke="#FDC700" strokeWidth="3.87885" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M36.6383 8.25635H29.8877" stroke="#FDC700" strokeWidth="3.87885" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9.3759 30.1899V35.9401" stroke="#FDC700" strokeWidth="3.87885" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12.2512 33.0651H6.50098" stroke="#FDC700" strokeWidth="3.87885" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </motion.div>
                      
                      <h2 className="text-[30px] font-bold mb-6 text-center leading-[36px]">
                        가입 완료!
                      </h2>
                      <p className="text-gray-500 text-base leading-[26px] text-center break-keep max-w-[280px]">
                        이제{" "}
                        <span className="text-blue-600 font-semibold">
                          {formData.name}
                        </span>
                        님의 통합 아이디로<br />
                        <span className="text-gray-800 font-semibold">
                          PPOP
                        </span>
                        의 모든 인프라<br />
                        서비스를 이용해보세요.
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          {/* Fixed Bottom Action Button */}
          {step !== 0 && step !== 6 && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent z-30 pb-8 flex-shrink-0">
              <div className="max-w-[600px] mx-auto">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  disabled={isNextDisabled || isLoading}
                  onClick={async () => {
                    if (step === 7) {
                      await handleSendSms();
                    } else if (step === 8) {
                      await handleVerifySms();
                    } else if (step === 9) {
                      window.location.href = "/";
                    } else {
                      nextStep();
                    }
                  }}
                  className={`w-full py-4 rounded-[2rem] text-lg font-bold shadow-lg transition-all duration-300 ${
                    isNextDisabled || isLoading
                      ? "bg-gray-100 text-gray-300 cursor-not-allowed shadow-none"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 shadow-xl"
                  }`}
                >
                  {isLoading ? "처리 중..." : step === 9 ? "홈으로 이동" : "다음"}
                </motion.button>
              </div>
            </div>
          )}

          {/* Carrier Selection Bottom Sheet */}
          <BottomSheet
            isOpen={isCarrierSheetOpen}
            onClose={() => setIsCarrierSheetOpen(false)}
            title="통신사를 선택해주세요"
          >
            <div className="grid grid-cols-1 gap-2">
              {CARRIERS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setFormData({ ...formData, carrier: c });
                    setIsCarrierSheetOpen(false);
                  }}
                  className={`w-full text-left p-5 rounded-2xl text-lg font-semibold transition-all ${
                    formData.carrier === c
                      ? "bg-blue-600 text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    {c}
                    {formData.carrier === c && <Check size={20} />}
                  </div>
                </button>
              ))}
            </div>
          </BottomSheet>
        </div>
      </div>
    </>
  );
}

