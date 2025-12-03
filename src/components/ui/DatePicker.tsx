import * as React from "react"
import { createPortal } from "react-dom"
import { Calendar, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReactDatePicker from "react-datepicker"
import { format, isValid, parseISO, startOfDay } from "date-fns"
import { cn } from "../../lib/utils"
import { MobileCalendar } from "./MobileCalendar"
import { useViewport } from "../../hooks/useViewport"
import "react-datepicker/dist/react-datepicker.css"
import "../../styles/datepicker-custom.css"

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
    const [isOpen, setIsOpen] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const { isMobile } = useViewport()
    const [isMounted, setIsMounted] = React.useState(false)
    const generatedId = React.useId()
    const datePickerId = id || generatedId
    const helperId = helperText ? `${datePickerId}-helper` : undefined

    // Ensure component is mounted before rendering
    React.useLayoutEffect(() => {
      setIsMounted(true)
    }, [])

    // DOM cleanup: Remove any react-datepicker popper elements on mobile
    React.useEffect(() => {
      if (!isMounted || !isMobile) return

      const cleanupPoppers = () => {
        // Find and remove any popper elements
        const poppers = document.querySelectorAll('.react-datepicker-popper')
        poppers.forEach(popper => {
          if (popper.parentNode) {
            popper.parentNode.removeChild(popper)
          }
        })

        // Also check the portal container
        const portalContainer = document.getElementById('react-datepicker-root')
        if (portalContainer) {
          const portalPoppers = portalContainer.querySelectorAll('.react-datepicker-popper')
          portalPoppers.forEach(popper => {
            if (popper.parentNode) {
              popper.parentNode.removeChild(popper)
            }
          })
        }
      }

      // Cleanup immediately and on interval (in case poppers are created later)
      cleanupPoppers()
      const interval = setInterval(cleanupPoppers, 100)

      return () => {
        clearInterval(interval)
      }
    }, [isMounted, isMobile])

    // Ensure portal element exists
    React.useEffect(() => {
      if (typeof document !== 'undefined') {
        let portalElement = document.getElementById('react-datepicker-root')
        if (!portalElement) {
          portalElement = document.createElement('div')
          portalElement.id = 'react-datepicker-root'
          document.body.appendChild(portalElement)
        }
      }
    }, [])

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

    // Calculate openToDate - ensure it's within min/max bounds
    const openToDate = React.useMemo(() => {
      // If a date is selected, use it
      if (selectedDate) {
        return selectedDate
      }
      
      // For date of birth fields, default to ~25-30 years ago (more reasonable than maxDate)
      // This provides a better UX than defaulting to the minimum allowed age
      const today = new Date()
      let defaultDate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate())
      
      // Ensure defaultDate is within bounds
      if (minDate && defaultDate < minDate) {
        defaultDate = minDate
      }
      if (maxDate && defaultDate > maxDate) {
        // If our default is beyond maxDate, use maxDate but go back a bit more
        // to show a reasonable range (e.g., if maxDate is 18 years ago, show 20-25 years ago)
        const maxDateObj = new Date(maxDate)
        const adjustedDate = new Date(maxDateObj.getFullYear() - 5, maxDateObj.getMonth(), maxDateObj.getDate())
        defaultDate = (minDate && adjustedDate < minDate) ? maxDate : adjustedDate
      }
      
      return startOfDay(defaultDate)
    }, [selectedDate, minDate, maxDate])

    // Format date for input display
    const displayValue = React.useMemo(() => {
      if (!selectedDate) return ""
      return format(selectedDate, "MM/dd/yyyy")
    }, [selectedDate])

    // Handle date selection
    const handleDateChange = React.useCallback(
      (date: Date | null) => {
        if (!date) {
          const syntheticEvent = {
            target: { value: "" },
            currentTarget: { value: "" },
          } as React.ChangeEvent<HTMLInputElement>
          onChange?.(syntheticEvent)
          onDateChange?.("")
          setIsOpen(false)
          return
        }

        const formattedDate = format(date, "yyyy-MM-dd")
        const syntheticEvent = {
          target: { value: formattedDate },
          currentTarget: { value: formattedDate },
        } as React.ChangeEvent<HTMLInputElement>

        onChange?.(syntheticEvent)
        onDateChange?.(formattedDate)

        const closeDelay = isMobile ? 300 : 150
        setTimeout(() => {
          setIsOpen(false)
          if (!isMobile) {
            setTimeout(() => {
              inputRef.current?.focus()
            }, 50)
          }
        }, closeDelay)
      },
      [onChange, onDateChange, isMobile]
    )

    // Handle manual input (desktop only)
    const handleInputChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value

        if (!inputValue) {
          onChange?.(e)
          onDateChange?.("")
          return
        }

        // Try to parse MM/dd/yyyy format
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(inputValue)) {
          const [month, day, year] = inputValue.split("/")
          const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))

          if (isValid(parsedDate)) {
            if (minDate && parsedDate < minDate) return
            if (maxDate && parsedDate > maxDate) return

            const formattedDate = format(parsedDate, "yyyy-MM-dd")
            e.target.value = formattedDate
            onChange?.(e)
            onDateChange?.(formattedDate)
            return
          }
        }

        onChange?.(e)
      },
      [onChange, onDateChange, minDate, maxDate]
    )

    // Handle input focus
    const handleInputFocus = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true)
        props.onFocus?.(e)
      },
      [props]
    )

    const handleInputBlur = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false)
        props.onBlur?.(e)
      },
      [props]
    )

    // Handle calendar open - ensure openToDate is respected
    const handleCalendarOpen = React.useCallback(() => {
      setIsOpen(true)
    }, [])

    // Handle close
    const handleClose = React.useCallback(() => {
      setIsOpen(false)
    }, [])

    // Prevent body scroll when mobile sheet is open
    React.useEffect(() => {
      if (isMobile && isOpen) {
        document.body.style.overflow = 'hidden'
        return () => {
          document.body.style.overflow = ''
        }
      }
    }, [isMobile, isOpen])

    // Handle escape key
    React.useEffect(() => {
      if (!isOpen) return

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose()
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('keydown', handleEscape)
      }
    }, [isOpen, handleClose])


    // Update gradient indicators based on scroll position
    React.useEffect(() => {
      if (!isOpen) return

      const updateGradients = (element: HTMLElement | null) => {
        if (!element) return

        const { scrollTop, scrollHeight, clientHeight } = element
        const isScrollable = scrollHeight > clientHeight
        const isAtTop = scrollTop <= 1
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1

        if (isScrollable && !isAtTop) {
          element.setAttribute("data-scrolled", "true")
        } else {
          element.removeAttribute("data-scrolled")
        }

        if (isScrollable && !isAtBottom) {
          element.setAttribute("data-at-bottom", "false")
        } else {
          element.setAttribute("data-at-bottom", "true")
        }
      }

      const handleScroll = (e: Event) => {
        const target = e.target as HTMLElement | null
        if (
          target &&
          target.classList &&
          (target.classList.contains("react-datepicker__month-dropdown") ||
          target.classList.contains("react-datepicker__year-dropdown"))
        ) {
          updateGradients(target)
        }
      }

      const checkGradients = () => {
        const monthDropdown = document.querySelector(".react-datepicker__month-dropdown") as HTMLElement
        const yearDropdown = document.querySelector(".react-datepicker__year-dropdown") as HTMLElement
        updateGradients(monthDropdown)
        updateGradients(yearDropdown)
      }

      const initialCheck = setTimeout(checkGradients, 150)

      const calendarContainer = document.querySelector(".react-datepicker")
      const observer = calendarContainer ? new MutationObserver(checkGradients) : null

      if (observer && calendarContainer) {
        observer.observe(calendarContainer, { childList: true, subtree: true })
      }

      document.addEventListener("scroll", handleScroll, true)
      window.addEventListener("resize", checkGradients)

      return () => {
        clearTimeout(initialCheck)
        observer?.disconnect()
        document.removeEventListener("scroll", handleScroll, true)
        window.removeEventListener("resize", checkGradients)
      }
    }, [isOpen])

    // Custom input component
    const CustomInput = React.forwardRef<HTMLInputElement, { value?: string; onClick?: () => void }>(
      ({ onClick }, forwardedRef) => (
        <div className="relative">
          <input
            ref={(node) => {
              inputRef.current = node
              if (typeof forwardedRef === "function") {
                forwardedRef(node)
              } else if (forwardedRef && typeof forwardedRef === "object" && "current" in forwardedRef) {
                const mutableRef = forwardedRef as React.MutableRefObject<HTMLInputElement | null>
                if (mutableRef.current !== undefined) {
                  mutableRef.current = node
                }
              }
              if (typeof ref === "function") {
                ref(node)
              } else if (ref && typeof ref === "object" && "current" in ref) {
                const mutableRef = ref as React.MutableRefObject<HTMLInputElement | null>
                if (mutableRef.current !== undefined) {
                  mutableRef.current = node
                }
              }
            }}
            id={datePickerId}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onClick={onClick}
            readOnly
            placeholder={placeholder || "MM/DD/YYYY"}
            className={cn(
              "flex h-11 sm:h-10 w-full rounded-lg border bg-background px-3 py-2.5 sm:py-2 pr-10 text-base sm:text-sm",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-colors duration-200",
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
            type="button"
            onClick={onClick}
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
      )
    )
    CustomInput.displayName = "CustomInput"

    // Popper modifiers for viewport constraint (using any to bypass type checking for react-datepicker compatibility)
    const popperModifiers = React.useMemo(() => [
      {
        name: 'preventOverflow',
        options: {
          rootBoundary: 'viewport',
          tether: false,
          altAxis: true,
          padding: 8, // 8px padding from viewport edges
        },
      },
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['top', 'bottom', 'left', 'right'],
          rootBoundary: 'viewport',
          padding: 8,
        },
      },
      {
        name: 'offset',
        options: {
          offset: [0, 8], // 8px gap from input
        },
      },
    ] as any, [])

    // DatePicker component props
    const datePickerProps = {
      key: `datepicker-${openToDate?.getTime()}`,
      selected: selectedDate,
      onChange: handleDateChange,
      minDate,
      maxDate,
      openToDate,
      startDate: openToDate,
      showMonthDropdown: true,
      showYearDropdown: true,
      dropdownMode: 'select' as const,
      yearDropdownItemNumber: isMobile ? 5 : 12,
      scrollableYearDropdown: true,
      dateFormat: "MM/dd/yyyy",
      customInput: <CustomInput />,
      open: !isMobile ? isOpen : false, // Only control open state for desktop
      onCalendarOpen: handleCalendarOpen,
      onCalendarClose: handleClose,
    }

    // Mobile Bottom Sheet - Using custom MobileCalendar (NO ReactDatePicker)
    const mobileSheetContent = (
      <>
        {/* Backdrop */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/50 z-40"
          aria-hidden="true"
        />

        {/* Bottom Sheet */}
        <motion.div
          key="sheet"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-2xl z-50 flex flex-col max-h-[85vh] safe-area-inset-bottom"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${datePickerId}-sheet-title`}
        >
          {/* Swipe indicator */}
          <div className="block w-12 h-1 bg-muted rounded-full mx-auto mt-3 mb-2" />

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <h2
              id={`${datePickerId}-sheet-title`}
              className="text-lg font-semibold text-foreground"
            >
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

          {/* Mobile Calendar Content - NO ReactDatePicker */}
          <div className="flex-1 overflow-y-auto p-4">
            <MobileCalendar
              selected={selectedDate}
              onChange={handleDateChange}
              minDate={minDate}
              maxDate={maxDate}
              openToDate={openToDate}
            />
          </div>
        </motion.div>
      </>
    )

    return (
      <>
        <div className="relative w-full">
          {/* Desktop: Standard Popover - ONLY render when NOT mobile AND mounted */}
          {isMounted && !isMobile ? (
            <ReactDatePicker
              {...datePickerProps}
              popperPlacement="bottom-start"
              portalId="react-datepicker-root"
              popperModifiers={popperModifiers}
              popperProps={{
                positionFixed: true,
              } as any}
              popperClassName="react-datepicker-popper-container"
            />
          ) : isMounted && isMobile ? (
            // Mobile: Simple input ONLY - NO ReactDatePicker at all
            <CustomInput onClick={handleCalendarOpen} />
          ) : (
            // Loading state: render input without datepicker until mounted
            <div className="relative">
              <input
                ref={(node) => {
                  inputRef.current = node
                  if (typeof ref === "function") {
                    ref(node)
                  } else if (ref && typeof ref === "object" && "current" in ref) {
                    const mutableRef = ref as React.MutableRefObject<HTMLInputElement | null>
                    if (mutableRef.current !== undefined) {
                      mutableRef.current = node
                    }
                  }
                }}
                id={datePickerId}
                type="text"
                value={displayValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onClick={handleCalendarOpen}
                readOnly
                placeholder={placeholder || "MM/DD/YYYY"}
                className={cn(
                  "flex h-11 sm:h-10 w-full rounded-lg border bg-background px-3 py-2.5 sm:py-2 pr-10 text-base sm:text-sm",
                  "placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "transition-colors duration-200",
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
                type="button"
                onClick={handleCalendarOpen}
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
          )}

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

        {/* Mobile Bottom Sheet Portal - Fixed AnimatePresence wrapping */}
        {typeof document !== 'undefined' && isMounted && isMobile && createPortal(
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

