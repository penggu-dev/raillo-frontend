import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** 다음 동작 버튼·링크 */
  action?: ReactNode;
  className?: string;
}

/** 빈 목록 상태 — 아이콘 타일 · 제목 · 설명 · 동작 (목업 상태 문서) */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="px-6 py-11 text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-card border bg-muted">
          <Icon className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="mb-1.5 text-lg font-bold text-foreground">{title}</h3>
        {description && <p className={cn("text-sm text-muted-foreground", action && "mb-5")}>{description}</p>}
        {action}
      </CardContent>
    </Card>
  );
}
