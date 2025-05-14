import { Newspaper } from "lucide-react"
import { PostSkeletonList } from "@/components/skeletons/post-skeleton"
import { AdvertisementSidebarSkeleton } from "@/components/skeletons/advertisement-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export function FeedSkeleton() {
  return (
    <div className="flex h-full">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto content-max-width">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
                    <Newspaper className="h-5 w-5 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <Skeleton className="h-8 w-32 mb-1" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-32" />
                  <Skeleton className="h-9 w-32" />
                </div>
                <Skeleton className="h-9 w-32" />
              </div>
            </div>

            <PostSkeletonList />
          </div>
        </div>
        <AdvertisementSidebarSkeleton />
      </div>
    </div>
  )
} 