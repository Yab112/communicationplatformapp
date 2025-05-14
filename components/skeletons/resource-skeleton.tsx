import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ResourceSkeleton() {
  return (
    <Card className="overflow-hidden bg-[var(--color-card)] shadow-sm border border-[var(--color-border)] border-l-4">
      <CardHeader className="space-y-3 pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-[200px]" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-[60px] rounded-full" />
            <Skeleton className="h-5 w-[80px] rounded-full" />
            <Skeleton className="h-5 w-[70px] rounded-full" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col p-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-[120px]" />
          </div>
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </CardFooter>
    </Card>
  )
}

export function ResourceSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <ResourceSkeleton key={i} />
      ))}
    </div>
  )
} 