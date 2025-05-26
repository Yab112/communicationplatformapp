"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Sparkles, Search } from "lucide-react"
import { departments } from "@/constants/departments"
import { cn } from "@/lib/utils"

interface FeedFiltersProps {
  selectedDepartment: string | null
  onDepartmentChange: (department: string | null) => void
  sortOrder: "newest" | "oldest" | "trending" | "hot"
  onSortOrderChange: (order: "newest" | "oldest" | "trending" | "hot") => void
}

export function FeedFilters({
  selectedDepartment,
  onDepartmentChange,
  sortOrder,
  onSortOrderChange,
}: FeedFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex items-center space-x-4">
      <div className="relative w-64">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-9 pl-9 bg-[var(--color-background)] border-[var(--color-border)] focus-visible:ring-1 focus-visible:ring-[var(--color-border)]"
          />
        </div>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-2">
          <Button
            variant={selectedDepartment === null ? "default" : "ghost"}
            size="sm"
            onClick={() => onDepartmentChange(null)}
            className={cn(
              "group relative overflow-hidden rounded-full transition-all duration-300",
              selectedDepartment === null
                ? "bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#FF0080] text-white shadow-lg group-hover:shadow-[#FF0080]/25"
                : "hover:bg-gradient-to-r hover:from-[#FF0080] hover:via-[#7928CA] hover:to-[#FF0080] hover:text-white hover:shadow-lg hover:group-hover:shadow-[#FF0080]/25 bg-[var(--color-background)] backdrop-blur-sm border border-[var(--color-border)]"
            )}
          >
            <div className="relative z-10 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">All Departments</span>
            </div>
            <div className="absolute inset-0 bg-[var(--color-background)]/10 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-0" />
          </Button>
          {filteredDepartments.map(({ name, icon: Icon, gradient, glow }) => (
            <Button
              key={name}
              variant={selectedDepartment === name ? "default" : "ghost"}
              size="sm"
              onClick={() => onDepartmentChange(name)}
              className={cn(
                "group relative overflow-hidden rounded-full transition-all duration-300",
                selectedDepartment === name
                  ? `bg-gradient-to-r ${gradient} text-white shadow-lg ${glow}`
                  : `hover:bg-gradient-to-r hover:${gradient} hover:text-white hover:shadow-lg ${glow} bg-[var(--color-background)] backdrop-blur-sm border border-[var(--color-border)]`
              )}
            >
              <div className="relative z-10 flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="font-medium">{name}</span>
              </div>
              <div className="absolute inset-0 bg-[var(--color-background)]/10 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-0" />
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  )
}
