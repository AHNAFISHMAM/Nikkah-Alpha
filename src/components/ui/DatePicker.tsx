import * as React from "react"
import { createPortal } from "react-dom"
import { Calendar, X, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  format,
  isValid,
  parseISO,
  startOfDay,
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
  setYear,
} from "date-fns"
import { cn } from "../../lib/utils"
import { CustomDropdown } from "./CustomDropdown"
import { useViewport } from "../../hooks/useViewport"
import { Popover } from "./Popover"
import { lockBodyScroll, unlockBodyScroll } from "../../utils/scrollLock"

export interface DatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  error?: boolean
  success?: boolean
  onDateChange?: (date: string) => void
  helperText?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  min?: string
  max?: string
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
] as const

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const

// Helper function to parse date strings safely (handles timezone issues)
const parseDateSafe = (dateString: string | undefined): Date | undefined => {
  if (!dateString) return undefined
  
  // If it's an ISO string (YYYY-MM-DD), parse it in UTC to avoid timezone shifts
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(Date.UTC(year, month - 1, day))
  }
  
  // Otherwise, try parseISO from date-fns
  try {
    const parsed = parseISO(dateString)
    return isValid(parsed) ? parsed : undefined
  } catch {
    return undefined
  }
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, error, success, onDateChange, onChange, helperText, id, value, min, max, placeholder, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const { isMobile } = useViewport()
    const generatedId = React.useId()
    const datePickerId = id || generatedId
    const helperId = helperText ? `${datePickerId}-helper` : undefined

    // Parse value to Date object (timezone-safe)
    const selectedDate = React.useMemo(() => {
      if (!value) return null
      const date = parseDateSafe(value)
      return date && isValid(date) ? date : null
    }, [value])

    // Parse min/max dates (timezone-safe)
    const minDate = React.useMemo(() => {
      const date = parseDateSafe(min)
      return date && isValid(date) ? startOfDay(date) : undefined
    }, [min])

    const maxDate = React.useMemo(() => {
      const date = parseDateSafe(max)
      return date && isValid(date) ? startOfDay(date) : undefined
    }, [max])

    // Calculate openToDate - ensure it's within min/max bounds and uses middle of valid year range
    const openToDate = React.useMemo(() => {
      if (selectedDate) return selectedDate
      
      const currentYear = new Date().getFullYear()
      const validMinYear = minDate ? minDate.getFullYear() : currentYear - 100
      const validMaxYear = maxDate ? maxDate.getFullYear() : currentYear - 18
      const middleYear = Math.floor((validMinYear + validMaxYear) / 2)
      const today = new Date()
      let defaultDate = new Date(middleYear, today.getMonth(), today.getDate())
      
      if (minDate && defaultDate < minDate) defaultDate = minDate
      if (maxDate && defaultDate > maxDate) defaultDate = maxDate
      
      return startOfDay(defaultDate)
    }, [selectedDate, minDate, maxDate])

    // Calendar state
    const [currentMonth, setCurrentMonth] = React.useState(() => startOfMonth(openToDate))

    // Sync currentMonth when openToDate changes
    React.useEffect(() => {
      const newMonth = startOfMonth(openToDate)
      if (minDate && isBefore(newMonth, startOfMonth(minDate))) {
        setCurrentMonth(startOfMonth(minDate))
      } else if (maxDate && isAfter(newMonth, startOfMonth(maxDate))) {
        setCurrentMonth(startOfMonth(maxDate))
      } else {
        setCurrentMonth(newMonth)
      }
    }, [openToDate, minDate, maxDate])

    // Format date for input display
    const displayValue = React.useMemo(() => {
      if (!selectedDate) return ""
      return format(selectedDate, "MM/dd/yyyy")
    }, [selectedDate])

    // Handle date selection
    const handleDateChange = React.useCallback((date: Date) => {
      const formattedDate = format(date, "yyyy-MM-dd")
      const syntheticEvent = {
        target: { value: formattedDate },
        currentTarget: { value: formattedDate },
      } as React.ChangeEvent<HTMLInputElement>

      onChange?.(syntheticEvent)
      onDateChange?.(formattedDate)
      setIsOpen(false)
    }, [onChange, onDateChange])

    // Handle manual input
    const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value.trim()
      if (!inputValue) {
        onChange?.(e)
        onDateChange?.("")
        return
      }

      if (/^\d{2}\/\d{2}\/\d{4}$/.test(inputValue)) {
        const [month, day, year] = inputValue.split("/").map(Number)
        const parsedDate = new Date(Date.UTC(year, month - 1, day))
        
        if (isValid(parsedDate)) {
          const dateStart = startOfDay(parsedDate)
          if ((!minDate || dateStart >= startOfDay(minDate)) && (!maxDate || dateStart <= startOfDay(maxDate))) {
            const formattedDate = format(parsedDate, "yyyy-MM-dd")
            e.target.value = formattedDate
            onChange?.(e)
            onDateChange?.(formattedDate)
            return
          }
        }
      }

      onChange?.(e)
    }, [onChange, onDateChange, minDate, maxDate])

    // Generate year options
    const yearOptions = React.useMemo(() => {
      const currentYear = getYear(new Date())
      const startYear = minDate ? getYear(minDate) : currentYear - 100
      const endYear = maxDate ? getYear(maxDate) : currentYear - 18
      return Array.from({ length: endYear - startYear + 1 }, (_, i) => ({
        value: (startYear + i).toString(),
        label: (startYear + i).toString(),
      }))
    }, [minDate, maxDate])

    // Generate month options
    const monthOptions = React.useMemo(() => {
      const currentYearValue = getYear(currentMonth)
      const isCurrentYearMin = minDate && getYear(minDate) === currentYearValue
      const isCurrentYearMax = maxDate && getYear(maxDate) === currentYearValue
      
      return MONTHS.map((month, index) => {
        const monthDate = new Date(currentYearValue, index, 1)
        const monthStart = startOfMonth(monthDate)
        
        let isDisabled = false
        if (isCurrentYearMin && minDate) {
          isDisabled = isBefore(monthStart, startOfMonth(minDate))
        }
        if (isCurrentYearMax && maxDate) {
          isDisabled = isDisabled || isAfter(monthStart, startOfMonth(maxDate))
        }
        
        return {
          value: index.toString(),
          label: month,
          disabled: isDisabled,
        }
      })
    }, [currentMonth, minDate, maxDate])

    // Clamp date to valid range
    const clampToValidRange = React.useCallback((date: Date): Date => {
      let clamped = date
      if (minDate && isBefore(clamped, startOfMonth(minDate))) {
        clamped = startOfMonth(minDate)
      }
      if (maxDate && isAfter(clamped, startOfMonth(maxDate))) {
        clamped = startOfMonth(maxDate)
      }
      return clamped
    }, [minDate, maxDate])

    // Handle month change
    const handleMonthChange = React.useCallback((monthIndex: string) => {
      const monthNum = parseInt(monthIndex, 10)
      if (isNaN(monthNum) || monthNum < 0 || monthNum > 11) return
      const newDate = setMonth(currentMonth, monthNum)
      const clamped = clampToValidRange(startOfMonth(newDate))
      setCurrentMonth(clamped)
    }, [currentMonth, clampToValidRange])

    // Handle year change
    const handleYearChange = React.useCallback((year: string) => {
      const yearNum = parseInt(year, 10)
      if (isNaN(yearNum)) return
      const newDate = setYear(currentMonth, yearNum)
      const clamped = clampToValidRange(startOfMonth(newDate))
      setCurrentMonth(clamped)
    }, [currentMonth, clampToValidRange])

    // Handle previous month
    const handlePreviousMonth = React.useCallback(() => {
      const newMonth = subMonths(currentMonth, 1)
      if (minDate && isBefore(newMonth, startOfMonth(minDate))) return
      setCurrentMonth(newMonth)
    }, [currentMonth, minDate])

    // Handle next month
    const handleNextMonth = React.useCallback(() => {
      const newMonth = addMonths(currentMonth, 1)
      if (maxDate && isAfter(newMonth, startOfMonth(maxDate))) return
      setCurrentMonth(newMonth)
    }, [currentMonth, maxDate])

    // Handle date click
    const handleDateClick = React.useCallback((date: Date) => {
      const dateStart = startOfDay(date)
      if (minDate && isBefore(dateStart, startOfDay(minDate))) return
      if (maxDate && isAfter(dateStart, startOfDay(maxDate))) return
      handleDateChange(dateStart)
    }, [handleDateChange, minDate, maxDate])

    // Get calendar days
    const calendarDays = React.useMemo(() => {
      const monthStart = startOfMonth(currentMonth)
      const monthEnd = endOfMonth(currentMonth)
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    }, [currentMonth])

    // Check if date is disabled
    const isDateDisabled = React.useCallback((date: Date): boolean => {
      const dateStart = startOfDay(date)
      if (minDate && isBefore(dateStart, startOfDay(minDate))) return true
      if (maxDate && isAfter(dateStart, startOfDay(maxDate))) return true
      return false
    }, [minDate, maxDate])

    // Handle toggle
    const handleToggle = React.useCallback(() => {
      setIsOpen(prev => !prev)
    }, [])

    const handleClose = React.useCallback(() => {
      setIsOpen(false)
    }, [])

    // Handle escape key
    React.useEffect(() => {
      if (!isOpen) return
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handleClose()
      }
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, handleClose])

    // Prevent body scroll on mobile (using centralized scroll lock)
    React.useEffect(() => {
      if (isMobile && isOpen) {
        lockBodyScroll()
        return () => unlockBodyScroll()
      }
    }, [isMobile, isOpen])

    // Calendar component
    const CalendarContent = () => (
      <div className="w-full bg-card rounded-xl border border-border shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand/10 to-brand-accent/10 border-b border-border p-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePreviousMonth}
              disabled={minDate && isBefore(subMonths(currentMonth, 1), startOfMonth(minDate))}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "hover:bg-accent active:scale-95",
                "disabled:opacity-30 disabled:cursor-not-allowed",
                "touch-manipulation h-10 w-10 flex items-center justify-center flex-shrink-0"
              )}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>

            <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
              <div className="w-[145px] flex-shrink-0">
                <CustomDropdown
                  value={getMonth(currentMonth).toString()}
                  onChange={handleMonthChange}
                  options={monthOptions}
                  className="h-10 text-sm"
                />
              </div>
              <div className="w-[95px] flex-shrink-0">
                <CustomDropdown
                  value={getYear(currentMonth).toString()}
                  onChange={handleYearChange}
                  options={yearOptions}
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={maxDate && isAfter(addMonths(currentMonth, 1), startOfMonth(maxDate))}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "hover:bg-accent active:scale-95",
                "disabled:opacity-30 disabled:cursor-not-allowed",
                "touch-manipulation h-10 w-10 flex items-center justify-center flex-shrink-0"
              )}
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Calendar Body */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Day names */}
          <div className="grid grid-cols-7 gap-1.5 px-4 pt-4 pb-2 bg-card flex-shrink-0">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-muted-foreground py-1.5"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid - Fixed 7 columns, no overflow */}
          <div className="grid grid-cols-7 gap-1.5 px-4 pb-4 bg-card flex-shrink-0">
            {calendarDays.map((date, idx) => {
              const isCurrentMonth = isSameMonth(date, currentMonth)
              const isSelected = selectedDate && isSameDay(date, selectedDate)
              const isToday = isSameDay(date, new Date())
              const isDisabled = isDateDisabled(date)

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDateClick(date)}
                  disabled={isDisabled}
                  className={cn(
                    "aspect-square rounded-lg text-sm font-medium transition-all duration-200",
                    "touch-manipulation w-full h-full min-h-[40px] flex items-center justify-center",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                    !isCurrentMonth && "text-muted-foreground/40",
                    isCurrentMonth && !isSelected && !isToday && "text-foreground hover:bg-accent",
                    isToday && !isSelected && "bg-brand-soft text-foreground font-semibold border border-brand/30",
                    isSelected && "gradient-brand text-white shadow-md font-semibold scale-105",
                    isDisabled && "opacity-30 cursor-not-allowed hover:bg-transparent"
                  )}
                  aria-label={format(date, "MMMM d, yyyy")}
                  aria-disabled={isDisabled}
                >
                  {format(date, "d")}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )

    // Desktop Modal Calendar - Centered on screen
    const desktopModalContent = (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          aria-hidden="true"
        />
        
        {/* Centered Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${datePickerId}-modal-title`}
        >
          <div 
            className="w-full max-w-[420px] pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CalendarContent />
          </div>
        </motion.div>
      </>
    )

    // Mobile bottom sheet
    const mobileSheetContent = (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/50 z-40"
          aria-hidden="true"
        />
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-2xl z-50 flex flex-col max-h-[85vh] safe-area-inset-bottom"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${datePickerId}-sheet-title`}
        >
          <div className="w-12 h-1 bg-muted rounded-full mx-auto mt-3 mb-2" />
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <h2 id={`${datePickerId}-sheet-title`} className="text-lg font-semibold text-foreground">
              Select Date
            </h2>
            <button
              onClick={handleClose}
              className="h-10 w-10 rounded-lg hover:bg-accent flex items-center justify-center transition-colors touch-manipulation min-h-[44px] min-w-[44px]"
              aria-label="Close date picker"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <CalendarContent />
          </div>
        </motion.div>
      </>
    )

    return (
      <>
        <div ref={containerRef} className="relative w-full">
          {/* Input */}
          <div className="relative">
            <input
              ref={(node) => {
                inputRef.current = node
                if (typeof ref === "function") {
                  ref(node)
                } else if (ref && typeof ref === "object" && "current" in ref) {
                  (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
                }
              }}
              id={datePickerId}
              type="text"
              value={displayValue}
              onChange={handleInputChange}
              onClick={handleToggle}
              onFocus={(e) => {
                setIsFocused(true)
                if (!isMobile) {
                  setIsOpen(true)
                }
                props.onFocus?.(e)
              }}
              onBlur={(e) => {
                setIsFocused(false)
                props.onBlur?.(e)
              }}
              readOnly
              placeholder={placeholder || "MM/DD/YYYY"}
              className={cn(
                "flex h-11 sm:h-10 w-full rounded-lg border bg-background px-3 py-2.5 sm:py-2 pr-10 text-base sm:text-sm",
                "placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "transition-colors duration-200",
                "cursor-pointer",
                isFocused && "ring-2 ring-primary ring-offset-2",
                error && "border-error focus-visible:ring-error",
                success && "border-success focus-visible:ring-success",
                !error && !success && "border-input",
                className
              )}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={helperId}
              {...props}
            />
            <button
              ref={triggerRef}
              type="button"
              onClick={handleToggle}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md",
                "text-muted-foreground hover:text-foreground",
                "transition-colors duration-200",
                "touch-manipulation min-h-[32px] min-w-[32px] flex items-center justify-center"
              )}
              aria-label="Open calendar"
            >
              <Calendar className="h-4 w-4" />
            </button>
          </div>

          {/* Desktop Modal - Centered on screen */}
          {!isMobile && typeof document !== 'undefined' && createPortal(
            <AnimatePresence mode="wait">
              {isOpen ? desktopModalContent : null}
            </AnimatePresence>,
            document.body
          )}

          {/* Helper text */}
          {helperText && (
            <p
              id={helperId}
              className={cn(
                "text-xs mt-1.5 transition-colors duration-200",
                error && "text-error",
                success && "text-success",
                !error && !success && "text-muted-foreground"
              )}
            >
              {helperText}
            </p>
          )}
        </div>

        {/* Mobile Bottom Sheet Portal */}
        {isMobile && typeof document !== 'undefined' && createPortal(
          <AnimatePresence mode="wait">
            {isOpen ? mobileSheetContent : null}
          </AnimatePresence>,
          document.body
        )}
      </>
    )
  }
)
DatePicker.displayName = "DatePicker"

export { DatePicker }
