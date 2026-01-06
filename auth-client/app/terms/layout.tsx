"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import Image from "next/image";

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="min-h-[100dvh] w-full bg-white md:bg-transparent flex items-center justify-center font-sans">
      <div className="w-full h-[100dvh] max-w-full md:max-w-[480px] bg-white md:bg-transparent text-gray-900 flex flex-col relative overflow-hidden">
        <header className="w-full px-6 py-4 flex items-center justify-between bg-white md:bg-transparent z-10 flex-shrink-0 border-b border-gray-100">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full active:bg-gray-100 transition-colors text-gray-800"
          >
            <ChevronLeft size={28} />
          </button>
          <Image
            src="/logo-2.png"
            alt="PPOP"
            width={96}
            height={32}
            className="h-8 w-auto"
          />
          <button
            onClick={() => router.push("/signup")}
            className="p-2 -mr-2 rounded-full active:bg-gray-100 transition-colors text-gray-800"
          >
            <X size={28} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

