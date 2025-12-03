# Icon System

Centralized icon management system for consistent icon usage across the application.

## Features

- ✅ Standardized sizes (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`)
- ✅ Consistent color variants
- ✅ Accessibility support (ARIA labels)
- ✅ Reduced motion support
- ✅ Tree-shaking optimized
- ✅ Type-safe icon registry

## Usage

### Basic Usage

```tsx
import { Icon } from '@/components/icons'
import { Home } from '@/components/icons/iconRegistry'

<Icon icon={Home} size="md" color="primary" />
```

### Direct Icon Import (when you need the raw component)

```tsx
import { Home, DollarSign } from '@/components/icons/iconRegistry'

<Home className="h-5 w-5 text-primary" />
```

### With Animation

```tsx
<Icon 
  icon={Sparkles} 
  size="lg" 
  color="brand" 
  animated 
  aria-label="Featured content"
/>
```

## Size Reference

| Size | Tailwind Class | Use Case |
|------|---------------|----------|
| `xs` | `h-3.5 w-3.5` | Form field indicators, inline badges |
| `sm` | `h-4 w-4` | Buttons, small UI elements |
| `md` | `h-5 w-5` | Navigation, cards, most UI (default) |
| `lg` | `h-6 w-6` | Headers, feature cards |
| `xl` | `h-8 w-8` | Hero sections, large features |
| `2xl` | `h-10 w-10` | Decorative elements |

## Color Variants

- `default` - Inherits from text color
- `primary` - Brand primary color
- `success` - Success/green
- `warning` - Warning/gold
- `error` - Error/red
- `muted` - Muted gray
- `brand` - Brand gradient color
- `islamic-gold` - Islamic gold accent

## Accessibility

Always provide `aria-label` for icon-only buttons:

```tsx
<Icon 
  icon={Download} 
  size="sm" 
  aria-label="Download file"
/>
```

For decorative icons, use `aria-hidden`:

```tsx
<Icon 
  icon={Sparkles} 
  size="lg" 
  aria-hidden="true"
/>
```

## Migration Guide

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

## Adding New Icons

1. Add the icon export to `iconRegistry.ts`:
```ts
export { NewIcon } from 'lucide-react'
```

2. Use it in your component:
```tsx
import { Icon } from '@/components/icons'
import { NewIcon } from '@/components/icons/iconRegistry'

<Icon icon={NewIcon} size="md" />
```

## Best Practices

1. **Use Icon component** for consistent sizing and colors
2. **Import from iconRegistry** to maintain tree-shaking
3. **Always provide aria-label** for interactive icons
4. **Use appropriate sizes** based on context
5. **Respect reduced motion** (handled automatically)
6. **Keep stroke width consistent** (default: 2.5)

