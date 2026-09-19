import LoadingSpinner from "@/components/common/LoadingSpinner";

// 라우트 전환 중 — 페이지의 결제 승인 대기와 같은 화면
export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16 text-center">
        <LoadingSpinner className="mx-auto mb-4" />
        <p className="text-muted-foreground">결제를 승인하는 중입니다...</p>
      </div>
    </div>
  );
}
