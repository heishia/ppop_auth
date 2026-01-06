"use client";

import React from "react";
import { FileText } from "lucide-react";

export default function ServiceTermsPage() {
  return (
    <div className="px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
          <FileText size={24} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">서비스 이용약관</h1>
          <p className="text-sm text-gray-500">필수 동의</p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제1조 (목적)</h2>
          <p className="leading-relaxed">
            이 약관은 주식회사 PPOP(이하 &quot;회사&quot;)이 제공하는 PPOP 통합 인증 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제2조 (정의)</h2>
          <p className="leading-relaxed mb-2">이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>&quot;서비스&quot;란 회사가 제공하는 PPOP 통합 인증 서비스 및 관련 제반 서비스를 의미합니다.</li>
            <li>&quot;이용자&quot;란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
            <li>&quot;회원&quot;이란 회사와 서비스 이용계약을 체결하고 회원 아이디를 부여받은 자를 말합니다.</li>
            <li>&quot;아이디(ID)&quot;란 회원의 식별과 서비스 이용을 위하여 회원이 설정하고 회사가 승인한 이메일 주소를 말합니다.</li>
            <li>&quot;비밀번호&quot;란 회원의 동일성 확인과 회원정보의 보호를 위하여 회원이 설정한 문자와 숫자 등의 조합을 말합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제3조 (약관의 효력 및 변경)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>이 약관은 서비스를 이용하고자 하는 모든 이용자에게 그 효력이 발생합니다.</li>
            <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있습니다.</li>
            <li>회사가 약관을 변경하는 경우 변경된 약관의 적용일자 및 변경사유를 명시하여 현행 약관과 함께 서비스 내 공지사항에 적용일자 7일 전부터 공지합니다.</li>
            <li>변경된 약관에 동의하지 않는 회원은 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제4조 (이용계약의 성립)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>이용계약은 이용자가 약관의 내용에 동의한 후 이용신청을 하고 회사가 이를 승낙함으로써 성립합니다.</li>
            <li>회사는 다음 각 호에 해당하는 이용신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                <li>허위의 정보를 기재하거나 필수 정보를 기재하지 않은 경우</li>
                <li>이전에 회원자격을 상실한 적이 있는 경우</li>
                <li>기타 회사가 정한 이용신청 요건이 충족되지 않은 경우</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제5조 (서비스의 제공)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>회사는 다음과 같은 서비스를 제공합니다.
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>통합 인증 서비스 (SSO)</li>
                <li>OAuth 2.0 기반 인증 서비스</li>
                <li>회원 정보 관리 서비스</li>
                <li>기타 회사가 정하는 서비스</li>
              </ul>
            </li>
            <li>서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.</li>
            <li>회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 등의 사유가 발생한 경우 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제6조 (회원의 의무)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>회원은 관계 법령, 이 약관의 규정, 이용안내 등 회사가 통지하는 사항을 준수하여야 하며, 회사의 업무에 방해되는 행위를 하여서는 안 됩니다.</li>
            <li>회원은 아이디와 비밀번호에 관한 관리 책임이 있으며, 이를 제3자에게 이용하게 해서는 안 됩니다.</li>
            <li>회원은 다음 각 호의 행위를 하여서는 안 됩니다.
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>타인의 정보 도용</li>
                <li>회사가 게시한 정보의 변경</li>
                <li>회사가 정한 정보 이외의 정보 등을 송신하거나 게시하는 행위</li>
                <li>회사 및 기타 제3자의 저작권 등 지식재산권에 대한 침해</li>
                <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>기타 공공질서 및 미풍양속에 반하는 행위</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제7조 (개인정보보호)</h2>
          <p className="leading-relaxed">
            회사는 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 사용에 대해서는 관련 법령 및 회사의 개인정보처리방침이 적용됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제8조 (이용계약의 해지)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>회원은 언제든지 서비스 내 설정 메뉴를 통하여 이용계약 해지 신청을 할 수 있으며, 회사는 관련 법령 등이 정하는 바에 따라 이를 즉시 처리합니다.</li>
            <li>회원이 계약을 해지할 경우, 관련 법령 및 개인정보처리방침에 따라 회사가 보유하는 정보를 제외하고는 해지 즉시 모든 데이터가 삭제됩니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제9조 (손해배상)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>회사는 무료로 제공하는 서비스와 관련하여 회원에게 발생한 손해에 대해서는 책임을 지지 않습니다.</li>
            <li>회사는 회원이 서비스를 이용함에 있어 회원의 고의 또는 과실로 인해 발생한 손해에 대해서는 책임을 지지 않습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제10조 (준거법 및 관할법원)</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>이 약관의 해석 및 회사와 회원 간의 분쟁에 대하여는 대한민국 법률을 적용합니다.</li>
            <li>서비스 이용과 관련하여 분쟁이 발생한 경우 회사의 본사 소재지를 관할하는 법원을 전속관할법원으로 합니다.</li>
          </ol>
        </section>

        <section className="bg-gray-50 rounded-2xl p-4 mt-8">
          <p className="text-gray-500 text-sm">
            <strong>부칙</strong><br />
            이 약관은 2026년 1월 1일부터 시행됩니다.
          </p>
        </section>
      </div>
    </div>
  );
}

