import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function GuestTicketSearchLoading() {
  return (
    <div className="min-h-screen">
      {/* 실제 화면처럼 이동 경로 줄 없이 본문부터 — 이동 경로는 공용 헤더가 그린다 */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-full max-w-96" />
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Skeleton className="h-12 w-48 mx-auto" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
