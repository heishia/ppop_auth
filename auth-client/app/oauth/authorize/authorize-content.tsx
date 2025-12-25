"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getTokens } from "@/lib/auth";

export function AuthorizeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processAuthorization = async () => {
      const clientId = searchParams.get("client_id");
      const redirectUri = searchParams.get("redirect_uri");
      const responseType = searchParams.get("response_type");
      const state = searchParams.get("state");

      // 필수 파라미터 확인
      if (!clientId || !redirectUri || !responseType) {
        setError("Missing required parameters");
        return;
      }

      // 토큰 확인
      const { accessToken } = getTokens();
      if (!accessToken) {
        // 로그인 페이지로 redirect
        const loginParams = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: responseType,
          ...(state && { state }),
        });
        router.push(`/login?${loginParams.toString()}`);
        return;
      }

      // Auth Server의 authorize/callback 엔드포인트 호출
      const apiUrl =
        process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:3000";
      const callbackParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: responseType,
        ...(state && { state }),
      });

      try {
        const response = await fetch(
          `${apiUrl}/oauth/authorize/callback?${callbackParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            redirect: "manual",
          }
        );

        if (response.type === "opaqueredirect" || response.status === 302) {
          const location = response.headers.get("location");
          if (location) {
            window.location.href = location;
            return;
          }
        }

        if (response.ok) {
          const data = await response.json();
          if (data.code) {
            const redirectParams = new URLSearchParams({
              code: data.code,
              ...(state && { state }),
            });
            window.location.href = `${redirectUri}?${redirectParams.toString()}`;
          }
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Authorization failed");
        }
      } catch (err) {
        console.error("Authorization error:", err);
        setError("Failed to authorize");
      }
    };

    processAuthorization();
  }, [router, searchParams]);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-[var(--card)] border border-[var(--error)]/20 rounded-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-[var(--error)] mb-2">
            Authorization Error
          </h1>
          <p className="text-[var(--muted)]">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-2 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-[var(--muted)]">Authorizing...</p>
      </div>
    </main>
  );
}

