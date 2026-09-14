import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function FindAccountLoading() {
  return (
    <div className="min-h-screen">
      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title Skeleton */}
          <div className="text-center mb-8">
            <Skeleton className="h-9 w-72 mx-auto mb-2" />
            <Skeleton className="h-5 w-80 mx-auto" />
          </div>

          <Card className="shadow-elev-md">
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
