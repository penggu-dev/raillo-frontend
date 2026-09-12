"use client";

import { useSearchParams } from "next/navigation";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

const LoginHeader = () => {
  const searchParams = useSearchParams();
  const redirectMessage =
    searchParams.get("redirectTo") && "로그인이 필요한 서비스입니다.";
  return (
    <CardHeader className="text-center">
      <CardTitle className="text-2xl font-bold text-foreground">로그인</CardTitle>
      <CardDescription className="text-muted-foreground">
        회원번호로 로그인하세요
      </CardDescription>
      {redirectMessage && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">{redirectMessage}</p>
        </div>
      )}
    </CardHeader>
  );
};

export default LoginHeader;
