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

      // 필수 파라미터 확인
      if (!clientId || !redirectUri || !responseType) {
        setError("Missing required parameters");
        return;
      }

      // 토큰 확인 및 갱신
      let { accessToken } = getTokens();
      const { refreshToken } = getTokens();
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
      const callbackParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: responseType,
        ...(state && { state }),
      });

      // API_URL 확인 및 로깅
      console.log("API_URL:", API_URL);
      if (!API_URL || API_URL === 'http://localhost:3000') {
        setError("API URL이 설정되지 않았습니다. NEXT_PUBLIC_AUTH_API_URL 환경변수를 확인하세요.");
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

        // 401 에러 또는 status 0 (CORS/네트워크 에러)이고 refresh token이 있으면 토큰 갱신 시도
        if ((response.status === 401 || response.status === 0) && refreshToken) {
          console.log("Access token expired or CORS error, attempting to refresh...");
          try {
            const refreshResponse = await refresh(refreshToken);
            // 새 토큰 저장
            saveTokens(refreshResponse.accessToken, refreshResponse.refreshToken);
            accessToken = refreshResponse.accessToken;
            
            // 새 토큰으로 다시 시도
            console.log("Retrying with new access token...");
            response = await callOAuthCallback(accessToken);
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            // Refresh 실패 시 로그인 페이지로
            const loginParams = new URLSearchParams({
              client_id: clientId,
              redirect_uri: redirectUri,
              response_type: responseType,
              ...(state && { state }),
            });
            router.push(`/login?${loginParams.toString()}`);
            return;
          }
        }

        // status가 0이면 CORS 또는 네트워크 에러
        if (response.status === 0) {
          console.error("CORS or network error. Status:", response.status);
          setError("Network error or CORS policy blocked the request. Please check CORS settings.");
          return;
        }

        // 302 리다이렉트 처리 (가장 우선)
        if (response.status === 302 || response.type === "opaqueredirect") {
          const location = response.headers.get("location");
          if (location) {
            console.log("Server redirect detected. Redirecting to:", location);
            // 서버가 리다이렉트한 URL로 이동
            window.location.href = location;
            return;
          }
        }

        // 200 OK 응답 처리 (JSON 응답인 경우 - 우선 처리)
        if (response.ok) {
          try {
            const data = await response.json();
            if (data.code) {
              // JSON 응답에 redirect_uri가 있으면 사용, 없으면 직접 구성
              if (data.redirect_uri) {
                console.log("JSON response with redirect_uri. Redirecting to:", data.redirect_uri);
                window.location.href = data.redirect_uri;
              } else {
                const redirectParams = new URLSearchParams({
                  code: data.code,
                  ...(data.state || state ? { state: data.state || state } : {}),
                });
                console.log("JSON response with code. Redirecting to:", `${redirectUri}?${redirectParams.toString()}`);
                window.location.href = `${redirectUri}?${redirectParams.toString()}`;
              }
              return;
            }
          } catch (jsonError) {
            console.warn("Failed to parse JSON response:", jsonError);
            // JSON 파싱 실패 시 Location 헤더 확인
            const location = response.headers.get("location");
            if (location) {
              console.log("Location header found. Redirecting to:", location);
              window.location.href = location;
              return;
            }
          }
        } else {
          // 404 또는 다른 에러 처리
          let errorMessage = `Authorization failed (${response.status})`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error_description || errorMessage;
          } catch {
            // JSON 파싱 실패 시 텍스트로 시도
            const text = await response.text();
            if (text) {
              errorMessage = text;
            }
          }
          console.error("OAuth callback error:", errorMessage);
          
          // 401 에러이고 refresh token도 없으면 로그인 페이지로
          if (response.status === 401) {
            const loginParams = new URLSearchParams({
              client_id: clientId,
              redirect_uri: redirectUri,
              response_type: responseType,
              ...(state && { state }),
            });
            router.push(`/login?${loginParams.toString()}`);
            return;
          }
          
          setError(errorMessage);
        }
      } catch (err) {
        console.error("Authorization error:", err);
        setError(`Failed to authorize: ${err instanceof Error ? err.message : "Unknown error"}`);
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

