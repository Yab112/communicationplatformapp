const TeacherModalSkeleton = () => {
  return (
    <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-primary/20 p-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                </div>
            </div>
        ))}
    </div>
  )
}

export default TeacherModalSkeleton