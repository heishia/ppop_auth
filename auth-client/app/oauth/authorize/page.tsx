import { Suspense } from "react";
import { AuthorizeContent } from "./authorize-content";

export default function AuthorizePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-[var(--primary)] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[var(--muted)]">Loading...</p>
          </div>
        </main>
      }
    >
      <AuthorizeContent />
    </Suspense>
  );
}
