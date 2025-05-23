import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

function AdvertisementCardSkeleton() {
  return (
    <div className="relative rounded-xl border border-[var(--color-border)] bg-gradient-to-b from-[var(--color-card)] to-[var(--color-card)]/50 p-4">
      <div className="absolute -right-1 -top-1 z-10">
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      
      <div className="relative mb-3 aspect-[16/9] overflow-hidden rounded-lg">
        <Skeleton className="h-full w-full" />
      </div>

      <div className="mb-2">
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>

      <Skeleton className="mb-2 h-5 w-3/4" />
      
      <Skeleton className="mb-4 h-16 w-full" />

      <Skeleton className="h-8 w-full rounded-md" />
    </div>
  )
}

export function AdvertisementSidebarSkeleton() {
  return (
    <div className="hidden w-80 xl:w-96 border-l border-[var(--color-border)] bg-[var(--color-background)] lg:block">
      <div className="sticky top-0 p-6">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-4 pr-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <AdvertisementCardSkeleton key={i} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
} 