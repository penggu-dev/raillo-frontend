"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { findMemberNo, verifyMemberNo } from "@/lib/api/authMembers";
import { SESSION_STORAGE_KEYS } from "@/constants/storageKeys";
import { AUTH_CODE_LENGTH } from "@/constants/validation";
import useErrorToast from "@/hooks/useErrorToast";
import { EmailCodeStep } from "./EmailCodeStep";
import { FindAccountGuide, LoadingSubmitButton } from "./FindAccountParts";

export function FindMemberTab() {
  const [memberName, setMemberName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [authCode, setAuthCode] = useState("");

  const router = useRouter();
  const { showErrorToast } = useErrorToast();

  const handleFindMember = async () => {
    if (!memberName || !memberPhone) {
      showErrorToast("이름과 휴대폰번호를 모두 입력해주세요.", "입력 오류");
      return;
    }

    if (memberPhone.length !== 11) {
      showErrorToast("휴대폰 번호는 11자리여야 합니다.", "입력 오류");
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const result = await findMemberNo({
        name: memberName,
        phoneNumber: memberPhone,
      });
      setUserEmail(result.email);
      setShowVerification(true);
    } catch (error: unknown) {
      showErrorToast(error, "회원번호 찾기에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAuthCode = async () => {
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
      const result = await verifyMemberNo({
        email: userEmail,
        authCode: authCode,
      });
      sessionStorage.setItem(
        SESSION_STORAGE_KEYS.FOUND_MEMBER_NUMBER,
        result.memberNo,
      );
      router.push("/find-account/result");
    } catch (error: unknown) {
      showErrorToast(error, "인증 코드 검증에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthCodeChange = (value: string) => {
    setAuthCode(value.replace(/[^0-9]/g, ""));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length <= 11) {
      setMemberPhone(value);
    }
  };

  const handleBackToFind = () => {
    setShowVerification(false);
    setAuthCode("");
    setUserEmail("");
  };

  if (!showVerification) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <p className="text-foreground">
            본인이름과 회원가입 시 입력한 휴대전화 번호로 회원번호를 찾으실 수
            있습니다.
            <br />
            이메일 인증을 통해 본인 확인 후 회원번호를 확인할 수 있습니다.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFindMember();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="memberName"
                className="text-sm font-medium text-foreground"
              >
                이름
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="memberName"
                  type="text"
                  placeholder="본인이름을 입력하세요"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="memberPhone"
                className="text-sm font-medium text-foreground"
              >
                휴대폰번호
              </Label>
              <Input
                id="memberPhone"
                type="tel"
                placeholder="휴대폰번호를 -없이 입력하세요 (11자리)"
                value={memberPhone}
                onChange={handlePhoneChange}
                maxLength={11}
                disabled={isLoading}
                autoComplete="tel"
              />
            </div>
          </div>

          <LoadingSubmitButton isLoading={isLoading} loadingLabel="처리 중...">
            회원번호 찾기
          </LoadingSubmitButton>
        </form>

        <FindAccountGuide icon={FileText} title="회원번호 찾기 안내" tone="muted">
          등록된 이메일 주소로 인증 코드가 전송됩니다. 이메일을 확인하여 6자리
          인증 코드를 입력해주세요.
          <br />
          휴대폰번호가 변경되었거나 회원정보와 일치하지 않는 경우 고객센터로
          문의해주세요.
        </FindAccountGuide>
      </div>
    );
  }

  return (
    <EmailCodeStep
      inputId="authCode"
      email={userEmail}
      authCode={authCode}
      onAuthCodeChange={handleAuthCodeChange}
      onSubmit={handleVerifyAuthCode}
      onBack={handleBackToFind}
      isLoading={isLoading}
    />
  );
}
