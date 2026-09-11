import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function GuestTicketsLoading() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}
      <div className="bg-primary py-6">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-64 mx-auto bg-primary-light" />
        </div>
      </div>

      {/* Breadcrumb Skeleton */}
      <div className="bg-card border-b py-3">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="space-y-6">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader className="bg-secondary">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-6 w-6" />
                      <div>
                        <Skeleton className="h-6 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="space-y-4">
                        <Skeleton className="h-5 w-24" />
                        <div className="space-y-2">
                          {[1, 2, 3, 4].map((k) => (
                            <div key={k} className="flex justify-between">
                              <Skeleton className="h-4 w-16" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-6 pt-6 border-t">
                    {[1, 2, 3].map((k) => (
                      <Skeleton key={k} className="h-8 w-24" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
