# 🔧 MASTER PROMPT: Code Refactoring & File Organization
## Production-Grade Refactoring Workflow for React/TypeScript Applications

---

## 📋 OVERVIEW

This master prompt provides a comprehensive, systematic approach to refactoring large files and organizing codebases following industry best practices. It covers the complete workflow from file identification to refactoring execution, including dependency analysis, file structure decisions, backward compatibility, performance optimization, and documentation.

**Applicable to:**
- Large component files (>300 lines)
- Complex utility files
- Monolithic page components
- Feature modules requiring organization
- Codebases needing better structure
- Performance optimization through refactoring

**Based on Research:**
- React/TypeScript best practices (10+ sources)
- Feature-based architecture patterns
- Dependency-based refactoring order
- Production-level code organization standards
- Next.js App Router considerations

---

## 🎯 CORE PRINCIPLES

### 1. **Single Responsibility Principle (SRP)**
- Each file/component should handle ONE specific responsibility
- Files should be focused and easy to understand
- Target: Keep files under 300 lines (flexible based on complexity)

### 2. **Feature-Based Organization**
- Group related files by feature/domain, not by file type
- Co-locate related components, hooks, utilities, and types
- Keep features isolated and self-contained

### 3. **Backward Compatibility**
- Maintain existing import paths using index.ts re-exports
- Preserve public APIs during refactoring
- Ensure no breaking changes to dependent code

### 4. **Dependency-Based Refactoring Order**
- Refactor dependencies BEFORE dependents
- Analyze dependency graph before starting
- Start with files that have no/few dependencies

### 5. **Performance Optimization**
- Apply React.memo, useMemo, useCallback during refactoring
- Optimize re-renders and expensive calculations
- Maintain smooth animations and interactions

### 6. **Documentation & History**
- Add JSDoc comments to extracted functions/components
- Document complex logic and business rules
- Maintain REFACTORING_HISTORY.md for tracking decisions

---

## 🔍 PHASE 1: IDENTIFICATION & ANALYSIS

### Step 1.1: Identify Files Needing Refactoring

**Priority Order (Research-Based):**

1. **Largest Files First** (>1000 lines)
   - These provide the most value when refactored
   - Often contain multiple responsibilities
   - Highest complexity and maintenance burden

2. **Dependency-Based Order**
   - Analyze dependency graph
   - Refactor files with NO dependencies first
   - Then refactor files that depend on already-refactored files
   - This prevents cascading changes

3. **Feature-Based Priority**
   - Start with core/critical features
   - Then move to supporting features
   - End with utility/helper features

**How to Identify:**

```bash
# Find large files
find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -20

# Analyze file sizes
# Files >300 lines: Consider refactoring
# Files >500 lines: High priority
# Files >1000 lines: Critical priority
```

**Questions to Ask:**
- Does this file handle multiple responsibilities?
- Is it difficult to navigate or understand?
- Are there clear boundaries for extraction?
- Would splitting improve testability?

### Step 1.2: Analyze Dependencies

**Before refactoring, analyze:**

1. **Import Dependencies**
   ```typescript
   // Check what this file imports
   import { ... } from './file1'
   import { ... } from './file2'
   ```

2. **Export Dependencies**
   ```typescript
   // Check what other files import from this
   // Search codebase for imports of this file
   ```

3. **Create Dependency Graph**
   - List all files that import the target file
   - List all files the target file imports
   - Identify circular dependencies
   - Determine refactoring order

**Tools:**
- Use TypeScript compiler to analyze imports
- Use grep/search to find usages
- Create a visual dependency map

### Step 1.3: Determine Refactoring Scope

**For each file, identify:**

1. **Main Responsibilities**
   - List all distinct responsibilities
   - Identify boundaries between responsibilities
   - Determine what can be extracted

2. **Extraction Candidates**
   - Components that can be standalone
   - Utility functions that can be shared
   - Custom hooks for reusable logic
   - Types/interfaces that can be co-located
   - Constants that can be extracted

3. **Dependencies to Preserve**
   - External library imports
   - Internal module dependencies
   - Context providers
   - Shared utilities

---

## 📐 PHASE 2: FILE STRUCTURE DECISIONS

### Step 2.1: Component Location Strategy

**Research-Based Best Practices:**

**Option A: Feature-Based Co-location (RECOMMENDED)**
```
src/pages/
  [FeatureName]/
    index.tsx              # Main page component
    components/            # Feature-specific components
      [ComponentName].tsx
    sections/              # Page sections
      [SectionName].tsx
    hooks/                 # Feature-specific hooks
      use[FeatureName].ts
    utils/                 # Feature-specific utilities
      [utility].ts
    types.ts               # Feature-specific types
    constants.ts           # Feature-specific constants
```

**When to Use:**
- Components used ONLY within this feature
- Feature-specific logic and utilities
- Components tightly coupled to the feature

**Option B: Shared Components Location**
```
src/components/
  [feature]/              # Feature-specific shared components
    [ComponentName].tsx
  ui/                     # Generic UI components (buttons, inputs, etc.)
    [ComponentName].tsx
```

**When to Use:**
- Components used across MULTIPLE features
- Generic, reusable UI components
- Shared utilities and helpers

**Decision Tree:**
```
Is component used in multiple features?
├─ YES → src/components/[feature]/ or src/components/ui/
└─ NO → src/pages/[Feature]/components/
```

### Step 2.2: Shared Components Strategy

**Research-Based Guidelines:**

**Keep in `src/components/ui/`:**
- Generic UI components (Button, Input, Card, Modal, etc.)
- Design system components
- Components with no business logic
- Highly reusable components

**Move to Feature Folders:**
- Components with feature-specific logic
- Components tightly coupled to a feature
- Components unlikely to be reused elsewhere

**Example:**
```typescript
// ✅ Generic - stays in src/components/ui/
<Button />
<Input />
<Modal />

// ✅ Feature-specific - moves to feature folder
<ProfileSetupForm />
<DiscussionPromptCard />
<BudgetCalculator />
```

### Step 2.3: Naming Conventions

**Research-Based Standards:**

**File Naming:**
- **Components**: PascalCase (`ProfileSetup.tsx`, `UserCard.tsx`)
- **Hooks**: camelCase starting with `use` (`useProfileData.ts`, `useFormValidation.ts`)
- **Utilities**: camelCase (`formatDate.ts`, `validateEmail.ts`)
- **Types**: PascalCase (`UserTypes.ts`, `ApiTypes.ts`)
- **Constants**: UPPER_SNAKE_CASE or camelCase (`API_ENDPOINTS.ts` or `apiEndpoints.ts`)

**Folder Structure:**
```
[FeatureName]/
  index.tsx              # Main entry point
  components/
    [ComponentName].tsx  # PascalCase
  hooks/
    use[HookName].ts     # camelCase with 'use' prefix
  utils/
    [utilityName].ts     # camelCase
  types.ts               # Feature types
  constants.ts           # Feature constants
```

**Index Files (Barrel Exports):**
```typescript
// [FeatureName]/index.ts
export { default } from './[FeatureName]'
export * from './components'
export * from './hooks'
export * from './types'
```

---

## 🏗️ PHASE 3: REFACTORING PLAN CREATION

### Step 3.1: Create Detailed Refactoring Plan

**Plan Format (Research-Based):**

```markdown
## Refactoring Plan: [FileName]

### Current State
- **File Path**: `src/pages/[path]/[FileName].tsx`
- **Lines of Code**: [X] lines
- **Main Responsibilities**: 
  1. [Responsibility 1]
  2. [Responsibility 2]
  3. [Responsibility 3]

### Dependency Analysis
- **Imports From**: 
  - `[file1]` - [purpose]
  - `[file2]` - [purpose]
- **Imported By**:
  - `[file1]` - [usage]
  - `[file2]` - [usage]

### Proposed Structure
```
[FeatureName]/
  index.tsx                    # Main component (~[X] lines)
  components/
    [Component1].tsx          # [Purpose] (~[X] lines)
    [Component2].tsx          # [Purpose] (~[X] lines)
  sections/
    [Section1].tsx            # [Purpose] (~[X] lines)
  hooks/
    use[FeatureName].ts       # [Purpose] (~[X] lines)
  utils/
    [utility].ts              # [Purpose] (~[X] lines)
  types.ts                    # Type definitions
  constants.ts                # Constants
```

### Extraction Strategy

#### Step 1: Extract [Component/Function]
- **From**: [Current location]
- **To**: `[FeatureName]/components/[ComponentName].tsx`
- **Reason**: [Why this extraction makes sense]
- **Dependencies**: [What it needs]
- **Exports**: [What it exports]

#### Step 2: Extract [Next Component/Function]
- [Repeat structure]

### Files to Modify
1. **Create New Files**:
   - `[FeatureName]/components/[Component1].tsx`
   - `[FeatureName]/hooks/use[HookName].ts`
   - [etc.]

2. **Modify Existing Files**:
   - `[FileName].tsx` - Update imports, remove extracted code
   - `[DependentFile1].tsx` - Update imports if needed
   - [etc.]

3. **Create/Update Index Files**:
   - `[FeatureName]/index.ts` - Re-export for backward compatibility

### Backward Compatibility Strategy
- **Maintain Import Path**: `import { [Component] } from '[old-path]'`
- **Implementation**: Use index.ts re-exports
- **Migration Path**: [How to migrate to new paths later]

### Performance Optimizations
- Apply `React.memo` to: [list components]
- Apply `useMemo` to: [list calculations]
- Apply `useCallback` to: [list functions]
- Lazy load: [list components if applicable]

### Testing Strategy
- [ ] Run existing tests after each step
- [ ] Check TypeScript compilation
- [ ] Verify ESLint passes
- [ ] Manual testing for UI/UX
- [ ] [Add specific test requirements if applicable]

### Before/After Comparison
[Show code snippets demonstrating the transformation]
```

### Step 3.2: Ask Questions Before Execution

**Before making changes, ask:**

1. **Scope Questions:**
   - "Should I extract [Component] into a separate file?"
   - "Is this the right location for [Component]?"
   - "Should [Component] be reusable or feature-specific?"

2. **Structure Questions:**
   - "Does this folder structure make sense for this feature?"
   - "Should [Component] be in `components/` or `sections/`?"
   - "Is this the right naming convention?"

3. **Breaking Change Questions:**
   - "This change will affect [X] files. Should I proceed?"
   - "Should I maintain backward compatibility or update all imports?"
   - "This will change the public API. Is that acceptable?"

4. **Performance Questions:**
   - "Should I apply React.memo to [Component]?"
   - "Should I optimize [calculation] with useMemo?"
   - "Will this refactoring impact performance?"

---

## ⚙️ PHASE 4: EXECUTION WORKFLOW

### Step 4.1: Pre-Refactoring Checklist

**Before starting refactoring:**

- [ ] Dependency analysis complete
- [ ] Refactoring plan created and reviewed
- [ ] Questions asked and answered
- [ ] Backup/commit current state
- [ ] Understand all dependencies
- [ ] Know which files will be affected

### Step 4.2: Step-by-Step Execution

**Execute refactoring in small, incremental steps:**

#### Step 1: Extract First Component/Function
1. Create new file with extracted code
2. Add JSDoc comments
3. Add proper TypeScript types
4. Export from new file
5. Update original file to import from new location
6. Test that it compiles
7. Verify functionality works

#### Step 2: Update Index Files
1. Create/update `index.ts` in feature folder
2. Re-export extracted components
3. Maintain backward compatibility
4. Test imports still work

#### Step 3: Apply Performance Optimizations
1. Add `React.memo` where appropriate
2. Add `useMemo` for expensive calculations
3. Add `useCallback` for event handlers
4. Verify no performance regressions

#### Step 4: Verify & Test
1. Run TypeScript compiler: `npm run typecheck` or `tsc --noEmit`
2. Run ESLint: `npm run lint` or `eslint .`
3. Check for runtime errors
4. Manual testing of affected features
5. Verify UI/UX unchanged (unless intentional)

#### Step 5: Update Documentation
1. Update REFACTORING_HISTORY.md
2. Add JSDoc comments to new functions/components
3. Update any relevant README files
4. Document breaking changes (if any)

### Step 4.3: Incremental Commits

**Commit after each successful extraction:**
```bash
git add [new-files]
git add [modified-files]
git commit -m "refactor: extract [Component] from [File] to [Feature]/components/[Component]"
```

**Benefits:**
- Easy to rollback if issues arise
- Clear history of changes
- Easier code review
- Better debugging

---

## 📁 PHASE 5: FILE STRUCTURE PATTERNS

### Pattern 1: Page Component Refactoring

**Before:**
```
src/pages/
  ProfileSetup.tsx (1,627 lines)
```

**After:**
```
src/pages/
  ProfileSetup/
    index.tsx                    # Main component (~400 lines)
    components/
      EssentialStep.tsx          # Step component (~200 lines)
      PersonalStep.tsx           # Step component (~200 lines)
      LocationStep.tsx           # Step component (~200 lines)
      RelationshipStep.tsx       # Step component (~200 lines)
    hooks/
      useProfileSetupForm.ts     # Form logic (~300 lines)
      useProfileValidation.ts    # Validation logic (~200 lines)
    utils/
      profileSetupUtils.ts       # Utilities (~150 lines)
    types.ts                     # Type definitions
    constants.ts                 # Constants
```

### Pattern 2: Feature Module Refactoring

**Before:**
```
src/components/
  Financial.tsx (500+ lines)
```

**After:**
```
src/components/
  financial/
    index.ts                     # Re-exports
    BudgetCalculator.tsx         # Main calculator
    MahrTracker.tsx              # Mahr tracking
    SavingsGoals.tsx             # Savings goals
    WeddingBudget.tsx            # Budget display
    hooks/
      useBudget.ts
      useMahr.ts
      useSavingsGoals.ts
    utils/
      budgetCalculations.ts
    types.ts
```

### Pattern 3: Utility File Refactoring

**Before:**
```
src/lib/
  utils.ts (1000+ lines)
```

**After:**
```
src/lib/
  utils/
    index.ts                     # Re-exports all
    validation.ts                # Validation utilities
    formatting.ts                # Formatting utilities
    dateUtils.ts                 # Date utilities
    stringUtils.ts               # String utilities
```

---

## 🔄 PHASE 6: BACKWARD COMPATIBILITY

### Step 6.1: Maintain Import Paths

**Strategy: Use Index Files (Barrel Exports)**

**Original Import:**
```typescript
import { ProfileSetup } from '@/pages/ProfileSetup'
```

**After Refactoring - Maintain Compatibility:**
```typescript
// src/pages/ProfileSetup/index.ts
export { default as ProfileSetup } from './ProfileSetup'
export * from './components'
export * from './hooks'
```

**Result:**
- Old imports still work ✅
- New imports also work ✅
- Gradual migration possible ✅

### Step 6.2: Preserve Public APIs

**Before Refactoring:**
```typescript
// ProfileSetup.tsx
export function ProfileSetup() { ... }
export type ProfileSetupProps = { ... }
```

**After Refactoring:**
```typescript
// ProfileSetup/index.ts
export { default as ProfileSetup } from './ProfileSetup'
export type { ProfileSetupProps } from './types'
```

**All existing imports continue to work.**

---

## ⚡ PHASE 7: PERFORMANCE OPTIMIZATION

### Step 7.1: Apply React.memo

**When to Use:**
- Components that receive the same props frequently
- Components that render often
- Presentational components

**Example:**
```typescript
// ✅ Apply React.memo to extracted components
import { memo } from 'react'

export const UserCard = memo(function UserCard({ user, onEdit }) {
  // Component implementation
})
```

### Step 7.2: Apply useMemo

**When to Use:**
- Expensive calculations
- Derived data that depends on props/state
- Object/array creation in render

**Example:**
```typescript
// ✅ Memoize expensive calculations
const processedData = useMemo(() => {
  return expensiveCalculation(data)
}, [data])
```

### Step 7.3: Apply useCallback

**When to Use:**
- Functions passed as props to memoized components
- Event handlers in frequently re-rendering components
- Functions in dependency arrays

**Example:**
```typescript
// ✅ Memoize callbacks
const handleSubmit = useCallback((data) => {
  onSubmit(data)
}, [onSubmit])
```

### Step 7.4: Extract Constants

**Move constants outside component:**
```typescript
// ❌ BAD - Recreated on every render
function Component() {
  const CONFIG = { ... }
}

// ✅ GOOD - Created once
const CONFIG = { ... } as const
function Component() {
  // Use CONFIG
}
```

---

## 📝 PHASE 8: DOCUMENTATION

### Step 8.1: JSDoc Comments

**Add JSDoc to extracted functions/components:**

```typescript
/**
 * Validates user profile data according to business rules.
 * 
 * @param data - The profile data to validate
 * @param step - The current step in the profile setup process
 * @returns Validation result with errors and validity status
 * 
 * @example
 * ```ts
 * const result = validateProfileStep(data, 'essential')
 * if (!result.valid) {
 *   console.error(result.errors)
 * }
 * ```
 */
export function validateProfileStep(
  data: ProfileData,
  step: ProfileStep
): ValidationResult {
  // Implementation
}
```

**JSDoc Standards:**
- Describe what the function/component does
- Document all parameters with `@param`
- Document return values with `@returns`
- Include `@example` for complex functions
- Document side effects if any

### Step 8.2: Update REFACTORING_HISTORY.md

**Document each refactoring:**

```markdown
## [Date] - [FeatureName] Refactoring

### Files Refactored
- `src/pages/[FeatureName].tsx` → `src/pages/[FeatureName]/`

### Changes Made
1. Extracted [Component1] → `components/[Component1].tsx`
2. Extracted [Component2] → `components/[Component2].tsx`
3. Extracted [Hook] → `hooks/use[Hook].ts`
4. Extracted [Utility] → `utils/[utility].ts`

### Rationale
- [Reason 1]
- [Reason 2]

### Impact
- Reduced main file from [X] to [Y] lines
- Improved maintainability
- Better testability
- [Other impacts]

### Breaking Changes
- None (backward compatible via index.ts)

### Performance Improvements
- Applied React.memo to [components]
- Optimized [calculations] with useMemo
- [Other optimizations]

### Testing
- ✅ TypeScript compilation passes
- ✅ ESLint passes
- ✅ Manual testing completed
- ✅ No regressions found
```

---

## 🧪 PHASE 9: VERIFICATION & TESTING

### Step 9.1: TypeScript Verification

**Run TypeScript compiler:**
```bash
npm run typecheck
# or
tsc --noEmit
```

**Check for:**
- Type errors
- Missing type definitions
- Incorrect type usage
- Import/export issues

### Step 9.2: ESLint Verification

**Run ESLint:**
```bash
npm run lint
# or
eslint .
```

**Check for:**
- Code style violations
- Potential bugs
- Unused imports
- Missing dependencies

### Step 9.3: Runtime Testing

**Manual Testing Checklist:**
- [ ] Feature works as before
- [ ] No console errors
- [ ] UI/UX unchanged (unless intentional)
- [ ] Performance is same or better
- [ ] All interactions work correctly
- [ ] Edge cases handled

### Step 9.4: Dependency Verification

**Verify imports work:**
```bash
# Check if all imports resolve
# Test the application
# Verify no broken imports
```

---

## 🚫 PHASE 10: FILES TO AVOID SPLITTING

### Research-Based Guidelines

**Do NOT Split These Files:**

1. **Configuration Files**
   - `tsconfig.json`
   - `vite.config.ts`
   - `package.json`
   - Environment config files

2. **Entry Points**
   - `main.tsx` / `index.tsx` (root)
   - `App.tsx` (if it's the main app component)
   - Route configuration files

3. **Type Definition Files**
   - `types/database.ts` (if it's auto-generated)
   - Global type definition files
   - Declaration files (`.d.ts`)

4. **Small Utility Files**
   - Files under 100 lines (unless very complex)
   - Simple, focused utility files
   - Single-purpose helper files

5. **Index/Barrel Export Files**
   - Files that only re-export
   - Public API definition files

**When in Doubt:**
- Ask before splitting
- Consider if splitting adds value
- Evaluate complexity vs. benefit

---

## 🔗 PHASE 11: NEXT.JS APP ROUTER CONSIDERATIONS

### Step 11.1: React Server Components vs Client Components

**Research-Based Guidelines:**

**Server Components (Default in App Router):**
- No `'use client'` directive
- Can fetch data directly
- Cannot use hooks, event handlers, or browser APIs
- Better for static content and data fetching

**Client Components:**
- Must have `'use client'` at top
- Can use hooks, state, event handlers
- Can access browser APIs
- Required for interactivity

**Refactoring Considerations:**
- If extracting from Server Component → Check if extracted component needs `'use client'`
- If extracting from Client Component → Extracted components are client by default
- Preserve `'use client'` directive when moving code

**Example:**
```typescript
// ✅ Preserve 'use client' when extracting
'use client'

import { useState } from 'react'

export function InteractiveComponent() {
  // Client component code
}
```

### Step 11.2: Next.js Patterns to Preserve

**Metadata Exports:**
```typescript
// ✅ Preserve metadata exports in page components
export const metadata = {
  title: 'Page Title',
  description: 'Page description'
}
```

**Route Handlers:**
```typescript
// ✅ Preserve route handler patterns
export async function GET(request: Request) {
  // Handler implementation
}
```

**Server Actions:**
```typescript
// ✅ Preserve server action patterns
'use server'

export async function serverAction() {
  // Server action implementation
}
```

**Dynamic Routes:**
- Preserve `[param]` folder structure
- Maintain route parameter handling

---

## 📊 PHASE 12: REFACTORING ORDER STRATEGY

### Step 12.1: Dependency-Based Order

**Algorithm:**

1. **Create Dependency Graph**
   ```
   File A → imports from → File B, File C
   File B → imports from → File D
   File C → imports from → File D
   File D → imports from → (none)
   ```

2. **Determine Refactoring Order**
   - Start with files that have NO dependencies (File D)
   - Then refactor files that depend on refactored files (File B, File C)
   - Finally refactor files that depend on those (File A)

3. **Handle Circular Dependencies**
   - Identify circular dependencies
   - Break cycles by extracting shared code
   - Refactor shared code first

### Step 12.2: Size-Based Priority

**Within same dependency level, prioritize:**
1. Largest files first (>1000 lines)
2. Medium files (500-1000 lines)
3. Smaller files (300-500 lines)

**Rationale:**
- Larger files provide more value when refactored
- Reduces complexity faster
- Improves maintainability significantly

### Step 12.3: Feature-Based Priority

**Order by feature importance:**
1. Core/Critical features first
2. Supporting features second
3. Utility/Helper features last

**Rationale:**
- Core features are used most
- Refactoring core features has biggest impact
- Supporting features can wait

---

## ✅ COMPLETE REFACTORING CHECKLIST

### Pre-Refactoring
- [ ] Identified files needing refactoring
- [ ] Analyzed dependencies
- [ ] Created refactoring plan
- [ ] Asked questions and got answers
- [ ] Committed current state
- [ ] Understood impact scope

### During Refactoring
- [ ] Extracted components one at a time
- [ ] Added JSDoc comments
- [ ] Applied TypeScript types
- [ ] Created/updated index.ts files
- [ ] Maintained backward compatibility
- [ ] Applied performance optimizations
- [ ] Committed after each successful extraction

### Post-Refactoring
- [ ] TypeScript compilation passes
- [ ] ESLint passes
- [ ] No runtime errors
- [ ] Manual testing completed
- [ ] UI/UX unchanged (unless intentional)
- [ ] Performance verified
- [ ] Updated REFACTORING_HISTORY.md
- [ ] Updated documentation
- [ ] All imports work correctly

---

## 🎓 EXAMPLES

### Example 1: Extracting a Component

**Before:**
```typescript
// ProfileSetup.tsx (1,627 lines)
export function ProfileSetup() {
  // ... 500 lines of code ...
  
  const EssentialStep = () => (
    <div>
      {/* Step content */}
    </div>
  )
  
  // ... more code ...
}
```

**After:**
```typescript
// ProfileSetup/components/EssentialStep.tsx
/**
 * Essential information step in profile setup.
 * 
 * @param data - Current form data
 * @param onChange - Handler for form field changes
 * @param errors - Validation errors
 */
export function EssentialStep({ data, onChange, errors }: EssentialStepProps) {
  return (
    <div>
      {/* Step content */}
    </div>
  )
}

// ProfileSetup/index.tsx
import { EssentialStep } from './components/EssentialStep'

export function ProfileSetup() {
  // ... uses EssentialStep ...
}
```

### Example 2: Extracting a Hook

**Before:**
```typescript
// ProfileSetup.tsx
export function ProfileSetup() {
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [isValid, setIsValid] = useState(false)
  
  // ... 200 lines of form logic ...
}
```

**After:**
```typescript
// ProfileSetup/hooks/useProfileSetupForm.ts
/**
 * Manages profile setup form state and validation.
 * 
 * @param initialData - Initial form data
 * @returns Form state, handlers, and validation results
 */
export function useProfileSetupForm(initialData = {}) {
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState({})
  const [isValid, setIsValid] = useState(false)
  
  // ... form logic ...
  
  return { formData, errors, isValid, handlers }
}

// ProfileSetup/index.tsx
import { useProfileSetupForm } from './hooks/useProfileSetupForm'

export function ProfileSetup() {
  const { formData, errors, isValid, handlers } = useProfileSetupForm()
  // ... use hook ...
}
```

### Example 3: Maintaining Backward Compatibility

**Before:**
```typescript
// ProfileSetup.tsx
export function ProfileSetup() { ... }
export type ProfileSetupProps = { ... }
```

**After:**
```typescript
// ProfileSetup/index.ts
export { default as ProfileSetup } from './ProfileSetup'
export type { ProfileSetupProps } from './types'

// Old imports still work:
import { ProfileSetup, ProfileSetupProps } from '@/pages/ProfileSetup'
```

---

## 🚨 COMMON PITFALLS TO AVOID

### 1. Over-Abstraction
**Problem:** Creating too many small files
**Solution:** Only extract when it makes sense (reusability, clarity, testability)

### 2. Breaking Changes
**Problem:** Changing import paths without maintaining compatibility
**Solution:** Always use index.ts re-exports for backward compatibility

### 3. Circular Dependencies
**Problem:** Creating import cycles
**Solution:** Analyze dependencies before refactoring, extract shared code first

### 4. Performance Regressions
**Problem:** Forgetting to optimize extracted components
**Solution:** Apply React.memo, useMemo, useCallback during refactoring

### 5. Incomplete Refactoring
**Problem:** Extracting code but leaving references
**Solution:** Update all imports, test thoroughly, verify no broken references

### 6. Losing Context
**Problem:** Extracting code that needs context
**Solution:** Pass necessary props/context, or keep code together if tightly coupled

---

## 📚 REFACTORING HISTORY TEMPLATE

Create `REFACTORING_HISTORY.md`:

```markdown
# Refactoring History

## [Date] - [FeatureName] Refactoring

### Summary
[Brief description of what was refactored]

### Files Changed
- **Refactored**: `[old-path]` → `[new-structure]`
- **Created**: 
  - `[new-file-1]`
  - `[new-file-2]`
- **Modified**:
  - `[dependent-file-1]`
  - `[dependent-file-2]`

### Extraction Details
1. **[Component/Function Name]**
   - **From**: `[old-location]`
   - **To**: `[new-location]`
   - **Lines**: [X] → [Y] lines
   - **Reason**: [Why extracted]

### Dependencies
- **Imports From**: [list]
- **Imported By**: [list]

### Breaking Changes
- None (or list if any)

### Performance Improvements
- Applied React.memo to: [list]
- Optimized with useMemo: [list]
- Optimized with useCallback: [list]

### Testing
- ✅ TypeScript: Passes
- ✅ ESLint: Passes
- ✅ Runtime: No errors
- ✅ Manual: All features work

### Notes
[Any additional notes or considerations]
```

---

## 🎯 QUICK REFERENCE

### File Size Guidelines
- **< 300 lines**: Generally acceptable
- **300-500 lines**: Consider refactoring if complex
- **500-1000 lines**: Should be refactored
- **> 1000 lines**: Must be refactored

### Extraction Priority
1. Largest files first
2. Dependencies before dependents
3. Core features before supporting features

### Component Location
- **Feature-specific**: `src/pages/[Feature]/components/`
- **Shared within feature**: `src/components/[feature]/`
- **Generic UI**: `src/components/ui/`

### Naming Conventions
- **Components**: PascalCase (`UserCard.tsx`)
- **Hooks**: camelCase with `use` (`useUserData.ts`)
- **Utils**: camelCase (`formatDate.ts`)
- **Types**: PascalCase (`UserTypes.ts`)

### Performance Patterns
- **React.memo**: Presentational components
- **useMemo**: Expensive calculations
- **useCallback**: Functions passed as props

---

## 📖 ADDITIONAL RESOURCES

### Research Sources
- React Best Practices (10+ sources)
- Feature-Based Architecture Patterns
- Dependency-Based Refactoring Strategies
- Next.js App Router Documentation
- TypeScript Best Practices
- Performance Optimization Guides

### Tools
- TypeScript Compiler (type checking)
- ESLint (code quality)
- Dependency analysis tools
- File size analysis scripts

---

**Last Updated**: Based on comprehensive research and best practices  
**Status**: ✅ Production-ready workflow  
**Version**: 1.0

