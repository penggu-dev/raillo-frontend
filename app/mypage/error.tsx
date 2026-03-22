"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
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
        <Button variant="outline" onClick={() => router.push("/mypage")}>
          마이페이지로
        </Button>
        <Button onClick={reset}>다시 시도</Button>
      </div>
    </div>
  );
}
