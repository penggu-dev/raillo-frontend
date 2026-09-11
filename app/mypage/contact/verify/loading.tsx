import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ContactVerifyLoading() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar Skeleton */}
          <div className="lg:w-80">
            <Card className="mb-6">
              <CardContent className="p-6">
                <Skeleton className="h-16 w-16 mx-auto mb-4 rounded-full" />
                <Skeleton className="h-6 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="px-4 py-3">
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-1">
            <Card>
              <CardContent className="p-8">
                <Skeleton className="h-8 w-64 mb-8" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="text-center">
                      <Skeleton className="w-32 h-32 mx-auto mb-4 rounded-lg" />
                      <Skeleton className="h-6 w-48 mx-auto mb-4" />
                      <Skeleton className="h-10 w-36 mx-auto rounded-full" />
                    </div>
                  ))}
                </div>

                <div className="bg-muted rounded-lg p-6">
                  <Skeleton className="h-6 w-16 mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
