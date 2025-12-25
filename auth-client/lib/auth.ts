// 인증 상태 관리 (클라이언트 사이드)

const ACCESS_TOKEN_KEY = "ppop_access_token";
const REFRESH_TOKEN_KEY = "ppop_refresh_token";

// 토큰 저장
export function saveTokens(accessToken: string, refreshToken: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

// 토큰 조회
export function getTokens() {
  if (typeof window !== "undefined") {
    return {
      accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
      refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    };
  }
  return { accessToken: null, refreshToken: null };
}

// 토큰 삭제
export function clearTokens() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

// 로그인 상태 확인
export function isLoggedIn(): boolean {
  const { accessToken } = getTokens();
  return !!accessToken;
}

// 리다이렉트 URL 저장/조회
export function setRedirectUrl(url: string) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("redirect_url", url);
  }
}

export function getRedirectUrl(): string | null {
  if (typeof window !== "undefined") {
    const url = sessionStorage.getItem("redirect_url");
    sessionStorage.removeItem("redirect_url");
    return url;
  }
  return null;
}

