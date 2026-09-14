import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title: string;
  description?: string;
  /** 재시도·돌아가기 등 동작 버튼 */
  action?: ReactNode;
  className?: string;
}

/** 오류 상태 — 오류 아이콘 · 제목 · 설명 · 동작 (목업 상태 문서). 스크린 리더에 바로 알림 */
export function ErrorState({ title, description, action, className }: ErrorStateProps) {
  return (
    <Card role="alert" className={className}>
      <CardContent className="px-6 py-8 text-center">
        <div className="mx-auto mb-3.5 grid h-[60px] w-[60px] place-items-center rounded-full bg-destructive/10">
          <AlertCircle className="h-7 w-7 text-destructive" aria-hidden="true" />
        </div>
        <h3 className="mb-1.5 text-lg font-bold text-foreground">{title}</h3>
        {description && (
          <p className={cn("text-sm leading-relaxed text-muted-foreground", action && "mb-5")}>{description}</p>
        )}
        {action && <div className="flex justify-center gap-2.5">{action}</div>}
      </CardContent>
    </Card>
  );
}
