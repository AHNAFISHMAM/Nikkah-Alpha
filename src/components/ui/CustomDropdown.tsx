import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "../../lib/utils"
import { Popover } from "./Popover"

export interface CustomDropdownProps {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
  className?: string
  disabled?: boolean
  id?: string
}

export const CustomDropdown = React.forwardRef<HTMLButtonElement, CustomDropdownProps>(
  ({ value, onChange, options, placeholder, className, disabled, id }, ref) => {
    // CRITICAL: Initialize isOpen to false - never true by default
    const [isOpen, setIsOpen] = React.useState<boolean>(false)
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    const selectedOption = options.find(opt => opt.value === value)
    const dropdownId = id || React.useId()

    // Combine refs
    React.useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement)

    // Ensure dropdown closes when disabled
    React.useEffect(() => {
      if (disabled && isOpen) {
        setIsOpen(false)
      }
    }, [disabled, isOpen])


    const handleSelect = (optionValue: string) => {
      onChange(optionValue)
      setIsOpen(false)
    }

    const handleToggle = () => {
      if (disabled) return
      setIsOpen(prev => !prev)
    }

    const handleClose = React.useCallback(() => {
      setIsOpen(false)
    }, [])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setIsOpen(!isOpen)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          // Focus first option
          const firstOption = document.querySelector(`[data-dropdown-id="${dropdownId}"] [role="option"]`) as HTMLElement
          firstOption?.focus()
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    const handleOptionKeyDown = (e: React.KeyboardEvent<HTMLLIElement>, optionValue: string, index: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleSelect(optionValue)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        const nextOption = document.querySelector(
          `[data-dropdown-id="${dropdownId}"] [role="option"]:nth-child(${index + 2})`
        ) as HTMLElement
        nextOption?.focus()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (index === 0) {
          triggerRef.current?.focus()
        } else {
          const prevOption = document.querySelector(
            `[data-dropdown-id="${dropdownId}"] [role="option"]:nth-child(${index})`
          ) as HTMLElement
          prevOption?.focus()
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    return (
      <div className="relative w-full">
        <button
          ref={triggerRef}
          id={dropdownId}
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex h-11 sm:h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2.5 sm:py-2 pr-10 text-base sm:text-sm",
            "appearance-none",
            "cursor-pointer touch-manipulation",
            "transition-all duration-200 ease-in-out",
            "text-left",
            "hover:border-primary/30",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            isOpen && "ring-2 ring-primary ring-offset-2 border-primary/50",
            !selectedOption && "text-muted-foreground",
            selectedOption && "text-foreground",
            className
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={placeholder || "Select option"}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder || "Select..."}
          </span>
          <ChevronDown
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180",
              "text-muted-foreground pointer-events-none"
            )}
            strokeWidth={2.5}
          />
        </button>

        {/* CRITICAL: Only render Popover when open - prevents always-visible options */}
        {/* Double-check isOpen state before rendering */}
        {isOpen === true && triggerRef.current && (
          <Popover
            isOpen={isOpen}
            onClose={handleClose}
            triggerRef={triggerRef}
            align="left"
            side="bottom"
            maxWidth="full"
            className="p-0 max-h-[min(300px,calc(100vh-200px))] overflow-y-auto"
          >
            <ul
              data-dropdown-id={dropdownId}
              role="listbox"
              className="py-1"
              aria-label={placeholder || "Options"}
            >
              {options.map((option, index) => {
                const isSelected = option.value === value
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={0}
                    onClick={() => handleSelect(option.value)}
                    onKeyDown={(e) => handleOptionKeyDown(e, option.value, index)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 sm:py-2 cursor-pointer",
                      "transition-colors duration-150",
                      "touch-manipulation min-h-[44px]",
                      "hover:bg-accent focus:bg-accent focus:outline-none",
                      isSelected && "bg-accent/50"
                    )}
                  >
                    <span className="text-sm text-foreground">{option.label}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" strokeWidth={2.5} />
                    )}
                  </li>
                )
              })}
            </ul>
          </Popover>
        )}
      </div>
    )
  }
)
CustomDropdown.displayName = "CustomDropdown"

