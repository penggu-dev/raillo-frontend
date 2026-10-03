import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { cn } from "@/lib/utils";

/** 단계 폼의 제출 버튼 — 요청 중에는 스피너와 진행 문구 */
export function LoadingSubmitButton({
  isLoading,
  loadingLabel,
  children,
}: {
  isLoading: boolean;
  loadingLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="text-center pt-4">
      <Button
        type="submit"
        className="font-semibold px-8 py-3"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <LoadingSpinner size="sm" color="white" className="mr-2" />
            {loadingLabel}
          </div>
        ) : (
          children
        )}
      </Button>
    </div>
  );
}

/** 첫 단계로 돌아가는 버튼 */
export function StepBackButton({
  onClick,
  disabled,
  children = "뒤로가기",
}: {
  onClick: () => void;
  disabled: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4">
      <Button
        variant="ghost"
        onClick={onClick}
        className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
        disabled={disabled}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{children}</span>
      </Button>
    </div>
  );
}

/** 단계 아래 안내 상자 — 첫 단계는 회색(muted), 인증 단계는 파랑(primary) */
export function FindAccountGuide({
  icon: Icon,
  title,
  tone,
  children,
}: {
  icon: LucideIcon;
  title: string;
  tone: "muted" | "primary";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        tone === "muted" ? "bg-muted" : "bg-primary/10",
        "rounded-lg p-4",
      )}
    >
      <div className="flex items-start space-x-3">
        <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {children}
          </p>
        </div>
      </div>
    </div>
  );
}
