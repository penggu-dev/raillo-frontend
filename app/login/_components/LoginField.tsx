"use client";

import { Eye, EyeOff, Lock, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { login } from "@/lib/api/authentication";
import { handleError } from "@/lib/utils/errorHandler";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/useToast";

const loginSchema = z.object({
  memberNumber: z.string().min(1, "회원번호를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginField = () => {
  const [showPassword, setShowPassword] = useState(false);
  const setTokens = useAuthStore((state) => state.setTokens);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { memberNumber: "", password: "" },
  });

  useEffect(() => {
    const storedMemberNo = localStorage.getItem("signupMemberNo");
    if (storedMemberNo) {
      setValue("memberNumber", storedMemberNo);
      localStorage.removeItem("signupMemberNo");
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await login({ memberNo: data.memberNumber, password: data.password });
      const expiresIn = Date.now() + result.accessTokenExpiresIn * 1000;
      setTokens(result.accessToken, expiresIn);
      window.location.href = "/";
    } catch (error: unknown) {
      toast({
        title: "오류",
        description: handleError(error, "로그인에 실패했습니다."),
        variant: "destructive",
      });
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label
          htmlFor="memberNumber"
          className="text-sm font-medium text-gray-700"
        >
          회원번호
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="memberNumber"
            type="text"
            placeholder="회원번호를 입력하세요"
            {...register("memberNumber")}
            className="pl-10"
            disabled={isSubmitting}
            autoFocus
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          비밀번호
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호를 입력하세요"
            {...register("password")}
            className="pl-10 pr-10"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            로그인 중...
          </div>
        ) : (
          "로그인"
        )}
      </Button>
    </form>
  );
};

export default LoginField;
