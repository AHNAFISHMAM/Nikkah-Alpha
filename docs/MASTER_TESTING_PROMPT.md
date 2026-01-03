# 🧪 MASTER TESTING PROMPT
## Production-Grade Testing Strategies and Patterns

---

## 📋 OVERVIEW

This master prompt provides a comprehensive approach to testing React applications with Vitest and Testing Library. It covers unit testing, integration testing, component testing, mocking strategies, and test organization.

**Applicable to:**
- Unit tests for utilities and hooks
- Component tests with React Testing Library
- Integration tests for features
- Mocking Supabase and React Query
- Test organization and structure
- Coverage targets and reporting

---

## 🎯 CORE PRINCIPLES

### 1. **Test User Behavior**
- **Test What Users See**: Focus on user interactions, not implementation details
- **Accessibility First**: Test with accessibility in mind
- **Realistic Scenarios**: Test real user flows, not edge cases only
- **User-Centric Assertions**: Assert on visible outcomes

### 2. **Test Organization**
- **Test Files Co-located**: Keep tests near source files
- **Clear Test Names**: Descriptive test names that explain what's being tested
- **Arrange-Act-Assert**: Follow AAA pattern
- **Isolated Tests**: Each test should be independent

### 3. **Maintainability**
- **DRY Principle**: Reuse test utilities and setup
- **Mock Strategically**: Mock external dependencies, not internal logic
- **Keep Tests Simple**: One assertion per test when possible
- **Update Tests with Code**: Update tests when code changes

---

## 🔍 PHASE 1: TEST SETUP

### Step 1.1: Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Step 1.2: Test Setup File
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any
```

### Step 1.3: Test Utilities
```typescript
// src/test/utils.tsx
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'
import { ReactElement } from 'react'

// Create a test query client
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
  initialEntries?: string[]
}

export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = createTestQueryClient(),
    initialEntries = ['/'],
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  }
}

// Re-export everything
export * from '@testing-library/react'
export { renderWithProviders as render }
```

### Step 1.4: Test Setup Checklist
- [ ] Vitest configured with jsdom
- [ ] Test setup file created
- [ ] Test utilities created
- [ ] Mock setup for common APIs
- [ ] Coverage thresholds configured

---

## 🛠️ PHASE 2: UNIT TESTING

### Step 2.1: Utility Function Tests
```typescript
// src/lib/validation.test.ts
import { describe, it, expect } from 'vitest'
import { validateEmail, validatePassword, validateName } from './validation'

describe('validateEmail', () => {
  it('should return null for valid email', () => {
    expect(validateEmail('test@example.com')).toBeNull()
  })

  it('should return error for invalid email', () => {
    expect(validateEmail('invalid')).toBeTruthy()
    expect(validateEmail('invalid@')).toBeTruthy()
    expect(validateEmail('@example.com')).toBeTruthy()
  })

  it('should return error for empty email', () => {
    expect(validateEmail('')).toBeTruthy()
  })
})

describe('validatePassword', () => {
  it('should return null for valid password', () => {
    expect(validatePassword('Password123')).toBeNull()
  })

  it('should return error for short password', () => {
    expect(validatePassword('Pass1')).toBeTruthy()
  })

  it('should return error for password without uppercase', () => {
    expect(validatePassword('password123')).toBeTruthy()
  })

  it('should return error for password without lowercase', () => {
    expect(validatePassword('PASSWORD123')).toBeTruthy()
  })

  it('should return error for password without number', () => {
    expect(validatePassword('Password')).toBeTruthy()
  })
})
```

### Step 2.2: Hook Tests
```typescript
// src/hooks/useProfile.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { useProfile } from './useProfile'
import { createTestQueryClient } from '../test/utils'
import { supabase } from '../lib/supabase'

vi.mock('../lib/supabase')
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}))

describe('useProfile', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('should fetch profile data', async () => {
    const mockProfile = { id: 'test-user-id', email: 'test@example.com' }
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        }),
      }),
    } as any)

    const { result } = renderHook(() => useProfile(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockProfile)
  })

  it('should handle errors', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Error fetching profile' },
          }),
        }),
      }),
    } as any)

    const { result } = renderHook(() => useProfile(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})
```

### Step 2.3: Unit Test Checklist
- [ ] Utility functions tested
- [ ] Hooks tested with proper mocking
- [ ] Error cases covered
- [ ] Edge cases covered
- [ ] Tests are isolated and independent

---

## 🧩 PHASE 3: COMPONENT TESTING

### Step 3.1: Simple Component Test
```typescript
// src/components/ui/Button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../test/utils'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should apply variant classes', () => {
    const { container } = render(<Button variant="primary">Click me</Button>)
    expect(container.firstChild).toHaveClass('bg-primary')
  })
})
```

### Step 3.2: Form Component Test
```typescript
// src/pages/public/Login.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../test/utils'
import userEvent from '@testing-library/user-event'
import { Login } from './Login'
import { useAuth } from '../../contexts/AuthContext'

vi.mock('../../contexts/AuthContext')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

describe('Login', () => {
  const mockLogin = vi.fn()

  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      user: null,
      isLoading: false,
    } as any)
  })

  it('should render login form', () => {
    render(<Login />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should validate email format', async () => {
    const user = userEvent.setup()
    render(<Login />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')
    await user.tab()

    expect(await screen.findByText(/valid email/i)).toBeInTheDocument()
  })

  it('should call login on form submit', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ error: null })
    
    render(<Login />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should display error message on login failure', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({
      error: new Error('Invalid login credentials'),
    })

    render(<Login />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument()
  })
})
```

### Step 3.3: Component Test Checklist
- [ ] Component renders correctly
- [ ] User interactions tested
- [ ] Props handled correctly
- [ ] Error states tested
- [ ] Loading states tested
- [ ] Accessibility tested (roles, labels)

---

## 🔗 PHASE 4: INTEGRATION TESTING

### Step 4.1: Feature Integration Test
```typescript
// src/pages/protected/Dashboard.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../test/utils'
import { Dashboard } from './Dashboard'
import { useAuth } from '../../contexts/AuthContext'
import { useProgressStats } from '../../hooks/useProgressStats'

vi.mock('../../contexts/AuthContext')
vi.mock('../../hooks/useProgressStats')

describe('Dashboard', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'test-user-id' },
      profile: { full_name: 'Test User' },
      isLoading: false,
    } as any)

    vi.mocked(useProgressStats).mockReturnValue({
      data: {
        checklist_completed: 5,
        checklist_total: 10,
        modules_completed: 2,
        modules_total: 5,
      },
      isLoading: false,
    } as any)
  })

  it('should display user greeting', () => {
    render(<Dashboard />)
    expect(screen.getByText(/test user/i)).toBeInTheDocument()
  })

  it('should display progress stats', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/5.*10/i)).toBeInTheDocument() // Checklist progress
      expect(screen.getByText(/2.*5/i)).toBeInTheDocument() // Module progress
    })
  })

  it('should show loading state', () => {
    vi.mocked(useProgressStats).mockReturnValue({
      isLoading: true,
    } as any)

    render(<Dashboard />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
```

### Step 4.2: Integration Test Checklist
- [ ] Feature flows tested end-to-end
- [ ] Multiple components work together
- [ ] API interactions mocked correctly
- [ ] State management tested
- [ ] Navigation tested

---

## 🎭 PHASE 5: MOCKING STRATEGIES

### Step 5.1: Mock Supabase
```typescript
// src/test/mocks/supabase.ts
import { vi } from 'vitest'

export const mockSupabase = {
  from: vi.fn(),
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
}

// Helper to create mock query chain
export function createMockQuery(data: any, error: any = null) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data, error }),
        single: vi.fn().mockResolvedValue({ data, error }),
      }),
      order: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data, error }),
      }),
    }),
  }
}
```

### Step 5.2: Mock React Query
```typescript
// Use createTestQueryClient for isolated tests
// Or mock useQuery/useMutation directly:

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
  }
})
```

### Step 5.3: Mocking Checklist
- [ ] External dependencies mocked
- [ ] API calls mocked
- [ ] React Query mocked appropriately
- [ ] Supabase mocked correctly
- [ ] Mocks reset between tests

---

## 📊 PHASE 6: TEST COVERAGE

### Step 6.1: Coverage Targets
```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
}
```

### Step 6.2: Coverage Commands
```bash
# Run tests with coverage
npm run test -- --coverage

# View coverage report
open coverage/index.html
```

### Step 6.3: Coverage Checklist
- [ ] Coverage thresholds set
- [ ] Coverage reports generated
- [ ] Coverage reviewed regularly
- [ ] Critical paths have high coverage

---

## 🎯 SUCCESS CRITERIA

Testing implementation is complete when:

1. ✅ **Unit Tests**: All utilities and hooks tested
2. ✅ **Component Tests**: All components tested
3. ✅ **Integration Tests**: Key features tested end-to-end
4. ✅ **Coverage**: >80% coverage achieved
5. ✅ **Mocks**: External dependencies properly mocked
6. ✅ **CI/CD**: Tests run in CI pipeline
7. ✅ **Maintainability**: Tests are maintainable and clear

---

## 🚨 COMMON PITFALLS

### ❌ Don't:
- Test implementation details
- Over-mock internal logic
- Write tests that are too complex
- Skip testing error cases
- Ignore accessibility in tests
- Write flaky tests

### ✅ Do:
- Test user behavior
- Mock external dependencies
- Keep tests simple and focused
- Test error and edge cases
- Use accessibility queries
- Write stable, deterministic tests

---

## 📝 TEST NAMING CONVENTIONS

```typescript
// ✅ GOOD - Descriptive test names
describe('validateEmail', () => {
  it('should return null for valid email address', () => {})
  it('should return error message for invalid email format', () => {})
  it('should return error message for empty string', () => {})
})

// ❌ BAD - Vague test names
describe('validateEmail', () => {
  it('works', () => {})
  it('test 1', () => {})
})
```

---

**This master prompt should be followed for ALL testing work.**

