import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function FindAccountLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Page Header Skeleton */}
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-64 mx-auto bg-primary-light" />
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
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              {/* Tabs Skeleton */}
              <div className="grid grid-cols-2 gap-2 mb-8">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>

              {/* Content Skeleton */}
              <div className="space-y-8">
                <Skeleton className="h-6 w-3/4 mx-auto" />

                <div className="bg-muted rounded-lg p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </div>

                  <div className="text-center pt-4">
                    <Skeleton className="h-12 w-40 mx-auto rounded-full" />
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-6">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>

              {/* Footer Links Skeleton */}
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex justify-center space-x-6">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
