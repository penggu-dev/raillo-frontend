import { CardListSkeleton } from "@/components/common/CardListSkeleton";

// 라우트 전환 중 — 페이지 데이터 로딩과 같은 목록 스켈레톤
export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">예매 내역</h2>
            <p className="text-muted-foreground">
              예매번호와 영수증 상세를 확인할 수 있습니다
            </p>
          </div>
          <CardListSkeleton label="예매 내역을 불러오는 중" />
        </div>
      </div>
    </div>
  );
}
