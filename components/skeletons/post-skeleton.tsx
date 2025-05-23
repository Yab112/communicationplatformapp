import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export function PostSkeleton() {
  return (
    <Card className="overflow-hidden bg-[var(--color-card)] shadow-sm border border-[var(--color-border)]">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-4 w-[120px] mb-1" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
          <Skeleton className="h-5 w-[80px]" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
          <Skeleton className="relative aspect-video w-full rounded-lg" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col p-0">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-[30px]" />
            </div>
          </div>
          <Skeleton className="h-4 w-[80px]" />
        </div>
        <Separator />
        <div className="flex p-1">
          <div className="flex-1 mx-1">
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex-1 mx-1">
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export function PostSkeletonList() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  )
} 