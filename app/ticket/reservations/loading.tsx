import { CardListSkeleton } from "@/components/common/CardListSkeleton";

// 라우트 전환 중 — 페이지 데이터 로딩과 같은 목록 스켈레톤
export default function Loading() {
  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">예약승차권 조회</h2>
            <p className="text-muted-foreground">
              예약한 승차권을 확인하고 결제하거나 취소할 수 있습니다
            </p>
          </div>
          <CardListSkeleton label="예약 목록을 불러오는 중" />
        </div>
      </div>
    </div>
  );
}
