# 📘 MASTER TYPESCRIPT PATTERNS PROMPT
## Production-Grade Type Safety and Type Patterns

---

## 📋 OVERVIEW

This master prompt provides a comprehensive approach to using TypeScript effectively in React applications, including type generation, utility types, type guards, and advanced patterns.

**Applicable to:**
- Type definitions
- Type generation from schemas
- Utility types
- Type guards
- Generic types
- Discriminated unions

---

## 🎯 CORE PRINCIPLES

### 1. **Type Safety**
- **Strict Mode**: Always use strict TypeScript
- **No Any**: Avoid `any`, use `unknown` if needed
- **Type Inference**: Leverage type inference where possible
- **Explicit Types**: Explicit types for public APIs

### 2. **Type Generation**
- **Database Types**: Generate from Supabase schema
- **API Types**: Generate from API schemas
- **Keep Types Updated**: Update types when schemas change

### 3. **Type Patterns**
- **Utility Types**: Use built-in utility types
- **Type Guards**: Use type guards for runtime checks
- **Discriminated Unions**: For state management

---

## 🔍 PHASE 1: TYPE GENERATION

### Step 1.1: Generate Database Types
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

### Step 1.2: Use Generated Types
```typescript
import type { Database } from '../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
```

---

## 🛠️ PHASE 2: TYPE PATTERNS

### Step 2.1: Utility Types
```typescript
// ✅ CORRECT - Use utility types
type PartialProfile = Partial<Profile>
type ProfileKeys = Pick<Profile, 'id' | 'email' | 'first_name'>
type ProfileWithoutId = Omit<Profile, 'id'>
```

### Step 2.2: Type Guards
```typescript
// ✅ CORRECT - Type guard
function isProfile(obj: unknown): obj is Profile {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj
  )
}
```

### Step 2.3: Type Checklist
- [ ] Strict mode enabled
- [ ] No `any` types
- [ ] Types generated from schemas
- [ ] Utility types used appropriately
- [ ] Type guards for runtime checks
- [ ] Public APIs explicitly typed

---

## 🎯 SUCCESS CRITERIA

TypeScript implementation is complete when:

1. ✅ **Type Safety**: Zero type errors
2. ✅ **No Any**: No `any` types
3. ✅ **Types Generated**: Types from schemas
4. ✅ **Type Guards**: Runtime type checks
5. ✅ **Documentation**: Types documented

---

## 🚨 COMMON PITFALLS

### ❌ Don't:
- Use `any` types
- Skip type generation
- Ignore type errors
- Forget to update types
- Skip type guards

### ✅ Do:
- Use strict mode
- Generate types from schemas
- Fix all type errors
- Update types regularly
- Use type guards

---

**This master prompt should be followed for ALL TypeScript work.**

