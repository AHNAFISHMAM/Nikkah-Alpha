# Complete Design System Documentation

## Overview

This document provides a comprehensive guide to the design system used throughout the application. The design system is built on Tailwind CSS v4 with custom CSS variables and follows an Islamic-inspired color palette with modern, accessible design principles.

---

## 1. Design Philosophy

### Core Principles
- **Islamic-Inspired Palette**: Green (60%), Gold (30%), Purple (10%)
- **Warm & Welcoming**: Cream-tinted backgrounds with soft shadows
- **Modern & Clean**: Minimalist interface with smooth animations
- **Mobile-First**: Responsive design starting from 320px viewport
- **Accessibility**: WCAG AA compliant with proper contrast ratios
- **Performance**: Optimized animations and GPU-accelerated transitions

---

## 2. Color System

### Primary Brand Colors

```css
/* Main Brand Gradient */
--color-brand: #00FF87 (Bright Islamic Green)
--color-brand-accent: #60EFFF (Cyan)
--color-brand-soft: color-mix(in srgb, #00FF87 15%, transparent)
--gradient-brand: linear-gradient(90deg, #00FF87, #60EFFF)

/* Islamic Theme Colors */
--color-islamic-gold: hsl(46 72% 68%) (Warm Gold)
--color-islamic-green: #00FF87 (Same as brand)
--color-islamic-purple: hsl(288 50% 35%) (Deep Purple)
```

### Background Colors

#### Light Mode
```css
--color-background: hsl(35 25% 99%) (Warm cream - almost white)
--color-card: hsl(35 20% 100%) (Pure white)
--color-secondary: hsl(35 15% 95%) (Light warm gray)
--color-popover: hsl(35 20% 100%) (White)
--color-accent: hsl(35 20% 94%) (Very light warm gray)
--color-muted: hsl(35 15% 95%) (Light warm gray)
```

#### Dark Mode
```css
--color-background: hsl(25 15% 8%) (Warm dark)
--color-card: hsl(25 12% 12%) (Dark card)
--color-secondary: hsl(25 10% 18%) (Dark gray)
--color-popover: hsl(25 12% 12%) (Dark)
--color-accent: hsl(25 12% 20%) (Slightly lighter dark)
--color-muted: hsl(25 10% 18%) (Dark gray)
```

### Semantic Colors

```css
/* Success */
--color-success: var(--color-brand) (Green)
--color-success-foreground: hsl(0 0% 100%) (White)

/* Warning */
--color-warning: hsl(46 72% 68%) (Gold)
--color-warning-foreground: hsl(20 15% 15%) (Dark text)

/* Error */
--color-error: hsl(0 65% 55%) (Soft red - Light)
--color-error: hsl(0 60% 50%) (Red - Dark)
--color-error-foreground: hsl(0 0% 100%) (White)

/* Info */
--color-info: hsl(210 70% 55%) (Blue - Light)
--color-info: hsl(210 65% 50%) (Blue - Dark)
--color-info-foreground: hsl(0 0% 100%) (White)

/* Destructive */
--color-destructive: hsl(0 65% 55%) (Red - Light)
--color-destructive: hsl(0 60% 45%) (Darker red - Dark)
--color-destructive-foreground: hsl(0 0% 100%) (White)
```

### Border & Input Colors

```css
/* Light Mode */
--color-border: hsl(35 20% 88%) (Warm gray border)
--color-input: hsl(35 20% 88%) (Input border)
--color-ring: hsl(46 72% 68%) (Focus ring - Gold)

/* Dark Mode */
--color-border: hsl(25 10% 22%) (Dark border)
--color-input: hsl(25 10% 22%) (Dark input border)
--color-ring: hsl(46 75% 72%) (Brighter gold for dark mode)
```

### Text Colors

#### Light Mode
```css
--color-foreground: hsl(20 15% 15%) (Dark text)
--color-muted-foreground: hsl(20 10% 45%) (Gray text)
--color-primary-foreground: hsl(0 0% 100%) (White on primary)
--color-secondary-foreground: hsl(20 15% 20%) (Dark on secondary)
--color-accent-foreground: hsl(20 15% 20%) (Dark on accent)
--color-card-foreground: hsl(20 15% 15%) (Dark on card)
```

#### Dark Mode
```css
--color-foreground: hsl(35 20% 95%) (Light text)
--color-muted-foreground: hsl(35 15% 60%) (Muted light)
--color-primary-foreground: hsl(0 0% 100%) (White on primary)
--color-secondary-foreground: hsl(35 20% 90%) (Light on secondary)
--color-accent-foreground: hsl(35 20% 90%) (Light on accent)
--color-card-foreground: hsl(35 20% 95%) (Light on card)
```

---

## 3. Typography System

### Fluid Typography Scale

All font sizes use `clamp()` for responsive scaling between mobile and desktop:

```css
--font-size-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)    /* 12px → 14px */
--font-size-sm: clamp(0.8125rem, 0.75rem + 0.3125vw, 0.9375rem) /* 13px → 15px */
--font-size-base: clamp(0.875rem, 0.8rem + 0.375vw, 1rem)   /* 14px → 16px */
--font-size-lg: clamp(1rem, 0.9rem + 0.5vw, 1.125rem)       /* 16px → 18px */
--font-size-xl: clamp(1.125rem, 0.95rem + 0.875vw, 1.25rem) /* 18px → 20px */
--font-size-2xl: clamp(1.25rem, 1rem + 1.25vw, 1.5rem)      /* 20px → 24px */
--font-size-3xl: clamp(1.5rem, 1rem + 2.5vw, 1.875rem)      /* 24px → 30px */
--font-size-4xl: clamp(1.875rem, 1.25rem + 3.125vw, 2.25rem) /* 30px → 36px */
--font-size-5xl: clamp(2.25rem, 1.5rem + 3.75vw, 3rem)      /* 36px → 48px */
--font-size-6xl: clamp(2.75rem, 1.5rem + 6.25vw, 3.75rem)   /* 44px → 60px */
```

### Font Styling

```css
/* Base Body Text */
font-family: System font stack (San Francisco, Segoe UI, etc.)
font-weight: 400 (Regular)
line-height: 1.5
-webkit-font-smoothing: antialiased
-moz-osx-font-smoothing: grayscale
font-feature-settings: "rlig" 1, "calt" 1

/* Headings */
font-weight: 600-700 (Semibold to Bold)
letter-spacing: -0.02em (Tighter spacing)

/* Mobile Input Fix */
input, select, textarea {
  font-size: 16px; /* Prevents iOS zoom on focus */
}
@media (min-width: 640px) {
  input, select, textarea {
    font-size: inherit; /* Use fluid typography on larger screens */
  }
}
```

### Typography Utilities

```css
.text-fluid-xs { font-size: var(--font-size-xs); }
.text-fluid-sm { font-size: var(--font-size-sm); }
.text-fluid-base { font-size: var(--font-size-base); }
.text-fluid-lg { font-size: var(--font-size-lg); }
.text-fluid-xl { font-size: var(--font-size-xl); }
.text-fluid-2xl { font-size: var(--font-size-2xl); }
.text-fluid-3xl { font-size: var(--font-size-3xl); }
.text-fluid-4xl { font-size: var(--font-size-4xl); }
.text-fluid-5xl { font-size: var(--font-size-5xl); }
.text-fluid-6xl { font-size: var(--font-size-6xl); }
```

---

## 4. Spacing & Layout

### Fluid Spacing Scale

```css
--space-xs: clamp(0.25rem, 0.2rem + 0.25vw, 0.375rem)    /* 4px → 6px */
--space-sm: clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem)      /* 8px → 12px */
--space-md: clamp(0.75rem, 0.6rem + 0.75vw, 1rem)       /* 12px → 16px */
--space-lg: clamp(1rem, 0.8rem + 1vw, 1.5rem)           /* 16px → 24px */
--space-xl: clamp(1.5rem, 1rem + 2.5vw, 2.5rem)         /* 24px → 40px */
--space-2xl: clamp(2rem, 1.5rem + 2.5vw, 3rem)          /* 32px → 48px */
```

### Responsive Spacing Utilities

```css
.px-responsive { padding-left: var(--space-md); padding-right: var(--space-md); }
.py-responsive { padding-top: var(--space-lg); padding-bottom: var(--space-lg); }
.p-responsive { padding: var(--space-md); }
.gap-responsive { gap: var(--space-md); }
```

### Border Radius

```css
--radius-sm: 0.375rem (6px)   /* Small elements */
--radius: 0.75rem (12px)      /* Default */
--radius-md: 0.75rem (12px)   /* Medium */
--radius-lg: 1rem (16px)      /* Large */
--radius-xl: 1.5rem (24px)    /* Extra large */
--radius-2xl: 2rem (32px)     /* Cards, modals */
--radius-full: 9999px         /* Pills, circles */
```

### Breakpoints

```css
--breakpoint-xs: 375px
Default: < 640px (Mobile)
sm: 640px+ (Tablet)
md: 768px+ (Small desktop)
lg: 1024px+ (Desktop)
xl: 1280px+ (Large desktop)
```

---

## 5. Shadows & Depth

### Shadow System

```css
--shadow-sm: 0 1px 2px 0 hsl(35 20% 50% / 0.05)
--shadow: 0 1px 3px 0 hsl(35 20% 50% / 0.1), 
          0 1px 2px -1px hsl(35 20% 50% / 0.1)
--shadow-md: 0 4px 6px -1px hsl(35 20% 50% / 0.1), 
             0 2px 4px -2px hsl(35 20% 50% / 0.1)
--shadow-lg: 0 10px 15px -3px hsl(35 20% 50% / 0.1), 
             0 4px 6px -4px hsl(35 20% 50% / 0.1)
--shadow-xl: 0 20px 25px -5px hsl(35 20% 50% / 0.1), 
             0 8px 10px -6px hsl(35 20% 50% / 0.1)
```

### Usage Guidelines

- **shadow-sm**: Subtle elevation (hover states)
- **shadow**: Default elevation (cards)
- **shadow-md**: Medium elevation (buttons, inputs)
- **shadow-lg**: High elevation (hover states, modals)
- **shadow-xl**: Maximum elevation (form cards, modals)

---

## 6. Z-Index System

```css
--z-base: 1
--z-dropdown: 10
--z-sticky: 20
--z-fixed: 30
--z-sidebar: 40
--z-modal-backdrop: 50
--z-modal: 50
--z-popover: 60
--z-tooltip: 70
--z-navbar: 100 (Navbar above all content)
```

### Utilities

```css
.z-base { z-index: var(--z-base); }
.z-dropdown { z-index: var(--z-dropdown); }
.z-sticky { z-index: var(--z-sticky); }
.z-fixed { z-index: var(--z-fixed); }
.z-sidebar { z-index: var(--z-sidebar); }
.z-navbar { z-index: var(--z-navbar); }
.z-modal-backdrop { z-index: var(--z-modal-backdrop); }
.z-modal { z-index: var(--z-modal); }
.z-popover { z-index: var(--z-popover); }
.z-tooltip { z-index: var(--z-tooltip); }
```

---

## 7. Component Design

### Button Component

#### Variants

```tsx
// Primary (Default) - Brand gradient
variant="primary" | "success" | "warm"
className="gradient-brand text-white shadow-md 
           hover:shadow-lg hover:-translate-y-0.5
           active:scale-[0.98]"

// Secondary - Soft neutral
variant="secondary"
className="bg-secondary text-secondary-foreground
           shadow-sm hover:bg-secondary/80"

// Outline - Border with hover fill
variant="outline"
className="border-2 border-input bg-background
           hover:bg-accent hover:border-primary/50"

// Ghost - Minimal, hover background
variant="ghost"
className="text-muted-foreground
           hover:bg-accent hover:text-accent-foreground"

// Danger/Destructive - Red
variant="danger" | "destructive"
className="bg-destructive text-destructive-foreground
           shadow-md hover:bg-destructive/90"

// Link - Text link style
variant="link"
className="text-brand underline-offset-4 hover:underline"
```

#### Sizes

```tsx
size="sm"  // px-3 py-1.5 text-sm min-h-[36px]
size="md"  // px-4 py-2.5 text-base min-h-[44px] (default)
size="lg"  // px-6 py-3 text-lg min-h-[52px]
```

#### Features
- Touch-friendly minimum heights (44px+)
- Loading state with spinner
- Left/right icon support
- Disabled state with reduced opacity
- Focus ring (gold color)
- Smooth transitions (200ms)

### Input Component

#### Base Styles

```tsx
className="w-full rounded-xl border bg-background text-foreground
           px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base
           transition-all duration-200
           placeholder:text-muted-foreground
           focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary
           disabled:bg-muted disabled:cursor-not-allowed
           touch-target"
```

#### States

```tsx
// Normal
border: var(--color-input)
background: var(--color-background)

// Hover
border: var(--color-primary) with 30% opacity

// Focus
border: var(--color-primary)
ring: 2px solid var(--color-ring) (Gold)
ring-offset: 2px

// Error
border: var(--color-error)
ring: var(--color-error) with 50% opacity

// Disabled
background: var(--color-muted)
cursor: not-allowed
```

#### Features
- Icon support (left/right)
- Label and hint text
- Error state with aria attributes
- Mobile-optimized (16px font prevents zoom)
- Touch-friendly (48px+ height)

### Card Component

```tsx
className="bg-card border border-border rounded-2xl shadow-xl p-8"
```

#### Breakdown
- **Background**: `var(--color-card)` (White in light, dark in dark mode)
- **Border**: `1px solid var(--color-border)` (Warm gray)
- **Radius**: `1.5rem` (24px)
- **Shadow**: `shadow-xl` (Large soft shadow)
- **Padding**: `2rem` (32px) on all sides

---

## 8. Animations & Transitions

### Duration Tokens

```css
--duration-fast: 150ms
--duration-normal: 200ms
--duration-slow: 300ms
```

### Built-in Animations

```css
/* Fade In */
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.animate-fade-in { animation: fade-in 0.3s ease-out; }

/* Slide Up */
@keyframes slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-slide-up { animation: slide-up 0.3s ease-out; }

/* Slide Down */
@keyframes slide-down { from { opacity: 0; transform: translateY(-100%); } to { opacity: 1; transform: translateY(0); } }
.animate-slide-down { animation: slide-down 0.4s ease-out; }

/* Scale In */
@keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.animate-scale-in { animation: scale-in 0.2s ease-out; }

/* Pulse Glow */
@keyframes pulse-glow { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.85; } }
.animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }

/* Shimmer (Loading) */
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
.animate-shimmer { background: linear-gradient(90deg, var(--color-muted) 25%, hsl(35 20% 92%) 50%, var(--color-muted) 75%); background-size: 200% 100%; animation: shimmer 1.5s ease-in-out infinite; }

/* Spin */
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Component Animations

```css
/* Card Hover */
.card-hover {
  transition: all 0.2s ease;
}
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Button Glow */
.btn-glow:hover {
  box-shadow: 0 0 20px hsl(158 64% 45% / 0.3);
}
```

---

## 9. Background Gradients

### Page Background (Auth Pages)

```tsx
className="bg-gradient-to-br from-primary/5 via-background via-70% to-islamic-purple/5"
```

**Breakdown:**
- `from-primary/5`: Start with 5% opacity green (#00FF87)
- `via-background`: Middle is cream background (hsl(35 25% 99%))
- `via-70%`: Background color at 70% of gradient
- `to-islamic-purple/5`: End with 5% opacity purple

**Visual Effect:** Subtle diagonal gradient from top-left (green tint) to bottom-right (purple tint) with cream in the middle.

---

## 10. Scrollbar Design

### Custom Scrollbar

```css
/* Global Scrollbar */
scrollbar-width: thin;
scrollbar-color: rgba(0, 255, 135, 0.3) transparent;

/* Webkit Scrollbar */
::-webkit-scrollbar {
  width: 8px; /* 4px on mobile */
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(0, 255, 135, 0.3), rgba(96, 239, 255, 0.3));
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(0, 255, 135, 0.5), rgba(96, 239, 255, 0.5));
}

::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, rgba(0, 255, 135, 0.7), rgba(96, 239, 255, 0.7));
}
```

### Scrollbar Utilities

```css
.scrollbar-hide { /* Hide scrollbar but keep functionality */ }
.scrollbar-thin { /* Thin scrollbar */ }
.custom-scrollbar { /* Branded scrollbar with gradient */ }
```

---

## 11. Brand Themes

The application supports multiple brand themes that can be selected by administrators:

### Classic Green (Default)

```css
.theme-classic {
  --color-brand: #00FF87;
  --color-brand-accent: #60EFFF;
  --gradient-brand: linear-gradient(90deg, #00FF87, #60EFFF);
  --color-primary: #00FF87;
  --color-islamic-gold: hsl(46 72% 68%);
  --color-islamic-purple: hsl(288 50% 35%);
  --color-success: #00FF87;
  --color-ring: hsl(46 72% 68%);
}
```

### Midnight Gold

```css
.theme-midnight {
  --color-brand: #1E293B;
  --color-brand-accent: #FACC15;
  --gradient-brand: linear-gradient(90deg, #1E293B, #FACC15);
  --color-primary: #FACC15;
  --color-islamic-gold: #FACC15;
  --color-islamic-purple: #4C1D95;
  --color-success: #FACC15;
  --color-ring: #FACC15;
}
```

### Soft Neutral

```css
.theme-soft {
  --color-brand: #14B8A6;
  --color-brand-accent: #FBBF24;
  --gradient-brand: linear-gradient(90deg, #14B8A6, #FBBF24);
  --color-primary: #14B8A6;
  --color-islamic-gold: #FBBF24;
  --color-islamic-purple: #6D28D9;
  --color-success: #14B8A6;
  --color-ring: #FBBF24;
}
```

---

## 12. Accessibility Features

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--color-islamic-gold);
  outline-offset: 2px;
}

/* Input Focus */
focus:ring-2: 2px ring
focus:ring-ring: Gold color
focus:ring-offset-2: 2px gap
```

### Color Contrast

All color combinations meet WCAG AA standards:
- **Text on Background**: ~15:1 (WCAG AAA)
- **Text on Primary**: ~4.5:1 (WCAG AA)
- **Error Text**: ~4.5:1 (WCAG AA)

### ARIA Attributes

Components include proper ARIA attributes:
- `aria-invalid` for error states
- `aria-describedby` for error/hint messages
- `aria-live="polite"` for dynamic content
- Proper label associations

### Touch Targets

```css
.touch-target {
  min-height: 48px; /* iOS minimum 44px, recommended 48px */
  min-width: 48px;
  touch-action: manipulation; /* Prevents double-tap zoom */
}

.touch-target-sm {
  min-height: 44px;
  min-width: 44px;
}
```

### Safe Area Insets

```css
.safe-area-inset-top { padding-top: env(safe-area-inset-top); }
.safe-area-inset-bottom { padding-bottom: env(safe-area-inset-bottom); }
.safe-area-inset-left { padding-left: env(safe-area-inset-left); }
.safe-area-inset-right { padding-right: env(safe-area-inset-right); }
```

---

## 13. Mobile Optimizations

### Viewport Handling

```css
/* Dynamic Viewport Height */
.h-screen-dynamic { height: 100vh; height: 100dvh; }
.min-h-screen-dynamic { min-height: 100vh; min-height: 100dvh; }

/* Stable Viewport Height */
.h-screen-stable { height: 100vh; height: 100svh; }
```

### Performance Optimizations

```css
/* GPU Acceleration */
.gpu-accelerate {
  transform: translateZ(0);
  backface-visibility: hidden;
}

.will-change-transform {
  will-change: transform;
}

/* Prevent Double-Tap Zoom */
button, a, [role="button"] {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
```

### Responsive Utilities

```css
/* Responsive Padding */
.card-padding {
  padding: 0.75rem; /* Mobile */
}
@media (min-width: 640px) {
  .card-padding { padding: 1rem; } /* Tablet */
}
@media (min-width: 1024px) {
  .card-padding { padding: 1.5rem; } /* Desktop */
}
```

---

## 14. Utility Classes

### Color Utilities

```css
.text-brand { color: var(--color-brand); }
.text-success { color: var(--color-success); }
.text-warning { color: var(--color-warning); }
.text-error { color: var(--color-error); }
.text-info { color: var(--color-info); }
.text-islamic-gold { color: var(--color-islamic-gold); }
.text-islamic-green { color: var(--color-brand); }
.text-islamic-purple { color: var(--color-islamic-purple); }

.bg-brand, .gradient-brand { background: var(--gradient-brand); }
.bg-brand-soft { background: var(--color-brand-soft); }
.bg-success { background-color: var(--color-success); }
.bg-warning { background-color: var(--color-warning); }
.bg-error { background-color: var(--color-error); }
.bg-info { background-color: var(--color-info); }
.bg-islamic-gold { background-color: var(--color-islamic-gold); }
.bg-islamic-green { background: var(--gradient-brand); }
.bg-islamic-purple { background-color: var(--color-islamic-purple); }
```

### Text Utilities

```css
.text-truncate-2 { /* Truncate to 2 lines */ }
.text-truncate-3 { /* Truncate to 3 lines */ }
```

### Glass Effect

```css
.glass {
  background: hsl(0 0% 100% / 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.dark .glass {
  background: hsl(25 12% 12% / 0.8);
}
```

---

## 15. Print Styles

```css
@media print {
  @page {
    margin: 1.5cm 2cm;
    size: A4;
  }
  
  /* Hide interactive elements */
  nav, aside, button, .toast, header, footer {
    display: none !important;
  }
  
  /* Optimize cards for print */
  .card {
    border: 1px solid #ddd !important;
    box-shadow: none !important;
    page-break-inside: avoid;
  }
  
  /* Typography */
  body { font-size: 12pt; line-height: 1.6; }
  h1 { font-size: 24pt; }
  h2 { font-size: 18pt; }
  h3 { font-size: 14pt; }
}
```

---

## 16. Component-Specific Styles

### List Item Interactive

```css
.list-item-interactive {
  transition: all 0.15s ease;
}
.list-item-interactive:hover {
  background-color: var(--color-accent);
}
```

### Progress Bar

```css
.progress-islamic {
  background: var(--gradient-brand);
}
```

### Border Accents

```css
.border-gold-accent {
  border-color: var(--color-islamic-gold);
}
```

---

## 17. Quick Reference

### Design Tokens Summary

```css
/* Colors */
Primary: #00FF87 (Green)
Gold: hsl(46 72% 68%)
Purple: hsl(288 50% 35%)
Background: hsl(35 25% 99%) (Cream)
Card: hsl(35 20% 100%) (White)
Border: hsl(35 20% 88%) (Warm gray)
Text: hsl(20 15% 15%) (Dark)
Muted Text: hsl(20 10% 45%) (Gray)

/* Spacing */
Card Padding: 2rem (32px)
Form Gap: 1rem (16px)
Input Height: 2.5rem (40px) - 3rem (48px) on mobile
Button Height: 2.75rem (44px) - 3.25rem (52px) for large

/* Border Radius */
Input: 0.75rem (12px)
Card: 1.5rem (24px)
Button: 0.75rem (12px)

/* Shadows */
Card: shadow-xl (Large)
Button: shadow-md (Medium)
Button Hover: shadow-lg (Large)

/* Transitions */
Default: 200ms ease
Animations: 300ms ease-out
Fast: 150ms
Slow: 300ms
```

---

## 18. Implementation Notes

### File Structure

- **Design Tokens**: `src/index.css` (CSS variables in `@theme`)
- **Components**: `src/components/ui/` (Button, Input, Card, etc.)
- **Utilities**: Defined in `src/index.css` under `@layer utilities`
- **Theme Presets**: `src/lib/themePresets.ts`

### Usage Guidelines

1. **Always use CSS variables** instead of hardcoded colors
2. **Use fluid typography** for responsive text sizing
3. **Follow mobile-first** approach (base styles for mobile, enhance for larger screens)
4. **Respect reduced motion** preferences
5. **Maintain accessibility** standards (contrast, focus states, ARIA)
6. **Use semantic colors** (success, error, warning) for consistency

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0

