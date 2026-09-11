import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function SignupVerifyLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Page Header Skeleton */}
      <div className="bg-blue-500 text-white py-6">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-48 mx-auto bg-blue-400" />
        </div>
      </div>

      {/* Breadcrumb Skeleton */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-8">
              <div className="mb-8">
                <Skeleton className="h-8 w-64 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* 인증 방법 스켈레톤 */}
                {[1, 2].map((i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="w-32 h-32 mx-auto mb-4 rounded-lg" />
                    <Skeleton className="h-6 w-48 mx-auto mb-4" />
                    <Skeleton className="h-10 w-40 mx-auto rounded-full" />
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <Skeleton className="h-6 w-16 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
