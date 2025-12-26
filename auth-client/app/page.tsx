import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            <span className="text-blue-600">PPOP</span> Auth
          </h1>
          <p className="text-gray-500">
            Secure authentication for PPOP services
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-8 py-3 border border-gray-200 hover:border-gray-300 text-gray-700 rounded-2xl font-medium transition-colors"
          >
            Create Account
          </Link>
        </div>

        {/* Legacy register link */}
        <p className="text-sm text-gray-400">
          <Link href="/register" className="hover:text-gray-600 underline">
            Use simple registration form
          </Link>
        </p>
      </div>
    </main>
  );
}
