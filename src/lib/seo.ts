// SEO Configuration Constants
// Best practices: Centralized SEO config for maintainability and consistency
export const SEO_CONFIG = {
  siteName: 'NikahPrep',
  siteUrl: import.meta.env.VITE_SITE_URL || 'https://nikahprep.com',
  defaultTitle: 'NikahPrep - Islamic Marriage Preparation',
  defaultDescription:
    'Comprehensive Islamic marriage preparation platform for engaged Muslim couples. Checklists, financial planning, learning modules, and discussion guides.',
  twitterHandle: '@nikahprep',
  locale: 'en_US',
} as const

// Page-specific SEO data
export const PAGE_SEO = {
  // Public pages
  home: {
    title: 'NikahPrep - Islamic Marriage Preparation',
    description:
      'Comprehensive Islamic marriage preparation platform for engaged Muslim couples. Checklists, financial planning, learning modules, and discussion guides.',
  },
  login: {
    title: 'Sign In',
    description:
      'Sign in to your NikahPrep account to continue your Islamic marriage preparation journey.',
  },
  signup: {
    title: 'Create Account',
    description:
      'Join NikahPrep to access Islamic marriage preparation tools, checklists, and resources for engaged couples.',
  },
  profileSetup: {
    title: 'Complete Your Profile',
    description: 'Set up your NikahPrep profile to personalize your marriage preparation journey.',
  },
  notFound: {
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist.',
  },

  // Dashboard pages (noindex)
  dashboard: {
    title: 'Dashboard',
    description: 'Your personalized Islamic marriage preparation dashboard.',
  },
  checklist: {
    title: 'Marriage Readiness Checklist',
    description: 'Track your marriage preparation progress.',
  },
  financial: {
    title: 'Financial Planning',
    description: 'Budget calculator and financial planning tools.',
  },
  modules: {
    title: 'Learning Modules',
    description: 'Islamic marriage education modules.',
  },
  moduleDetail: {
    title: 'Module',
    description: 'Learn about Islamic marriage preparation.',
  },
  discussions: {
    title: 'Discussion Prompts',
    description: 'Conversation starters for pre-marriage topics.',
  },
  resources: {
    title: 'Resources Library',
    description: 'Curated Islamic resources for marriage preparation.',
  },
  profile: {
    title: 'Profile Settings',
    description: 'Manage your account settings.',
  },
} as const

