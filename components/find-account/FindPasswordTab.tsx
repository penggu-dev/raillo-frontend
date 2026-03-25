"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, User, Lock, Mail, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { findPassword, verifyPassword } from "@/lib/api/authMembers";
import { updatePassword } from "@/lib/api/members";
import { handleError } from "@/lib/utils/errorHandler";
import { useToast } from "@/hooks/useToast";

export function FindPasswordTab() {
  const [passwordName, setPasswordName] = useState("");
  const [passwordMemberNumber, setPasswordMemberNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordVerification, setShowPasswordVerification] =
    useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);
  const [passwordUserEmail, setPasswordUserEmail] = useState("");
  const [passwordAuthCode, setPasswordAuthCode] = useState("");
  const [temporaryToken, setTemporaryToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const loginRedirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const router = useRouter();
  const { toast } = useToast();

  // sessionStorage에서 비밀번호 찾기 상태 복원
  useEffect(() => {
    const tempToken = sessionStorage.getItem("tempPasswordToken");
    const tempEmail = sessionStorage.getItem("tempPasswordEmail");

    if (tempToken && tempEmail) {
      setTemporaryToken(tempToken);
      setPasswordUserEmail(tempEmail);
      setShowPasswordChange(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (loginRedirectTimeoutRef.current) {
        clearTimeout(loginRedirectTimeoutRef.current);
      }
    };
  }, []);

  const handleFindPassword = async () => {
    if (!passwordName || !passwordMemberNumber) {
      toast({
        title: "입력 오류",
        description: "이름과 회원번호를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const result = await findPassword({
        name: passwordName,
        memberNo: passwordMemberNumber,
      });
      setPasswordUserEmail(result.email);
      setShowPasswordVerification(true);
    } catch (error: unknown) {
      toast({
        title: "오류",
        description: handleError(error, "비밀번호 찾기에 실패했습니다."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPasswordAuthCode = async (skipLengthCheck = false) => {
    if (!passwordAuthCode) {
      toast({
        title: "입력 오류",
        description: "인증 코드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!skipLengthCheck && passwordAuthCode.length !== 6) {
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
      const result = await verifyPassword({
        email: passwordUserEmail,
        authCode: passwordAuthCode,
      });
      const token = result.temporaryToken;
      setTemporaryToken(token);
      sessionStorage.setItem("tempPasswordToken", token);
      sessionStorage.setItem("tempPasswordEmail", passwordUserEmail);
      setShowPasswordChange(true);
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

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "입력 오류",
        description: "새 비밀번호와 확인 비밀번호를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "입력 오류",
        description: "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "입력 오류",
        description: "비밀번호는 8자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const token =
        sessionStorage.getItem("tempPasswordToken") || temporaryToken;

      if (!token) {
        toast({
          title: "오류",
          description: "임시 토큰이 만료되었습니다. 다시 인증해주세요.",
          variant: "destructive",
        });
        handleBackToPasswordFind();
        return;
      }

      await updatePassword(newPassword, token);
      setShowPasswordSuccess(true);
      setTemporaryToken("");
      sessionStorage.removeItem("tempPasswordToken");
      sessionStorage.removeItem("tempPasswordEmail");

      loginRedirectTimeoutRef.current = setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: unknown) {
      toast({
        title: "오류",
        description: handleError(error, "비밀번호 변경에 실패했습니다."),
        variant: "destructive",
      });
      setTemporaryToken("");
      sessionStorage.removeItem("tempPasswordToken");
      sessionStorage.removeItem("tempPasswordEmail");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordAuthCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setPasswordAuthCode(value);
  };

  const handleBackToPasswordFind = () => {
    setShowPasswordVerification(false);
    setShowPasswordChange(false);
    setShowPasswordSuccess(false);
    setPasswordAuthCode("");
    setPasswordUserEmail("");
    setTemporaryToken("");
    setNewPassword("");
    setConfirmPassword("");
    sessionStorage.removeItem("tempPasswordToken");
    sessionStorage.removeItem("tempPasswordEmail");
  };

  if (
    !showPasswordVerification &&
    !showPasswordChange &&
    !showPasswordSuccess
  ) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <p className="text-gray-700">
            본인이름과 회원번호를 입력 후 조회하세요.
            <br />
            이메일 인증을 통해 본인 확인 후 새 비밀번호를 설정할 수 있습니다.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFindPassword();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="passwordName"
                className="text-sm font-medium text-gray-700"
              >
                이름
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="passwordName"
                  type="text"
                  placeholder="본인이름을 입력하세요"
                  value={passwordName}
                  onChange={(e) => setPasswordName(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="passwordMemberNumber"
                className="text-sm font-medium text-gray-700"
              >
                회원번호
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="passwordMemberNumber"
                  type="text"
                  placeholder="코레일 회원번호를 입력하세요"
                  value={passwordMemberNumber}
                  onChange={(e) => setPasswordMemberNumber(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
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
                "조회"
              )}
            </Button>
          </div>
        </form>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                비밀번호 찾기 안내
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                회원번호를 모르시는 경우 먼저 회원번호 찾기를 이용해 주세요.
                본인 확인 후 등록된 이메일로 인증 코드가 전송되며, 인증 완료 시
                새 비밀번호를 설정할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showPasswordVerification && !showPasswordChange && !showPasswordSuccess) {
    return (
      <div className="space-y-6">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={handleBackToPasswordFind}
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
            <span className="font-medium">{passwordUserEmail}</span>로 인증
            코드를 전송했습니다.
            <br />
            이메일을 확인하여 인증 코드를 입력해주세요.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerifyPasswordAuthCode(false);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label
              htmlFor="passwordAuthCode"
              className="text-sm font-medium text-gray-700"
            >
              인증 코드
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="passwordAuthCode"
                type="text"
                placeholder="인증 코드 6자리를 입력하세요"
                value={passwordAuthCode}
                onChange={handlePasswordAuthCodeChange}
                className={`pl-10 ${passwordAuthCode.length === 6 ? "border-green-500 focus:border-green-500" : ""}`}
                maxLength={6}
                disabled={isLoading}
                autoComplete="one-time-code"
              />
              {passwordAuthCode.length > 0 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  {passwordAuthCode.length}/6
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
              <h3 className="font-semibold text-gray-900 mb-1">
                인증 코드 안내
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                이메일로 전송된 6자리 인증 코드를 입력해주세요. 인증 코드는
                5분간 유효합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showPasswordChange && !showPasswordSuccess) {
    return (
      <div className="space-y-6">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={handleBackToPasswordFind}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isLoading ? "처리 중..." : "뒤로가기"}</span>
          </Button>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            새 비밀번호 설정
          </h3>
          <p className="text-gray-700">새로운 비밀번호를 입력해주세요.</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleChangePassword();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label
              htmlFor="newPassword"
              className="text-sm font-medium text-gray-700"
            >
              새 비밀번호
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="newPassword"
                type="password"
                placeholder="새 비밀번호를 입력하세요 (8자 이상)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700"
            >
              새 비밀번호 확인
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="새 비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="text-center pt-4">
            <Button
              type="submit"
              className={`font-semibold px-8 py-3 ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  비밀번호 변경 중...
                </div>
              ) : (
                "비밀번호 변경"
              )}
            </Button>
          </div>
        </form>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Lock className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                비밀번호 변경 안내
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                비밀번호는 8자 이상이어야 하며, 영문, 숫자, 특수문자를 포함하는
                것을 권장합니다. 비밀번호 변경 후 자동으로 로그인 페이지로
                이동합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          비밀번호 변경 완료!
        </h3>
        <p className="text-gray-700 text-lg mb-6">
          비밀번호가 성공적으로 변경되었습니다.
          <br />
          <span className="text-blue-600 font-medium">
            3초 후 로그인 페이지로 이동합니다.
          </span>
        </p>
      </div>

      <div className="text-center">
        <Button
          onClick={() => router.push("/login")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
          size="lg"
        >
          바로 로그인하기
        </Button>
      </div>

      <div className="bg-green-50 rounded-lg p-4 mt-6">
        <div className="flex items-start space-x-3">
          <svg
            className="h-5 w-5 text-green-600 mt-1 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">변경 완료 안내</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              새로운 비밀번호로 로그인하실 수 있습니다. 보안을 위해 정기적으로
              비밀번호를 변경하시는 것을 권장합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
