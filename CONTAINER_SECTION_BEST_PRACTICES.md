# Container & Section Best Practices - Implementation Guide

## Research Summary

Based on comprehensive research of modern UI/UX best practices (2024), this document outlines the spacing, layout, and organization standards applied to the Profile page and modals.

---

## 1. Page Container Best Practices

### Spacing Standards
- **Minimum Padding**: 16px (1rem) on mobile
- **Recommended Padding**: 24px (1.5rem) on tablet, 32px (2rem) on desktop
- **Implementation**: `p-4 sm:p-6 lg:p-8`

### Max Width & Centering
- **Content Max Width**: 1024px (max-w-4xl) for optimal readability
- **Centering**: `mx-auto` for horizontal centering
- **Safe Areas**: `safe-area-inset-top safe-area-inset-bottom` for mobile notches

### Vertical Spacing
- **Section Gap**: 24px minimum between major sections (`space-y-6 sm:space-y-8`)
- **Header Margin**: 32px-40px below page header (`mb-8 sm:mb-10`)

---

## 2. Card/Section Container Best Practices

### Card Padding
- **Mobile**: 24px (p-6)
- **Desktop**: 32px (sm:p-8)
- **Header Padding**: 20px-24px (px-6 py-5 sm:px-8 sm:py-6)
- **Content Padding**: 24px-32px (p-6 sm:p-8)

### Card Spacing
- **Between Cards**: 24px-32px (`space-y-6 sm:space-y-8`)
- **Card Border**: 1px solid border with subtle color
- **Card Shadow**: `shadow-sm` for elevation

### Visual Separation
- **Header Border**: `border-b border-border` for clear section separation
- **Section Dividers**: `border-t border-border/50` for subtle separation
- **Background**: Use `bg-card` for consistent theming

---

## 3. Form Section Best Practices

### Section Organization
- **Group Related Fields**: Use semantic `<section>` elements
- **Section Headings**: Clear, descriptive headings with visual separation
- **Section Spacing**: 24px between sections (`space-y-6`)

### Form Field Spacing
- **Between Fields**: 20px (`space-y-5`) for comfortable scanning
- **Label to Input**: 6px-8px gap (`mb-1.5` or `mb-2`)
- **Input to Helper Text**: 8px-12px (`mt-1.5` or `mt-2`)
- **Input to Error**: 8px-12px with clear visual distinction

### Visual Hierarchy
- **Section Headings**: 
  - Font size: `text-sm font-semibold`
  - Bottom border: `border-b border-border/50`
  - Margin: `mb-4 pb-2`
- **Field Labels**: 
  - Font size: `text-sm font-medium`
  - Required indicator: Asterisk (*) with proper styling

---

## 4. Modal Content Best Practices

### Modal Container
- **Padding**: 24px mobile, 32px desktop (`p-6 sm:p-8`)
- **Max Width**: 448px (`max-w-md`) for optimal readability
- **Border Radius**: 16px-24px (`rounded-2xl`)

### Modal Sections

#### Header Section
- **Padding**: 24px-32px (`px-6 py-5 sm:px-8 sm:py-6`)
- **Icon Size**: 40px-48px (`h-10 w-10 sm:h-12 sm:w-12`)
- **Title Size**: `text-lg sm:text-xl`
- **Description**: `text-sm text-muted-foreground`
- **Bottom Margin**: 24px-32px (`mb-6 sm:mb-8`)

#### Content Section
- **Main Spacing**: 24px (`space-y-6`)
- **Field Group Spacing**: 12px (`space-y-3`)
- **Label to Input**: 12px gap
- **Input to Helper/Error**: 12px (`mt-3`)

#### Footer Section
- **Top Padding**: 16px (`pt-4`)
- **Top Border**: `border-t border-border` for clear separation
- **Button Gap**: 12px (`gap-3`)
- **Button Height**: 44px minimum (`min-h-[44px]`)

---

## 5. Information Display Best Practices

### Info Card Items
- **Item Padding**: 16px (`p-4`)
- **Item Gap**: 16px (`gap-4`)
- **Icon Container**: 40px-44px (`h-10 w-10 sm:h-11 sm:w-11`)
- **Hover State**: Subtle background change (`hover:bg-card/50`)
- **Spacing Between Items**: 12px (`space-y-3`)

### Section Headings in Display Mode
- **Font**: `text-sm font-semibold`
- **Bottom Border**: `border-b border-border/50`
- **Margin**: `mb-3 pb-2`
- **Section Gap**: 24px (`pt-6 border-t border-border/50`)

---

## 6. Button & Action Best Practices

### Button Spacing
- **Button Height**: 44px minimum for touch targets
- **Button Gap**: 12px (`gap-3`)
- **Button Padding**: Responsive (`px-4 py-2.5 sm:px-6 sm:py-3`)
- **Action Section Top Padding**: 24px (`pt-6`)

### Button Layout
- **Mobile**: Stacked (`flex-col-reverse`)
- **Desktop**: Side-by-side (`sm:flex-row`)
- **Primary Action**: Right side (or bottom on mobile)

---

## 7. Typography & Text Spacing

### Heading Hierarchy
- **Page Title**: `text-2xl sm:text-3xl` with `leading-tight`
- **Card Title**: `text-lg sm:text-xl`
- **Section Heading**: `text-sm font-semibold`
- **Field Label**: `text-sm font-medium`

### Text Spacing
- **Line Height**: 
  - Headings: `leading-tight`
  - Body: `leading-relaxed`
- **Paragraph Spacing**: 8px-12px (`mt-2` or `mt-3`)
- **Helper Text**: `text-sm` with `text-muted-foreground`

---

## 8. Responsive Breakpoints

### Mobile First Approach
- **Base**: 320px-639px (mobile)
- **Tablet**: 640px-1023px (`sm:`)
- **Desktop**: 1024px+ (`lg:`)

### Spacing Scale
- **Mobile**: 16px base unit
- **Tablet**: 20px-24px
- **Desktop**: 24px-32px

---

## 9. Visual Hierarchy Principles

### Importance Order
1. **Primary Actions**: Most prominent (primary buttons, main CTAs)
2. **Section Headings**: Clear but secondary
3. **Field Labels**: Visible but not dominant
4. **Helper Text**: Subtle, muted colors

### Color Usage
- **Primary Text**: `text-foreground` (high contrast)
- **Secondary Text**: `text-muted-foreground` (medium contrast)
- **Success/Info**: `text-primary` (brand color)
- **Errors**: `text-error` (red, high visibility)

---

## 10. Accessibility Standards

### Touch Targets
- **Minimum Size**: 44px × 44px
- **Recommended**: 48px × 48px
- **Implementation**: `min-h-[44px]` with `touch-manipulation`

### Focus States
- **Focus Ring**: 2px solid with 2px offset
- **Color**: Primary brand color or gold (`ring-primary`)
- **Visibility**: Always visible on keyboard navigation

### ARIA Attributes
- **Labels**: Proper `htmlFor` associations
- **Descriptions**: `aria-describedby` for helper text
- **Errors**: `aria-invalid` and `role="alert"`
- **Modals**: `aria-modal="true"` and proper labeling

---

## 11. Implementation Checklist

### Page Level
- [x] 16px+ padding on mobile, 24px+ on desktop
- [x] Max width container (1024px)
- [x] Safe area insets for mobile
- [x] 24px+ spacing between major sections

### Card Level
- [x] 24px+ padding inside cards
- [x] Clear header/content separation
- [x] 24px+ spacing between cards
- [x] Proper border and shadow

### Form Level
- [x] Single-column layout
- [x] 20px spacing between fields
- [x] Clear section grouping
- [x] Proper label placement (above inputs)

### Modal Level
- [x] 24px+ padding
- [x] Clear header/body/footer separation
- [x] 24px spacing between major elements
- [x] Border separator for footer

### Display Level
- [x] Consistent item spacing (12px)
- [x] Clear section headings
- [x] Hover states for interactivity
- [x] Proper visual grouping

---

## 12. Spacing Reference Table

| Element | Mobile | Tablet | Desktop | Purpose |
|---------|--------|--------|---------|---------|
| Page Padding | 16px | 24px | 32px | Content breathing room |
| Card Padding | 24px | 24px | 32px | Internal spacing |
| Card Gap | 24px | 24px | 32px | Between sections |
| Form Field Gap | 20px | 20px | 20px | Between inputs |
| Section Gap | 24px | 24px | 24px | Between groups |
| Modal Padding | 24px | 24px | 32px | Modal content |
| Button Height | 44px | 44px | 44px | Touch target |
| Icon Size | 40px | 40px | 48px | Visual prominence |

---

## 13. Key Principles Applied

1. **Consistency**: Same spacing patterns throughout
2. **Hierarchy**: Clear visual importance order
3. **Breathing Room**: Adequate whitespace prevents crowding
4. **Grouping**: Related items visually grouped
5. **Separation**: Clear boundaries between sections
6. **Responsiveness**: Scales appropriately across devices
7. **Accessibility**: Touch-friendly, keyboard-navigable
8. **Theme Integration**: Uses design system tokens

---

**Last Updated**: 2025-01-XX
**Applied To**: Profile.tsx, DateOfBirthModal.tsx, GenderModal.tsx, MaritalStatusModal.tsx

