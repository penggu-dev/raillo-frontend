"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AUTH_CODE_LENGTH } from "@/constants/validation";
import { useEmailVerification } from "@/hooks/useEmailVerification";

interface EmailVerificationStepProps {
  /** 인증에 성공했을 때 — 다음 단계로 넘어간다 */
  onVerified: () => void;
}

/** 회원정보 변경 1단계 — 등록된 이메일로 인증코드를 받아 확인한다 */
export function EmailVerificationStep({ onVerified }: EmailVerificationStepProps) {
  const { email, codeSent, isSending, isVerifying, sendCode, verifyCode } =
    useEmailVerification();
  const [authCode, setAuthCode] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (await verifyCode(authCode)) onVerified();
  };

  return (
    <div>
      <div className="space-y-3 text-foreground mb-8">
        <p>• 회원정보 변경을 위해 이메일 인증이 필요합니다.</p>
        <p>• 등록된 이메일로 인증코드가 발송됩니다.</p>
      </div>

      {!codeSent ? (
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">인증코드를 발송하시겠습니까?</p>
          <Button
            onClick={sendCode}
            disabled={isSending}
            className="px-8 py-2 rounded-full disabled:opacity-50"
          >
            {isSending ? "처리 중..." : "인증코드 발송"}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="auth-code" className="text-sm font-medium text-foreground">
              인증코드 <span className="text-red-600 dark:text-red-400">*</span>
            </Label>
            <Input
              id="auth-code"
              type="text"
              inputMode="numeric"
              value={authCode}
              // 숫자만·6자리까지
              onChange={(e) =>
                setAuthCode(e.target.value.replace(/[^0-9]/g, "").slice(0, AUTH_CODE_LENGTH))
              }
              placeholder={`인증코드 ${AUTH_CODE_LENGTH}자리 입력`}
              maxLength={AUTH_CODE_LENGTH}
              autoComplete="one-time-code"
            />
            <p className="text-xs text-muted-foreground">
              {email}로 발송된 {AUTH_CODE_LENGTH}자리 인증코드를 입력해주세요.
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={isVerifying}
              className="flex-1 px-6 py-2 rounded-full disabled:opacity-50"
            >
              {isVerifying ? "처리 중..." : "인증 확인"}
            </Button>
            <Button
              type="button"
              onClick={sendCode}
              disabled={isSending || isVerifying}
              variant="outline"
              className="px-6 py-2 text-foreground hover:bg-muted disabled:opacity-50"
            >
              재발송
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
