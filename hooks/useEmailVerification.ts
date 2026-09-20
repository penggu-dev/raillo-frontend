"use client";

import { useState } from "react";
import {
  sendMemberEmailVerification,
  verifyMemberEmail,
} from "@/lib/api/authentication";
import { AUTH_CODE_LENGTH } from "@/constants/validation";
import { handleError } from "@/lib/utils/errorHandler";
import { useToast } from "@/hooks/useToast";

/**
 * 회원정보 변경 전 이메일 인증 — 등록된 이메일로 코드를 보내고 확인한다.
 * 인증 결과는 화면 상태로만 남고 저장소에 쓰지 않는다.
 */
export const useEmailVerification = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const notifyError = (error: unknown, fallback: string) => {
    toast({
      title: "오류",
      description: handleError(error, fallback),
      variant: "destructive",
    });
  };

  const sendCode = async () => {
    setIsSending(true);
    try {
      const result = await sendMemberEmailVerification();
      setEmail(result.email);
      setCodeSent(true);
      toast({ description: "인증코드가 이메일로 발송되었습니다." });
    } catch (error: unknown) {
      notifyError(error, "인증코드 발송에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSending(false);
    }
  };

  /** 인증에 성공하면 true — 실패·형식 오류는 안내만 하고 false */
  const verifyCode = async (authCode: string): Promise<boolean> => {
    if (authCode.length !== AUTH_CODE_LENGTH) {
      toast({
        title: "입력 오류",
        description: `인증코드는 ${AUTH_CODE_LENGTH}자리 숫자로 입력해주세요.`,
        variant: "destructive",
      });
      return false;
    }

    setIsVerifying(true);
    try {
      const result = await verifyMemberEmail(email, authCode);
      if (!result.isVerified) {
        toast({
          title: "오류",
          description: "인증코드가 올바르지 않습니다. 다시 확인해주세요.",
          variant: "destructive",
        });
        return false;
      }
      toast({ description: "이메일 인증이 완료되었습니다." });
      return true;
    } catch (error: unknown) {
      notifyError(error, "이메일 인증에 실패했습니다. 다시 시도해주세요.");
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  return { email, codeSent, isSending, isVerifying, sendCode, verifyCode };
};
