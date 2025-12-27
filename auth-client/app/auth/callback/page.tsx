"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { saveTokens, getRedirectUrl } from "@/lib/auth";

// 콜백 처리 컴포넌트
function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    // URL 파라미터에서 토큰 또는 에러 추출
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    if (error) {
      // 에러 처리
      setStatus("error");
      setErrorMessage(message || "Social login failed");
      return;
    }

    if (accessToken && refreshToken) {
      // 토큰 저장
      saveTokens(accessToken, refreshToken);
      setStatus("success");

      // 저장된 리다이렉트 URL 또는 홈으로 이동
      const redirectUrl = getRedirectUrl();
      
      // 약간의 딜레이 후 리다이렉트 (성공 상태 표시)
      setTimeout(() => {
        router.replace(redirectUrl || "/");
      }, 500);
    } else {
      // 토큰이 없는 경우
      setStatus("error");
      setErrorMessage("No tokens received");
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-8">
        {status === "loading" && (
          <div className="space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-600">Processing login...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-gray-600">Login successful! Redirecting...</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div>
              <p className="text-red-600 font-medium">Login failed</p>
              <p className="text-gray-500 text-sm mt-1">{errorMessage}</p>
            </div>
            <button
              onClick={() => router.replace("/")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go back to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}

