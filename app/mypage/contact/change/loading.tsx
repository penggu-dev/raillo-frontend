import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ContactChangeLoading() {
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
                <Skeleton className="h-6 w-80 mb-4" />
                <div className="space-y-2 mb-8">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>

                {/* Email Section Skeleton */}
                <div className="mb-12">
                  <Skeleton className="h-6 w-40 mb-4" />
                  <div className="space-y-2 mb-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-24 mt-7 rounded-full" />
                  </div>
                </div>

                {/* Phone Section Skeleton */}
                <div>
                  <Skeleton className="h-6 w-40 mb-4" />
                  <div className="space-y-2 mb-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-10 w-20" />
                        <span className="text-muted-foreground">-</span>
                        <Skeleton className="h-10 w-24" />
                        <span className="text-muted-foreground">-</span>
                        <Skeleton className="h-10 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-32 rounded-full" />
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
