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

### Step 2.3: Performance Checklist
- [ ] Components memoized where appropriate
- [ ] Expensive computations memoized
- [ ] Callbacks memoized
- [ ] Code split by route
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

---

**This master prompt should be followed for ALL performance optimization work.**

