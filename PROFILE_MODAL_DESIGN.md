# Modal-like Design Patterns in Profile Pages

## Overview

The profile pages use modal-like design patterns with centered cards, gradient backdrops, and smooth animations to create an immersive, focused user experience. This document details the implementation patterns used in `ProfileSetup.tsx` and `Profile.tsx`.

**Note:** The actual implementation uses a split-screen layout on ProfileSetup (left decorative, right form) rather than a centered modal. This documentation reflects the actual codebase implementation.

---

## 1. ProfileSetup Page - Split-Screen Layout Design

### Layout Structure

```tsx
// src/pages/protected/ProfileSetup.tsx
<div className="min-h-screen-dynamic flex flex-col lg:flex-row bg-white">
  {/* Left side - Decorative (hidden on mobile, shown on desktop) */}
  <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden 
                  bg-gradient-to-br from-primary via-primary-600 to-primary-700">
    {/* Background decoration with blur circles */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-20 left-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
    </div>
    
    {/* Left side content */}
    <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
      {/* Logo, Title, Progress, Step Indicators */}
    </div>
  </div>

  {/* Right side - Form (mobile-first: full width on mobile) */}
  <div className="w-full lg:w-1/2 flex items-center justify-center 
                  px-4 py-6 sm:px-6 sm:py-8 lg:px-8 
                  overflow-y-auto safe-area-inset-top safe-area-inset-bottom">
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      {/* Mobile logo and progress (hidden on desktop) */}
      {/* Form Card */}
      <Card className="shadow-lg">
        <CardContent className="p-6 sm:p-8">
          {/* Multi-step form content */}
        </CardContent>
      </Card>
    </motion.div>
  </div>
</div>
```

### Design Tokens

```css
/* Page Background */
Background: bg-white (White background)
Layout: flex flex-col lg:flex-row (Stacked on mobile, side-by-side on desktop)

/* Left Side (Desktop only) */
Width: lg:w-1/2 (50% on desktop, hidden on mobile)
Background: bg-gradient-to-br from-primary via-primary-600 to-primary-700
- from-primary: #00FF87 (Green)
- via-primary-600: Darker green
- to-primary-700: Darkest green
Padding: px-12 xl:px-20 (48px horizontal, 80px on xl screens)

/* Left Side Decorative Elements */
Blur Circles:
- Top-left: w-48 h-48 bg-white/10 (White 10% opacity, 192px)
- Bottom-right: w-64 h-64 bg-black/10 (Black 10% opacity, 256px)
- Center: w-72 h-72 bg-secondary/20 (Secondary 20% opacity, 288px)
All with blur-3xl (64px blur)

/* Right Side (Form) */
Width: w-full lg:w-1/2 (100% on mobile, 50% on desktop)
Padding: px-4 py-6 sm:px-6 sm:py-8 lg:px-8
- Mobile: 16px horizontal, 24px vertical
- Tablet: 24px horizontal, 32px vertical
- Desktop: 32px horizontal

/* Form Card Container */
Max Width: max-w-md (448px)
Centered: flex items-center justify-center

/* Card Component */
Background: hsl(35 20% 100%) (White) - from Card component
Border: 1px solid hsl(35 20% 88%) (Warm gray) - from Card component
Border Radius: rounded-2xl (1.5rem / 24px) - from Card component
Shadow: shadow-lg (Large shadow)
Padding: p-6 sm:p-8 (24px on mobile, 32px on tablet+)
```

### Entry Animation

```tsx
// Card Container Animation
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.5 }}

/* Breakdown */
- Starts: Invisible, 20px to the right
- Ends: Visible, in position
- Duration: 500ms
- Easing: Default (ease)
```

### Step Transition Animations

```tsx
<AnimatePresence mode="wait">
  {step === 'essential' && (
    <motion.div
      key="essential"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Step Content */}
    </motion.div>
  )}
</AnimatePresence>

/* Animation Breakdown */
- Enter: Slides in from right (x: 20 → 0)
- Exit: Slides out to left (x: 0 → -20)
- Duration: 300ms
- Mode: "wait" (waits for exit before entering)
```

### Conditional Field Reveal

```tsx
<AnimatePresence>
  {formData.country && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Input label="City (Required if country selected)" />
    </motion.div>
  )}
</AnimatePresence>

/* Design Pattern */
- Smoothly expands when condition becomes true
- Smoothly collapses when condition becomes false
- Height animation prevents layout jump
- Duration: 200ms (fast, responsive)
```

### Progress Bar Animation

```tsx
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${progress}%` }}
  transition={{ duration: 0.5 }}
  className="h-full bg-secondary rounded-full"
/>

/* Animation Breakdown */
- Starts: 0% width
- Ends: Current progress percentage
- Duration: 500ms
- Smooth width transition
```

### Step Indicator Animation

```tsx
<motion.div
  key={step}
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: idx * 0.1 }}
  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
    isActive ? 'bg-white/20 backdrop-blur-sm' : 'bg-white/5'
  }`}
>
  {/* Step indicator content */}
</motion.div>

/* Staggered Animation */
- Each step indicator: 0.1s delay increment
- Step 1: delay 0s
- Step 2: delay 0.1s
- Step 3: delay 0.2s
- Step 4: delay 0.3s
- Creates cascading reveal effect
```

---

## 2. Profile Page - Inline Edit Pattern

### Layout Structure

```tsx
// src/pages/protected/Profile.tsx
<div className="min-h-screen bg-background">
  <div className="max-w-4xl mx-auto px-4 py-8">
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Profile cards */}
    </motion.div>
  </div>
</div>
```

### Container Animation Variants

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

/* Animation Breakdown */
- Container: Fades in, then triggers children
- Children: Staggered by 100ms
- Each child: Fades in and slides up (y: 20 → 0)
- Duration: 400ms per child
```

### View/Edit Mode Transition

```tsx
{isEditing ? (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-5"
  >
    {/* Edit Form */}
  </motion.div>
) : (
  <div className="space-y-5">
    {/* View Mode */}
  </div>
)}
```

**Note:** The Profile page uses a simpler fade transition for edit mode, not the height animation pattern mentioned in the user's documentation. The actual implementation is:

```tsx
// Actual implementation uses simple opacity fade
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className="space-y-5"
>
```

### Profile Header Animation

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="mb-8"
>
  {/* Profile header with breadcrumb */}
</motion.div>

/* Animation Breakdown */
- Starts: Invisible, 20px below
- Ends: Visible, in position
- Duration: 500ms
- Runs independently before card animations
```

### Card Stagger Animation

```tsx
<motion.div variants={itemVariants}>
  <Card>
    {/* Card content */}
  </Card>
</motion.div>

/* Pattern */
- Each card animates with 100ms delay after previous
- Creates cascading reveal effect
- Smooth, professional appearance
```

---

## 3. Complete Design System Summary

### Color Scheme

```css
/* Background Gradient (Modal Backdrop) */
from-primary/10: hsl(158 64% 45% / 0.1) (10% green)
via-background: hsl(35 25% 99%) (Cream)
to-green-500/10: hsl(142 76% 36% / 0.1) (10% green)

/* Card Background */
bg-card: hsl(35 20% 100%) (White)

/* Border */
border-border: hsl(35 20% 88%) (Warm gray)

/* Text Colors */
text-foreground: hsl(20 15% 15%) (Dark)
text-muted-foreground: hsl(20 10% 45%) (Gray)
text-destructive: hsl(0 65% 55%) (Red)
text-primary: #00FF87 (Green)

/* Step Indicator Active State */
bg-white/20: White with 20% opacity
backdrop-blur-sm: Small blur effect
```

### Spacing System

```css
/* Page Container */
p-4: 1rem (16px) padding on mobile
py-8: 2rem (32px) vertical padding

/* Card Spacing */
space-y-6: 1.5rem (24px) vertical gap between cards
space-y-4: 1rem (16px) vertical gap in forms
space-y-5: 1.25rem (20px) vertical gap in edit forms
gap-4: 1rem (16px) between elements

/* Card Padding */
CardHeader: p-6 (24px) - from Card component
CardContent: p-6 (24px) - from Card component
```

### Typography

```css
/* Page Title (ProfileSetup) */
text-4xl: 2.25rem (36px) on mobile
xl:text-5xl: 3rem (48px) on desktop
font-bold
text-white

/* Card Titles */
text-2xl: 1.5rem (24px)
font-semibold

/* Descriptions */
text-sm: 0.875rem (14px)
text-muted-foreground

/* Labels */
text-sm: 0.875rem (14px)
font-medium

/* Helper Text */
text-xs: 0.75rem (12px)
text-muted-foreground
```

### Animation Timing

```css
/* Page Entry */
Duration: 500ms (ProfileSetup card)
Duration: 500ms (Profile header)

/* Step Transitions */
Duration: 300ms
Easing: Default (ease)

/* Conditional Field Reveal */
Duration: 200ms (fast, responsive)

/* Progress Bar */
Duration: 500ms

/* Staggered Animations */
Delay: 100ms between items
Child Duration: 400ms

/* Step Indicators */
Delay: 100ms * index
```

### Interactive States

```tsx
/* Step Indicator Active */
bg-white/20: White with 20% opacity
backdrop-blur-sm: Small blur effect

/* Step Indicator Inactive */
bg-white/5: White with 5% opacity

/* Transition */
transition-all: Smooth transitions on all properties
```

---

## 4. Visual Layout Diagram

### ProfileSetup Page (Desktop Layout)

```
┌─────────────────────────────────────────────────────────────┐
│  Page Container (min-h-screen-dynamic, flex-row)            │
│  Background: White                                          │
│                                                             │
│  ┌──────────────────────────┬──────────────────────────────┐ │
│  │  Left Side (50% width)   │  Right Side (50% width)      │ │
│  │  Hidden on mobile        │  Full width on mobile        │ │
│  │                          │                              │ │
│  │  ┌────────────────────┐  │  ┌────────────────────────┐  │ │
│  │  │  Gradient BG       │  │  │  Form Container        │  │ │
│  │  │  (Green gradient)  │  │  │  (Centered)            │  │ │
│  │  │                    │  │  │                        │  │ │
│  │  │  ┌──────────────┐  │  │  │  ┌──────────────────┐  │  │ │
│  │  │  │  Logo        │  │  │  │  │  Mobile Logo     │  │  │ │
│  │  │  └──────────────┘  │  │  │  │  (lg:hidden)     │  │  │ │
│  │  │                    │  │  │  └──────────────────┘  │  │ │
│  │  │  ┌──────────────┐  │  │  │  ┌──────────────────┐  │  │ │
│  │  │  │  Title       │  │  │  │  │  Mobile Progress │  │  │ │
│  │  │  │  "Complete   │  │  │  │  │  (lg:hidden)     │  │  │ │
│  │  │  │   Your       │  │  │  │  └──────────────────┘  │  │ │
│  │  │  │   Profile"   │  │  │  │                        │  │ │
│  │  │  └──────────────┘  │  │  │  ┌──────────────────┐  │  │ │
│  │  │                    │  │  │  │  Step Title      │  │  │ │
│  │  │  ┌──────────────┐  │  │  │  └──────────────────┘  │  │ │
│  │  │  │  Progress    │  │  │  │                        │  │ │
│  │  │  │  Bar         │  │  │  │  ┌──────────────────┐  │  │ │
│  │  │  └──────────────┘  │  │  │  │  Card            │  │  │ │
│  │  │                    │  │  │  │  ┌──────────────┐ │  │  │ │
│  │  │  ┌──────────────┐  │  │  │  │  │  Form        │ │  │  │ │
│  │  │  │  Step        │  │  │  │  │  │  Fields      │ │  │  │ │
│  │  │  │  Indicators  │  │  │  │  │  │  (Animate    │ │  │  │ │
│  │  │  │  (List)      │  │  │  │  │  │   Presence)  │ │  │  │ │
│  │  │  └──────────────┘  │  │  │  │  └──────────────┘ │  │  │ │
│  │  │                    │  │  │  │  └──────────────────┘  │  │ │
│  │  └────────────────────┘  │  │  └────────────────────────┘  │ │
│  └──────────────────────────┴──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### ProfileSetup Page (Mobile Layout)

```
┌─────────────────────────────────────────────┐
│  Page Container (flex-col, full width)      │
│  Background: White                          │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Right Side (Full width)              │ │
│  │  ┌─────────────────────────────────┐  │ │
│  │  │  Mobile Logo                    │  │ │
│  │  └─────────────────────────────────┘  │ │
│  │  ┌─────────────────────────────────┐  │ │
│  │  │  Mobile Progress Bar            │  │ │
│  │  └─────────────────────────────────┘  │ │
│  │  ┌─────────────────────────────────┐  │ │
│  │  │  Step Title                     │  │ │
│  │  └─────────────────────────────────┘  │ │
│  │  ┌─────────────────────────────────┐  │ │
│  │  │  Card (max-w-md)                │  │ │
│  │  │  ┌───────────────────────────┐  │  │ │
│  │  │  │  Form Fields              │  │  │ │
│  │  │  │  (AnimatePresence)        │  │  │ │
│  │  │  └───────────────────────────┘  │  │ │
│  │  └─────────────────────────────────┘  │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  (Left side hidden on mobile)              │
└─────────────────────────────────────────────┘
```

### Profile Page

```
┌─────────────────────────────────────────────┐
│  Page Container (min-h-screen)              │
│  Background: var(--color-background)        │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Content Container (max-w-4xl)        │ │
│  │  Padding: 16px horizontal, 32px top   │ │
│  │                                       │ │
│  │  ┌─────────────────────────────────┐  │ │
│  │  │  Header (Breadcrumb)            │  │ │
│  │  └─────────────────────────────────┘  │ │
│  │                                       │ │
│  │  ┌─────────────────────────────────┐  │ │
│  │  │  Card 1: Profile Header         │  │ │
│  │  │  (Staggered animation)          │  │ │
│  │  └─────────────────────────────────┘  │ │
│  │                                       │ │
│  │  ┌─────────────────────────────────┐  │ │
│  │  │  Card 2: Edit Profile           │  │ │
│  │  │  (View/Edit toggle)             │  │ │
│  │  └─────────────────────────────────┘  │ │
│  │                                       │ │
│  │  ┌─────────────────────────────────┐  │ │
│  │  │  Card 3: Quick Settings         │  │ │
│  │  └─────────────────────────────────┘  │ │
│  │                                       │ │
│  │  ┌─────────────────────────────────┐  │ │
│  │  │  Card 4: Sign Out               │  │ │
│  │  └─────────────────────────────────┘  │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 5. Responsive Design

### ProfileSetup Page

```tsx
/* Mobile (< 1024px) */
- Full width layout (flex-col)
- Left side: Hidden (hidden lg:flex)
- Right side: Full width (w-full)
- Padding: px-4 py-6 (16px horizontal, 24px vertical)
- Card max-width: max-w-md (448px)
- Card padding: p-6 (24px)

/* Desktop (≥ 1024px) */
- Split-screen layout (flex-row)
- Left side: 50% width (lg:w-1/2) with gradient background
- Right side: 50% width (lg:w-1/2) with form
- Padding: px-8 (32px horizontal)
- Card padding: p-8 (32px)
- Left side shows: Logo, Title, Progress, Step Indicators
- Mobile elements hidden: Logo, Progress (lg:hidden)
```

### Profile Page

```tsx
/* Mobile (< 640px) */
- Full width with padding (px-4 = 16px)
- Container max-width: max-w-4xl (896px)
- Vertical padding: py-8 (32px)

/* Tablet/Desktop (≥ 1024px) */
- Same max-width: max-w-4xl (896px)
- More horizontal space for cards
```

---

## 6. Accessibility Features

### Focus States

```tsx
/* Input Focus */
focus:outline-none
focus:ring-2
focus:ring-ring (Gold color)
focus:border-primary/50

/* Button Focus */
focus:outline-none
focus:ring-2
focus:ring-offset-2
focus:ring-ring
```

### ARIA Attributes

```tsx
/* Form Fields */
aria-invalid={error ? "true" : undefined}
aria-describedby={error ? `${id}-error` : undefined}

/* Progress Bar */
role="progressbar"
aria-valuenow={progress}
aria-valuemin={0}
aria-valuemax={100}
```

### Keyboard Navigation

- Tab through form fields
- Enter to submit forms
- Arrow keys in select dropdowns
- Escape to cancel (if implemented)

---

## 7. Implementation Notes

### Key Differences from Documentation

1. **ProfileSetup Entry Animation**: Uses `x: 20` (slides from right) instead of `y: 30, scale: 0.95`
2. **Profile Edit Mode**: Uses simple opacity fade instead of height animation
3. **Step Indicators**: Uses staggered animation with `x: -20` instead of complex logo animation
4. **Card Max Width**: Uses `max-w-md` (448px) instead of `max-w-2xl` (672px)

### Animation Best Practices

1. **Use AnimatePresence with mode="wait"** for step transitions to prevent overlap
2. **Stagger animations** for lists/collections (100ms delay between items)
3. **Keep durations short** (200-500ms) for responsive feel
4. **Use height: 'auto'** for conditional field reveals to prevent layout jumps
5. **Fade in before sliding** for smoother appearance

### Performance Considerations

1. **GPU Acceleration**: Transform properties (x, y, scale) are GPU-accelerated
2. **Will-change**: Not needed for simple animations (browser optimizes automatically)
3. **Reduced Motion**: Respect `prefers-reduced-motion` media query
4. **Animation Count**: Limit simultaneous animations to prevent jank

---

## 8. Code Examples

### Step Transition Pattern

```tsx
<AnimatePresence mode="wait">
  {step === 'essential' && (
    <motion.div
      key="essential"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Step content */}
    </motion.div>
  )}
</AnimatePresence>
```

### Conditional Field Reveal

```tsx
<AnimatePresence>
  {condition && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Input label="Conditional Field" />
    </motion.div>
  )}
</AnimatePresence>
```

### Staggered Card Animation

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  <motion.div variants={itemVariants}>
    <Card>Card 1</Card>
  </motion.div>
  <motion.div variants={itemVariants}>
    <Card>Card 2</Card>
  </motion.div>
</motion.div>
```

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0

