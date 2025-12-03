# Module PDF Generation & Print Implementation

## Overview

This document describes the implementation of comprehensive PDF generation and print styles for educational module content, following industry best practices.

## Implementation Summary

### 1. PDF Generation Utility (`src/lib/modulePdf.ts`)

**Best Practices Implemented:**

✅ **Lazy Loading**: jsPDF is dynamically imported only when needed, saving ~540KB from initial bundle  
✅ **HTML to Plain Text**: Proper HTML stripping with browser DOM method (preferred) and regex fallback  
✅ **Automatic Pagination**: Smart page breaks to prevent content overflow  
✅ **Text Wrapping**: Automatic word wrapping with configurable line heights  
✅ **Branded Header**: Green header bar with white text matching brand identity  
✅ **Completion Status**: Visual indicators (colored circles) for completion status  
✅ **Content Chunking**: Large content split into manageable 2000-character chunks  
✅ **Footer with Page Numbers**: Page numbers on all pages for navigation  
✅ **Accessible Structure**: Proper text hierarchy and formatting for screen readers  

**Key Features:**

- **A4 Format**: Standard 210mm × 297mm format
- **Margins**: 20mm on all sides (170mm content width)
- **Font Sizes**: 
  - Header: 20pt (bold)
  - Title: 18pt (bold)
  - Section Headers: 14pt (bold)
  - Content: 11pt (normal)
  - Footer: 8pt (gray)
- **Color Scheme**: Brand green (#00FF87) for header, black for content

**Function Signature:**

```typescript
generateModulePDF(
  moduleTitle: string,
  moduleDescription: string,
  moduleContent: string,      // HTML content (aggregated from lessons)
  userNotes: string,
  isCompleted: boolean,
  completedAt?: string | null
): Promise<void>
```

### 2. Enhanced Print Styles (`src/index.css`)

**Best Practices Implemented:**

✅ **A4 Page Setup**: Proper margins (1.5cm top/bottom, 2cm left/right)  
✅ **Page Break Control**: Prevents breaking inside sections, lists, blockquotes  
✅ **Typography Hierarchy**: Proper font sizes (24pt h1, 18pt h2, 14pt h3, 12pt body)  
✅ **Arabic Text Support**: RTL direction and right alignment for Arabic content  
✅ **Blockquote Styling**: Green left border for Quran/Hadith citations  
✅ **Link URLs**: External links show full URL in parentheses  
✅ **Orphans/Widows**: Minimum 3 lines to prevent awkward breaks  
✅ **Color Preservation**: Exact color printing enabled  
✅ **Hide UI Elements**: Navigation, buttons, sidebars hidden when printing  

**Key Print Styles:**

- **Sections**: `page-break-inside: avoid` to keep content together
- **Headings**: `page-break-after: avoid` to prevent orphaned headings
- **Lists**: Kept together with proper spacing
- **Blockquotes**: Green border accent for Islamic content
- **Arabic Text**: RTL support with larger font size (14pt)
- **Images**: Responsive sizing with page break avoidance

### 3. ModuleDetail Integration

**Changes Made:**

- Replaced basic inline PDF generation with comprehensive utility
- Now includes full module content (aggregated from lessons)
- Proper error handling with user-friendly messages
- Type-safe implementation with proper TypeScript types

**Usage:**

```typescript
const handleDownloadPDF = async () => {
  const { generateModulePDF } = await import('../../lib/modulePdf')
  
  await generateModulePDF(
    module.title,
    module.description || '',
    moduleContent,  // Aggregated from lessons
    notes,
    isModuleComplete,
    moduleNotes?.completed_at || null
  )
}
```

## Database Schema Notes

**Current Structure:**
- `modules` table: Contains metadata (title, description, icon, sort_order)
- `lessons` table: Contains actual content (`content` field with HTML)
- `user_module_progress` table: Tracks completion per lesson
- `module_notes` table: Stores user notes and module-level completion

**Content Aggregation:**
Module content is aggregated from lessons:
```typescript
const moduleContent = lessons
  .sort((a, b) => a.sort_order - b.sort_order)
  .map((lesson) => lesson.content)
  .filter(Boolean)
  .join('\n\n')
```

## Best Practices Followed

### PDF Generation

1. **Performance**: Lazy loading reduces initial bundle size
2. **Accessibility**: Proper text hierarchy and structure
3. **User Experience**: Clear status indicators and formatting
4. **Error Handling**: Graceful fallbacks and user feedback
5. **Content Preservation**: HTML stripped but content preserved

### Print Styles

1. **Page Layout**: A4 standard with proper margins
2. **Content Preservation**: Sections kept together when possible
3. **Typography**: Readable font sizes and line heights
4. **Accessibility**: Proper semantic structure maintained
5. **Internationalization**: RTL support for Arabic text

### Code Quality

1. **Type Safety**: Full TypeScript implementation
2. **Modularity**: Separate utility file for reusability
3. **Documentation**: Comprehensive JSDoc comments
4. **Error Handling**: Try-catch with user-friendly messages
5. **Maintainability**: Clear function structure and naming

## Future Enhancements

Potential improvements:

1. **Rich Text Support**: Preserve formatting (bold, italic, lists) in PDF
2. **Image Support**: Include images from lesson content
3. **Table Support**: Better table rendering in PDF
4. **Custom Themes**: User-selectable PDF themes
5. **Batch Export**: Export multiple modules at once
6. **Print Preview**: Preview before printing/exporting

## Testing Checklist

- [x] PDF generates successfully with module content
- [x] PDF includes user notes
- [x] Completion status displays correctly
- [x] Page breaks work properly
- [x] Print styles hide UI elements
- [x] Print styles preserve content structure
- [x] Arabic text displays correctly in print
- [x] Links show URLs in print
- [x] Error handling works for missing jsPDF

## Files Modified

1. **Created**: `src/lib/modulePdf.ts` - PDF generation utility
2. **Modified**: `src/pages/public/ModuleDetail.tsx` - Updated PDF handler
3. **Modified**: `src/index.css` - Enhanced print styles

## Dependencies

- `jspdf`: PDF generation library (already installed)
- No additional dependencies required

---

**Implementation Date**: January 2025  
**Status**: ✅ Complete and tested

