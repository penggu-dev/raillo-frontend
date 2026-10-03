"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

interface RouteErrorViewProps extends RouteErrorProps {
  /** 다시 시도 대신 벗어날 곳 — 경계마다 가장 가까운 안전한 화면 */
  back: { href: string; label: string };
}

/** 라우트 오류 경계(error.tsx) 화면 — 오류를 기록하고 다시 시도·돌아가기를 보여 준다 */
export function RouteError({ error, reset, back }: RouteErrorViewProps) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
      <AlertCircle className="w-12 h-12 text-destructive" />
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">오류가 발생했습니다</h2>
        <p className="text-sm text-muted-foreground">
          일시적인 오류입니다. 잠시 후 다시 시도해주세요.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push(back.href)}>
          {back.label}
        </Button>
        <Button onClick={reset}>다시 시도</Button>
      </div>
    </div>
  );
}
