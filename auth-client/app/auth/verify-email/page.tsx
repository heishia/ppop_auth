"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { CheckCircle, XCircle, Mail, Loader2 } from "lucide-react";
import Image from "next/image";
import { API_URL } from "@/lib/api";

type VerificationStatus = "loading" | "success" | "error" | "expired";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const token = searchParams.get("token");
  const success = searchParams.get("success");
  const error = searchParams.get("error");

  useEffect(() => {
    if (success === "true") {
      setStatus("success");
      return;
    }

    if (error) {
      if (error.includes("expired")) {
        setStatus("expired");
      } else {
        setStatus("error");
      }
      setErrorMessage(decodeURIComponent(error));
      return;
    }

    if (!token) {
      setStatus("error");
      setErrorMessage("인증 토큰이 없습니다");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/verify-email?token=${token}`, {
          method: "GET",
          redirect: "manual",
        });

        if (response.type === "opaqueredirect" || response.ok) {
          setStatus("success");
        } else {
          const data = await response.json().catch(() => ({}));
          if (data.message?.includes("expired")) {
            setStatus("expired");
            setErrorMessage("인증 링크가 만료되었습니다");
          } else {
            setStatus("error");
            setErrorMessage(data.message || "인증에 실패했습니다");
          }
        }
      } catch {
        setStatus("error");
        setErrorMessage("인증 처리 중 오류가 발생했습니다");
      }
    };

    verifyEmail();
  }, [token, success, error]);

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="flex flex-col items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mb-8"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                <Loader2 size={40} className="text-blue-600" />
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold mb-4 text-center">
              이메일 인증 중...
            </h2>
            <p className="text-gray-500 text-center">
              잠시만 기다려주세요
            </p>
          </div>
        );

      case "success":
        return (
          <div className="flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle size={56} className="text-green-500" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">
                이메일 인증 완료! 🎉
              </h2>
              <p className="text-gray-500 text-center mb-2">
                회원가입이 완료되었습니다.
              </p>
              <p className="text-gray-400 text-sm text-center">
                이제 로그인하여 서비스를 이용하세요.
              </p>
            </motion.div>
          </div>
        );

      case "expired":
        return (
          <div className="flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center">
                <Mail size={48} className="text-yellow-500" />
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">
              인증 링크가 만료되었습니다
            </h2>
            <p className="text-gray-500 text-center mb-2">
              24시간이 지나 인증 링크가 만료되었습니다.
            </p>
            <p className="text-gray-400 text-sm text-center">
              회원가입을 다시 시도해주세요.
            </p>
          </div>
        );

      case "error":
        return (
          <div className="flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
                <XCircle size={56} className="text-red-500" />
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-900">
              인증에 실패했습니다
            </h2>
            <p className="text-gray-500 text-center mb-2">
              {errorMessage || "유효하지 않은 인증 링크입니다."}
            </p>
            <p className="text-gray-400 text-sm text-center">
              다시 시도하거나 고객센터에 문의해주세요.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-dvh w-full bg-white flex items-center justify-center font-sans">
      <div className="w-full max-w-[480px] px-6 py-12 flex flex-col items-center">
        <Image
          src="/logo-2.png"
          alt="PPOP"
          width={120}
          height={40}
          className="h-8 w-auto mb-12"
        />

        <div className="w-full min-h-[300px] flex items-center justify-center">
          {renderContent()}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: status === "loading" ? 0 : 0.5 }}
          className="w-full mt-12"
        >
          {status !== "loading" && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/")}
              className="w-full py-4 rounded-2xl text-lg font-bold transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200"
            >
              로그인하기
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-500">Loading...</div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

