import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SEO } from '../../components/SEO'
import {
  CheckCircle,
  BookOpen,
  MessageCircle,
  Library,
  Settings,
  Shield,
  BarChart3,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/utils'

const manageSections = [
  {
    path: '/manage/checklist',
    icon: CheckCircle,
    label: 'Checklist Items',
    description: 'Manage checklist categories and items',
    color: 'bg-gradient-to-br from-primary to-primary/80',
  },
  {
    path: '/manage/modules',
    icon: BookOpen,
    label: 'Learning Modules',
    description: 'Manage modules and lessons',
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
  },
  {
    path: '/manage/discussions',
    icon: MessageCircle,
    label: 'Discussion Prompts',
    description: 'Manage discussion topics',
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
  },
  {
    path: '/manage/resources',
    icon: Library,
    label: 'Resources',
    description: 'Manage resource library',
    color: 'bg-gradient-to-br from-secondary to-secondary/80',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function ManageDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['manage-stats'],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }

      try {
        const [
          checklistCategoriesResult,
          checklistItemsResult,
          modulesResult,
          lessonsResult,
          discussionPromptsResult,
          resourcesResult,
          usersResult,
        ] = await Promise.all([
          supabase.from('checklist_categories').select('*', { count: 'exact', head: true }),
          supabase.from('checklist_items').select('*', { count: 'exact', head: true }),
          supabase.from('modules').select('*', { count: 'exact', head: true }),
          supabase.from('lessons').select('*', { count: 'exact', head: true }),
          supabase.from('discussion_prompts').select('*', { count: 'exact', head: true }),
          supabase.from('resources').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
        ])

        return {
          checklistCategories: checklistCategoriesResult.count || 0,
          checklistItems: checklistItemsResult.count || 0,
          modules: modulesResult.count || 0,
          lessons: lessonsResult.count || 0,
          discussionPrompts: discussionPromptsResult.count || 0,
          resources: resourcesResult.count || 0,
          users: usersResult.count || 0,
        }
      } catch (error) {
        console.error('Error fetching management stats:', error)
        // Return default values on error
        return {
          checklistCategories: 0,
          checklistItems: 0,
          modules: 0,
          lessons: 0,
          discussionPrompts: 0,
          resources: 0,
          users: 0,
        }
      }
    },
    staleTime: 60000, // 1 minute
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // Use safe defaults while loading
  const displayStats = stats || {
    checklistCategories: 0,
    checklistItems: 0,
    modules: 0,
    lessons: 0,
    discussionPrompts: 0,
    resources: 0,
    users: 0,
  }

  return (
    <>
      <SEO
        title="Management Dashboard"
        description="Manage your NikahPrep content and settings"
        path="/manage"
        noIndex
      />

      <div className="min-h-screen w-full bg-gradient-to-br from-primary/5 via-background via-60% to-islamic-purple/5">
        <div className="w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
              <Shield className="h-4 w-4" />
              <span>Content Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Management Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage content and monitor application data
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Card>
              <div className="bg-gradient-to-r from-primary/10 via-islamic-gold/5 to-islamic-purple/10 p-6 border-b border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Content Overview</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Total content items in the system
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Users</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isLoading ? (
                        <span className="inline-block h-6 w-8 bg-muted rounded animate-pulse" />
                      ) : (
                        displayStats.users
                      )}
                    </p>
                  </div>
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Checklist Items</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isLoading ? (
                        <span className="inline-block h-6 w-8 bg-muted rounded animate-pulse" />
                      ) : (
                        displayStats.checklistItems
                      )}
                    </p>
                  </div>
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Lessons</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isLoading ? (
                        <span className="inline-block h-6 w-8 bg-muted rounded animate-pulse" />
                      ) : (
                        displayStats.lessons
                      )}
                    </p>
                  </div>
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Resources</p>
                    <p className="text-2xl font-bold text-foreground">
                      {isLoading ? (
                        <span className="inline-block h-6 w-8 bg-muted rounded animate-pulse" />
                      ) : (
                        displayStats.resources
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Categories</p>
                    <p className="text-xl font-semibold text-primary">
                      {isLoading ? (
                        <span className="inline-block h-5 w-6 bg-muted rounded animate-pulse" />
                      ) : (
                        displayStats.checklistCategories
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Modules</p>
                    <p className="text-xl font-semibold text-accent">
                      {isLoading ? (
                        <span className="inline-block h-5 w-6 bg-muted rounded animate-pulse" />
                      ) : (
                        displayStats.modules
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Prompts</p>
                    <p className="text-xl font-semibold text-islamic-purple">
                      {isLoading ? (
                        <span className="inline-block h-5 w-6 bg-muted rounded animate-pulse" />
                      ) : (
                        displayStats.discussionPrompts
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Management Sections */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid sm:grid-cols-2 gap-4 sm:gap-6"
          >
            {manageSections.map((section) => (
              <motion.div key={section.path} variants={itemVariants}>
                <Link to={section.path}>
                  <motion.div
                    whileHover={{
                      y: -8,
                      scale: 1.02,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      },
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="h-full group cursor-pointer relative overflow-hidden border-2 transition-all duration-300 hover:border-primary/20 hover:shadow-sm">
                      {/* Stripe-style gradient overlay on hover */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 z-0"
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      {/* Subtle shine effect on hover */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full z-0"
                        whileHover={{ x: "200%" }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      />
                      <CardHeader className="relative z-10">
                        <div className="flex items-center justify-between">
                          <div
                            className={`h-12 w-12 rounded-xl ${section.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                          >
                            <section.icon className={cn(
                              "h-6 w-6",
                              section.path === '/manage/resources'
                                ? "text-secondary-foreground"
                                : "text-primary-foreground"
                            )} />
                          </div>
                          <Settings className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <CardTitle className="mt-4 group-hover:text-primary transition-colors">{section.label}</CardTitle>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <p className="text-muted-foreground text-sm mb-4">
                          {section.description}
                        </p>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  )
}

