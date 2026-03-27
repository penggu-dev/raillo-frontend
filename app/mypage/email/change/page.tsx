"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { sendEmailVerificationCode, updateEmail } from "@/lib/api/authMembers";
import MyPageSidebar from "@/components/layout/MyPageSidebar";
import { useGetMemberInfo } from "@/hooks/useUser";
import AuthGuard from "@/components/auth/AuthGuard";
import { handleError } from "@/lib/utils/errorHandler";
import { useToast } from "@/hooks/useToast";

const emailSchema = z.object({
  email: z
    .string()
    .min(1, "이메일 주소를 입력해주세요.")
    .email("올바른 이메일 형식을 입력해주세요."),
});

const codeSchema = z.object({
  authCode: z
    .string()
    .length(6, "인증코드는 6자리 숫자로 입력해주세요."),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type CodeFormValues = z.infer<typeof codeSchema>;

function EmailChangePageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    const emailVerified = sessionStorage.getItem("emailVerified");
    const emailVerifiedFor = sessionStorage.getItem("emailVerifiedFor");

    if (!emailVerified || emailVerifiedFor !== "email_change") {
      router.push("/mypage/verify?purpose=email_change");
    }
  }, [router]);

  const { data: memberInfo = null, isLoading: loading } = useGetMemberInfo();

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const codeForm = useForm<CodeFormValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { authCode: "" },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const onSendCode = async (data: EmailFormValues) => {
    try {
      await sendEmailVerificationCode(data.email);
      toast({ description: "인증코드가 이메일로 발송되었습니다." });
      setShowVerification(true);
    } catch (error: unknown) {
      toast({
        title: "오류",
        description: handleError(
          error,
          "인증코드 발송에 실패했습니다. 다시 시도해주세요.",
        ),
        variant: "destructive",
      });
    }
  };

  const onChangeEmail = async (data: CodeFormValues) => {
    try {
      await updateEmail(emailForm.getValues("email"), data.authCode);
      toast({ description: "이메일 변경이 성공적으로 처리되었습니다." });
      sessionStorage.removeItem("emailVerified");
      sessionStorage.removeItem("emailVerifiedFor");
      router.push("/mypage");
    } catch (error: unknown) {
      toast({
        title: "오류",
        description: handleError(
          error,
          "이메일 변경에 실패했습니다. 다시 시도해주세요.",
        ),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <MyPageSidebar memberInfo={memberInfo || undefined} />

          {/* Main Content */}
          <div className="flex-1">
            <Card>
              <CardContent className="p-8">
                {/* 서비스 안내 */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    이메일 변경
                  </h2>
                  <div className="space-y-2 text-gray-700">
                    <p>• 로그인에 사용할 이메일 계정을 변경합니다.</p>
                    <p>
                      • 변경된 이메일 주소로 회원정보의 이메일주소가 자동
                      변경됩니다.
                    </p>
                  </div>
                </div>

                {/* 이메일 변경 폼 */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    새 이메일 주소 입력
                  </h3>
                  <div className="space-y-3 text-sm text-gray-700 mb-6">
                    <p>• 변경할 이메일 주소를 입력해주세요.</p>
                    <p>• 입력하신 이메일로 인증 메일이 발송됩니다.</p>
                  </div>

                  <form
                    onSubmit={emailForm.handleSubmit(onSendCode)}
                    className="flex items-start space-x-4"
                  >
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        새 이메일 주소
                      </label>
                      <Input
                        type="email"
                        placeholder="새 이메일 주소를 입력하세요"
                        {...emailForm.register("email")}
                        className={`w-full ${emailForm.formState.errors.email ? "border-red-500" : ""}`}
                        disabled={showVerification}
                        autoComplete="email"
                      />
                      {emailForm.formState.errors.email && (
                        <p className="text-xs text-red-500 mt-1">
                          {emailForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={emailForm.formState.isSubmitting || showVerification}
                      className="mt-7 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50"
                    >
                      {emailForm.formState.isSubmitting ? "처리 중..." : "인증코드 발송"}
                    </Button>
                  </form>
                </div>

                {/* 인증코드 입력 */}
                {showVerification && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      인증코드 확인
                    </h3>
                    <div className="space-y-3 text-sm text-gray-700 mb-6">
                      <p>• 입력하신 이메일로 발송된 인증코드를 입력해주세요.</p>
                    </div>

                    <form
                      onSubmit={codeForm.handleSubmit(onChangeEmail)}
                      className="flex items-start space-x-4"
                    >
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          인증코드
                        </label>
                        <Controller
                          name="authCode"
                          control={codeForm.control}
                          render={({ field }) => (
                            <Input
                              type="text"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value.replace(/[^0-9]/g, "").slice(0, 6),
                                )
                              }
                              placeholder="인증코드 6자리 입력"
                              maxLength={6}
                              className={`w-full ${codeForm.formState.errors.authCode ? "border-red-500" : ""}`}
                              autoComplete="one-time-code"
                            />
                          )}
                        />
                        {codeForm.formState.errors.authCode && (
                          <p className="text-xs text-red-500 mt-1">
                            {codeForm.formState.errors.authCode.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        disabled={codeForm.formState.isSubmitting}
                        className="mt-7 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50"
                      >
                        {codeForm.formState.isSubmitting ? "처리 중..." : "이메일 변경"}
                      </Button>
                    </form>
                  </div>
                )}

                {/* 주의사항 */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">주의사항</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>
                      • 이메일 변경 후 기존 이메일로는 로그인할 수 없습니다.
                    </li>
                    <li>
                      • 변경된 이메일로 인증 메일이 발송되므로 정확히
                      입력해주세요.
                    </li>
                    <li>• 인증 메일을 확인하여 변경을 완료해주세요.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmailChangePage() {
  return (
    <AuthGuard>
      <EmailChangePageContent />
    </AuthGuard>
  );
}
