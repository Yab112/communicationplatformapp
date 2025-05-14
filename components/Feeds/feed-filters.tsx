"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface FeedFiltersProps {
  selectedDepartment: string | null
  onDepartmentChange: (department: string | null) => void
  sortOrder: "newest" | "oldest" | "trending" | "hot"
  onSortOrderChange: (order: "newest" | "oldest" | "trending" | "hot") => void
}

const departments = [
  "All",
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Engineering",
  "Business",
  "Arts",
  "Humanities",
  "Social Sciences",
]

export function FeedFilters({
  selectedDepartment,
  onDepartmentChange,
  sortOrder,
  onSortOrderChange,
}: FeedFiltersProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex w-max space-x-2">
        {departments.map((department) => (
          <Button
            key={department}
            variant={selectedDepartment === department ? "default" : "ghost"}
            size="sm"
            onClick={() => onDepartmentChange(department === "All" ? null : department)}
            className={cn(
              "rounded-full transition-all",
              selectedDepartment === department
                ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90"
                : "hover:bg-[var(--color-muted)]/10"
            )}
          >
            {department}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  )
}
