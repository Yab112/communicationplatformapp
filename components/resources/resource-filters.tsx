"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Search, X, Filter, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { subjects, years, fileTypes } from "@/data/mock/resources";
import { departments } from "@/constants/departments";
import { getCoursesForDepartment } from "@/constants/courses";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";

interface ResourceFiltersProps {
  filters: {
    search: string;
    subject: string;
    year: string;
    fileType: string;
    dateRange: {
      from: Date | undefined;
      to: Date | undefined;
    };
    department: string;
    courseId: string;
    teacherName: string;
  };
  onFilterChange: (filters: ResourceFiltersProps["filters"]) => void;
  onClearFilters: () => void;
}

export function ResourceFilters({ filters, onFilterChange, onClearFilters }: ResourceFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>(filters.department || "");
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [isDepartmentPopoverOpen, setIsDepartmentPopoverOpen] = useState(false);
  const [isCoursePopoverOpen, setIsCoursePopoverOpen] = useState(false);

  // Sync selectedDepartment with filters.department on mount or filter change
  useEffect(() => {
    setSelectedDepartment(filters.department);
  }, [filters.department]);

  // Update available courses when selectedDepartment changes
  useEffect(() => {
    if (selectedDepartment) {
      const courses = getCoursesForDepartment(selectedDepartment);
      setAvailableCourses(courses);
    } else {
      setAvailableCourses([]);
      // Reset courseId when no department is selected
      if (filters.courseId) {
        onFilterChange({ ...filters, courseId: "" });
      }
    }
  }, [selectedDepartment, filters, onFilterChange]);

  // Filter departments based on search
  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(departmentSearch.toLowerCase())
  );

  // Filter courses based on search
  const filteredCourses = availableCourses.filter((course) =>
    course.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleTeacherNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, teacherName: e.target.value });
  };

  const handleSubjectChange = (subject: string) => {
    onFilterChange({ ...filters, subject: filters.subject === subject ? "" : subject });
  };

  const handleYearChange = (year: string) => {
    onFilterChange({ ...filters, year: filters.year === year ? "" : year });
  };

  const handleFileTypeChange = (fileType: string) => {
    onFilterChange({ ...filters, fileType: filters.fileType === fileType ? "" : fileType });
  };

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    onFilterChange({ ...filters, dateRange: range });
  };

  const handleDepartmentChange = (department: string) => {
    const newDepartment = department === filters.department ? "" : department;
    setSelectedDepartment(newDepartment);
    onFilterChange({ ...filters, department: newDepartment, courseId: "" });
    setCourseSearch("");
  };

  const handleCourseChange = (courseId: string) => {
    onFilterChange({ ...filters, courseId: courseId === filters.courseId ? "" : courseId });
    setCourseSearch("");
  };

  // Count active filters (excluding search)
  const activeFilterCount =
    (filters.subject ? 1 : 0) +
    (filters.year ? 1 : 0) +
    (filters.fileType ? 1 : 0) +
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0) +
    (filters.department ? 1 : 0) +
    (filters.courseId ? 1 : 0) +
    (filters.teacherName ? 1 : 0);

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
        <Button
          variant="outline"
          className="flex gap-2 hover:bg-blue-50 hover:text-blue-600"
          onClick={() => setIsFiltersOpen(true)}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="outline" className="ml-1 rounded-full px-1 py-0 text-xs bg-blue-500/90 border-none text-white">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Filter Resources</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Teacher Name</h4>
              <Input
                placeholder="Search by teacher name..."
                value={filters.teacherName}
                onChange={handleTeacherNameChange}
              />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Department</h4>
                <Select
                  value={filters.department}
                  onValueChange={handleDepartmentChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDepartments.map((dept) => (
                      <SelectItem key={dept.name} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium leading-none">Course</h4>
                <Select
                  value={filters.courseId}
                  onValueChange={handleCourseChange}
                  disabled={!filters.department}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCourses.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Subject</h4>
              <div className="flex flex-wrap gap-1">
                {subjects.map((subject) => (
                  <Badge
                    key={subject}
                    variant={filters.subject === subject ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer",
                      filters.subject === subject ? "bg-blue-500 hover:bg-blue-600" : "hover:bg-blue-50"
                    )}
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
                    className={cn(
                      "cursor-pointer",
                      filters.year === year ? "bg-blue-500 hover:bg-blue-600" : "hover:bg-blue-50"
                    )}
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
                    className={cn(
                      "cursor-pointer uppercase",
                      filters.fileType === fileType ? "bg-blue-500 hover:bg-blue-600" : "hover:bg-blue-50"
                    )}
                    onClick={() => handleFileTypeChange(fileType)}
                  >
                    {fileType}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Date Range</h4>
              <DateRangePicker onChange={(range) => handleDateRangeChange(range)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                onClearFilters();
                setSelectedDepartment("");
                setCourseSearch("");
                setDepartmentSearch("");
                setIsFiltersOpen(false);
              }}
              className="hover:bg-blue-50 hover:text-blue-600"
            >
              Clear all
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => setIsFiltersOpen(false)}
            >
              Apply filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.teacherName && (
            <Badge variant="outline" className="flex items-center gap-1 bg-blue-500 border-blue-500 text-white">
              Teacher: {filters.teacherName}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 hover:bg-blue-600"
                onClick={() => onFilterChange({ ...filters, teacherName: "" })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove teacher filter</span>
              </Button>
            </Badge>
          )}
          {filters.subject && (
            <Badge variant="outline" className="flex items-center gap-1 bg-blue-500 border-blue-500 text-white">
              Subject: {filters.subject}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 hover:bg-blue-600"
                onClick={() => onFilterChange({ ...filters, subject: "" })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove subject filter</span>
              </Button>
            </Badge>
          )}
          {filters.year && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-blue-500 border-blue-500 text-white">
              Year: {filters.year}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 hover:bg-blue-600"
                onClick={() => onFilterChange({ ...filters, year: "" })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove year filter</span>
              </Button>
            </Badge>
          )}
          {filters.fileType && (
            <Badge variant="secondary" className="flex items-center gap-1 uppercase bg-blue-500 border-blue-500 text-white">
              Type: {filters.fileType}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 hover:bg-blue-600"
                onClick={() => onFilterChange({ ...filters, fileType: "" })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove file type filter</span>
              </Button>
            </Badge>
          )}
          {(filters.dateRange.from || filters.dateRange.to) && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-blue-500 border-blue-500 text-white">
              Date: {filters.dateRange.from && format(filters.dateRange.from, "MMM d, yyyy")}
              {filters.dateRange.from && filters.dateRange.to && " - "}
              {filters.dateRange.to && format(filters.dateRange.to, "MMM d, yyyy")}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 hover:bg-blue-600"
                onClick={() => handleDateRangeChange({ from: undefined, to: undefined })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove date filter</span>
              </Button>
            </Badge>
          )}
          {filters.department && (
            <Badge variant="outline" className="flex items-center gap-1 bg-blue-500 border-blue-500 text-white">
              Department: {filters.department}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 hover:bg-blue-600"
                onClick={() => {
                  onFilterChange({ ...filters, department: "", courseId: "" });
                  setSelectedDepartment("");
                }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove department filter</span>
              </Button>
            </Badge>
          )}
          {filters.courseId && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-blue-500 border-blue-500 text-white">
              Course: {filters.courseId}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 ml-1 hover:bg-blue-600"
                onClick={() => onFilterChange({ ...filters, courseId: "" })}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove course filter</span>
              </Button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onClearFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}