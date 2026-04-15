"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getTokens, saveTokens } from "@/lib/auth";
import { API_URL, refresh } from "@/lib/api";

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
      const prompt = searchParams.get("prompt");

      if (!clientId || !redirectUri || !responseType) {
        setError("Missing required parameters");
        return;
      }

      const buildLoginParams = () => new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: responseType,
        ...(state && { state }),
      });

      if (prompt === "login") {
        router.push(`/?${buildLoginParams().toString()}`);
        return;
      }

      let { accessToken } = getTokens();
      const { refreshToken } = getTokens();

      if (prompt === "none") {
        if (!accessToken) {
          const errorParams = new URLSearchParams({
            error: "login_required",
            error_description: "User is not authenticated",
            ...(state && { state }),
          });
          window.location.href = `${redirectUri}?${errorParams.toString()}`;
          return;
        }
      }

      if (!accessToken) {
        router.push(`/?${buildLoginParams().toString()}`);
        return;
      }

      // Auth Server의 authorize/callback 엔드포인트 호출
      const callbackParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: responseType,
        ...(state && { state }),
      });

      // API_URL 확인 및 로깅
      console.log("API_URL:", API_URL);
      
      // 개발 환경 여부 확인
      const isDevEnv = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       process.env.NODE_ENV === 'development';
      
      if (!API_URL) {
        setError("API URL이 설정되지 않았습니다. NEXT_PUBLIC_AUTH_API_URL 환경변수를 확인하세요.");
        return;
      }
      
      // 프로덕션 환경에서만 localhost 차단
      if (API_URL === 'http://localhost:3000' && !isDevEnv) {
        setError("프로덕션 환경에서는 localhost를 사용할 수 없습니다. NEXT_PUBLIC_AUTH_API_URL을 설정하세요.");
        return;
      }

      // API_URL 끝의 슬래시 제거 후 엔드포인트 추가
      const baseUrl = API_URL.replace(/\/$/, '');
      const callbackUrl = `${baseUrl}/oauth/authorize/callback?${callbackParams.toString()}`;

      // OAuth callback 호출 함수
      const callOAuthCallback = async (token: string) => {
        console.log("Calling OAuth callback:", callbackUrl);
        console.log("Access token present:", !!token);
        const response = await fetch(
          callbackUrl,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json', // JSON 응답 요청
            },
            redirect: "manual",
          }
        );

        console.log("OAuth callback response:", {
          status: response.status,
          statusText: response.statusText,
          type: response.type,
          ok: response.ok,
        });

        return response;
      };

      try {
        let response = await callOAuthCallback(accessToken);

        // 401이고 refresh token이 있으면 토큰 갱신 시도
        if (response.status === 401 && refreshToken) {
          console.log("Access token expired, attempting to refresh...");
          try {
            const refreshResponse = await refresh(refreshToken);
            saveTokens(refreshResponse.accessToken, refreshResponse.refreshToken);
            accessToken = refreshResponse.accessToken;
            console.log("Retrying with new access token...");
            response = await callOAuthCallback(accessToken);
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            router.push(`/?${buildLoginParams().toString()}`);
            return;
          }
        }

        // opaque redirect: redirect: "manual" + 서버 302 → status 0, type "opaqueredirect"
        if (response.type === "opaqueredirect") {
          console.warn("Received opaque redirect - server returned a redirect instead of JSON. Retrying without redirect:manual...");
          const retryResponse = await fetch(
            `${API_URL.replace(/\/$/, '')}/oauth/authorize/callback?${new URLSearchParams({
              client_id: clientId,
              redirect_uri: redirectUri,
              response_type: responseType,
              ...(state && { state }),
            }).toString()}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
              },
            }
          );

          if (retryResponse.ok) {
            const data = await retryResponse.json();
            if (data.code) {
              const target = data.redirect_uri || `${redirectUri}?${new URLSearchParams({
                code: data.code,
                ...(data.state || state ? { state: data.state || state } : {}),
              }).toString()}`;
              window.location.href = target;
              return;
            }
          }

          setError("인증 서버에서 예상치 못한 리다이렉트가 발생했습니다. 다시 시도해주세요.");
          return;
        }

        // 네트워크 에러 (status 0이면서 opaqueredirect가 아닌 경우)
        if (response.status === 0) {
          console.error("Network error. Status:", response.status);
          setError("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.");
          return;
        }

        // 200 OK - JSON 응답 처리
        if (response.ok) {
          try {
            const data = await response.json();
            if (data.code) {
              const target = data.redirect_uri || `${redirectUri}?${new URLSearchParams({
                code: data.code,
                ...(data.state || state ? { state: data.state || state } : {}),
              }).toString()}`;
              console.log("Authorization successful. Redirecting to:", target);
              window.location.href = target;
              return;
            }
          } catch (jsonError) {
            console.warn("Failed to parse JSON response:", jsonError);
          }
        }

        // 에러 응답 처리
        if (!response.ok) {
          let errorMessage = `인증 실패 (${response.status})`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error_description || errorData.message || errorMessage;
          } catch {
            const text = await response.text();
            if (text) errorMessage = text;
          }
          console.error("OAuth callback error:", errorMessage);

          if (response.status === 401) {
            router.push(`/?${buildLoginParams().toString()}`);
            return;
          }

          setError(errorMessage);
        }
      } catch (err) {
        console.error("Authorization error:", err);
        setError(`인증 처리 중 오류가 발생했습니다: ${err instanceof Error ? err.message : "알 수 없는 오류"}`);
      }
    };

    processAuthorization();
  }, [router, searchParams]);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-(--card) border border-(--error)/20 rounded-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-(--error) mb-2">
            Authorization Error
          </h1>
          <p className="text-(--muted)">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-2 border-(--primary) border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-(--muted)">Authorizing...</p>
      </div>
    </main>
  );
}

