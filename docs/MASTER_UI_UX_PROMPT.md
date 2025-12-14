# 🎨 MASTER UI/UX DEVELOPMENT PROMPT
## Production-Grade Component & Page Development Workflow

---

## 📋 OVERVIEW

This master prompt provides a comprehensive, systematic approach to building, refactoring, or replacing UI/UX components and pages with **production-level quality** (Apple/Google standards). It covers the complete workflow from problem identification to final implementation, including deep research, design system enforcement, accessibility, performance optimization, and iterative refinement.

**Applicable to:**
- Visual/UI Components (DatePicker, Cards, Buttons, Inputs, Dropdowns, Modals, etc.)
- Data-Heavy Components (Tables, Charts, Forms, Data Visualizations)
- Full Page Layouts (Dashboard, Profile, Home, Settings, etc.)
- Complex Interactive Components (Wizards, Multi-step Forms, Calendars, etc.)

---

## 🎯 CORE PRINCIPLES

### 1. **Design System Enforcement**
- **STRICTLY** follow existing design system (colors, spacing, typography, shadows, borders)
- Use CSS variables from `src/index.css` - NEVER hardcode values
- Reference `DESIGN_SYSTEM.md` for all design tokens
- If design system needs extension → **ASK PERMISSION FIRST** before deviating
- Maintain consistency with existing components

### 2. **Mobile-First Approach**
- Start with 320px viewport as base
- All components must work flawlessly on mobile first
- Progressive enhancement for larger screens
- Touch-friendly targets (minimum 44px × 44px)
- No horizontal scrolling unless intentional
- Test on actual mobile devices when possible

### 3. **Production Quality Standards**
- **Accessibility**: WCAG 2.1/2.2 AA compliance (aim for AAA where possible)
- **Performance**: Optimized rendering, minimal re-renders, lazy loading
- **Browser Compatibility**: Support modern browsers (Chrome, Firefox, Safari, Edge)
- **Responsive Design**: Fluid layouts that adapt to all screen sizes
- **Error Handling**: Graceful degradation and error states
- **Type Safety**: Full TypeScript coverage with strict types

### 4. **Code Quality**
- Clean, maintainable, self-documenting code
- Proper separation of concerns
- Reusable, composable components
- Performance optimizations (memoization, callbacks, refs)
- Inline comments for complex logic
- JSDoc for all public APIs

---

## 🔍 PHASE 1: DEEP RESEARCH & ANALYSIS

### Step 1.1: Understand the Current State
```
1. Read existing component/page code completely
2. Identify all dependencies and imports
3. Map out current functionality and features
4. Document current issues, bugs, or limitations
5. Understand integration points with other components
6. Review related files (styles, types, utilities)
```

### Step 1.2: Research Industry Standards
**Research Sources (in order of priority):**

1. **Material Design 3** (Google)
   - Component guidelines and patterns
   - Interaction patterns and animations
   - Accessibility requirements
   - Responsive design principles
   - URL: https://m3.material.io/

2. **Apple Human Interface Guidelines (HIG)**
   - iOS and macOS design patterns
   - Typography and spacing scales
   - Color and contrast guidelines
   - Gesture and interaction patterns
   - URL: https://developer.apple.com/design/human-interface-guidelines/

3. **WCAG 2.1/2.2 Guidelines**
   - Level AA compliance (minimum)
   - Level AAA where achievable
   - Keyboard navigation requirements
   - Screen reader compatibility
   - Color contrast ratios (4.5:1 for text, 3:1 for UI components)
   - URL: https://www.w3.org/WAI/WCAG21/quickref/

4. **Web.dev Best Practices**
   - Performance optimization
   - Core Web Vitals
   - Responsive images
   - Loading strategies
   - URL: https://web.dev/

5. **Mobile UX Patterns**
   - Touch target sizes (44px minimum)
   - Gesture patterns
   - Mobile navigation patterns
   - Bottom sheets and modals
   - Safe area handling
   - URL: https://www.nngroup.com/articles/mobile-ux/

6. **React Best Practices**
   - React 18+ patterns
   - Hooks optimization
   - Component composition
   - State management patterns
   - URL: https://react.dev/

7. **ARIA Authoring Practices Guide (APG)**
   - Component-specific accessibility patterns
   - Keyboard interaction patterns
   - Screen reader announcements
   - URL: https://www.w3.org/WAI/ARIA/apg/

### Step 1.3: Research Specific Component Type
**For each component type, research:**
- Common patterns and anti-patterns
- Accessibility requirements specific to that component
- Performance considerations
- Mobile-specific adaptations
- Industry-standard sizing and spacing
- Animation and transition best practices
- Browser compatibility considerations
- Common edge cases and how to handle them

### Step 1.4: Analyze Design System
```
1. Read DESIGN_SYSTEM.md completely
2. Review src/index.css for all CSS variables
3. Study existing similar components for patterns
4. Understand color palette and usage rules
5. Review spacing scale and typography system
6. Check shadow and border radius conventions
7. Understand breakpoint system
8. Review animation and transition patterns
```

---

## 🎨 PHASE 2: DESIGN & PLANNING

### Step 2.1: Problem Definition
```
1. Clearly define what needs to be built/replaced
2. List all requirements (functional and non-functional)
3. Identify constraints (design system, performance, accessibility)
4. Document user goals and use cases
5. Define success criteria
6. Identify edge cases
```

### Step 2.2: Design Options (if applicable)
**If multiple design approaches are possible:**
1. Create 2-3 design options with clear differences
2. Explain pros/cons of each approach
3. Include trade-offs (performance, accessibility, complexity)
4. Recommend the best option with justification
5. Wait for user selection before proceeding

### Step 2.3: Technical Architecture
```
1. Plan component structure and hierarchy
2. Define TypeScript interfaces and types
3. Plan state management approach
4. Identify reusable utilities and hooks
5. Plan performance optimizations
6. Design accessibility implementation
7. Plan responsive breakpoints
8. Design error handling strategy
9. Plan loading states
10. Design animation and transition strategy
```

### Step 2.4: Component API Design
```
1. Define props interface (extend HTML attributes where appropriate)
2. Plan ref forwarding if needed
3. Design event handlers and callbacks
4. Plan controlled vs uncontrolled patterns
5. Define default values and variants
6. Plan composition patterns (if applicable)
7. Design accessibility props (aria-*, role, etc.)
```

---

## 🛠️ PHASE 3: IMPLEMENTATION

### Step 3.1: Setup & Structure
```
1. Create new component file with proper naming convention
2. Set up TypeScript interface extending appropriate HTML attributes
3. Import all necessary dependencies
4. Set up React.forwardRef if needed
5. Create displayName for debugging
6. Set up proper file structure
7. Extract constants outside component (performance)
```

### Step 3.2: Core Implementation Rules

#### A. **Design System Compliance**
```typescript
// ✅ CORRECT - Use CSS variables
className="bg-card text-card-foreground border-border"

// ❌ WRONG - Hardcoded values
className="bg-white text-gray-900 border-gray-200"
```

#### B. **Mobile-First Styling**
```typescript
// ✅ CORRECT - Mobile first, then enhance
className="w-full p-4 sm:p-6 lg:p-8"

// ❌ WRONG - Desktop first
className="p-8 sm:p-6 md:p-4"
```

#### C. **Performance Optimization**
```typescript
// ✅ CORRECT - Memoize expensive computations
const expensiveValue = React.useMemo(() => {
  return computeExpensiveValue(deps)
}, [deps])

// ✅ CORRECT - Memoize callbacks
const handleClick = React.useCallback(() => {
  // handler logic
}, [dependencies])

// ✅ CORRECT - Extract constants outside component
const CONSTANT_VALUE = { ... }

// ✅ CORRECT - Use refs for DOM access
const elementRef = React.useRef<HTMLDivElement>(null)
```

#### D. **Accessibility Implementation**
```typescript
// ✅ CORRECT - Full accessibility
<button
  aria-label="Close dialog"
  aria-expanded={isOpen}
  aria-controls={dialogId}
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
>
```

#### E. **TypeScript Best Practices**
```typescript
// ✅ CORRECT - Proper typing
export interface ComponentProps extends Omit<HTMLDivElement, 'children'> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

// ✅ CORRECT - JSDoc for public APIs
/**
 * A flexible card component with multiple variants
 * @param variant - Visual style variant
 * @param size - Size of the component
 * @param children - Content to display inside the card
 */
```

### Step 3.3: Implementation Checklist

#### Component Structure
- [ ] Proper TypeScript interfaces
- [ ] React.forwardRef if needed
- [ ] displayName set
- [ ] Proper prop destructuring
- [ ] Default values defined
- [ ] Constants extracted outside component

#### Styling
- [ ] All styles use design system tokens
- [ ] Mobile-first responsive classes
- [ ] Proper use of `cn()` utility
- [ ] No hardcoded colors, spacing, or sizes
- [ ] Consistent with existing components
- [ ] Dark mode support (if applicable)

#### Functionality
- [ ] All features implemented
- [ ] State management correct
- [ ] Event handlers properly typed
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Edge cases handled

#### Performance
- [ ] Expensive computations memoized
- [ ] Callbacks memoized with useCallback
- [ ] Refs used appropriately
- [ ] No unnecessary re-renders
- [ ] Lazy loading where appropriate
- [ ] Code splitting if component is large

#### Accessibility
- [ ] ARIA labels and roles
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Screen reader support
- [ ] Color contrast compliant
- [ ] Touch targets ≥ 44px
- [ ] No keyboard traps
- [ ] Proper heading hierarchy

#### Responsive Design
- [ ] Works on 320px viewport
- [ ] Tablet breakpoints handled
- [ ] Desktop enhancements
- [ ] No horizontal scroll
- [ ] Proper text scaling
- [ ] Safe area handling (mobile)

---

## 🧪 PHASE 4: QUALITY ASSURANCE

### Step 4.1: Automated Checks
```bash
# Run these checks before considering implementation complete:

1. TypeScript Type Checking
   npm run typecheck
   # Must pass with zero errors

2. Linting
   npm run lint
   # Must pass with zero errors (or within acceptable threshold)

3. Build Verification
   npm run build
   # Must build successfully without errors

4. Type Checking (if separate command)
   tsc --noEmit
   # Must pass with zero errors
```

### Step 4.2: Manual Verification Checklist

#### Visual Verification
- [ ] Component renders correctly
- [ ] All variants/styles work
- [ ] Responsive on all breakpoints (320px, 640px, 768px, 1024px, 1280px+)
- [ ] Dark mode support (if applicable)
- [ ] Animations smooth and performant
- [ ] No visual glitches or layout shifts
- [ ] Proper spacing and alignment
- [ ] Text is readable at all sizes

#### Functional Verification
- [ ] All interactions work
- [ ] State updates correctly
- [ ] Event handlers fire properly
- [ ] Error states display correctly
- [ ] Loading states work
- [ ] Edge cases handled
- [ ] Form validation works (if applicable)
- [ ] Data updates correctly (if data-heavy)

#### Accessibility Verification
- [ ] Keyboard navigation works (Tab, Enter, Space, Arrow keys, Escape)
- [ ] Screen reader announces correctly (test with NVDA/JAWS/VoiceOver)
- [ ] Focus indicators visible
- [ ] Color contrast passes (use WebAIM Contrast Checker)
- [ ] No keyboard traps
- [ ] ARIA attributes correct
- [ ] Semantic HTML used
- [ ] Alt text for images (if applicable)

#### Browser Testing
- [ ] Chrome/Edge (latest) - Desktop
- [ ] Firefox (latest) - Desktop
- [ ] Safari (latest) - Desktop
- [ ] Mobile Safari (iOS) - iPhone
- [ ] Chrome Mobile (Android)
- [ ] Test on actual devices when possible
- [ ] Test with different screen sizes
- [ ] Test with different zoom levels

#### Performance Verification
- [ ] No console errors or warnings
- [ ] No memory leaks
- [ ] Smooth animations (60fps)
- [ ] Fast initial render
- [ ] Efficient re-renders
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals pass
- [ ] No layout shifts (CLS < 0.1)

### Step 4.3: Integration Testing
- [ ] Works with existing components
- [ ] No breaking changes to dependent code
- [ ] Properly integrated with routing (if page)
- [ ] State management works correctly
- [ ] API integration works (if applicable)
- [ ] Works with theme system
- [ ] Works with internationalization (if applicable)

---

## 🔄 PHASE 5: ITERATION & REFINEMENT

### Step 5.1: User Feedback Integration
```
When user provides feedback:

1. Understand the feedback clearly
   - Read feedback carefully
   - Identify specific issues mentioned
   - Clarify if anything is unclear

2. Identify the root cause
   - Analyze the problem
   - Check if it's a design, functionality, or UX issue
   - Review related code

3. Research best practices for the specific issue
   - Look up industry standards
   - Check accessibility guidelines
   - Review performance implications

4. Propose solution with explanation
   - Explain the approach
   - Mention trade-offs if any
   - Get confirmation if major change

5. Implement fix
   - Make the change
   - Maintain all existing functionality
   - Don't introduce regressions

6. Verify fix resolves the issue
   - Test the specific issue
   - Check for side effects
   - Verify on multiple devices/browsers

7. Check for regressions
   - Test all related functionality
   - Verify accessibility still works
   - Check performance impact
```

### Step 5.2: Iterative Improvement
```
For each iteration:

1. Address specific feedback
   - Focus on the exact issue
   - Don't over-engineer
   - Keep changes minimal

2. Maintain all existing functionality
   - Don't break working features
   - Test before and after
   - Document significant changes

3. Don't break working features
   - Regression testing
   - Check integration points
   - Verify edge cases

4. Improve incrementally
   - Small, focused changes
   - Test after each change
   - Get feedback before major refactors

5. Test after each change
   - Quick smoke test
   - Check affected areas
   - Verify no console errors

6. Document significant changes
   - Inline comments for complex logic
   - Update JSDoc if API changes
   - Note breaking changes (if any)
```

### Step 5.3: Refinement Checklist
- [ ] All user feedback addressed
- [ ] No regressions introduced
- [ ] Code quality maintained
- [ ] Performance not degraded
- [ ] Accessibility maintained
- [ ] Design system compliance maintained
- [ ] All tests still pass
- [ ] Documentation updated

---

## 📝 PHASE 6: CODE DOCUMENTATION

### Step 6.1: Inline Comments
```typescript
// Add comments for:
// - Complex algorithms or logic
// - Non-obvious implementation decisions
// - Performance optimizations
// - Workarounds for browser issues
// - Accessibility considerations
// - Business logic explanations

// Example:
// CRITICAL: Use UTC dates to avoid timezone shifts when parsing ISO strings.
// This ensures consistent date handling across different timezones.
const parsedDate = new Date(Date.UTC(year, month - 1, day))

// Example:
// Performance: Memoize this expensive computation to prevent unnecessary recalculations
// on every render. Only recalculates when dependencies change.
const expensiveValue = React.useMemo(() => {
  return computeExpensiveValue(deps)
}, [deps])
```

### Step 6.2: JSDoc for Public APIs
```typescript
/**
 * DatePicker Component
 * 
 * A fully accessible, mobile-first date picker with modal display on desktop
 * and bottom sheet on mobile. Supports min/max date constraints, custom styling,
 * and full keyboard navigation.
 * 
 * @example
 * ```tsx
 * <DatePicker
 *   value={date}
 *   onChange={handleChange}
 *   min="2020-01-01"
 *   max="2030-12-31"
 *   error={hasError}
 *   helperText="Select your date of birth"
 * />
 * ```
 * 
 * @param value - ISO date string (YYYY-MM-DD format). Controlled value.
 * @param onChange - Callback when date changes via input field. Receives ChangeEvent.
 * @param onDateChange - Callback when date selected from calendar. Receives ISO string.
 * @param min - Minimum selectable date (ISO string YYYY-MM-DD). Defaults to no minimum.
 * @param max - Maximum selectable date (ISO string YYYY-MM-DD). Defaults to no maximum.
 * @param error - Show error state styling. Defaults to false.
 * @param success - Show success state styling. Defaults to false.
 * @param helperText - Helper text displayed below input. Supports accessibility.
 * @param placeholder - Placeholder text for input. Defaults to "Select date".
 * @param disabled - Disable the date picker. Defaults to false.
 * @param className - Additional CSS classes. Merged with component classes.
 * @param id - HTML id attribute. Auto-generated if not provided.
 * 
 * @returns A date picker input with calendar modal/sheet
 * 
 * @remarks
 * - Uses UTC dates internally to avoid timezone issues
 * - Fully keyboard accessible (Tab, Enter, Space, Arrow keys, Escape)
 * - Screen reader compatible with proper ARIA attributes
 * - Mobile: Bottom sheet modal
 * - Desktop: Centered modal overlay
 * 
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/} for accessibility patterns
 */
```

### Step 6.3: Component Documentation
- [ ] JSDoc for component and all public props
- [ ] Usage examples in JSDoc
- [ ] Complex logic explained with comments
- [ ] Accessibility features documented
- [ ] Performance considerations noted
- [ ] Browser compatibility notes (if applicable)
- [ ] Known limitations or edge cases documented

---

## 🗑️ PHASE 7: CLEANUP & MIGRATION

### Step 7.1: Remove Old Implementation
```
1. Delete old component files
   - Remove old .tsx files
   - Remove old .css files (if any)
   - Remove old test files (if any)

2. Remove old dependencies from package.json
   - Uninstall unused packages
   - Update package-lock.json

3. Remove unused CSS files
   - Delete old stylesheets
   - Remove imports

4. Clean up unused imports
   - Remove from component files
   - Remove from utility files

5. Remove old test files (if any)
   - Delete test files
   - Update test configuration

6. Update any references in other files
   - Update imports
   - Update component usage
   - Update documentation
```

### Step 7.2: Update Dependencies
```bash
# Remove unused packages
npm uninstall <package-name>

# Install if new dependencies needed
npm install <package-name>

# Update lock file
npm install

# Verify no broken dependencies
npm run build
```

### Step 7.3: Verify No Breaking Changes
- [ ] All imports updated
- [ ] No broken references
- [ ] Build still works
- [ ] No console errors
- [ ] All features still functional
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] All tests pass (if applicable)

---

## 🎯 IMPLEMENTATION TEMPLATE

### Component Template Structure
```typescript
import * as React from "react"
import { cn } from "../../lib/utils"
// ... other imports

/**
 * [Component Name] - [Brief Description]
 * 
 * [Detailed description of component purpose, features, and usage]
 * 
 * @example
 * ```tsx
 * <ComponentName prop1="value" />
 * ```
 */
export interface ComponentNameProps 
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  // Props definition
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  // ... other props
}

// Extract constants to prevent recreation (performance best practice)
const VARIANTS = {
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
} as const

const SIZES = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-6 text-lg',
} as const

const ComponentName = React.forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    // Refs
    const containerRef = React.useRef<HTMLDivElement>(null)
    
    // State
    const [isOpen, setIsOpen] = React.useState(false)
    
    // Memoized values
    const computedValue = React.useMemo(() => {
      // Expensive computation
      return computeValue()
    }, [dependencies])
    
    // Callbacks
    const handleClick = React.useCallback(() => {
      // Handler logic
      setIsOpen(prev => !prev)
    }, [dependencies])
    
    // Effects
    React.useEffect(() => {
      // Effect logic
      return () => {
        // Cleanup
      }
    }, [dependencies])
    
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "base-classes",
          // Variant styles
          VARIANTS[variant],
          // Size styles
          SIZES[size],
          // Conditional styles
          isOpen && "open-styles",
          // Design system classes
          "bg-card text-card-foreground border-border",
          // Responsive classes (mobile-first)
          "w-full p-4 sm:p-6 lg:p-8",
          className
        )}
        // Accessibility
        role="..."
        aria-label="..."
        aria-expanded={isOpen}
        // Event handlers
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {/* Component content */}
      </div>
    )
  }
)
ComponentName.displayName = "ComponentName"

export { ComponentName }
```

---

## 📊 QUALITY METRICS

### Must Achieve:
- ✅ **TypeScript**: Zero type errors
- ✅ **Linting**: Zero errors (warnings acceptable within threshold)
- ✅ **Build**: Successful build
- ✅ **Accessibility**: WCAG 2.1 AA compliant (AAA where possible)
- ✅ **Performance**: Lighthouse score > 90
- ✅ **Mobile**: Works perfectly on 320px viewport
- ✅ **Browser**: Works on Chrome, Firefox, Safari, Edge (latest versions)
- ✅ **Design System**: 100% compliance with tokens
- ✅ **Code Quality**: Clean, maintainable, documented

### Performance Targets:
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms
- **Total Blocking Time (TBT)**: < 200ms
- **No console errors or warnings**

### Accessibility Targets:
- **WCAG Level**: AA (minimum), AAA where achievable
- **Color Contrast**: 4.5:1 for text, 3:1 for UI components
- **Keyboard Navigation**: Full support (Tab, Enter, Space, Arrow keys, Escape)
- **Screen Reader**: Compatible with NVDA, JAWS, VoiceOver
- **Focus Indicators**: Visible and clear
- **Touch Targets**: Minimum 44px × 44px

---

## 🔧 TECH STACK SPECIFICS

### React Patterns
- Use React 18+ features
- Functional components only (no class components)
- Hooks for state and effects
- forwardRef for ref forwarding
- Proper dependency arrays
- Cleanup in useEffect
- Error boundaries for error handling

### TypeScript Patterns
- Strict type checking enabled
- Proper interface definitions
- Extend HTML attributes where appropriate
- Use utility types (Omit, Pick, Partial, etc.)
- No `any` types (use `unknown` if needed)
- Proper generic types
- Discriminated unions for variants

### Tailwind CSS Patterns
- Use design system CSS variables
- Mobile-first responsive classes
- Use `cn()` utility for conditional classes
- Follow existing naming conventions
- Use semantic color names
- Avoid arbitrary values when possible

### File Structure
```
src/
  components/
    ui/
      ComponentName.tsx    # Main component
    [feature]/
      FeatureComponent.tsx # Feature-specific components
  pages/
    [page]/
      PageName.tsx         # Page components
  lib/
    utils.ts               # Utilities
    types.ts               # Shared types
  hooks/
    useCustomHook.ts       # Custom hooks
```

---

## 🚨 COMMON PITFALLS TO AVOID

### ❌ Don't:
- Hardcode colors, spacing, or sizes
- Use desktop-first responsive design
- Skip accessibility features
- Ignore mobile viewport (320px)
- Create unnecessary re-renders
- Use `any` types in TypeScript
- Skip error handling
- Forget keyboard navigation
- Ignore browser compatibility
- Break existing functionality
- Forget to clean up effects
- Use inline styles
- Create deeply nested components
- Ignore performance implications

### ✅ Do:
- Use design system tokens
- Mobile-first approach
- Full accessibility implementation
- Test on mobile devices
- Optimize performance
- Strict TypeScript typing
- Comprehensive error handling
- Keyboard navigation support
- Cross-browser testing
- Maintain backward compatibility
- Clean up effects properly
- Use Tailwind classes
- Keep components shallow
- Consider performance impact

---

## 📚 REFERENCE CHECKLIST

Before starting implementation, ensure you have:
- [ ] Read DESIGN_SYSTEM.md completely
- [ ] Reviewed src/index.css for all tokens
- [ ] Studied similar existing components
- [ ] Researched industry standards
- [ ] Understood accessibility requirements
- [ ] Planned performance optimizations
- [ ] Designed component API
- [ ] Planned responsive breakpoints
- [ ] Identified all dependencies
- [ ] Understood integration points
- [ ] Planned error handling
- [ ] Designed loading states

---

## 🎬 EXECUTION WORKFLOW

### When User Requests Component/Page:

1. **Acknowledge & Analyze**
   - Understand the request clearly
   - Identify if it's new, replacement, or refactor
   - Check existing implementation (if any)
   - Ask clarifying questions if needed

2. **Research Phase**
   - Deep research on component type
   - Review design system
   - Study existing patterns
   - Research best practices
   - Review accessibility requirements

3. **Design Phase**
   - If multiple options exist, present them
   - Get user selection
   - Plan implementation
   - Design API and structure

4. **Implementation Phase**
   - Build component following template
   - Follow all quality standards
   - Implement accessibility
   - Optimize performance
   - Add proper documentation

5. **Quality Assurance**
   - Run automated checks
   - Manual verification
   - Browser testing
   - Accessibility audit
   - Performance testing

6. **Iteration Phase**
   - Address user feedback
   - Refine implementation
   - Maintain quality standards
   - Test after each change

7. **Cleanup Phase**
   - Remove old code
   - Update dependencies
   - Verify no breaking changes
   - Update documentation

8. **Documentation**
   - Add inline comments
   - Write JSDoc
   - Document complex logic
   - Update examples

---

## 💡 EXAMPLE USAGE

### User Request:
"Create a new DatePicker component to replace the old react-datepicker. It should be a centered modal on desktop, bottom sheet on mobile, with proper year range validation."

### Execution:
1. **Research**: Date picker best practices (Material Design, Apple HIG, WCAG), accessibility patterns, mobile UX
2. **Design System**: Review colors, spacing, typography, existing components
3. **Architecture**: Plan component structure, state management, accessibility implementation
4. **Implementation**: Build with full accessibility, performance optimization, mobile-first design
5. **Testing**: Test on all browsers, devices, screen readers, keyboard navigation
6. **Iteration**: Address feedback (modal sizing, dropdown UX, etc.)
7. **Cleanup**: Remove react-datepicker, update dependencies
8. **Documentation**: Add JSDoc, inline comments for complex logic

---

## 🎯 SUCCESS CRITERIA

A component/page is considered complete when:

1. ✅ **Functionality**: All features work correctly
2. ✅ **Design**: Matches design system perfectly
3. ✅ **Accessibility**: WCAG 2.1 AA compliant (AAA where possible)
4. ✅ **Performance**: Meets performance targets (Lighthouse > 90)
5. ✅ **Responsive**: Works on all screen sizes (320px+)
6. ✅ **Browser**: Works on all target browsers
7. ✅ **Code Quality**: Clean, maintainable, documented
8. ✅ **Type Safety**: Full TypeScript coverage
9. ✅ **Testing**: All checks pass (type, lint, build)
10. ✅ **User Approval**: User confirms it meets requirements
11. ✅ **Documentation**: JSDoc and inline comments complete
12. ✅ **Cleanup**: Old code removed, dependencies updated

---

## 🔗 ADDITIONAL RESOURCES

### Accessibility
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA APG: https://www.w3.org/WAI/ARIA/apg/
- WebAIM: https://webaim.org/
- A11y Project: https://www.a11yproject.com/

### Performance
- Web.dev: https://web.dev/
- Lighthouse: https://developers.google.com/web/tools/lighthouse
- Core Web Vitals: https://web.dev/vitals/

### Design Systems
- Material Design: https://m3.material.io/
- Apple HIG: https://developer.apple.com/design/human-interface-guidelines/
- Carbon Design: https://carbondesignsystem.com/

### React
- React Docs: https://react.dev/
- React TypeScript Cheatsheet: https://react-typescript-cheatsheet.netlify.app/

---

**This master prompt should be followed for ALL UI/UX component and page development work.**

