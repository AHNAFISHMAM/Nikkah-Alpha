# Custom React Hooks

Reusable hooks for common patterns and functionality.

## Hooks

### `useProgressStats(userId)`
Fetches and calculates user progress statistics across all features.

**Parameters:**
- `userId: string | undefined` - The user's unique identifier

**Returns:**
```typescript
{
  checklistCompleted: number
  checklistTotal: number
  checklistPercent: number
  modulesCompleted: number
  modulesTotal: number
  discussionsCompleted: number
  discussionsTotal: number
  daysUntilWedding: number | null
  weddingDate: Date | null
  hasBudget: boolean
  budgetAmount: number | null
}
```

**Usage:**
```typescript
import { useProgressStats } from '@/hooks/useProgressStats'

function Dashboard() {
  const { user } = useAuth()
  const { data: stats, isLoading } = useProgressStats(user?.id)

  return (
    <div>
      <p>Checklist: {stats?.checklistPercent}% complete</p>
    </div>
  )
}
```

**Performance:** Optimized to use database views, reducing from 8 to 3 queries.

### `useBatchProcess()`
Handle batch operations with progress tracking.

**Use Cases:**
- Bulk updates
- Mass deletions
- Batch imports

### `useCancellableOperation()`
Create cancellable async operations.

**Use Cases:**
- Long-running requests
- User-initiated cancellation
- Component unmount cleanup

### `useDebounce(value, delay)`
Debounce a value to reduce re-renders.

**Parameters:**
- `value: T` - The value to debounce
- `delay: number` - Delay in milliseconds (default: 300ms)

**Usage:**
```typescript
import { useDebounce } from '@/hooks/useDebounce'

function SearchInput() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    // This only runs 500ms after user stops typing
    fetchResults(debouncedSearch)
  }, [debouncedSearch])
}
```

## Best Practices

1. **Dependencies**: Keep dependency arrays minimal and stable
2. **Cleanup**: Always return cleanup functions where appropriate
3. **Type Safety**: Hooks are fully typed with TypeScript
4. **Performance**: Use React Query caching when fetching data
5. **Error Handling**: Hooks handle errors gracefully with fallback values
