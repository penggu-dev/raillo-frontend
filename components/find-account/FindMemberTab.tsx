"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, User, Mail, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { findMemberNo, verifyMemberNo } from "@/lib/api/authMembers";
import { handleError } from "@/lib/utils/errorHandler";
import { useToast } from "@/hooks/useToast";

export function FindMemberTab() {
  const [memberName, setMemberName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [authCode, setAuthCode] = useState("");

  const router = useRouter();
  const { toast } = useToast();

  const handleFindMember = async () => {
    if (!memberName || !memberPhone) {
      toast({
        title: "입력 오류",
        description: "이름과 휴대폰번호를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (memberPhone.length !== 11) {
      toast({
        title: "입력 오류",
        description: "휴대폰번호는 11자리여야 합니다.",
        variant: "destructive",
      });
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
      toast({
        title: "오류",
        description: handleError(error, "회원번호 찾기에 실패했습니다."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAuthCode = async (skipLengthCheck = false) => {
    if (!authCode) {
      toast({
        title: "입력 오류",
        description: "인증 코드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!skipLengthCheck && authCode.length !== 6) {
      toast({
        title: "입력 오류",
        description: "인증 코드는 6자리여야 합니다.",
        variant: "destructive",
      });
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const result = await verifyMemberNo({
        email: userEmail,
        authCode: authCode,
      });
      sessionStorage.setItem("foundMemberNo", result.memberNo);
      router.push("/find-account/result");
    } catch (error: unknown) {
      toast({
        title: "오류",
        description: handleError(error, "인증 코드 검증에 실패했습니다."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setAuthCode(value);
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
          <p className="text-gray-700">
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
                className="text-sm font-medium text-gray-700"
              >
                이름
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                className="text-sm font-medium text-gray-700"
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

          <div className="text-center pt-4">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  처리 중...
                </div>
              ) : (
                "회원번호 찾기"
              )}
            </Button>
          </div>
        </form>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                회원번호 찾기 안내
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                등록된 이메일 주소로 인증 코드가 전송됩니다. 이메일을 확인하여
                6자리 인증 코드를 입력해주세요.
                <br />
                휴대폰번호가 변경되었거나 회원정보와 일치하지 않는 경우
                고객센터로 문의해주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={handleBackToFind}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>뒤로가기</span>
        </Button>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          이메일 인증
        </h3>
        <p className="text-gray-700">
          <span className="font-medium">{userEmail}</span>로 인증 코드를
          전송했습니다.
          <br />
          이메일을 확인하여 인증 코드를 입력해주세요.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleVerifyAuthCode(false);
        }}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label
            htmlFor="authCode"
            className="text-sm font-medium text-gray-700"
          >
            인증 코드
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="authCode"
              type="text"
              placeholder="인증 코드 6자리를 입력하세요"
              value={authCode}
              onChange={handleAuthCodeChange}
              className={`pl-10 ${authCode.length === 6 ? "border-green-500 focus:border-green-500" : ""}`}
              maxLength={6}
              disabled={isLoading}
              autoComplete="one-time-code"
            />
            {authCode.length > 0 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                {authCode.length}/6
              </div>
            )}
          </div>
        </div>

        <div className="text-center pt-4">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                인증 중...
              </div>
            ) : (
              "인증 확인"
            )}
          </Button>
        </div>
      </form>

      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Mail className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">인증 코드 안내</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              이메일로 전송된 6자리 인증 코드를 입력해주세요. 인증 코드는 5분간
              유효합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
