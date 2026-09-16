"use client";

import { useSearchParams } from "next/navigation";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
        <Alert variant="info" role="note" className="mt-4 p-3">
          <AlertDescription>{redirectMessage}</AlertDescription>
        </Alert>
      )}
    </CardHeader>
  );
};

export default LoginHeader;
