"use client";

import React from "react";
import { Bell } from "lucide-react";

export default function MarketingTermsPage() {
  return (
    <div className="px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
          <Bell size={24} className="text-purple-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">마케팅 정보 수신 동의</h1>
          <p className="text-sm text-gray-500">선택 동의</p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
        <section className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
          <p className="text-purple-800 text-sm font-medium leading-relaxed">
            본 동의는 선택 사항입니다. 동의하지 않으셔도 PPOP 서비스 이용에는 제한이 없습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">1. 마케팅 정보 수신 목적</h2>
          <p className="leading-relaxed">
            주식회사 PPOP(이하 &quot;회사&quot;)은 이용자에게 다양한 혜택과 유용한 정보를 제공하기 위해 마케팅 정보를 발송합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">2. 수신 정보 항목</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>신규 서비스 및 기능 안내</li>
            <li>이벤트 및 프로모션 정보</li>
            <li>할인 쿠폰 및 포인트 혜택</li>
            <li>제휴 서비스 안내</li>
            <li>맞춤형 추천 서비스</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">3. 수신 방법</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-2">📧</div>
              <p className="text-sm font-medium text-gray-700">이메일</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-2">📱</div>
              <p className="text-sm font-medium text-gray-700">SMS/MMS</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-2">🔔</div>
              <p className="text-sm font-medium text-gray-700">앱 푸시</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">4. 이용하는 개인정보 항목</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>이름</li>
            <li>이메일 주소</li>
            <li>휴대전화번호 (수집 시)</li>
            <li>서비스 이용 기록 (맞춤형 추천 목적)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">5. 보유 및 이용 기간</h2>
          <p className="leading-relaxed">
            마케팅 정보 수신 동의일로부터 <strong>회원 탈퇴 시 또는 동의 철회 시까지</strong> 보유 및 이용됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">6. 동의 철회 방법</h2>
          <p className="leading-relaxed mb-3">
            마케팅 정보 수신 동의는 언제든지 철회할 수 있습니다.
          </p>
          <div className="bg-blue-50 rounded-2xl p-4">
            <p className="text-blue-800 text-sm leading-relaxed">
              <strong>철회 방법:</strong><br />
              • 서비스 내 설정 &gt; 알림 설정에서 변경<br />
              • 이메일 하단의 &apos;수신거부&apos; 링크 클릭<br />
              • 고객센터 문의
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">7. 유의사항</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>본 동의를 거부하시더라도 PPOP 서비스 이용에는 제한이 없습니다.</li>
            <li>다만, 할인 쿠폰, 이벤트, 프로모션 등의 혜택 관련 정보를 받아보실 수 없습니다.</li>
            <li>서비스 이용에 필수적인 공지사항은 마케팅 동의와 관계없이 발송됩니다.</li>
          </ul>
        </section>

        <section className="bg-gray-50 rounded-2xl p-4 mt-8">
          <p className="text-gray-500 text-sm">
            <strong>부칙</strong><br />
            이 마케팅 정보 수신 동의서는 2026년 1월 1일부터 시행됩니다.
          </p>
        </section>
      </div>
    </div>
  );
}

