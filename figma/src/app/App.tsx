import React, { useState, useMemo } from "react";
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
  Sparkles,
} from "lucide-react";
import { Mascot } from "./components/ui/Mascot";
import { FloatingInput } from "./components/ui/FloatingInput";
import { BottomSheet } from "./components/ui/BottomSheet";
import { SecureKeypad } from "./components/ui/SecureKeypad";
import { SocialLoginButtons } from "./components/ui/SocialLoginButtons";
import { ProgressBar } from "./components/ui/ProgressBar";
import logoImage from "figma:asset/60c715ee26e73323f687236f871696c5d44ffe17.png";

// --- Types & Constants ---

const CARRIERS = [
  "SKT",
  "KT",
  "LG U+",
  "SKT 알뜰폰",
  "KT 알뜰폰",
  "LG U+ 알뜰폰",
];

export default function App() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isCarrierSheetOpen, setIsCarrierSheetOpen] =
    useState(false);
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);
  const [isSocialLoginModalOpen, setIsSocialLoginModalOpen] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    agreeAll: false,
    name: "",
    birthdate: "", // Renamed from residentFront
    email: "", // New field
    phone: "",
    carrier: "",
    code: "",
    password: "",
    skipPhoneVerification: false, // New field for tracking if user skips phone verification
  });

  // Validation
  const isNextDisabled = useMemo(() => {
    switch (step) {
      case 0:
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) || formData.password.length < 6; // Login
      case 1:
        return false; // Welcome
      case 2:
        return !formData.agreeAll; // Terms
      case 3:
        return formData.name.length < 2; // Name
      case 4:
        return formData.birthdate.length < 6; // Birthdate
      case 5:
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email); // Email
      case 6:
        return formData.password.length < 6; // Password
      case 7:
        return false; // Phone verification benefit page
      case 8:
        return formData.phone.length < 10 || !formData.carrier; // Phone/Carrier
      case 9:
        return formData.code.length < 6; // Code
      default:
        return false;
    }
  }, [step, formData]);

  // Handlers
  const nextStep = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
    setIsKeypadOpen(false); // Close keypad on transition
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
    setIsKeypadOpen(false);
  };

  // Handle Secure Keypad Input
  const handleKeypadInput = (key: string) => {
    // Determine which field we are editing based on step
    if (step === 8) {
      // Password
      if (formData.password.length < 4) {
        setFormData((prev) => ({
          ...prev,
          password: prev.password + key,
        }));
      }
    }
  };

  const handleKeypadDelete = () => {
    if (step === 8) {
      setFormData((prev) => ({
        ...prev,
        password: prev.password.slice(0, -1),
      }));
    }
  };

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
      
      <div className="min-h-[100dvh] max-h-[100dvh] w-full bg-white flex items-center justify-center font-sans overflow-hidden" style={{ fontFamily: '"Pretendard", sans-serif' }}>
        <div className="w-full h-[100dvh] max-w-full bg-white text-gray-900 flex flex-col relative overflow-hidden">
          {step !== 0 && step !== 7 && step !== 10 && <ProgressBar current={step - 1} total={9} />}

          {step !== 0 && (
            <header className="w-full px-6 py-4 flex items-center justify-between bg-white z-10 flex-shrink-0">
              {step > 1 && step < 10 ? (
                <button
                  onClick={prevStep}
                  className="p-2 -ml-2 rounded-full active:bg-gray-100 transition-colors text-gray-800"
                >
                  <ChevronLeft size={28} />
                </button>
              ) : (
                <div className="w-10" />
              )}
              <img 
                src={logoImage} 
                alt="ppop" 
                className="h-8"
                style={{ fontFamily: 'var(--font-family-brand)' }}
              />
              <button 
                onClick={() => {
                  setDirection(-1);
                  setStep(0);
                }}
                className="p-2 -mr-2 rounded-full active:bg-gray-100 transition-colors text-gray-800"
              >
                <X size={28} />
              </button>
            </header>
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
                  {/* Step 0: Login */}
                  {step === 0 && (
                    <div className="flex flex-col h-full justify-center px-6">
                      <div className="text-center mb-10">
                        <img 
                          src={logoImage} 
                          alt="ppop" 
                          className="h-8 mx-auto mb-6"
                          style={{ fontFamily: 'var(--font-family-brand)' }}
                        />
                        <h2 className="text-2xl font-bold leading-snug text-gray-900 break-keep">
                          다시 만나서 반가워요!
                        </h2>
                      </div>

                      <div className="space-y-6 mb-8">
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
                            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && formData.password.length >= 6) {
                              alert('로그인 성공!');
                            }
                          }}
                        />
                        
                        <FloatingInput
                          type="password"
                          label="비밀번호"
                          placeholder="비밀번호 입력"
                          value={formData.password}
                          onChange={(val) =>
                            setFormData({
                              ...formData,
                              password: val,
                            })
                          }
                          onEnter={() => {
                            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && formData.password.length >= 6) {
                              alert('로그인 성공!');
                            }
                          }}
                        />

                        <div className="flex justify-between items-center px-1 text-sm">
                          <label className="flex items-center gap-2 text-[#6A7282] cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600" />
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
                          disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) || formData.password.length < 6}
                          onClick={() => {
                            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && formData.password.length >= 6) {
                              alert('로그인 성공!');
                            }
                          }}
                          className={`w-full py-4 rounded-2xl font-bold text-base transition-colors border ${
                            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) || formData.password.length < 6
                              ? "bg-gray-100 text-gray-300 cursor-not-allowed border-gray-200"
                              : "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                          }`}
                        >
                          로그인하기
                        </motion.button>

                        <button
                          onClick={() => setIsSocialLoginModalOpen(true)}
                          className="w-full py-4 rounded-2xl bg-[#F9FAFB] text-[#4A5565] font-bold text-base hover:bg-gray-100 transition-colors border border-[#E5E7EB]"
                        >
                          소셜 계정으로 로그인
                        </button>

                        <button
                          onClick={() => {
                            setDirection(1);
                            setStep(1);
                          }}
                          className="w-full py-3 text-[#99a1af] font-medium text-[14px] hover:text-gray-600 transition-colors"
                        >
                          아직 계정이 없으신가요? <span className="text-[#155DFC] font-semibold">회원가입</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Welcome */}
                  {step === 1 && (
                    <div className="flex flex-col h-full justify-between pt-2 px-2">
                      <div className="text-center px-4 flex-1 flex flex-col justify-center items-center">
                        <div className="mb-3">
                          <Mascot size="large" />
                        </div>
                        <h2 className="text-[30px] font-bold mb-3 leading-[41px] text-gray-900 break-keep m-[0px]">
                          <span className="text-[#155DFC]">
                            PPOP
                          </span>{" "}
                          하나로 모든걸
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

                  {/* Step 2: Terms */}
                  {step === 2 && (
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
                                <span className="text-base">
                                  {term}
                                </span>
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

                  {/* Step 3: Name */}
                  {step === 3 && (
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

                  {/* Step 4: Birthdate (Renamed from Resident Number) */}
                  {step === 4 && (
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
                            입력하신 정보는 안전하게 암호화되어
                            처리됩니다.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Email (New) */}
                  {step === 5 && (
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

                  {/* Step 6: Password (New - 이메일 다음) */}
                  {step === 6 && (
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

                  {/* Step 7: Phone Verification Benefit Page */}
                  {step === 7 && (
                    <div className="flex flex-col h-full justify-between pt-10 px-2 pb-6">
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="mb-8">
                          <Mascot size="large" />
                        </div>
                        <div className="text-center px-4 max-w-md">
                          <h2 className="font-bold mb-3 leading-[33px] text-[#155DFC] break-keep" style={{ fontFamily: 'var(--font-family-brand)', fontSize: '36px' }}>
                            PPOP
                          </h2>
                          <p className="text-[#101828] font-semibold text-[24px] leading-[33px] mb-6">
                            전화번호를 인증하면
                          </p>
                          <div className="bg-gradient-to-r from-[#eff6ff] to-[#eef2ff] rounded-[16px] border border-[#dbeafe] p-4 flex items-center gap-3 mb-8">
                            <div className="flex-shrink-0">
                              <svg width="24" height="24" viewBox="0 0 23.336 23.336" fill="none">
                                <path d="M9.66208 15.0712C9.57527 14.7347 9.39988 14.4276 9.15415 14.1819C8.90842 13.9361 8.60134 13.7607 8.26484 13.6739L2.29957 12.1357C2.1978 12.1068 2.10822 12.0455 2.04444 11.9611C1.98066 11.8767 1.94615 11.7738 1.94615 11.668C1.94615 11.5622 1.98066 11.4593 2.04444 11.3749C2.10822 11.2905 2.1978 11.2292 2.29957 11.2003L8.26484 9.66111C8.60122 9.57439 8.90822 9.39914 9.15394 9.15359C9.39966 8.90805 9.57512 8.60116 9.66208 8.26484L11.2003 2.29957C11.2289 2.1974 11.2901 2.10738 11.3747 2.04326C11.4592 1.97914 11.5624 1.94443 11.6685 1.94443C11.7746 1.94443 11.8778 1.97914 11.9623 2.04326C12.0468 2.10738 12.1081 2.1974 12.1367 2.29957L13.6739 8.26484C13.7607 8.60134 13.9361 8.90843 14.1819 9.15416C14.4276 9.39989 14.7347 9.57528 15.0712 9.66209L21.0364 11.1993C21.139 11.2276 21.2295 11.2888 21.294 11.3735C21.3584 11.4581 21.3933 11.5616 21.3933 11.668C21.3933 11.7744 21.3584 11.8779 21.294 11.9626C21.2295 12.0472 21.139 12.1084 21.0364 12.1367L15.0712 13.6739C14.7347 13.7607 14.4276 13.9361 14.1819 14.1819C13.9361 14.4276 13.7607 14.7347 13.6739 15.0712L12.1357 21.0364C12.1071 21.1386 12.0459 21.2286 11.9613 21.2928C11.8768 21.3569 11.7736 21.3916 11.6675 21.3916C11.5614 21.3916 11.4582 21.3569 11.3737 21.2928C11.2892 21.2286 11.2279 21.1386 11.1993 21.0364L9.66208 15.0712Z" stroke="#155DFC" strokeWidth="1.94467" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M19.4467 2.917V6.80634" stroke="#155DFC" strokeWidth="1.94467" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M21.3913 4.86167H17.502" stroke="#155DFC" strokeWidth="1.94467" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M3.88934 16.5297V18.4743" stroke="#155DFC" strokeWidth="1.94467" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M4.86167 17.502H2.917" stroke="#155DFC" strokeWidth="1.94467" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
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
                          onClick={() => {
                            setFormData({ ...formData, skipPhoneVerification: true });
                            setDirection(1);
                            setStep(9);
                          }}
                          className="w-full py-3 text-[#99a1af] font-medium text-[14px] hover:text-gray-600 transition-colors"
                        >
                          인증하지 않고 진행하기
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 8: Phone & Carrier */}
                  {step === 8 && (
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
                          onClick={() =>
                            setIsCarrierSheetOpen(true)
                          }
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

                  {/* Step 9: Verification Code */}
                  {step === 9 && (
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
                              code: val
                                .slice(0, 6)
                                .replace(/[^0-9]/g, ""),
                            })
                          }
                          onEnter={() => {
                            if (formData.code.length >= 6) {
                              nextStep();
                            }
                          }}
                        />
                        <div className="flex justify-between items-center px-1 mt-4">
                          <span className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-lg">
                            03:00
                          </span>
                          <button className="text-gray-400 text-sm font-medium border-b border-gray-300 pb-0.5 hover:text-gray-600 hover:border-gray-500 transition-colors">
                            인증번호 재전송
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 10: Success */}
                  {step === 10 && (
                    <div className="flex flex-col items-center justify-center h-full pb-32">
                      {/* Yellow Star Icon */}
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
                        의  인프라<br />
                        서비스를 이용해보세요.
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          {/* Fixed Bottom Action Button */}
          {step !== 0 && step !== 1 && step !== 7 && step !== 10 && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent z-30 pb-8 flex-shrink-0">
              <div className="max-w-[600px] mx-auto">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  disabled={isNextDisabled}
                  onClick={nextStep}
                  className={`w-full py-4 rounded-[2rem] text-lg font-bold shadow-lg transition-all duration-300 ${
                    isNextDisabled
                      ? "bg-gray-100 text-gray-300 cursor-not-allowed shadow-none"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 shadow-xl"
                  }`}
                >
                  다음
                </motion.button>
              </div>
            </div>
          )}

          {/* Success Page Button */}
          {step === 10 && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent z-30 pb-8 flex-shrink-0">
              <div className="max-w-[600px] mx-auto">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setDirection(1);
                    setStep(0);
                  }}
                  className="w-full py-4 rounded-[2rem] text-lg font-bold shadow-lg transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 shadow-xl"
                >
                  로그인하기
                </motion.button>
              </div>
            </div>
          )}

          {/* Sheets & Overlays */}
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

          {/* Secure Keypad Overlay */}
          <AnimatePresence>
            {(isKeypadOpen || step === 8) &&
              step === 8 && (
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  className="absolute bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2.5rem] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
                >
                  {isKeypadOpen && (
                    <SecureKeypad
                      onKeyPress={handleKeypadInput}
                      onDelete={handleKeypadDelete}
                    />
                  )}
                </motion.div>
              )}
          </AnimatePresence>

          {/* Social Login Modal */}
          <AnimatePresence>
            {isSocialLoginModalOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSocialLoginModalOpen(false)}
                  className="fixed inset-0 bg-black/50 z-[60]"
                />
                
                {/* Modal */}
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