"use client"

import type React from "react"

import { useState } from "react"
import { Search, X, Filter, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { subjects, years, fileTypes } from "@/data/mock/resources"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface ResourceFiltersProps {
  filters: {
    search: string
    subject: string
    year: string
    fileType: string
    dateRange: {
      from: Date | undefined
      to: Date | undefined
    }
  }
  onFilterChange: (filters: ResourceFiltersProps["filters"]) => void
  onClearFilters: () => void
}

export function ResourceFilters({ filters, onFilterChange, onClearFilters }: ResourceFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value })
  }

  const handleSubjectChange = (subject: string) => {
    onFilterChange({ ...filters, subject: filters.subject === subject ? "" : subject })
  }

  const handleYearChange = (year: string) => {
    onFilterChange({ ...filters, year: filters.year === year ? "" : year })
  }

  const handleFileTypeChange = (fileType: string) => {
    onFilterChange({ ...filters, fileType: filters.fileType === fileType ? "" : fileType })
  }

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    onFilterChange({ ...filters, dateRange: range })
  }

  // Count active filters (excluding search)
  const activeFilterCount =
    (filters.subject ? 1 : 0) +
    (filters.year ? 1 : 0) +
    (filters.fileType ? 1 : 0) +
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search resources..."
            className="pl-8"
            value={filters.search}
            onChange={handleSearchChange}
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-9 w-9 p-0"
              onClick={() => onFilterChange({ ...filters, search: "" })}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="outline" className="ml-1 rounded-full px-1 py-0 text-xs bg-blue-500/90 border-none text-white">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[340px] p-4" align="end">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Subject</h4>
                <div className="flex flex-wrap gap-1">
                  {subjects.map((subject) => (
                    <Badge
                      key={subject}
                      variant={filters.subject === subject ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleSubjectChange(subject)}
                    >
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Year</h4>
                <div className="flex flex-wrap gap-1">
                  {years.map((year) => (
                    <Badge
                      key={year}
                      variant={filters.year === year ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleYearChange(year)}
                    >
                      {year}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium leading-none">File Type</h4>
                <div className="flex flex-wrap gap-1">
                  {fileTypes.map((fileType) => (
                    <Badge
                      key={fileType}
                      variant={filters.fileType === fileType ? "default" : "outline"}
                      className="cursor-pointer uppercase"
                      onClick={() => handleFileTypeChange(fileType)}
                    >
                      {fileType}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Upload Date</h4>
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="from" className="text-xs">
                        From
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="from"
                            variant="outline"
                            size="sm"
                            className={cn(
                              "justify-start text-left font-normal",
                              !filters.dateRange.from && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateRange.from ? format(filters.dateRange.from, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.dateRange.from}
                            onSelect={(date) => handleDateRangeChange({ ...filters.dateRange, from: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="to" className="text-xs">
                        To
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="to"
                            variant="outline"
                            size="sm"
                            className={cn(
                              "justify-start text-left font-normal",
                              !filters.dateRange.to && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateRange.to ? format(filters.dateRange.to, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.dateRange.to}
                            onSelect={(date) => handleDateRangeChange({ ...filters.dateRange, to: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  {(filters.dateRange.from || filters.dateRange.to) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1"
                      onClick={() => handleDateRangeChange({ from: undefined, to: undefined })}
                    >
                      Clear dates
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" size="sm" onClick={onClearFilters}>
                  Clear all
                </Button>
                <Button size="sm" onClick={() => setIsFiltersOpen(false)}>
                  Apply filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.subject && (
            <Badge variant="outline" className="flex items-center gap-1 bg-blue-600 border-blue-600 text-white">
              Subject: {filters.subject}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => onFilterChange({ ...filters, subject: "" })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove subject filter</span>
              </Button>
            </Badge>
          )}
          {filters.year && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-blue-600 border-blue-600 text-white">
              Year: {filters.year}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => onFilterChange({ ...filters, year: "" })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove year filter</span>
              </Button>
            </Badge>
          )}
          {filters.fileType && (
            <Badge variant="secondary" className="flex items-center gap-1 uppercase bg-blue-600 border-blue-600 text-white">
              Type: {filters.fileType}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => onFilterChange({ ...filters, fileType: "" })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove file type filter</span>
              </Button>
            </Badge>
          )}
          {(filters.dateRange.from || filters.dateRange.to) && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-blue-600 border-blue-600 text-white">
              Date: {filters.dateRange.from && format(filters.dateRange.from, "MMM d, yyyy")}
              {filters.dateRange.from && filters.dateRange.to && " - "}
              {filters.dateRange.to && format(filters.dateRange.to, "MMM d, yyyy")}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => handleDateRangeChange({ from: undefined, to: undefined })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove date filter</span>
              </Button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onClearFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
