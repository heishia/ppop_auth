import { Suspense } from "react";
import { AuthForm } from "@/components/auth";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <AuthForm mode="register" />
      </Suspense>
    </main>
  );
}

