"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Train, Home, Printer, Eye, EyeOff } from "lucide-react";
import { updatePassword } from "@/lib/api/members";
import { handleError } from "@/lib/utils/errorHandler";
import { useToast } from "@/hooks/useToast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [passwords, setPasswords] = useState({
    new: "",
    confirm: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePasswordVisibility = (field: "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handlePasswordChange = (field: "new" | "confirm", value: string) => {
    setPasswords((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!passwords.new || !passwords.confirm) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "입력 오류",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    if (passwords.new.length < 8) {
      toast({
        title: "입력 오류",
        description: "비밀번호는 8자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const temporaryToken = sessionStorage.getItem("tempPasswordToken");
      if (!temporaryToken) {
        toast({
          title: "오류",
          description: "임시 토큰이 만료되었습니다. 다시 인증해주세요.",
          variant: "destructive",
        });
        router.push("/find-account");
        return;
      }

      await updatePassword(passwords.new, temporaryToken);

      sessionStorage.removeItem("tempPasswordToken");
      sessionStorage.removeItem("tempPasswordEmail");
      toast({ description: "비밀번호가 성공적으로 변경되었습니다." });
      router.push("/login");
    } catch (error: unknown) {
      toast({
        title: "오류",
        description: handleError(error, "비밀번호 변경에 실패했습니다."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Train className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-blue-600">RAILLO</h1>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/login" className="text-gray-600 hover:text-blue-600">
                로그인
              </Link>
              <Link href="/" className="text-gray-600 hover:text-blue-600">
                홈으로
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-blue-500 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">비밀번호 변경</h1>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Home className="h-4 w-4" />
              <Link href="/" className="hover:text-blue-600">
                홈
              </Link>
              <span>/</span>
              <Link href="/find-account" className="hover:text-blue-600">
                회원번호/비밀번호 찾기
              </Link>
              <span>/</span>
              <span className="text-gray-900">비밀번호 변경</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Printer className="h-4 w-4" />
              <span>인쇄</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                  새 비밀번호 설정
                </h1>

                <div className="space-y-3 mb-8">
                  <p className="text-gray-700">
                    • 새로운 비밀번호를 설정해 주세요.
                  </p>
                  <p className="text-gray-700">
                    • 영문자, 숫자, 특수문자 2가지 이상을 조합하여 8자 이상
                    입력해 주세요.
                  </p>
                  <p className="text-gray-700">
                    • 개인정보와 관련된 숫자, 연속된 숫자, 동일 반복된 숫자 등은
                    사용하지 마십시오.
                  </p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="space-y-6"
              >
                {/* 신규 비밀번호 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="new-password"
                    className="text-base font-medium"
                  >
                    신규 비밀번호 <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPasswords.new ? "text" : "password"}
                      placeholder="신규 비밀번호를 입력하세요"
                      value={passwords.new}
                      onChange={(e) =>
                        handlePasswordChange("new", e.target.value)
                      }
                      className="pr-10 h-12 text-lg"
                      autoComplete="new-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility("new")}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* 비밀번호 확인 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirm-password"
                    className="text-base font-medium"
                  >
                    비밀번호 확인 <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPasswords.confirm ? "text" : "password"}
                      placeholder="확인 비밀번호를 입력하세요"
                      value={passwords.confirm}
                      onChange={(e) =>
                        handlePasswordChange("confirm", e.target.value)
                      }
                      className="pr-10 h-12 text-lg"
                      autoComplete="new-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility("confirm")}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* 비밀번호 일치 확인 */}
                {passwords.new && passwords.confirm && (
                  <div className="text-sm">
                    {passwords.new === passwords.confirm ? (
                      <p className="text-green-600">✓ 비밀번호가 일치합니다.</p>
                    ) : (
                      <p className="text-red-500">
                        ✗ 비밀번호가 일치하지 않습니다.
                      </p>
                    )}
                  </div>
                )}

                {/* 변경완료 버튼 */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg rounded-full"
                    size="lg"
                  >
                    {isSubmitting ? "변경 중..." : "비밀번호 변경완료"}
                  </Button>
                </div>
              </form>

              {/* 추가 링크 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-center space-x-6 text-sm">
                  <Link
                    href="/find-account"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    이전으로
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    로그인하기
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">고객센터</h3>
              <p className="text-sm text-gray-300">1544-7788</p>
              <p className="text-sm text-gray-300">평일 05:30~23:30</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">빠른 링크</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="#" className="hover:text-white">
                    이용약관
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    개인정보처리방침
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    사이트맵
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">RAILLO 소개</h3>
              <p className="text-sm text-gray-300">
                한국철도공사는 국민의 안전하고 편리한 철도여행을 위해 최선을
                다하고 있습니다.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 RAILLO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
