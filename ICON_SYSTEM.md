# Icon System Documentation

## Overview

A centralized icon management system that standardizes icon usage across the application. All icons are from `lucide-react` and are organized through a registry system.

## Quick Start

### Basic Icon Usage

```tsx
import { Icon } from '@/components/icons'
import { Home } from '@/components/icons/iconRegistry'

<Icon icon={Home} size="md" color="primary" />
```

### Icon Button

```tsx
import { IconButton } from '@/components/icons'
import { Download } from '@/components/icons/iconRegistry'

<IconButton 
  icon={Download} 
  size="md" 
  variant="ghost"
  aria-label="Download file"
  onClick={handleDownload}
/>
```

### Icon with Text

```tsx
import { IconWithText } from '@/components/icons'
import { DollarSign } from '@/components/icons/iconRegistry'

<IconWithText icon={DollarSign} size="md" gap="md">
  Financial Planning
</IconWithText>
```

## Icon Sizes

| Size | Tailwind | Pixels | Use Case |
|------|----------|--------|----------|
| `xs` | `h-3.5 w-3.5` | 14px | Form indicators, inline badges |
| `sm` | `h-4 w-4` | 16px | Buttons, small UI elements |
| `md` | `h-5 w-5` | 20px | Navigation, cards (default) |
| `lg` | `h-6 w-6` | 24px | Headers, feature cards |
| `xl` | `h-8 w-8` | 32px | Hero sections |
| `2xl` | `h-10 w-10` | 40px | Decorative elements |

## Color Variants

- `default` - Inherits text color
- `primary` - Brand primary (green)
- `success` - Success state (green)
- `warning` - Warning state (gold)
- `error` - Error state (red)
- `muted` - Muted gray
- `brand` - Brand gradient color
- `islamic-gold` - Islamic gold accent

## Available Icons

All icons are exported from `@/components/icons/iconRegistry`. Common icons:

### Navigation
- `Home`, `LayoutDashboard`, `Menu`, `X`
- `ChevronLeft`, `ChevronRight`, `ChevronUp`, `ChevronDown`
- `ArrowLeft`, `ArrowRight`

### User & Profile
- `User`, `Users`, `LogOut`, `Settings`

### Content
- `BookOpen`, `Library`, `FileText`, `GraduationCap`
- `CheckCircle`, `CheckCircle2`, `CheckSquare`, `Check`

### Communication
- `MessageSquare`, `MessageCircle`, `Bell`, `Mail`

### Financial
- `DollarSign`, `Calculator`, `TrendingUp`, `TrendingDown`
- `PieChart`, `BarChart3`, `Wallet`, `Coins`, `CircleDollarSign`, `Banknote`, `Receipt`

### Actions
- `Plus`, `Edit2`, `Trash2`, `Download`, `Upload`
- `Printer`, `ExternalLink`, `Search`, `Star`, `Heart`

### Status
- `AlertCircle`, `AlertTriangle`, `Info`, `Clock`, `Calendar`
- `Loader2`, `Shield`

See `src/components/icons/iconRegistry.ts` for the complete list.

## Migration Examples

### Before
```tsx
import { Home } from 'lucide-react'

<Home className="h-5 w-5 text-primary" />
```

### After
```tsx
import { Icon } from '@/components/icons'
import { Home } from '@/components/icons/iconRegistry'

<Icon icon={Home} size="md" color="primary" />
```

### Button with Icon (Before)
```tsx
import { Download } from 'lucide-react'

<button className="p-2 hover:bg-accent">
  <Download className="h-4 w-4" />
</button>
```

### Button with Icon (After)
```tsx
import { IconButton } from '@/components/icons'
import { Download } from '@/components/icons/iconRegistry'

<IconButton 
  icon={Download} 
  size="sm" 
  variant="ghost"
  aria-label="Download"
/>
```

## Accessibility

### Always Provide Labels

```tsx
// ✅ Good - Icon button with label
<IconButton 
  icon={Download} 
  aria-label="Download file"
/>

// ✅ Good - Icon with text
<IconWithText icon={Home}>Dashboard</IconWithText>

// ❌ Bad - No label
<IconButton icon={Download} />
```

### Decorative Icons

```tsx
// ✅ Good - Hidden from screen readers
<Icon 
  icon={Sparkles} 
  size="lg" 
  aria-hidden="true"
/>
```

## Animation

Icons respect `prefers-reduced-motion`. Animation is enabled by default for interactive elements:

```tsx
// Animated (default)
<Icon icon={Home} animated />

// No animation
<Icon icon={Home} animated={false} />
```

## Best Practices

1. **Use Icon component** for consistency
2. **Import from iconRegistry** for tree-shaking
3. **Always provide aria-label** for interactive icons
4. **Use appropriate sizes** based on context
5. **Respect reduced motion** (automatic)
6. **Keep stroke width consistent** (default: 2.5)

## File Structure

```
src/components/icons/
├── Icon.tsx           # Base Icon component
├── IconButton.tsx     # Icon button wrapper
├── IconWithText.tsx   # Icon + text layout
├── iconRegistry.ts    # Centralized icon exports
├── index.ts           # Public exports
└── README.md          # Detailed documentation
```

## Statistics

- **Total Icons**: 47 unique icons
- **Total Usages**: 100+ across codebase
- **Library**: `lucide-react`
- **Bundle Impact**: Tree-shaken (only used icons included)

## Common Patterns

### Navigation Item
```tsx
<IconWithText icon={Home} size="md" gap="md">
  Dashboard
</IconWithText>
```

### Status Indicator
```tsx
<Icon 
  icon={CheckCircle2} 
  size="sm" 
  color="success"
  aria-label="Completed"
/>
```

### Action Button
```tsx
<IconButton 
  icon={Download} 
  size="sm" 
  variant="outline"
  aria-label="Download"
  onClick={handleDownload}
/>
```

### Feature Card Icon
```tsx
<div className="p-3 bg-primary/10 rounded-lg">
  <Icon icon={BookOpen} size="lg" color="primary" />
</div>
```

