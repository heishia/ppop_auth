import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">PPOP Auth</h1>
          <p className="text-[var(--muted)]">
            Secure authentication for PPOP services
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 border border-[var(--border)] hover:border-[var(--muted)] rounded-lg font-medium transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}
