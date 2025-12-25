"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Button } from "@/components/ui";
import { login, register, ApiError } from "@/lib/api";
import { saveTokens, getRedirectUrl } from "@/lib/auth";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLogin = mode === "login";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // 회원가입 시 비밀번호 확인
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // 비밀번호 최소 길이
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = isLogin
        ? await login(email, password)
        : await register(email, password);

      // 토큰 저장
      saveTokens(response.accessToken, response.refreshToken);

      // OAuth 리다이렉트 처리
      const redirectUri = searchParams.get("redirect_uri");
      const state = searchParams.get("state");
      const clientId = searchParams.get("client_id");

      if (redirectUri && clientId) {
        // OAuth 흐름: authorize 페이지로 리다이렉트
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: "code",
          ...(state && { state }),
        });
        router.push(`/oauth/authorize?${params.toString()}`);
      } else {
        // 일반 로그인: 저장된 리다이렉트 URL 또는 홈으로
        const savedRedirect = getRedirectUrl();
        router.push(savedRedirect || "/");
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">
            {isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-[var(--muted)] text-sm">
            {isLogin
              ? "Sign in to your account to continue"
              : "Sign up to get started with PPOP"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-lg">
              <p className="text-sm text-[var(--error)]">{error}</p>
            </div>
          )}

          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
          />

          {!isLogin && (
            <Input
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          )}

          <Button type="submit" loading={loading}>
            {isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-[var(--muted)]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <Link
            href={isLogin ? "/register" : "/login"}
            className="text-[var(--primary)] hover:underline font-medium"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </Link>
        </div>
      </div>
    </div>
  );
}

