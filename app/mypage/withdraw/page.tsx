"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, ChevronLeft, UserX } from "lucide-react";
import { deleteAccount } from "@/lib/api/members";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import AuthGuard from "@/components/auth/AuthGuard";

function WithdrawPageContent() {
  const removeTokens = useAuthStore((state) => state.removeTokens);
  const [confirmText, setConfirmText] = useState("");
  const [agreements, setAgreements] = useState({
    dataDeletion: false,
    serviceTermination: false,
    noRefund: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const handleAgreementChange = (key: keyof typeof agreements) => {
    setAgreements((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const allAgreementsChecked = Object.values(agreements).every(Boolean);
  const isFormValid = confirmText === "회원탈퇴" && allAgreementsChecked;

  const handleWithdraw = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await deleteAccount();

      // API 함수에서 이미 상태 코드를 확인하므로,
      // 여기까지 오면 성공으로 간주
      setSuccess(true);
      // 토큰 삭제
      removeTokens();

      // 3초 후 홈으로 이동
      redirectTimeoutRef.current = setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "회원탈퇴 처리 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserX className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    회원탈퇴 완료
                  </h2>
                  <p className="text-gray-600">
                    회원탈퇴가 성공적으로 완료되었습니다.
                  </p>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  잠시 후 홈페이지로 이동합니다...
                </p>
                <Link href="/">
                  <Button className="w-full">홈으로 이동</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 뒤로가기 버튼 */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              뒤로가기
            </button>
          </div>

          {/* 경고 알림 */}
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              회원탈퇴는 되돌릴 수 없습니다. 신중하게 결정해 주세요.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold text-gray-900">
                <UserX className="h-6 w-6 mr-2 text-red-600" />
                회원탈퇴
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleWithdraw();
                }}
              >
                {/* 주의사항 */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">
                    회원탈퇴 시 주의사항
                  </h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• 모든 개인정보가 영구적으로 삭제됩니다</li>
                    <li>• 구매 내역, 마일리지 등 모든 데이터가 소멸됩니다</li>
                    <li>• 탈퇴 후에는 복구가 불가능합니다</li>
                    <li>• 진행 중인 예약이나 결제가 있다면 취소됩니다</li>
                  </ul>
                </div>

                {/* 확인 텍스트 */}
                <div className="space-y-2">
                  <Label htmlFor="confirmText" className="text-sm font-medium">
                    확인 문구 입력
                  </Label>
                  <Input
                    id="confirmText"
                    type="text"
                    placeholder="회원탈퇴"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="w-full"
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-500">
                    위 입력란에 "회원탈퇴"를 정확히 입력해주세요
                  </p>
                </div>

                {/* 동의사항 */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">동의사항</h3>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="dataDeletion"
                        checked={agreements.dataDeletion}
                        onCheckedChange={() =>
                          handleAgreementChange("dataDeletion")
                        }
                      />
                      <Label
                        htmlFor="dataDeletion"
                        className="text-sm leading-relaxed"
                      >
                        개인정보 삭제에 동의합니다. (필수)
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="serviceTermination"
                        checked={agreements.serviceTermination}
                        onCheckedChange={() =>
                          handleAgreementChange("serviceTermination")
                        }
                      />
                      <Label
                        htmlFor="serviceTermination"
                        className="text-sm leading-relaxed"
                      >
                        서비스 이용 종료에 동의합니다. (필수)
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="noRefund"
                        checked={agreements.noRefund}
                        onCheckedChange={() =>
                          handleAgreementChange("noRefund")
                        }
                      />
                      <Label
                        htmlFor="noRefund"
                        className="text-sm leading-relaxed"
                      >
                        탈퇴 후 복구 불가능함을 확인합니다. (필수)
                      </Label>
                    </div>
                  </div>
                </div>

                {/* 에러 메시지 */}
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* 버튼 */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.back()}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
                  >
                    {isLoading ? "처리 중..." : "회원탈퇴"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function WithdrawPage() {
  return (
    <AuthGuard>
      <WithdrawPageContent />
    </AuthGuard>
  );
}
