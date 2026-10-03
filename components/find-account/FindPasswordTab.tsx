"use client";

import { useFindPassword } from "@/hooks/useFindPassword";
import { EmailCodeStep } from "./EmailCodeStep";
import {
  FindPasswordDoneStep,
  FindPasswordLookupStep,
  FindPasswordNewPasswordStep,
} from "./FindPasswordSteps";

/** 비밀번호 찾기 — 조회 → 이메일 인증 → 새 비밀번호 → 완료 */
export function FindPasswordTab() {
  const flow = useFindPassword();

  switch (flow.step) {
    case "lookup":
      return (
        <FindPasswordLookupStep
          name={flow.name}
          onNameChange={flow.setName}
          memberNo={flow.memberNo}
          onMemberNoChange={flow.setMemberNo}
          onSubmit={flow.lookUp}
          isLoading={flow.isLoading}
        />
      );
    case "verify":
      return (
        <EmailCodeStep
          inputId="passwordAuthCode"
          email={flow.email}
          authCode={flow.authCode}
          onAuthCodeChange={flow.setAuthCode}
          onSubmit={flow.verify}
          onBack={flow.backToLookup}
          isLoading={flow.isLoading}
        />
      );
    case "change":
      return (
        <FindPasswordNewPasswordStep
          newPassword={flow.newPassword}
          onNewPasswordChange={flow.setNewPassword}
          confirmPassword={flow.confirmPassword}
          onConfirmPasswordChange={flow.setConfirmPassword}
          onSubmit={flow.changePassword}
          onBack={flow.backToLookup}
          isLoading={flow.isLoading}
        />
      );
    case "done":
      return <FindPasswordDoneStep onLogin={flow.goToLogin} />;
  }
}
