# Nikkah Alpha - Marriage Preparation Platform

A comprehensive web application to help couples prepare for marriage through guided modules, checklists, financial planning tools, and discussion prompts.

## Tech Stack

- **Frontend**: React 18.3.1 + TypeScript 5.6.2
- **Build Tool**: Vite 6.4.1
- **Styling**: Tailwind CSS 4.1.17 (mobile-first)
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: TanStack React Query 5.62.0
- **Routing**: React Router DOM 7.9.6
- **Animations**: Framer Motion 12.0.0
- **Icons**: Lucide React

## Features

- ✅ **Authentication** - Email/password with Supabase Auth
- ✅ **Profile Management** - Comprehensive user profiles
- ✅ **Marriage Checklist** - Track preparation tasks
- ✅ **Financial Planning** - Mahr calculator, budget planner
- ✅ **Learning Modules** - Pre-marriage education content
- ✅ **Discussion Prompts** - Guided conversation topics
- ✅ **Resources Library** - Curated articles, videos, PDFs
- ✅ **Content Management** - Admin interface for content
- ✅ **Mobile-First Design** - Responsive across all devices

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (or run locally with Supabase CLI)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd "Nikkah Alpha"

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Development

```bash
# Run development server
npm run dev

# Run type checking
npm run typecheck

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Setup

```bash
# Run migrations (if using Supabase CLI)
supabase db push

# Or manually run migrations from supabase/migrations/ in your Supabase dashboard
```

## Project Structure

```
src/
├── components/       # React components
│   ├── auth/        # Authentication guards
│   ├── common/      # Shared components
│   ├── layout/      # Layout components
│   └── ui/          # Base UI components
├── contexts/        # React contexts
├── hooks/           # Custom React hooks
├── lib/             # Utility libraries
├── pages/           # Page components
│   ├── public/      # Public pages
│   ├── protected/   # Protected user pages
│   └── manage/      # Content management pages
├── types/           # TypeScript types
├── constants/       # App-wide constants
└── App.tsx          # Main app component

supabase/
└── migrations/      # Database migrations
```

## Code Quality

### Type Safety
- ✅ Zero TypeScript errors
- ✅ Strict mode enabled
- ✅ No `@ts-ignore` or `@ts-expect-error`

### Performance
- ✅ Code splitting by route
- ✅ Lazy loading components
- ✅ Optimized database queries (8→3 queries)
- ✅ React Query caching (60s stale time)

### Security
- ✅ Environment-gated mock sessions
- ✅ Row Level Security (RLS) enabled
- ✅ Input validation
- ✅ XSS protection

### Accessibility
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support
- ✅ Touch targets ≥48x48px
- ✅ Semantic HTML

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment

### Quick Deploy (Vercel - Recommended)
```bash
npm i -g vercel
vercel login
vercel
# Add environment variables in Vercel dashboard
vercel --prod
```

### Manual Deployment
1. Build: `npm run build`
2. Upload `dist/` folder to your hosting provider
3. Set environment variables
4. Configure SPA routing (all routes → index.html)

**📖 Full Deployment Guide:** See `DEPLOYMENT_GUIDE.md` for detailed instructions.

**⚡ Quick Start:** See `DEPLOYMENT_QUICK_START.md` for 5-minute deployment.

## Contributing

1. Follow the existing code style
2. Run `npm run typecheck` before committing
3. Add tests for new features
4. Update documentation as needed

## License

[Your License Here]

## Support

For issues and questions, please [open an issue](your-repo-url/issues).
