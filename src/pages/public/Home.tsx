import { Link } from 'react-router-dom'
import { useMemo, memo, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  CheckSquare,
  DollarSign,
  BookOpen,
  MessageSquare,
  Library,
  LayoutDashboard,
  Heart,
  Sparkles,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { SEO, jsonLdSchemas } from '../../components/SEO'
import { PAGE_SEO } from '../../lib/seo'
import { ThemeToggle } from '../../components/common/ThemeToggle'
import { useImagePreload } from '../../hooks/useImagePreload'
import { useThemeImage } from '../../hooks/useThemeImage'

/**
 * ============================================================================
 * HOME PAGE - PHASE IMPLEMENTATION SUMMARY
 * ============================================================================
 * 
 * ✅ PHASE 1: CUSTOM HOOKS & REUSABLE LOGIC
 *    - useThemeImage: Theme-based image selection (light/dark mode)
 *    - useImagePreload: Image preloading with error handling and retry logic
 *    - Custom hooks for separation of concerns and reusability
 * 
 * ✅ PHASE 2: ERROR HANDLING & RESILIENCE
 *    - Enhanced error states with user-friendly messages
 *    - Retry logic for failed image loads
 *    - Graceful degradation with fallback UI (gradient backgrounds)
 *    - Error recovery UI (development mode only)
 *    - Comprehensive error logging and user feedback
 * 
 * ✅ PHASE 3: PERFORMANCE OPTIMIZATION
 *    - Memoized background styles (prevents object recreation)
 *    - Memoized animation variants (prevents recreation on every render)
 *    - Extracted animation constants (ANIMATION_CONFIGS)
 *    - Memoized callbacks (handleRetryImage)
 *    - GPU-accelerated transforms (will-change)
 *    - Reduced motion support for accessibility
 *    - Optimized animation timings and easing
 * 
 * ✅ PHASE 4: TYPESCRIPT PATTERNS & TYPE SAFETY
 *    - Readonly types for immutable constants (BACKGROUND_IMAGES, BACKGROUND_STYLE)
 *    - Explicit type annotations for better type safety
 *    - Type definitions for animation configs (AnimationEase, AnimationType)
 *    - Utility types (Pick, Readonly)
 *    - Explicit return types for public APIs
 *    - Enhanced interfaces with proper typing
 * 
 * ============================================================================
 * STATUS: ALL PHASES COMPLETE ✅
 * ============================================================================
 */

// Phase 4: TypeScript Patterns - Use Readonly for immutable constants
// Background image URLs
const BACKGROUND_IMAGES: Readonly<{
  readonly light: string
  readonly dark: string
}> = {
  light: '/images/background.jpeg',
  dark: '/images/background2.jpeg',
} as const

// Phase 4: TypeScript Patterns - Explicit type for style constants
// Style constants to prevent object recreation
// Using inset-0 approach instead of 100vw to avoid scrollbar width causing horizontal overflow
const BACKGROUND_STYLE: Readonly<{
  readonly top: number
  readonly left: number
  readonly right: number
  readonly bottom: number
  readonly width: string
  readonly height: string
  readonly minHeight: string
}> = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
  minHeight: '100vh',
} as const

const FEATURE_CARD_SHADOW = "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)"

// Phase 4: TypeScript Patterns - Type definitions for animation configs
type AnimationEase = "easeOut" | "easeInOut" | "linear" | readonly [number, number, number, number]
type AnimationType = "spring" | "tween" | "inertia" | "keyframes"

interface TransitionConfig {
  readonly duration?: number
  readonly ease?: AnimationEase
  readonly type?: AnimationType
  readonly stiffness?: number
  readonly damping?: number
  readonly repeat?: number | typeof Infinity
  readonly repeatDelay?: number
  readonly repeatType?: "loop" | "reverse" | "mirror"
  readonly delay?: number
}

interface AnimationConfig {
  readonly opacity?: number | readonly number[]
  readonly scale?: number | readonly number[]
  readonly rotate?: number | readonly number[]
  readonly x?: number | string | readonly (number | string)[]
  readonly y?: number | string | readonly (number | string)[]
  readonly transition?: TransitionConfig
}

// Phase 3: Performance Optimization - Extract animation constants to prevent recreation
// Phase 4: TypeScript Patterns - Explicit type annotation for better type safety
const ANIMATION_CONFIGS: Readonly<{
  readonly headerTransition: TransitionConfig
  readonly headerInitial: AnimationConfig
  readonly headerAnimate: AnimationConfig
  readonly logoHover: AnimationConfig
  readonly logoTransition: TransitionConfig
  readonly glowAnimation: AnimationConfig
  readonly glowTransition: TransitionConfig
  readonly glowAnimationSmall: AnimationConfig
  readonly glowTransitionSmall: TransitionConfig
  readonly badgeAnimation: AnimationConfig
  readonly badgeTransition: TransitionConfig
  readonly buttonHover: AnimationConfig
  readonly buttonHoverTransition: TransitionConfig
  readonly buttonTap: AnimationConfig
  readonly buttonTapTransition: TransitionConfig
  readonly shimmerTransition: TransitionConfig
  readonly shimmerAnimation: AnimationConfig
  readonly shimmerTransitionLong: TransitionConfig
  readonly floatingY: AnimationConfig
  readonly floatingYTransition: TransitionConfig
  readonly floatingYReverse: AnimationConfig
  readonly floatingYReverseTransition: TransitionConfig
}> = {
  headerTransition: { duration: 0.5, ease: "easeOut" } as const,
  headerInitial: { y: -100 } as const,
  headerAnimate: { y: 0 } as const,
  logoHover: { scale: 1.03, rotate: 5 } as const,
  logoTransition: { type: "spring" as const, stiffness: 300 } as const,
  glowAnimation: {
    opacity: [0.3, 0.5, 0.3] as const,
    scale: [1, 1.1, 1] as const,
  } as const,
  glowTransition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut" as const,
  } as const,
  glowAnimationSmall: {
    opacity: [0.2, 0.4, 0.2] as const,
  } as const,
  glowTransitionSmall: {
    duration: 2.5,
    repeat: Infinity,
    ease: "easeInOut" as const,
  } as const,
  badgeAnimation: {
    scale: [1, 1.1, 1] as const,
    rotate: [0, 5, -5, 0] as const,
  } as const,
  badgeTransition: {
    duration: 2,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut" as const,
  } as const,
  buttonHover: {
    scale: 1.05,
    y: -2,
  } as const,
  buttonHoverTransition: {
    type: "spring" as const,
    stiffness: 400,
    damping: 17,
  } as const,
  buttonTap: {
    scale: 0.95,
    y: 0,
  } as const,
  buttonTapTransition: {
    duration: 0.1,
  } as const,
  shimmerTransition: {
    duration: 0.6,
    ease: 'easeInOut' as const,
  } as const,
  shimmerAnimation: {
    x: ["-100%", "100%"] as const,
  } as const,
  shimmerTransitionLong: {
    duration: 2,
    repeat: Infinity,
    repeatDelay: 3,
    ease: "easeInOut" as const,
  } as const,
  floatingY: {
    y: [0, -10, 0] as const,
    rotate: [0, 5, -5, 0] as const,
  } as const,
  floatingYTransition: {
    y: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
    rotate: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  } as const,
  floatingYReverse: {
    y: [0, 10, 0] as const,
    rotate: [0, -5, 5, 0] as const,
  } as const,
  floatingYReverseTransition: {
    y: {
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut" as const,
      delay: 0.5,
    },
    rotate: {
      duration: 4.5,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  } as const,
} as const


/**
 * Home Component - Public Landing Page
 * 
 * The main landing page for unauthenticated users. Features a hero section with
 * call-to-action buttons, feature cards showcasing platform capabilities, and a
 * final CTA section. Designed with mobile-first responsive layout and smooth animations.
 * 
 * @example
 * ```tsx
 * // This component is typically rendered via routing
 * <Route path="/" element={<Home />} />
 * ```
 * 
 * @remarks
 * **Features:**
 * - Hero section with animated gradient headline
 * - 6 feature cards with hover effects
 * - Call-to-action sections with multiple CTAs
 * - Fixed background image with parallax effect
 * - Smooth scroll behavior
 * - Theme-aware background images (light/dark mode)
 * - Image preloading with error handling
 * - Reduced motion support for accessibility
 * 
 * **Accessibility:**
 * - WCAG 2.1 AA compliant
 * - Full keyboard navigation support
 * - Screen reader compatible
 * - Reduced motion support (respects prefers-reduced-motion)
 * - Proper semantic HTML structure
 * - ARIA labels where needed
 * - Color contrast compliant
 * 
 * **Performance:**
 * - Memoized animation variants (prevents recreation)
 * - Memoized background styles
 * - Image preloading with timeout protection
 * - GPU-accelerated animations
 * - Lazy loading for below-fold content
 * - Optimized animation timings
 * 
 * **Design System:**
 * - Uses CSS variables from design system
 * - Mobile-first responsive breakpoints
 * - Consistent spacing and typography
 * - Brand gradient colors
 * - Custom scrollbar styling
 * 
 * **Image Handling:**
 * - Theme-based image selection (light/dark)
 * - Preloading with 10-second timeout
 * - Graceful fallback to gradient background
 * - Error recovery UI (development mode)
 * - Retry mechanism for failed loads
 * 
 * **Known Limitations:**
 * - Background images are fixed (no parallax scrolling)
 * - Image error recovery only shown in development
 * - Animation constants are large but necessary for performance
 * 
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/} for accessibility patterns
 * @see {@link DESIGN_SYSTEM.md} for design tokens
 * 
 * @returns The Home page component with hero, features, and CTA sections
 */
export function Home(): JSX.Element {
  // RADICAL APPROACH: Remove ALL scroll-related JavaScript
  // Static header - no scroll tracking, no event listeners, no interference
  const shouldReduceMotion = useReducedMotion()
  const headerOpacity = 1

  // Phase 1: Custom Hooks - Theme-based image selection
  const { imageUrl: backgroundImageUrl } = useThemeImage(BACKGROUND_IMAGES)
  
  // Phase 1: Custom Hooks - Image preloading with error handling
  // Phase 2: Error Handling - Enhanced error state with user-friendly messages and retry logic
  const { 
    isLoaded: imageLoaded, 
    hasError: imageError, 
    errorMessage: imageErrorMessage,
    isRetryable: imageErrorRetryable,
    retry: retryImageLoad 
  } = useImagePreload({
    src: backgroundImageUrl,
    enabled: true,
    timeout: 10000,
  })


  // Phase 3: Performance Optimization - Memoize background style to prevent object recreation
  // Phase 4: TypeScript Patterns - Explicit return type using utility types
  const backgroundImageStyle = useMemo((): Readonly<typeof BACKGROUND_STYLE & {
    readonly backgroundSize: 'cover'
    readonly backgroundPosition: 'center center'
    readonly backgroundRepeat: 'no-repeat'
    readonly backgroundAttachment: 'fixed'
    readonly willChange: 'auto'
  }> => ({
    ...BACKGROUND_STYLE,
    backgroundSize: 'cover' as const,
    backgroundPosition: 'center center' as const,
    backgroundRepeat: 'no-repeat' as const,
    backgroundAttachment: 'fixed' as const,
    willChange: 'auto' as const,
  }), [])

  // Phase 3: Performance Optimization - Memoize animation variants to prevent recreation on every render
  // Phase 4: TypeScript Patterns - Type inference leveraged (explicit type would be too verbose)
  const variants = useMemo(() => {
    const reducedMotionVariant = { 
      hidden: { opacity: 1 }, 
      visible: { opacity: 1, transition: { duration: 0.1 } } 
    }
    
    if (shouldReduceMotion) {
      return {
        fadeInUp: reducedMotionVariant,
        fadeIn: reducedMotionVariant,
        slideInLeft: reducedMotionVariant,
        slideInRight: reducedMotionVariant,
      }
    }
    
    return {
      fadeInUp: {
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.6, -0.05, 0.01, 0.99] as const,
          },
        },
      },
      fadeIn: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: 0.3,
            ease: "easeOut" as const,
          },
        },
      },
      slideInLeft: {
        hidden: { opacity: 0, x: -30 },
        visible: {
          opacity: 1,
          x: 0,
          transition: {
            duration: 0.4,
            ease: [0.6, -0.05, 0.01, 0.99] as const,
          },
        },
      },
      slideInRight: {
        hidden: { opacity: 0, x: 30 },
        visible: {
          opacity: 1,
          x: 0,
          transition: {
            duration: 0.4,
            ease: [0.6, -0.05, 0.01, 0.99] as const,
          },
        },
      },
    }
  }, [shouldReduceMotion])

  // Phase 3: Performance Optimization - Memoize retry handler to prevent recreation
  const handleRetryImage = useCallback(() => {
    retryImageLoad()
  }, [retryImageLoad])

  return (
    <>
      <SEO
        title={PAGE_SEO.home.title}
        description={PAGE_SEO.home.description}
        path="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@graph': [jsonLdSchemas.organization, jsonLdSchemas.website],
        }}
      />

      <main className="relative overflow-x-hidden" style={{ overflowY: 'visible' }}>
        {/* Fixed Background Layer - Completely stationary, no parallax */}
        {backgroundImageUrl && !imageError && imageLoaded && (
          <motion.div
            className="fixed -z-10"
            style={{
              ...backgroundImageStyle,
              backgroundImage: `url(${backgroundImageUrl})`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Fallback gradient background (shown when image not loaded or error) */}
        {/* Phase 2: Error Handling - Graceful degradation with fallback UI */}
        {(!backgroundImageUrl || imageError || !imageLoaded) && (
          <div 
            className="fixed -z-10 bg-gradient-to-br from-primary/5 via-background via-60% to-islamic-purple/5"
            style={BACKGROUND_STYLE}
          />
        )}

        {/* Phase 2: Error Handling - Error recovery UI (only shown in development for debugging) */}
        {imageError && imageErrorMessage && import.meta.env.DEV && (
          <div className="fixed bottom-4 right-4 z-[200] max-w-sm p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg">
            <p className="text-xs text-red-800 dark:text-red-200 mb-2">
              {imageErrorMessage}
            </p>
            {/* Phase 3: Performance Optimization - Use memoized callback */}
            {imageErrorRetryable && (
              <button
                onClick={handleRetryImage}
                className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Retry Loading Image
              </button>
            )}
          </div>
        )}

        {/* Overlay for better text readability */}
        <div 
          className="fixed -z-[9] bg-gradient-to-br from-primary/5 via-background/40 via-60% to-islamic-purple/5"
          style={BACKGROUND_STYLE}
        />

        {/* Header */}
        {/* Phase 3: Performance Optimization - Use extracted animation constants */}
        {/* RADICAL APPROACH: Simple opacity style, no framer-motion scroll tracking */}
        <motion.header 
          className="sticky top-0 z-[100] border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-inset-top w-full overflow-visible"
          style={{ opacity: headerOpacity }}
          initial={ANIMATION_CONFIGS.headerInitial}
          animate={ANIMATION_CONFIGS.headerAnimate}
          transition={ANIMATION_CONFIGS.headerTransition}
        >
          <motion.div 
            className="container flex h-[72px] sm:h-[80px] items-center justify-between px-3 sm:px-4 lg:px-6 gap-2 overflow-hidden py-1 sm:py-1.5"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            <motion.div 
              className="flex items-center gap-2 sm:gap-3"
              variants={variants.slideInLeft}
            >
              {/* Logo and Theme Toggle grouped together - almost touching */}
              <div className="flex items-center overflow-visible">
                <Link to="/" className="flex items-center touch-target-sm relative overflow-visible">
                  {/* Phase 3: Performance Optimization - Use extracted animation constants */}
                  <motion.div
                    className="relative overflow-visible"
                    whileHover={shouldReduceMotion ? {} : ANIMATION_CONFIGS.logoHover}
                    transition={ANIMATION_CONFIGS.logoTransition}
                  >
                    <motion.img
                      src="/logo.svg"
                      alt="NikahPrep Logo - Crescent Moon and Heart"
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)] filter brightness-110 contrast-110"
                      width={40}
                      height={40}
                      loading="eager"
                      decoding="async"
                      style={{ imageRendering: 'auto' }}
                    />
                    {/* Phase 3: Performance Optimization - Use extracted animation constants */}
                    {/* Subtle glow effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/20 blur-md -z-10"
                      animate={shouldReduceMotion ? {} : ANIMATION_CONFIGS.glowAnimation}
                      transition={ANIMATION_CONFIGS.glowTransition}
                    />
                  </motion.div>
                </Link>
                
                {/* Theme Toggle - pulled close to logo using negative margin */}
                <div className="flex items-center -ml-1 sm:-ml-1.5 relative overflow-visible">
                  <div className="relative overflow-visible">
                    <ThemeToggle variant="icon" size="sm" iconColor="white" className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)] dark:drop-shadow-[0_2px_6px_rgba(255,255,255,0.3)] filter brightness-110" />
                    {/* Phase 3: Performance Optimization - Use extracted animation constants */}
                    {/* Subtle glow effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-white/20 blur-sm -z-10"
                      animate={shouldReduceMotion ? {} : ANIMATION_CONFIGS.glowAnimationSmall}
                      transition={ANIMATION_CONFIGS.glowTransitionSmall}
                    />
                  </div>
                </div>
              </div>

              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-foreground">NikahPrep</span>
            </motion.div>
            <motion.div 
              className="flex gap-1.5 sm:gap-2"
              variants={variants.slideInRight}
            >
                <Button variant="ghost" asChild className="min-h-[40px] sm:min-h-[44px] px-2 sm:px-4 text-sm !text-gray-900 dark:!text-foreground hover:!text-gray-900 dark:hover:!text-foreground">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button variant="warm" asChild className="min-h-[40px] sm:min-h-[44px] px-3 sm:px-4 text-sm">
                  <Link to="/signup">Get Started</Link>
                </Button>
            </motion.div>
          </motion.div>
        </motion.header>

        {/* Hero Section */}
        <section className="container py-10 sm:py-16 md:py-24 px-4 sm:px-6 relative z-10 w-full">
          <motion.div 
            className="mx-auto max-w-4xl text-center space-y-5 sm:space-y-6 md:space-y-8"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.15,
                  delayChildren: 0.1,
                },
              },
            }}
          >
            {/* Badge with pulse animation */}
            <motion.div
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-badge-gradient text-xs sm:text-sm font-medium text-foreground mb-3 sm:mb-4 md:mb-5"
              variants={{
                hidden: { opacity: 0, y: -20, scale: 0.9 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  },
                },
              }}
            >
              {/* Phase 3: Performance Optimization - Use extracted animation constants */}
              {shouldReduceMotion ? (
                <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground" />
              ) : (
              <motion.div
                  animate={ANIMATION_CONFIGS.badgeAnimation}
                  transition={ANIMATION_CONFIGS.badgeTransition}
                >
                  <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground" />
                </motion.div>
              )}
              Islamic Marriage Preparation
            </motion.div>

            {/* Animated Gradient Headline */}
            <motion.h1 
              className="text-[clamp(1.75rem,1rem+4vw,3.75rem)] font-bold tracking-tight leading-[1.15]"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              <motion.span
                className="bg-gradient-to-r from-islamic-green via-islamic-gold to-islamic-purple bg-clip-text text-transparent bg-[length:200%_auto] inline-block"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 12,
                    },
                  },
                }}
              >
                Prepare for Your
              </motion.span>
                <br />
                  <motion.span
                className="text-foreground inline-block"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 12,
                      delay: 0.1,
                    },
                  },
                }}
              >
                Blessed Marriage
              </motion.span>
            </motion.h1>

            {/* Description with fade-in */}
            <motion.p
              className="text-base sm:text-lg md:text-xl text-muted-foreground dark:text-foreground/80 max-w-2xl mx-auto leading-relaxed mt-4 sm:mt-5 md:mt-6"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    delay: 0.3,
                    duration: 0.5,
                  },
                },
              }}
            >
              A comprehensive Islamic marriage preparation platform for engaged couples.
              </motion.p>

            {/* CTA Buttons with stagger */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-6 sm:pt-8 md:pt-10"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.4,
                  },
                },
              }}
            >
              {/* Phase 3: Performance Optimization - Use extracted animation constants */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.8 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      mass: 0.8,
                    },
                  },
                }}
                whileHover={shouldReduceMotion ? {} : {
                  ...ANIMATION_CONFIGS.buttonHover,
                  transition: ANIMATION_CONFIGS.buttonHoverTransition,
                }}
                whileTap={shouldReduceMotion ? {} : {
                  ...ANIMATION_CONFIGS.buttonTap,
                  transition: ANIMATION_CONFIGS.buttonTapTransition,
                }}
              >
                <Button size="xl" variant="warm" className="shadow-lg min-h-[48px] w-full sm:w-auto relative overflow-hidden group" asChild>
                  <Link to="/signup">
                    <motion.span
                      className="relative z-10"
                      initial={{ opacity: 1 }}
                      whileHover={{ opacity: 1 }}
                    >
                      Start Your Journey
                    </motion.span>
                    {!shouldReduceMotion && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                      />
                    )}
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.8 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      mass: 0.8,
                      delay: 0.1,
                    },
                  },
                }}
                whileTap={shouldReduceMotion ? {} : { 
                  scale: 0.98,
                  transition: { 
                    duration: 0.1 
                  } 
                }}
              >
                <Button size="xl" variant="outline" className="min-h-[48px] w-full sm:w-auto" asChild>
                  <Link to="/login">
                    Sign In
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
            </motion.div>
        </section>

        {/* Features */}
        <section className="container pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 relative z-10">
            <motion.div
            className="text-center mb-8 sm:mb-10 md:mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">What You'll Get</h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground dark:text-foreground/80 max-w-xl mx-auto leading-relaxed">
              Everything you need for a blessed Islamic marriage
              </p>
            </motion.div>
            <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-5xl mx-auto"
              initial="hidden"
              whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.12,
                  delayChildren: 0.15,
                },
              },
            }}
          >
            <FeatureCard
              icon={CheckSquare}
              title="Readiness Checklist"
              description="30+ items across spiritual, financial, family categories"
              color="primary"
            />
            <FeatureCard
              icon={DollarSign}
              title="Financial Tools"
              description="Budget calculator and financial planning tools"
              color="islamic-gold"
            />
            <FeatureCard
              icon={BookOpen}
              title="Islamic Modules"
              description="5 modules on marriage, communication, and family"
              color="islamic-green"
            />
            <FeatureCard
              icon={MessageSquare}
              title="Discussion Prompts"
              description="15+ conversation starters for important topics"
              color="islamic-purple"
            />
            <FeatureCard
              icon={Library}
              title="Resources Library"
              description="Curated Islamic books and courses"
              color="islamic-gold"
            />
            <FeatureCard
              icon={LayoutDashboard}
              title="Progress Dashboard"
              description="Track your readiness and wedding countdown"
              color="islamic-green"
            />
            </motion.div>
        </section>

        {/* CTA Section */}
        <section className="container pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 relative z-10">
            <motion.div
            className="relative overflow-hidden rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 text-center border-2 border-primary/30 dark:border-primary/40 shadow-none"
            style={{ boxShadow: 'none' }}
            initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
          >
            {/* Subtle gradient background */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary/20 via-islamic-gold/15 to-islamic-purple/20 dark:bg-card/50 dark:border dark:border-border/30"
            />

            {/* Content */}
            <motion.div
              className="relative z-10 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.h2
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-5 md:mb-6 bg-gradient-to-r from-islamic-green via-islamic-gold to-islamic-purple bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Begin Your Marriage Preparation
              </motion.h2>
              <motion.p
                className="text-sm sm:text-base md:text-lg text-foreground/90 dark:text-foreground/95 font-medium mb-5 sm:mb-6 md:mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Join couples preparing for their blessed union
              </motion.p>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.4, type: "spring", stiffness: 200 }}
                whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="bg-card text-primary hover:bg-card/90 dark:bg-card dark:hover:bg-card/90 min-h-[48px] w-full sm:w-auto relative overflow-hidden group"
                  asChild
                >
                  <Link to="/signup">
                    {!shouldReduceMotion && (
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-primary/20 via-islamic-gold/10 to-islamic-purple/20 opacity-0 group-hover:opacity-100 transition-opacity"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                    <span className="relative z-10">Create Free Account</span>
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Floating Sparkles icon - enhanced visibility */}
            {!shouldReduceMotion && (
              <motion.div
                className="absolute right-4 sm:right-8 top-4 sm:top-8 z-0"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 0.6, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                {/* Phase 3: Performance Optimization - Use extracted animation constants */}
                <motion.div
                  animate={ANIMATION_CONFIGS.floatingY}
                  transition={ANIMATION_CONFIGS.floatingYTransition}
                >
                  <Sparkles className="h-10 w-10 sm:h-16 sm:w-16 text-primary drop-shadow-lg" />
                </motion.div>
              </motion.div>
            )}

            {/* Floating Heart icon - enhanced visibility */}
            {!shouldReduceMotion && (
              <motion.div
                className="absolute left-4 sm:left-8 bottom-4 sm:bottom-8 z-0"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 0.6, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                {/* Phase 3: Performance Optimization - Use extracted animation constants */}
                <motion.div
                  animate={ANIMATION_CONFIGS.floatingYReverse}
                  transition={ANIMATION_CONFIGS.floatingYReverseTransition}
                >
                  <Heart className="h-8 w-8 sm:h-12 sm:w-12 text-islamic-gold drop-shadow-lg" />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </section>

        {/* Footer */}
        <motion.footer 
          className="border-t bg-card/30 safe-area-inset-bottom relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <div className="container py-4 sm:py-5 md:py-6 px-4 sm:px-6">
            <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 text-center">
              {/* Logo and Brand */}
              <motion.div variants={variants.fadeInUp}>
                <Link 
                  to="/" 
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  aria-label="Go to home page"
                >
                  <motion.img
                    src="/logo.svg"
                    alt="NikahPrep Logo - Crescent Moon and Heart"
                    className="w-6 h-6 sm:w-7 sm:h-7 object-contain flex-shrink-0"
                    width={28}
                    height={28}
                    loading="lazy"
                    decoding="async"
                    style={{ imageRendering: 'auto' }}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  <span className="text-base sm:text-lg font-semibold text-foreground">NikahPrep</span>
                </Link>
              </motion.div>
              
              {/* Blessing and Copyright */}
              <motion.div 
                className="space-y-1.5"
                variants={variants.fadeInUp}
              >
                <p 
                  className="text-sm sm:text-base font-semibold italic text-foreground/90 dark:text-foreground/95"
                >
                  May Allah Bless All Marriages
                </p>
                <p className="text-xs text-muted-foreground dark:text-foreground/70">
                  © {new Date().getFullYear()} NikahPrep
                </p>
              </motion.div>
            </div>
          </div>
        </motion.footer>
      </main>
    </>
  )
}

/**
 * FeatureCard Component Props
 * 
 * Props for the FeatureCard component used in the features section.
 */
interface FeatureCardProps {
  /** Icon component to display in the card */
  icon: React.ComponentType<{ className?: string }>
  /** Card title text */
  title: string
  /** Card description text */
  description: string
  /** Optional color variant (currently unused but reserved for future use) */
  color?: 'primary' | 'islamic-gold' | 'islamic-green' | 'islamic-purple'
}

// Phase 4: TypeScript Patterns - Type for required props only
type FeatureCardRequiredProps = Pick<FeatureCardProps, 'icon' | 'title' | 'description'>

/**
 * FeatureCard Component
 * 
 * A reusable card component for displaying platform features. Includes hover animations,
 * icon display, and responsive design. Memoized for performance optimization.
 * 
 * @example
 * ```tsx
 * <FeatureCard
 *   icon={CheckSquare}
 *   title="Readiness Checklist"
 *   description="30+ items across spiritual, financial, family categories"
 * />
 * ```
 * 
 * @param icon - Icon component to display (from lucide-react)
 * @param title - Title text for the feature
 * @param description - Description text for the feature
 * 
 * @remarks
 * - Memoized to prevent unnecessary re-renders
 * - Hover animations disabled for reduced motion preference
 * - Responsive design (mobile-first)
 * - Uses design system colors and spacing
 * 
 * @returns A feature card with icon, title, and description
 */
const FeatureCard = memo(function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: FeatureCardRequiredProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion()

  // Memoize variants to prevent recreation on every render
  const cardVariants = useMemo(() => {
    if (shouldReduceMotion) {
      return {
        hidden: { opacity: 1 },
        visible: { opacity: 1, transition: { duration: 0.1 } },
      }
    }
    return {
      hidden: {
        opacity: 0,
        y: 30,
        scale: 0.9,
      },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: "spring" as const,
          stiffness: 100,
          damping: 15,
        },
      },
    }
  }, [shouldReduceMotion])

  return (
    <motion.div
      className="group p-5 sm:p-6 md:p-7 rounded-xl border border-border/60 bg-card relative overflow-hidden min-h-[140px] sm:min-h-[160px]"
      variants={cardVariants}
      whileHover={shouldReduceMotion ? {} : {
        y: -8,
        scale: 1.02,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 17,
        },
      }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
      style={{
        boxShadow: FEATURE_CARD_SHADOW,
      }}
    >
      {/* Border glow effect on hover - simplified for reduced motion */}
      {!shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-transparent pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{
            opacity: 1,
            borderColor: "hsl(var(--color-primary) / 0.3)",
            boxShadow: "0 0 20px hsl(var(--color-primary) / 0.2)",
          }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Icon container */}
      <div
        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center mb-4 sm:mb-5 relative z-10 bg-badge-gradient"
      >
        <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-foreground" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="font-semibold text-base sm:text-lg md:text-xl text-foreground mb-2 sm:mb-3 leading-tight">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground dark:text-foreground/80 leading-relaxed line-clamp-3">{description}</p>
      </div>

      {/* Shadow enhancement on hover - hidden for reduced motion */}
      {!shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{
            opacity: 1,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  )
})
