"use client";

import { LogIn, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { usePostLogout } from "@/hooks/useAuth";

const HeaderAuthBtn = () => {
  const router = useRouter();
  const { isInitialized, isAuthenticated, removeTokens } = useAuthStore();
  const { mutateAsync: logout, isPending } = usePostLogout();

  const handleLogout = async () => {
    try {
      await logout();
      alert("로그아웃되었습니다.");
      router.push("/");
    } catch (error: any) {
      console.error("로그아웃 에러:", error);
      alert("로그아웃되었습니다.");
      router.push("/");
    } finally {
      // 서버 응답과 무관하게 클라이언트 상태 초기화
      removeTokens();
    }
  };

  if (!isInitialized) {
    return null;
  }

  if (isAuthenticated) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center space-x-2"
        disabled={isPending}
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" />
        <span>로그아웃</span>
      </Button>
    );
  }
  return (
    <Link href="/login">
      <Button variant="ghost" size="sm" className="flex items-center space-x-2">
        <LogIn className="h-4 w-4" />
        <span>로그인</span>
      </Button>
    </Link>
  );
};

export default HeaderAuthBtn;
