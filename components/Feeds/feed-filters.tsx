"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Code2, Calculator, Atom, Beaker, Dna, Cog, Building2, Palette, BookOpen, Users, GraduationCap, Sparkles } from "lucide-react"

interface FeedFiltersProps {
  selectedDepartment: string | null
  onDepartmentChange: (department: string | null) => void
  sortOrder: "newest" | "oldest" | "trending" | "hot"
  onSortOrderChange: (order: "newest" | "oldest" | "trending" | "hot") => void
}

const departments = [
  {
    name: "All",
    icon: Sparkles,
    gradient: "from-[#FF0080] via-[#7928CA] to-[#FF0080]",
    glow: "group-hover:shadow-[#FF0080]/25"
  },
  {
    name: "Computer Science",
    icon: Code2,
    gradient: "from-[#3B82F6] via-[#2DD4BF] to-[#3B82F6]",
    glow: "group-hover:shadow-[#3B82F6]/25"
  },
  {
    name: "Mathematics",
    icon: Calculator,
    gradient: "from-[#10B981] via-[#34D399] to-[#10B981]",
    glow: "group-hover:shadow-[#10B981]/25"
  },
  {
    name: "Physics",
    icon: Atom,
    gradient: "from-[#F59E0B] via-[#FBBF24] to-[#F59E0B]",
    glow: "group-hover:shadow-[#F59E0B]/25"
  },
  {
    name: "Chemistry",
    icon: Beaker,
    gradient: "from-[#EF4444] via-[#F87171] to-[#EF4444]",
    glow: "group-hover:shadow-[#EF4444]/25"
  },
  {
    name: "Biology",
    icon: Dna,
    gradient: "from-[#22C55E] via-[#4ADE80] to-[#22C55E]",
    glow: "group-hover:shadow-[#22C55E]/25"
  },
  {
    name: "Engineering",
    icon: Cog,
    gradient: "from-[#6366F1] via-[#818CF8] to-[#6366F1]",
    glow: "group-hover:shadow-[#6366F1]/25"
  },
  {
    name: "Business",
    icon: Building2,
    gradient: "from-[#64748B] via-[#94A3B8] to-[#64748B]",
    glow: "group-hover:shadow-[#64748B]/25"
  },
  {
    name: "Arts",
    icon: Palette,
    gradient: "from-[#EC4899] via-[#F472B6] to-[#EC4899]",
    glow: "group-hover:shadow-[#EC4899]/25"
  },
  {
    name: "Humanities",
    icon: BookOpen,
    gradient: "from-[#F59E0B] via-[#FBBF24] to-[#F59E0B]",
    glow: "group-hover:shadow-[#F59E0B]/25"
  },
  {
    name: "Social Sciences",
    icon: Users,
    gradient: "from-[#8B5CF6] via-[#A78BFA] to-[#8B5CF6]",
    glow: "group-hover:shadow-[#8B5CF6]/25"
  },
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
        {departments.map(({ name, icon: Icon, gradient, glow }) => (
          <Button
            key={name}
            variant={selectedDepartment === name ? "default" : "ghost"}
            size="sm"
            onClick={() => onDepartmentChange(name === "All" ? null : name)}
            className={cn(
              "group relative overflow-hidden rounded-full transition-all duration-300",
              selectedDepartment === name
                ? cn(
                    "bg-gradient-to-r bg-[size:200%_auto] animate-gradient",
                    gradient,
                    "text-white shadow-lg",
                    glow
                  )
                : cn(
                    "hover:bg-gradient-to-r hover:bg-[size:200%_auto]",
                    gradient,
                    "hover:text-white hover:shadow-lg",
                    glow,
                    "bg-[var(--color-background)] backdrop-blur-sm border border-[var(--color-border)]"
                  )
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
  )
}
