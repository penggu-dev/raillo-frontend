"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { findPassword, verifyPassword } from "@/lib/api/authMembers";
import { updatePassword } from "@/lib/api/members";
import { SESSION_STORAGE_KEYS } from "@/constants/storageKeys";
import { AUTH_CODE_LENGTH, PASSWORD_MIN_LENGTH } from "@/constants/validation";
import useErrorToast from "@/hooks/useErrorToast";

/** 비밀번호 찾기 단계 — 조회 → 이메일 인증 → 새 비밀번호 → 완료 */
export type FindPasswordStep = "lookup" | "verify" | "change" | "done";

const LOGIN_REDIRECT_DELAY_MS = 3000;

const clearResetSession = () => {
  sessionStorage.removeItem(SESSION_STORAGE_KEYS.PASSWORD_RESET_TOKEN);
  sessionStorage.removeItem(SESSION_STORAGE_KEYS.PASSWORD_RESET_EMAIL);
};

/**
 * 비밀번호 찾기 흐름 — 입력값·단계·요청을 한곳에서 관리한다.
 * 인증을 마친 임시 토큰은 세션에 보관해, 새로고침해도 새 비밀번호 단계부터 이어 간다.
 */
export const useFindPassword = () => {
  const [step, setStep] = useState<FindPasswordStep>("lookup");
  const [name, setName] = useState("");
  const [memberNo, setMemberNo] = useState("");
  const [email, setEmail] = useState("");
  const [authCode, setAuthCodeValue] = useState("");
  const [temporaryToken, setTemporaryToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const loginRedirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const router = useRouter();
  const { showErrorToast } = useErrorToast();

  // 세션에 인증 결과가 남아 있으면 새 비밀번호 단계부터
  useEffect(() => {
    const tempToken = sessionStorage.getItem(
      SESSION_STORAGE_KEYS.PASSWORD_RESET_TOKEN,
    );
    const tempEmail = sessionStorage.getItem(
      SESSION_STORAGE_KEYS.PASSWORD_RESET_EMAIL,
    );

    if (tempToken && tempEmail) {
      setTemporaryToken(tempToken);
      setEmail(tempEmail);
      setStep("change");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (loginRedirectTimeoutRef.current) {
        clearTimeout(loginRedirectTimeoutRef.current);
      }
    };
  }, []);

  /** 인증 코드는 숫자만 받는다 */
  const setAuthCode = (value: string) => {
    setAuthCodeValue(value.replace(/[^0-9]/g, ""));
  };

  const backToLookup = () => {
    setStep("lookup");
    setAuthCodeValue("");
    setEmail("");
    setTemporaryToken("");
    setNewPassword("");
    setConfirmPassword("");
    clearResetSession();
  };

  const lookUp = async () => {
    if (!name || !memberNo) {
      showErrorToast("이름과 회원 번호를 모두 입력해주세요.", "입력 오류");
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const result = await findPassword({ name, memberNo });
      setEmail(result.email);
      setStep("verify");
    } catch (error: unknown) {
      showErrorToast(error, "비밀번호 찾기에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const verify = async () => {
    if (!authCode) {
      showErrorToast("인증 코드를 입력해주세요.", "입력 오류");
      return;
    }

    if (authCode.length !== AUTH_CODE_LENGTH) {
      showErrorToast("인증 코드는 6자리여야 합니다.", "입력 오류");
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const result = await verifyPassword({ email, authCode });
      const token = result.temporaryToken;
      setTemporaryToken(token);
      sessionStorage.setItem(SESSION_STORAGE_KEYS.PASSWORD_RESET_TOKEN, token);
      sessionStorage.setItem(SESSION_STORAGE_KEYS.PASSWORD_RESET_EMAIL, email);
      setStep("change");
    } catch (error: unknown) {
      showErrorToast(error, "인증 코드 검증에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async () => {
    if (!newPassword || !confirmPassword) {
      showErrorToast(
        "새 비밀번호와 확인 비밀번호를 모두 입력해주세요.",
        "입력 오류",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showErrorToast(
        "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.",
        "입력 오류",
      );
      return;
    }

    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      showErrorToast("비밀번호는 8자 이상이어야 합니다.", "입력 오류");
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const token =
        sessionStorage.getItem(SESSION_STORAGE_KEYS.PASSWORD_RESET_TOKEN) ||
        temporaryToken;

      if (!token) {
        showErrorToast("임시 토큰이 만료되었습니다. 다시 인증해주세요.");
        backToLookup();
        return;
      }

      await updatePassword(newPassword, token);
      setStep("done");
      setTemporaryToken("");
      clearResetSession();

      loginRedirectTimeoutRef.current = setTimeout(() => {
        router.push("/login");
      }, LOGIN_REDIRECT_DELAY_MS);
    } catch (error: unknown) {
      showErrorToast(error, "비밀번호 변경에 실패했습니다.");
      setTemporaryToken("");
      clearResetSession();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    step,
    isLoading,
    name,
    setName,
    memberNo,
    setMemberNo,
    email,
    authCode,
    setAuthCode,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    lookUp,
    verify,
    changePassword,
    backToLookup,
    goToLogin: () => router.push("/login"),
  };
};
