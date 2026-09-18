"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserX className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    회원탈퇴 완료
                  </h2>
                  <p className="text-muted-foreground">
                    회원탈퇴가 성공적으로 완료되었습니다.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  잠시 후 홈페이지로 이동합니다...
                </p>
                <Button className="w-full" asChild>
                  <Link href="/">홈으로 이동</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 뒤로가기 버튼 */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              뒤로가기
            </button>
          </div>

          {/* 경고 알림 */}
          <Alert variant="destructive" role="note" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              회원탈퇴는 되돌릴 수 없습니다. 신중하게 결정해 주세요.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-bold text-foreground">
                <UserX className="h-6 w-6 mr-2 text-red-600 dark:text-red-400" />
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
                <Alert variant="warning" role="note">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle asChild>
                    <h3 className="mb-2 font-semibold">회원탈퇴 시 주의사항</h3>
                  </AlertTitle>
                  <AlertDescription>
                    <ul className="space-y-1">
                      <li>• 모든 개인정보가 영구적으로 삭제됩니다</li>
                      <li>• 구매 내역, 마일리지 등 모든 데이터가 소멸됩니다</li>
                      <li>• 탈퇴 후에는 복구가 불가능합니다</li>
                      <li>• 진행 중인 예약이나 결제가 있다면 취소됩니다</li>
                    </ul>
                  </AlertDescription>
                </Alert>

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
                  <p className="text-xs text-muted-foreground">
                    위 입력란에 "회원탈퇴"를 정확히 입력해주세요
                  </p>
                </div>

                {/* 동의사항 */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">동의사항</h3>

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
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
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
                    variant="destructive"
                    disabled={!isFormValid || isLoading}
                    className="flex-1"
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
