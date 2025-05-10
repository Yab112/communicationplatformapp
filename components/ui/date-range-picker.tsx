"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  onChange: (range: { from: Date | undefined; to: Date | undefined }) => void
  className?: string
}

export function DateRangePicker({ onChange, className }: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>()

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal hover:bg-blue-50 hover:text-blue-600",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(range) => {
              setDate(range)
              onChange({ from: range?.from, to: range?.to })
            }}
            numberOfMonths={2}
            className="rounded-md border border-blue-100"
            classNames={{
              day_selected: "bg-blue-500 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-500 focus:text-white",
              day_today: "bg-blue-100 text-blue-900",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle: "aria-selected:bg-blue-100 aria-selected:text-blue-900",
              day_hidden: "invisible",
              nav_button: "hover:bg-blue-100",
              nav_button_previous: "hover:bg-blue-100",
              nav_button_next: "hover:bg-blue-100",
              caption: "text-blue-900",
              head_cell: "text-blue-900",
              cell: "hover:bg-blue-50",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
} 