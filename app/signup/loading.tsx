import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function SignupLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Page Header Skeleton */}
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-32 mx-auto bg-primary-light" />
        </div>
      </div>

      {/* Breadcrumb Skeleton */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 입력 필드 스켈레톤 */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}

              {/* 약관 동의 스켈레톤 */}
              <div className="space-y-4 pt-6 border-t border-border">
                <Skeleton className="h-6 w-24" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  ))}
                </div>
              </div>

              {/* 버튼 스켈레톤 */}
              <Skeleton className="h-12 w-full mt-8" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
