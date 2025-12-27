"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// 리다이렉트 컴포넌트 (searchParams 사용)
function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // OAuth query params 유지하면서 메인 페이지로 리다이렉트
    const params = searchParams.toString();
    const redirectUrl = params ? `/?${params}` : "/";
    router.replace(redirectUrl);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-gray-500">Redirecting...</div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <LoginRedirect />
    </Suspense>
  );
}
