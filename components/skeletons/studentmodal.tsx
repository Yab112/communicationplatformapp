import { Skeleton } from "@/components/ui/skeleton"

export default function StudentModalSkeleton() {
  return (
    <div className="flex flex-col h-[400px]">
      <div className="p-4">
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex-1 px-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 