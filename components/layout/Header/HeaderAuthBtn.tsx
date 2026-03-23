"use client";

import { useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { logout } from "@/lib/api/authentication";
import { useToast } from "@/hooks/useToast";

const HeaderAuthBtn = () => {
  const router = useRouter();
  const { isInitialized, isAuthenticated, removeTokens } = useAuthStore();
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const handleLogout = async () => {
    setIsPending(true);
    try {
      await logout();
      toast({ description: "로그아웃되었습니다." });
      router.push("/");
    } catch (error: unknown) {
      toast({ description: "로그아웃되었습니다." });
      router.push("/");
    } finally {
      // 서버 응답과 무관하게 클라이언트 상태 초기화
      removeTokens();
      setIsPending(false);
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
