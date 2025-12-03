import * as React from "react"
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addMonths, 
  subMonths,
  isSameMonth,
  isSameDay,
  isBefore,
  isAfter,
  eachDayOfInterval,
  getYear,
  getMonth,
  setMonth,
  setYear
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"
import { CustomDropdown } from "./CustomDropdown"

interface MobileCalendarProps {
  selected?: Date | null
  onChange: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  openToDate?: Date
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export function MobileCalendar({
  selected,
  onChange,
  minDate,
  maxDate,
  openToDate,
}: MobileCalendarProps) {
  const monthDropdownId = React.useId()
  const yearDropdownId = React.useId()
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    if (openToDate) return startOfMonth(openToDate)
    if (selected) return startOfMonth(selected)
    return startOfMonth(new Date())
  })

  // Generate year options (100 years range, centered around current year)
  const currentYear = getYear(new Date())
  const yearOptions = React.useMemo(() => {
    const startYear = Math.max(
      minDate ? getYear(minDate) : currentYear - 50,
      currentYear - 50
    )
    const endYear = Math.min(
      maxDate ? getYear(maxDate) : currentYear + 50,
      currentYear + 50
    )
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
  }, [minDate, maxDate, currentYear])

  // Generate month options
  const monthOptions = React.useMemo(() => {
    return MONTHS.map((month, index) => ({
      value: index.toString(),
      label: month,
    }))
  }, [])

  const handleMonthChange = (monthIndex: string) => {
    const newMonth = parseInt(monthIndex, 10)
    const newDate = setMonth(currentMonth, newMonth)
    setCurrentMonth(startOfMonth(newDate))
  }

  const handleYearChange = (year: string) => {
    const newYear = parseInt(year, 10)
    const newDate = setYear(currentMonth, newYear)
    setCurrentMonth(startOfMonth(newDate))
  }

  const handlePreviousMonth = () => {
    const newMonth = subMonths(currentMonth, 1)
    if (minDate && isBefore(newMonth, startOfMonth(minDate))) {
      return
    }
    setCurrentMonth(newMonth)
  }

  const handleNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1)
    if (maxDate && isAfter(newMonth, startOfMonth(maxDate))) {
      return
    }
    setCurrentMonth(newMonth)
  }

  const handleDateClick = (date: Date) => {
    if (minDate && isBefore(date, minDate)) return
    if (maxDate && isAfter(date, maxDate)) return
    onChange(date)
  }

  // Get calendar days (including previous/next month days)
  const calendarDays = React.useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  const isDateDisabled = (date: Date) => {
    if (minDate && isBefore(date, startOfMonth(minDate)) && !isSameMonth(date, minDate)) return true
    if (maxDate && isAfter(date, endOfMonth(maxDate)) && !isSameMonth(date, maxDate)) return true
    if (minDate && isBefore(date, minDate)) return true
    if (maxDate && isAfter(date, maxDate)) return true
    return false
  }

  const isDateSelected = (date: Date) => {
    return selected ? isSameDay(date, selected) : false
  }

  const isDateToday = (date: Date) => {
    return isSameDay(date, new Date())
  }

  const isCurrentMonth = (date: Date) => {
    return isSameMonth(date, currentMonth)
  }

  return (
    <div className="w-full">
      {/* Header with Month/Year Dropdowns */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          type="button"
          onClick={handlePreviousMonth}
          disabled={minDate && isBefore(subMonths(currentMonth, 1), startOfMonth(minDate))}
          className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
            "hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed",
            "touch-manipulation min-h-[44px] min-w-[44px]"
          )}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 flex-1 justify-center">
          <CustomDropdown
            id={`${monthDropdownId}-month`}
            value={getMonth(currentMonth).toString()}
            onChange={handleMonthChange}
            options={monthOptions}
            className="min-w-[120px]"
          />
          <CustomDropdown
            id={`${yearDropdownId}-year`}
            value={getYear(currentMonth).toString()}
            onChange={handleYearChange}
            options={yearOptions.map(year => ({
              value: year.toString(),
              label: year.toString(),
            }))}
            className="min-w-[80px]"
          />
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          disabled={maxDate && isAfter(addMonths(currentMonth, 1), startOfMonth(maxDate))}
          className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
            "hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed",
            "touch-manipulation min-h-[44px] min-w-[44px]"
          )}
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const disabled = isDateDisabled(date)
          const selected = isDateSelected(date)
          const today = isDateToday(date)
          const currentMonth = isCurrentMonth(date)

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleDateClick(date)}
              disabled={disabled}
              className={cn(
                "h-10 sm:h-11 rounded-lg text-sm font-medium transition-all",
                "touch-manipulation min-h-[40px] min-w-[40px]",
                "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                !currentMonth && "text-muted-foreground opacity-50",
                disabled && "opacity-30 cursor-not-allowed hover:bg-transparent",
                today && !selected && "bg-accent/50",
                selected && "bg-primary text-primary-foreground hover:bg-primary/90",
                !selected && !disabled && currentMonth && "hover:bg-accent"
              )}
              aria-label={format(date, "MMMM d, yyyy")}
            >
              {format(date, "d")}
            </button>
          )
        })}
      </div>
    </div>
  )
}

