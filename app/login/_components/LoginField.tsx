"use client";

import { Eye, EyeOff, Lock, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { login } from "@/lib/api/authentication";
import { handleError } from "@/lib/utils/errorHandler";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";

const LoginField = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [memberNumber, setMemberNumber] = useState("");
  const [password, setPassword] = useState("");
  const setTokens = useAuthStore((state) => state.setTokens);
  const { toast } = useToast();
  const memberNumberInputRef = useRef<HTMLInputElement>(null);

  // 페이지 로드 시 localStorage에서 회원번호 가져오기
  useEffect(() => {
    const storedMemberNo = localStorage.getItem("signupMemberNo");
    if (storedMemberNo) {
      setMemberNumber(storedMemberNo);
      // 회원번호를 가져온 후 localStorage에서 삭제
      localStorage.removeItem("signupMemberNo");
    }
  }, []);

  const handleMemberLogin = async (e?: React.FormEvent) => {
    e?.preventDefault(); // form 제출 시 기본 동작 방지

    if (!memberNumber || !password) {
      toast({
        title: "입력 오류",
        description: "회원번호와 비밀번호를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (isLoading) return; // 중복 클릭 방지

    setIsLoading(true);

    try {
      const result = await login({ memberNo: memberNumber, password });
      // 토큰 만료 시각은 ms 단위 절대 시각으로 저장
      const expiresIn = Date.now() + result.accessTokenExpiresIn * 1000;
      setTokens(result.accessToken, expiresIn);
      window.location.href = "/";
    } catch (error: unknown) {
      toast({
        title: "오류",
        description: handleError(error, "로그인에 실패했습니다."),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleMemberLogin}>
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
            ref={memberNumberInputRef}
            id="memberNumber"
            type="text"
            placeholder="회원번호를 입력하세요"
            value={memberNumber}
            onChange={(e) => setMemberNumber(e.target.value)}
            className="pl-10"
            disabled={isLoading}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            disabled={isLoading}
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
        disabled={isLoading}
      >
        {isLoading ? (
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
