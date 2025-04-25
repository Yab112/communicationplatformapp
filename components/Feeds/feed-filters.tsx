"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FeedFiltersProps {
  selectedDepartment: string | null
  onDepartmentChange: (department: string | null) => void
  sortOrder: "newest" | "oldest"
  onSortOrderChange: (order: "newest" | "oldest") => void
}

export function FeedFilters({
  selectedDepartment,
  onDepartmentChange,
  sortOrder,
  onSortOrderChange,
}: FeedFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)]">
      <div className="flex-1">
        <h3 className="text-sm font-medium mb-2">Filter by department</h3>
        <Select
          value={selectedDepartment || "all"}
          onValueChange={(value) => onDepartmentChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="Computer Science">Computer Science</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
            <SelectItem value="Business">Business</SelectItem>
            <SelectItem value="Arts">Arts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Sort by</h3>
        <Select value={sortOrder} onValueChange={(value) => onSortOrderChange(value as "newest" | "oldest")}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedDepartment && (
        <div className="self-end mt-2 sm:mt-6">
          <Button variant="ghost" size="sm" onClick={() => onDepartmentChange(null)}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}
