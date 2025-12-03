import { Link } from 'react-router-dom'
import { useState, useEffect, useMemo, memo } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
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
import { useTheme } from '../../contexts/ThemeContext'

// Background image URLs
const LIGHT_BG_IMAGE_URL = '/images/background.jpeg'
const DARK_BG_IMAGE_URL = '/images/background2.jpeg'

// Style constants to prevent object recreation
const BACKGROUND_STYLE = {
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  minHeight: '100vh',
} as const

const FEATURE_CARD_SHADOW = "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)"


/**
 * Public Landing Page
 * Only shown to unauthenticated users (wrapped in PublicRoute)
 */
export function Home() {
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, shouldReduceMotion ? 1 : 0.95])
  const { theme } = useTheme()

  // State management for background image
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Theme detection
  const isLightTheme = theme === 'light'

  // Choose image based on theme
  useEffect(() => {
    const url = isLightTheme ? LIGHT_BG_IMAGE_URL : DARK_BG_IMAGE_URL
    setBackgroundImageUrl(url)
    setImageLoaded(false)
    setImageError(false)
  }, [isLightTheme])

  // Image preloading and error handling with proper cleanup
  useEffect(() => {
    if (!backgroundImageUrl || typeof document === 'undefined') return

    const img = new Image()
    let isMounted = true

    const handleLoad = () => {
      if (isMounted) {
        setImageLoaded(true)
        setImageError(false)
      }
    }

    const handleError = () => {
      if (isMounted) {
        setImageError(true)
        setImageLoaded(false)
      }
    }

    img.onload = handleLoad
    img.onerror = handleError
    img.src = backgroundImageUrl

    return () => {
      isMounted = false
      // Clean up event listeners
      img.onload = null
      img.onerror = null
    }
  }, [backgroundImageUrl])


  // Memoize background style to prevent object recreation
  const backgroundImageStyle = useMemo(() => ({
    ...BACKGROUND_STYLE,
    backgroundSize: 'cover' as const,
    backgroundPosition: 'center center' as const,
    backgroundRepeat: 'no-repeat' as const,
    backgroundAttachment: 'fixed' as const,
    willChange: 'auto' as const,
  }), [])

  // Memoize animation variants to prevent recreation on every render
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
            duration: 0.6,
            ease: [0.6, -0.05, 0.01, 0.99] as const,
          },
        },
      },
      fadeIn: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: 0.5,
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
            duration: 0.6,
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
            duration: 0.6,
            ease: [0.6, -0.05, 0.01, 0.99] as const,
          },
        },
      },
    }
  }, [shouldReduceMotion])

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

      <main className="min-h-screen relative overflow-hidden">
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
        {(!backgroundImageUrl || imageError || !imageLoaded) && (
          <div 
            className="fixed -z-10 bg-gradient-to-br from-primary/5 via-background via-60% to-islamic-purple/5"
            style={BACKGROUND_STYLE}
          />
        )}

        {/* Overlay for better text readability */}
        <div 
          className="fixed -z-[9] bg-gradient-to-br from-primary/5 via-background/40 via-60% to-islamic-purple/5"
          style={BACKGROUND_STYLE}
        />

        {/* Header */}
        <motion.header 
          className="sticky top-0 z-[100] border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-inset-top"
          style={{ opacity: headerOpacity }}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div 
            className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6 gap-2"
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
              <div className="flex items-center">
                <Link to="/" className="flex items-center hover:opacity-80 transition-opacity touch-target-sm">
                  <motion.img
                    src="/logo.svg"
                    alt="NikahPrep Logo - Crescent Moon and Heart"
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0"
                    width={40}
                    height={40}
                    loading="eager"
                    decoding="async"
                    style={{ imageRendering: 'auto' }}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                </Link>
                
                {/* Theme Toggle - pulled close to logo using negative margin */}
                <div className="flex items-center -ml-1 sm:-ml-1.5">
                  <ThemeToggle variant="icon" size="sm" iconColor="white" />
                </div>
              </div>

              <span className="text-lg sm:text-xl font-bold text-foreground">NikahPrep</span>
            </motion.div>
            <motion.div 
              className="flex gap-1.5 sm:gap-2"
              variants={variants.slideInRight}
            >
                <Button variant="ghost" asChild className="min-h-[40px] sm:min-h-[44px] px-2 sm:px-4 text-sm">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button variant="warm" asChild className="min-h-[40px] sm:min-h-[44px] px-3 sm:px-4 text-sm">
                  <Link to="/signup">Get Started</Link>
                </Button>
            </motion.div>
          </motion.div>
        </motion.header>

        {/* Hero Section */}
        <section className="container py-10 sm:py-16 md:py-24 px-4 sm:px-6 relative z-10">
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
              {shouldReduceMotion ? (
                <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground" />
              ) : (
              <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
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
                  scale: 1.05,
                  y: -2,
                  transition: { 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 17 
                  } 
                }}
                whileTap={shouldReduceMotion ? {} : { 
                  scale: 0.95,
                  y: 0,
                  transition: { 
                    duration: 0.1 
                  } 
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
              className="absolute inset-0 bg-gradient-to-br from-primary/20 via-islamic-gold/15 to-islamic-purple/20 dark:from-primary/25 dark:via-islamic-gold/20 dark:to-islamic-purple/25"
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
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    y: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                    rotate: {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
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
                <motion.div
                  animate={{
                    y: [0, 10, 0],
                    rotate: [0, -5, 5, 0],
                  }}
                  transition={{
                    y: {
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    },
                    rotate: {
                      duration: 4.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
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

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  color?: 'primary' | 'islamic-gold' | 'islamic-green' | 'islamic-purple' // Optional, not currently used
}

const FeatureCard = memo(function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
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
