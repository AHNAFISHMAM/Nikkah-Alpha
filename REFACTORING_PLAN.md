# Comprehensive Refactoring Plan
## Mobile-First Performance Optimization & Code Cleanup

**Date:** January 2025  
**Goal:** Clean up unused components, eliminate duplicate code, improve performance without changing UI/functionality  
**Focus:** Mobile-first optimization across all devices

---

## Research Summary

Based on online research and React/Next.js best practices:

### Key Findings:
1. **Code Duplication Detection**: Use static analysis tools (ESLint, TypeScript) to identify duplicates
2. **Performance Optimization**: React.memo, useMemo, useCallback for expensive operations
3. **Code Splitting**: Lazy loading for route-based and component-based splitting
4. **Hook Consolidation**: Single source of truth for viewport/mobile detection
5. **Import Optimization**: Tree-shaking friendly imports, remove unused dependencies

---

## Phase 1: Remove Unused Files & Components ✅

### Completed:
- ✅ Deleted `src/pages/public/ModuleDetail.backup.tsx`
- ✅ Deleted `src/lib/modulePdf.backup.ts`

### To Do:
- [ ] Check if `Select` component is used anywhere (currently only exported in index.ts)
- [ ] Remove `Select` component if unused (replaced by `CustomDropdown`)
- [ ] Verify all exports in `src/components/ui/index.ts` are actually used

---

## Phase 2: Consolidate Duplicate Code ✅

### Issue 1: Inconsistent Mobile Detection Breakpoints ✅

**Problem:** Multiple inline mobile detections with different breakpoints:
- `640px` (Tailwind `sm`) - used in: DatePicker, Popover, useViewport, useIsMobile
- `768px` (Tailwind `md`) - used in: MoreMenu, NotificationsBell
- `1024px` (Tailwind `lg`) - used in: useToastPosition, CollapsibleSection

**Solution:** Standardized to `640px` (mobile-first, Tailwind `sm` breakpoint) where appropriate

**Files Updated:**
1. ✅ `src/components/common/MoreMenu.tsx` - Changed `768` to `640` (removed unused variable)
2. ✅ `src/components/common/NotificationsBell.tsx` - Changed `768` to `640`
3. ⚠️ `src/hooks/useToastPosition.ts` - Kept `1024` (intentional for toast positioning)
4. ⚠️ `src/components/common/CollapsibleSection.tsx` - Kept `1024` (intentional for tablet/mobile distinction)

### Issue 2: Duplicate Mobile Detection Hooks ✅

**Problem:** 
- `useIsMobile` - Simple boolean hook
- `useViewport` - Comprehensive hook with isMobile, isTablet, isDesktop, width, height
- Inline `window.innerWidth < 640` checks in multiple components

**Solution:** Consolidated to `useViewport` hook where possible

**Files Updated:**
1. ✅ `src/components/ui/DatePicker.tsx` - Replaced inline mobile detection with `useViewport().isMobile`
2. ✅ `src/components/ui/Popover.tsx` - Added comment for consistency (kept inline for performance)
3. ✅ Removed `useIsMobile` hook (no longer needed)
4. ✅ Updated components using inline `window.innerWidth` checks

### Issue 3: Duplicate Validation Functions ✅

**Problem:** 
- `validateName` exists in both `src/lib/utils.ts` and `src/lib/validation.ts`
- `isValidEmail` exists in both `src/lib/utils.ts` and `src/lib/validation.ts`

**Solution:** Kept only in `src/lib/validation.ts`, re-exported from `utils.ts` for backward compatibility

**Files Updated:**
1. ✅ `src/lib/utils.ts` - Removed duplicate `validateName`, added re-export
2. ✅ Verified all imports still work (backward compatible)

---

## Phase 3: Optimize Imports & Dependencies

### To Do:
- [ ] Check for unused imports using ESLint
- [ ] Remove unused dependencies from package.json
- [ ] Optimize import statements (use named imports, avoid default imports where possible)
- [ ] Ensure tree-shaking works correctly

---

## Phase 4: Performance Optimizations

### Memoization Opportunities:
1. **Financial Components** (BudgetCalculator, MahrTracker, WeddingBudget, SavingsGoals):
   - Memoize expensive calculations with `useMemo`
   - Memoize callback functions with `useCallback`
   - Wrap components with `React.memo` if props don't change often

2. **Dashboard Components**:
   - Memoize data transformations
   - Optimize list rendering

3. **Form Components**:
   - Debounce validation functions
   - Memoize form state updates

### Code Splitting:
- [ ] Verify lazy loading is working for routes
- [ ] Add component-level code splitting for heavy components (charts, PDF generation)

---

## Phase 5: Mobile-Specific Optimizations

### To Do:
- [ ] Ensure all components use mobile-first breakpoints consistently
- [ ] Optimize image loading (lazy loading, responsive images)
- [ ] Reduce bundle size for mobile (code splitting)
- [ ] Optimize touch interactions (44px+ touch targets)
- [ ] Ensure proper viewport handling across all components

---

## Implementation Order

1. ✅ **Phase 1** - Remove unused files (DONE)
2. **Phase 2** - Consolidate duplicate code (IN PROGRESS)
3. **Phase 3** - Optimize imports
4. **Phase 4** - Performance optimizations
5. **Phase 5** - Mobile-specific optimizations

---

## Success Metrics

- [ ] Zero duplicate code patterns
- [ ] Consistent mobile breakpoints (640px)
- [ ] Reduced bundle size
- [ ] Improved Lighthouse scores
- [ ] No functionality changes
- [ ] All tests passing

