import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CardListSkeletonProps {
  /** 스크린 리더에 알릴 로딩 문구 (예: "예매 내역을 불러오는 중") */
  label: string;
  /** 스켈레톤 카드 개수 */
  count?: number;
}

/** 목록 화면 로딩 — 카드 모양 스켈레톤(목업 상태 문서의 skrow 구성) */
export function CardListSkeleton({ label, count = 3 }: CardListSkeletonProps) {
  return (
    <div role="status" className="space-y-4">
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, i) => (
        <Card key={i}>
          <CardContent className="grid grid-cols-1 items-center gap-4 p-5 sm:grid-cols-[1.2fr_1fr_1.4fr]">
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/5" />
              <Skeleton className="h-3.5 w-5/6" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-7 w-11/12" />
              <Skeleton className="h-3 w-3/5" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
