import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { useProfile } from '../../hooks/useProfile'

const quickLinks = [
  {
    href: '/dashboard/checklist',
    title: 'Readiness Checklist',
    desc: 'Track your preparation progress',
  },
  {
    href: '/dashboard/financial',
    title: 'Financial Planning',
    desc: 'Budget and financial tools',
  },
  {
    href: '/dashboard/modules',
    title: 'Learning Modules',
    desc: 'Islamic marriage education',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99] as const,
    },
  },
}

export function AuthenticatedHome() {
  const { data: profile } = useProfile()

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/10 via-islamic-gold/5 to-islamic-purple/10 p-6 sm:p-8 border border-primary/10"
      >
        {/* Left Content */}
        <div className="relative z-10 max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="text-2xl sm:text-3xl font-bold mb-2 text-foreground"
          >
            Welcome back, {profile?.first_name || 'there'}!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="text-muted-foreground mb-4 text-sm sm:text-base"
          >
            Continue your marriage preparation journey
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          >
            <Link to="/dashboard">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="warm"
                  className="mt-4 min-h-[44px] px-6"
                >
                  Go to Dashboard
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 2,
                      ease: 'easeInOut',
                    }}
                    className="ml-2 inline-block"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Decorative Sparkles Icon */}
        <motion.div
          className="absolute right-4 sm:right-6 top-4 sm:top-6 z-0"
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 0.3, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-brand" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Quick Links Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {quickLinks.map((link, index) => (
          <motion.div
            key={link.href}
            variants={itemVariants}
            transition={{ delay: 0.8 + index * 0.1 }}
          >
            <Link
              to={link.href}
              className="block h-full"
            >
              <Card
                className="h-full p-4 sm:p-5 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer group"
                padding="none"
              >
                <CardContent className="p-0">
                  <h3 className="font-semibold mb-1 text-sm sm:text-base text-foreground group-hover:text-foreground transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-muted-foreground group-hover:text-muted-foreground transition-colors">
                    {link.desc}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

