"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

/** 로그인이 필요한 화면에서 넘어온 경우(redirectTo)의 안내 — 주소를 읽는 부분만 클라이언트에서 그린다 */
const LoginRedirectNotice = () => {
  const searchParams = useSearchParams();
  if (!searchParams.get("redirectTo")) return null;
  return (
    <Alert variant="info" role="note" className="mt-4 p-3">
      <AlertDescription>로그인이 필요한 서비스입니다.</AlertDescription>
    </Alert>
  );
};

const LoginHeader = () => {
  return (
    <CardHeader className="text-center">
      <CardTitle asChild className="text-2xl font-bold text-foreground">
        <h1>로그인</h1>
      </CardTitle>
      <CardDescription className="text-muted-foreground">
        회원번호로 로그인하세요
      </CardDescription>
      {/* useSearchParams를 경계 안에 둬야 로그인 화면 전체가 서버 HTML에 담긴다(없으면 화면 전체가 클라이언트 렌더링으로 밀림) */}
      <Suspense fallback={null}>
        <LoginRedirectNotice />
      </Suspense>
    </CardHeader>
  );
};

export default LoginHeader;
