# ⚡ MASTER PERFORMANCE OPTIMIZATION PROMPT
## Production-Grade Performance Optimization Strategies

---

## 📋 OVERVIEW

This master prompt provides a comprehensive approach to optimizing React applications for performance, including component optimization, bundle optimization, rendering optimization, and Core Web Vitals.

**Applicable to:**
- Component performance
- Bundle size optimization
- Rendering optimization
- Image optimization
- Code splitting
- Lazy loading
- Core Web Vitals optimization

---

## 🎯 CORE PRINCIPLES

### 1. **Measure First**
- **Profile Before Optimizing**: Use React DevTools Profiler
- **Core Web Vitals**: Monitor LCP, FID, CLS
- **Bundle Analysis**: Analyze bundle size
- **Performance Budgets**: Set performance budgets

### 2. **Optimize Rendering**
- **Memoization**: Use React.memo, useMemo, useCallback
- **Code Splitting**: Split code by route/feature
- **Lazy Loading**: Lazy load components and images
- **Virtual Scrolling**: For long lists

### 3. **Optimize Assets**
- **Image Optimization**: Use optimized images
- **Font Optimization**: Optimize font loading
- **Bundle Optimization**: Tree-shake unused code

---

## 🔍 PHASE 1: PERFORMANCE ANALYSIS

### Step 1.1: Performance Metrics
```
1. Lighthouse score
2. Core Web Vitals (LCP, FID, CLS)
3. Bundle size
4. First Contentful Paint (FCP)
5. Time to Interactive (TTI)
```

### Step 1.2: Profiling Tools
```
1. React DevTools Profiler
2. Chrome DevTools Performance
3. Lighthouse
4. Bundle Analyzer
```

---

## 🛠️ PHASE 2: OPTIMIZATION TECHNIQUES

### Step 2.1: Component Memoization
```typescript
// ✅ CORRECT - Memoize expensive components
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  // Component logic
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.data.id === nextProps.data.id
})

// ✅ CORRECT - Memoize expensive computations
const expensiveValue = React.useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

// ✅ CORRECT - Memoize callbacks
const handleClick = React.useCallback(() => {
  // Handler logic
}, [dependencies])
```

### Step 2.2: Code Splitting
```typescript
// ✅ CORRECT - Lazy load components
const HeavyComponent = React.lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

### Step 2.3: Virtual Scrolling for Long Lists
```typescript
// ✅ CORRECT - Use virtual scrolling for lists >20 items
import { useVirtualizer } from '@tanstack/react-virtual'

function LongList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Estimated item height
    overscan: 5, // Render 5 extra items outside viewport
  })

  return (
    <div ref={parentRef} className="h-[400px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index]}
          </div>
        ))}
      </div>
    </div>
  )
}
```

**When to Use Virtual Scrolling:**
- Lists with >20 items
- Long scrollable content (Discussions, Resources, Modules, Checklist)
- Performance issues with rendering many DOM nodes
- Mobile devices with limited memory

**Installation:**
```bash
npm install @tanstack/react-virtual
```

### Step 2.4: Route-Based Code Splitting
```typescript
// ✅ CORRECT - Lazy load route components
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PageLoader } from '../components/common/PageLoader'

// Lazy load all route components
const Dashboard = lazy(() => import('../pages/protected/Dashboard'))
const Checklist = lazy(() => import('../pages/protected/Checklist'))
const Financial = lazy(() => import('../pages/protected/Financial'))
const Discussions = lazy(() => import('../pages/protected/Discussions'))
const Resources = lazy(() => import('../pages/protected/Resources'))
const Profile = lazy(() => import('../pages/protected/Profile'))
const Modules = lazy(() => import('../pages/public/Modules'))

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/financial" element={<Financial />} />
        <Route path="/discussions" element={<Discussions />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/modules" element={<Modules />} />
      </Routes>
    </Suspense>
  )
}
```

**Benefits:**
- Smaller initial bundle size
- Faster Time to Interactive (TTI)
- Better Core Web Vitals scores
- Improved mobile performance

**Best Practices:**
- Lazy load all route components
- Use consistent loading fallback
- Preload critical routes on hover/focus

### Step 2.5: Performance Checklist
- [ ] Components memoized where appropriate
- [ ] Expensive computations memoized
- [ ] Callbacks memoized
- [ ] Code split by route
- [ ] Virtual scrolling for lists >20 items
- [ ] Images optimized
- [ ] Bundle size optimized
- [ ] Core Web Vitals meet targets

---

## 🎯 SUCCESS CRITERIA

Performance optimization is complete when:

1. ✅ **Lighthouse**: Score > 90
2. ✅ **Core Web Vitals**: All metrics pass
3. ✅ **Bundle Size**: Within budget
4. ✅ **Rendering**: No unnecessary re-renders
5. ✅ **Loading**: Fast initial load

---

## 🚨 COMMON PITFALLS

### ❌ Don't:
- Over-memoize (premature optimization)
- Skip profiling
- Ignore bundle size
- Forget image optimization
- Skip code splitting

### ✅ Do:
- Profile before optimizing
- Memoize strategically
- Monitor bundle size
- Optimize images
- Code split by route
- Use virtual scrolling for long lists

---

**This master prompt should be followed for ALL performance optimization work.**

