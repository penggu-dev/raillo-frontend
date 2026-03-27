"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { updatePassword } from "@/lib/api/members";
import MyPageSidebar from "@/components/layout/MyPageSidebar";
import { useGetMemberInfo } from "@/hooks/useUser";
import AuthGuard from "@/components/auth/AuthGuard";
import { handleError } from "@/lib/utils/errorHandler";
import { useToast } from "@/hooks/useToast";
import { passwordSchema, PasswordFormValues } from "@/lib/validation/password";

function PasswordChangePageContent() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const emailVerified = sessionStorage.getItem("emailVerified");
    const emailVerifiedFor = sessionStorage.getItem("emailVerifiedFor");

    if (!emailVerified || emailVerifiedFor !== "password_change") {
      router.push("/mypage/verify?purpose=password_change");
    }
  }, [router]);

  const { data: memberInfo = null, isLoading: loading } = useGetMemberInfo();

  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const watchNew = watch("newPassword");
  const watchConfirm = watch("confirmPassword");

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

  const onSubmit = async (data: PasswordFormValues) => {
    try {
      await updatePassword(data.newPassword);
      toast({ description: "비밀번호가 성공적으로 변경되었습니다." });
      sessionStorage.removeItem("emailVerified");
      sessionStorage.removeItem("emailVerifiedFor");
      router.push("/mypage");
    } catch (error: unknown) {
      toast({
        title: "오류",
        description: handleError(
          error,
          "비밀번호 변경에 실패했습니다. 다시 시도해주세요.",
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
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    비밀번호 변경
                  </h1>

                  <div className="space-y-3 mb-8">
                    <p className="text-gray-700">
                      • 새로운 비밀번호를 설정해 주세요.
                    </p>
                    <p className="text-gray-700">
                      • 비밀번호는 8자 이상 입력해 주세요.
                    </p>
                    <p className="text-gray-700">
                      • 개인정보와 관련된 숫자, 연속된 숫자, 동일 반복된 숫자
                      등은 사용하지 마십시오.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* 신규 비밀번호 */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="new-password"
                      className="text-sm font-medium text-gray-700"
                    >
                      새 비밀번호 <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPasswords.new ? "text" : "password"}
                        placeholder="새 비밀번호를 입력하세요 (8자 이상)"
                        {...register("newPassword")}
                        className={`pr-10 ${errors.newPassword ? "border-red-500" : ""}`}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            new: !prev.new,
                          }))
                        }
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-xs text-red-500">
                        {errors.newPassword.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      8자 이상 입력해주세요.
                    </p>
                  </div>

                  {/* 비밀번호 확인 */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm-password"
                      className="text-sm font-medium text-gray-700"
                    >
                      새 비밀번호 확인 <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showPasswords.confirm ? "text" : "password"}
                        placeholder="새 비밀번호를 다시 입력하세요"
                        {...register("confirmPassword")}
                        className={`pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            confirm: !prev.confirm,
                          }))
                        }
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                    {watchConfirm && !errors.confirmPassword && (
                      <p
                        className={`text-xs ${watchNew === watchConfirm ? "text-green-600" : "text-red-500"}`}
                      >
                        {watchNew === watchConfirm
                          ? "비밀번호가 일치합니다."
                          : "비밀번호가 일치하지 않습니다."}
                      </p>
                    )}
                  </div>

                  {/* 수정완료 버튼 */}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50"
                    >
                      {isSubmitting ? "처리 중..." : "비밀번호 변경"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PasswordChangePage() {
  return (
    <AuthGuard>
      <PasswordChangePageContent />
    </AuthGuard>
  );
}
