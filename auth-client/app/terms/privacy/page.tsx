"use client";

import React from "react";
import { Shield } from "lucide-react";

export default function PrivacyTermsPage() {
  return (
    <div className="px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
          <Shield size={24} className="text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">개인정보 수집 및 이용</h1>
          <p className="text-sm text-gray-500">필수 동의</p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">1. 개인정보의 수집 목적</h2>
          <p className="leading-relaxed">
            주식회사 PPOP(이하 &quot;회사&quot;)은 다음의 목적을 위하여 개인정보를 처리합니다.
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li><strong>회원가입 및 관리:</strong> 회원 식별, 본인확인, 가입의사 확인, 서비스 부정이용 방지</li>
            <li><strong>서비스 제공:</strong> 통합 인증(SSO) 서비스 제공, OAuth 2.0 기반 인증, 맞춤형 서비스 제공</li>
            <li><strong>고객 상담:</strong> 민원 접수 및 처리, 공지사항 전달</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">2. 수집하는 개인정보 항목</h2>
          
          <div className="bg-blue-50 rounded-2xl p-4 mb-4">
            <h3 className="font-bold text-blue-800 mb-2">필수 수집 항목</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• 이메일 주소</li>
              <li>• 비밀번호 (암호화 저장)</li>
              <li>• 이름</li>
              <li>• 생년월일</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 mb-4">
            <h3 className="font-bold text-gray-700 mb-2">선택 수집 항목</h3>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• 프로필 이미지</li>
              <li>• 휴대전화번호</li>
            </ul>
          </div>

          <div className="bg-orange-50 rounded-2xl p-4">
            <h3 className="font-bold text-orange-700 mb-2">자동 수집 항목</h3>
            <ul className="text-orange-600 text-sm space-y-1">
              <li>• 접속 IP 주소</li>
              <li>• 서비스 이용 기록</li>
              <li>• 접속 시간</li>
              <li>• 기기 정보 (OS, 브라우저 종류)</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">3. 개인정보의 보유 및 이용 기간</h2>
          <p className="leading-relaxed mb-3">
            회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
          </p>
          
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-700">항목</th>
                  <th className="text-left p-3 font-semibold text-gray-700">보유 기간</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100">
                  <td className="p-3 text-gray-600">회원 정보</td>
                  <td className="p-3 text-gray-600">회원 탈퇴 시까지</td>
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="p-3 text-gray-600">서비스 이용 기록</td>
                  <td className="p-3 text-gray-600">3년</td>
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="p-3 text-gray-600">접속 로그</td>
                  <td className="p-3 text-gray-600">1년</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">4. 개인정보의 제3자 제공</h2>
          <p className="leading-relaxed mb-3">
            회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            <li>OAuth 연동 시 이용자가 명시적으로 동의한 정보에 한해 제3자 서비스에 제공</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">5. 개인정보의 안전성 확보 조치</h2>
          <p className="leading-relaxed mb-3">
            회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>관리적 조치:</strong> 내부관리계획 수립·시행, 정기적 직원 교육</li>
            <li><strong>기술적 조치:</strong> 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
            <li><strong>물리적 조치:</strong> 전산실, 자료보관실 등의 접근통제</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">6. 정보주체의 권리·의무 및 행사방법</h2>
          <p className="leading-relaxed mb-3">
            이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>개인정보 열람 요구</li>
            <li>오류 등이 있을 경우 정정 요구</li>
            <li>삭제 요구</li>
            <li>처리정지 요구</li>
          </ul>
          <p className="mt-3 leading-relaxed text-gray-600">
            권리 행사는 서비스 내 설정 메뉴 또는 고객센터를 통해 하실 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">7. 개인정보 보호책임자</h2>
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              <strong>개인정보 보호책임자</strong><br />
              성명: 홍길동<br />
              직책: 개인정보보호팀장<br />
              이메일: privacy@ppop.com
            </p>
          </div>
        </section>

        <section className="bg-gray-50 rounded-2xl p-4 mt-8">
          <p className="text-gray-500 text-sm">
            <strong>부칙</strong><br />
            이 개인정보처리방침은 2026년 1월 1일부터 시행됩니다.
          </p>
        </section>
      </div>
    </div>
  );
}

