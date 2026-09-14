import LoadingSpinner from "@/components/common/LoadingSpinner";
import { CardListSkeleton } from "@/components/common/CardListSkeleton";
import { Card } from "@/components/ui/card";

/** 열차 조회 로딩 — 인라인 스피너 안내 + 열차 카드 스켈레톤 (목업 상태 문서) */
export function TrainListSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-4">
        <Card className="flex items-center justify-center gap-3 p-5 text-sm font-medium text-muted-foreground">
          <LoadingSpinner size="sm" />
          열차를 조회하는 중…
        </Card>
        <CardListSkeleton label="열차를 조회하는 중" />
      </div>
    </div>
  );
}
