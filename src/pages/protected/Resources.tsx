import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { SEO } from '../../components/SEO'
import { PAGE_SEO } from '../../lib/seo'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Library,
  BookOpen,
  GraduationCap,
  Users,
  DollarSign,
  Heart,
  FileText,
  ExternalLink,
  Star,
  Search,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useDebounce } from '../../hooks/useDebounce'
import { useRealtimeFavorites } from '../../hooks/useRealtimeFavorites'
import { useScrollToSection } from '../../hooks/useScrollToSection'
import { logError, getUserFriendlyError } from '../../lib/error-handler'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { SkeletonGrid } from '../../components/common/Skeleton'
import { Popover } from '../../components/ui/Popover'
import { FilterPopover } from '../../components/resources/FilterPopover'
import { cn } from '../../lib/utils'
interface ResourceWithFavorites {
  id: string
  title: string
  description: string | null
  url: string
  category: 'Books' | 'Scholarly' | 'Counseling' | 'Finance' | 'Duas' | 'Courses'
  is_featured: boolean
  order_index: number | null
  created_at: string
  updated_at: string
  user_resource_favorites?: Array<{ id: string; user_id: string; resource_id: string }> | null
}

const categoryConfig: Record<string, { icon: typeof BookOpen; color: string; bgColor: string }> = {
  Books: { icon: BookOpen, color: 'text-primary', bgColor: 'bg-primary/10 dark:bg-primary/20' },
  Scholarly: { icon: GraduationCap, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  Counseling: { icon: Users, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  Finance: { icon: DollarSign, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  Duas: { icon: Heart, color: 'text-pink-600 dark:text-pink-400', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
  Courses: { icon: FileText, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
}

const categoryOrder = ['Books', 'Scholarly', 'Counseling', 'Finance', 'Duas', 'Courses']

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function Resources() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const filterButtonRef = useRef<HTMLButtonElement>(null)

  // Real-time updates for favorites
  useRealtimeFavorites()
  
  // Auto-scroll to section when hash is present in URL
  useScrollToSection()

  // Handle ?favorites=true query parameter
  useEffect(() => {
    const favoritesParam = searchParams.get('favorites')
    if (favoritesParam === 'true') {
      setShowSavedOnly(true)
    }
  }, [searchParams])

  const { data: resources, isLoading, refetch } = useQuery({
    queryKey: ['resources', user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      if (!supabase) {
        throw new Error('Supabase is not configured')
      }

      // Fetch all resources - Supabase default limit is 1000, but we'll be explicit
      // Use left join to get favorites, then filter by current user in mapping
      const { data, error, count } = await supabase
        .from('resources')
        .select(`
          *,
          user_resource_favorites (
            id,
            user_id,
            resource_id
          )
        `, { count: 'exact' })
        .order('order_index', { ascending: true, nullsFirst: false })
        .order('title', { ascending: true })
        .range(0, 999) // Explicit range to get all resources

      if (error) {
        console.error('❌ Resources fetch error:', error)
        logError(error, 'Resources.fetchResources')
        throw error
      }

      // Filter favorites to only include current user's favorites
      const mapped = (data as any[]).map(r => ({
        ...r,
        user_resource_favorites: Array.isArray(r.user_resource_favorites) 
          ? r.user_resource_favorites.filter((f: any) => f.user_id === user.id)
          : [],
      })) as ResourceWithFavorites[]

      // Debug logging
      console.log('📊 Resources fetched:', {
        count: count || data?.length || 0,
        dataLength: data?.length || 0,
        mappedLength: mapped.length,
        resources: mapped.map(r => ({ id: r.id, title: r.title, category: r.category }))
      })
      
      return mapped
    },
    enabled: !!user,
    staleTime: 0, // Always refetch
    gcTime: 300000, // 5 minutes cache
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ resourceId, isFavorite }: { resourceId: string; isFavorite: boolean }) => {
      if (!user) throw new Error('Not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      if (isFavorite) {
        // Remove favorite
        const { error } = await supabase
          .from('user_resource_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_id', resourceId)

        if (error) throw error
      } else {
        // Add favorite with conflict handling
        const { error } = await supabase
          .from('user_resource_favorites')
          .insert({
            user_id: user.id,
            resource_id: resourceId,
          } as any)
          .select()
          .single()

        // Handle unique constraint violation gracefully (duplicate favorite)
        if (error) {
          // If it's a duplicate (unique violation), that's okay - just ignore
          if (error.code === '23505') {
            console.log('Favorite already exists, ignoring duplicate')
            return
          }
          throw error
        }
      }
    },
    onMutate: async ({ resourceId, isFavorite }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['resources', user?.id] })
      await queryClient.cancelQueries({ queryKey: ['favorite-resources', user?.id] })

      // Snapshot previous value for rollback
      const previousResources = queryClient.getQueryData<ResourceWithFavorites[]>(['resources', user?.id])

      // Optimistically update the UI
      queryClient.setQueryData<ResourceWithFavorites[]>(['resources', user?.id], (old) => {
        if (!old) return old
        return old.map(resource => {
          if (resource.id === resourceId) {
            return {
              ...resource,
              user_resource_favorites: isFavorite 
                ? []  // Remove favorite (empty array)
                : [{ id: `temp-${Date.now()}`, user_id: user.id, resource_id: resourceId }]  // Add favorite (temporary ID)
            }
          }
          return resource
        })
      })

      return { previousResources }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousResources) {
        queryClient.setQueryData(['resources', user?.id], context.previousResources)
      }
      logError(error, 'Resources.toggleFavorite')
      toast.error(`❌ ${getUserFriendlyError(error)}`)
    },
    onSuccess: (_, { isFavorite }) => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['resources', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['favorite-resources', user?.id] })
      toast.success(isFavorite ? '⭐ Removed from favorites' : '⭐ Added to favorites')
    },
  })

  // Use safe defaults while loading
  const displayResources = resources || []
  
  // Debug logging
  console.log('🔍 Display resources:', {
    total: displayResources.length,
    byCategory: displayResources.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    resources: displayResources.map(r => ({ id: r.id, title: r.title, category: r.category }))
  })
  
  // Get unique categories in specified order
  const categories = categoryOrder.filter(cat => 
    displayResources.some((r) => r.category === cat)
  )

  // Filter resources (use debounced search)
  const filteredResources = displayResources.filter((resource) => {
    const matchesSearch = debouncedSearchQuery === '' ||
      resource.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())

    const matchesCategory = !selectedCategory || resource.category === selectedCategory

    const isFavorite = Array.isArray(resource.user_resource_favorites) && resource.user_resource_favorites.length > 0
    const matchesFavorite = !showSavedOnly || isFavorite

    const matches = matchesSearch && matchesCategory && matchesFavorite
    
    if (!matches) {
      console.log('🚫 Filtered out:', {
        title: resource.title,
        matchesSearch,
        matchesCategory,
        matchesFavorite,
        searchQuery: debouncedSearchQuery,
        selectedCategory,
        showSavedOnly
      })
    }

    return matches
  })

  console.log('🎯 Filtered resources:', {
    total: filteredResources.length,
    searchQuery: debouncedSearchQuery,
    selectedCategory,
    showSavedOnly,
    byCategory: filteredResources.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  })

  // Group resources by category
  const groupedResources = filteredResources.reduce((acc: Record<string, ResourceWithFavorites[]>, resource) => {
    const category = resource.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(resource)
    return acc
  }, {})

  // Sort resources within each category
  Object.keys(groupedResources).forEach(category => {
    groupedResources[category].sort((a, b) => {
      if (a.order_index !== null && b.order_index !== null) {
        return a.order_index - b.order_index
      }
      if (a.order_index !== null) return -1
      if (b.order_index !== null) return 1
      return a.title.localeCompare(b.title)
    })
  })

  // Count favorited resources
  const favoriteCount = displayResources.filter((r) => 
    Array.isArray(r.user_resource_favorites) && r.user_resource_favorites.length > 0
  ).length

  return (
    <>
      <SEO
        title={PAGE_SEO.resources.title}
        description={PAGE_SEO.resources.description}
        path="/resources"
        noIndex
      />

      <div className="min-h-screen w-full bg-gradient-to-br from-primary/5 via-background via-60% to-islamic-purple/5">
        <div className="w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 sm:mb-8"
            >
              <div className="flex items-center gap-2 text-primary text-sm sm:text-base font-medium mb-2 sm:mb-3">
                <Library className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Curated Knowledge</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
                Resources Library
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Curated Islamic resources: books, scholarly articles, counseling, finance, duas, and courses
              </p>
            </motion.div>
          </section>

          {/* Stats Bar */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 sm:mb-8"
            >
              <Card className="overflow-hidden" padding="none">
                <div className="bg-gradient-to-r from-primary/10 via-islamic-gold/5 to-islamic-purple/10 dark:from-primary/20 dark:via-islamic-gold/10 dark:to-islamic-purple/20 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-card dark:bg-card/50 shadow-sm flex items-center justify-center flex-shrink-0">
                        <Library className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">
                          {isLoading ? (
                            <span className="inline-block h-7 w-10 bg-muted rounded animate-pulse" />
                          ) : (
                            displayResources.length
                          )}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Total Resources</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </section>

          {/* Search and Filters */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4 sm:space-y-5 mb-6 sm:mb-8"
            >
              <div className="relative">
                <Input
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4 sm:h-5 sm:w-5" />}
                  rightIcon={
                    <button
                      ref={filterButtonRef}
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsFilterOpen(!isFilterOpen)
                      }}
                      className="relative flex items-center justify-center touch-manipulation"
                      aria-label="Open filters"
                      aria-expanded={isFilterOpen}
                      aria-haspopup="true"
                      type="button"
                    >
                      <SlidersHorizontal
                        className={cn(
                          'h-4 w-4 sm:h-5 sm:w-5 transition-colors',
                          showSavedOnly || selectedCategory !== null
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        )}
                      />
                      {/* Active filter indicator badge */}
                      {(showSavedOnly || selectedCategory !== null) && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary border-2 border-background" />
                      )}
                    </button>
                  }
                  className="pl-11 sm:pl-12 pr-11 sm:pr-12 w-full h-11 sm:h-12"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur()
                    }
                  }}
                />
              </div>

              {/* Filter Popover */}
              <Popover
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                triggerRef={filterButtonRef}
                align="right"
                side="bottom"
                maxWidth="md"
                showBackdrop={false}
              >
                <FilterPopover
                  showSavedOnly={showSavedOnly}
                  onShowSavedOnlyChange={setShowSavedOnly}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  categories={categories}
                  favoriteCount={favoriteCount}
                  onClose={() => setIsFilterOpen(false)}
                />
              </Popover>
            </motion.div>
          </section>

          {/* Resources by Category */}
          {isLoading && displayResources.length === 0 && user ? (
            <section>
              <SkeletonGrid count={6} />
            </section>
          ) : !user ? (
            <section>
              <Card>
                <CardContent className="py-16 sm:py-20 text-center">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4 sm:mb-5">
                    <Library className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg sm:text-xl mb-2 sm:mb-3">
                    Please log in to view resources
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    You need to be authenticated to access this page.
                  </p>
                </CardContent>
              </Card>
            </section>
          ) : (
            <section>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 sm:space-y-8 mt-6 sm:mt-8"
              >
                {categoryOrder.map((category) => {
                  const categoryResources = groupedResources[category] || []
                  if (categoryResources.length === 0) return null

                  const config = categoryConfig[category] || { icon: FileText, color: 'text-muted-foreground', bgColor: 'bg-muted' }
                  const CategoryIcon = config.icon

                  return (
                    <motion.div key={category} variants={itemVariants}>
                      {/* Category Header */}
                      <div className="mb-4 sm:mb-5">
                        <h2 className="text-lg sm:text-xl font-semibold text-foreground capitalize">
                          {category === 'Scholarly' ? 'Islamic Marriage Resources' :
                           category === 'Finance' ? 'Islamic Finance' :
                           category === 'Duas' ? 'Duas for Marriage' :
                           category === 'Courses' ? 'Pre-Marriage Courses' :
                           category === 'Books' ? 'Recommended Books' :
                           category}
                        </h2>
                      </div>

                      {/* Resources Grid */}
                      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                        {categoryResources.map((resource) => {
                          const isFavorite = Array.isArray(resource.user_resource_favorites) && resource.user_resource_favorites.length > 0

                          return (
                            <motion.div 
                              key={resource.id} 
                              variants={itemVariants}
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
                              <Card 
                                className={cn(
                                  "h-full group cursor-pointer relative border-2 transition-all duration-300 hover:border-primary/20 hover:shadow-sm overflow-hidden",
                                  isFavorite && "bg-primary/5 dark:bg-primary/10 border-primary/40",
                                  resource.is_featured && "border-secondary/40"
                                )}
                                padding="none"
                              >
                                {/* Stripe-style gradient overlay on hover */}
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 z-0 pointer-events-none"
                                  whileHover={{ opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                />
                                {/* Subtle shine effect on hover */}
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full z-0 pointer-events-none"
                                  whileHover={{ x: "200%" }}
                                  transition={{ duration: 0.6, ease: "easeInOut" }}
                                />
                                <CardContent className="p-5 sm:p-6 flex flex-col h-full relative z-10">
                                  <div className="flex items-start justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
                                    <div className={cn(
                                      'h-14 w-14 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110',
                                      config.bgColor
                                    )}>
                                      <CategoryIcon className={cn('h-7 w-7 sm:h-8 sm:w-8', config.color)} />
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        e.preventDefault()
                                        toggleFavoriteMutation.mutate({
                                          resourceId: resource.id,
                                          isFavorite,
                                        })
                                      }}
                                      disabled={toggleFavoriteMutation.isPending}
                                      className={cn(
                                        'p-2 sm:p-2.5 rounded-xl transition-all',
                                        'min-h-[44px] min-w-[44px] sm:min-h-[48px] sm:min-w-[48px]',
                                        'flex items-center justify-center touch-manipulation',
                                        'active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                                        isFavorite
                                          ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                                          : 'hover:bg-card/30 dark:hover:bg-card/50 text-muted-foreground hover:text-foreground',
                                        toggleFavoriteMutation.isPending && 'opacity-50 cursor-wait'
                                      )}
                                      type="button"
                                      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                      aria-pressed={isFavorite}
                                    >
                                      {toggleFavoriteMutation.isPending ? (
                                        <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-islamic-gold" />
                                      ) : (
                                        <Star className={cn(
                                          "h-5 w-5 sm:h-6 sm:w-6 transition-all duration-200",
                                          isFavorite && "fill-current scale-110"
                                        )} />
                                      )}
                                    </button>
                                  </div>

                                  <div className="flex-1 space-y-3 sm:space-y-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                      {resource.is_featured && (
                                        <span className="text-xs sm:text-sm font-medium bg-secondary/20 dark:bg-secondary/30 text-secondary-700 dark:text-secondary-300 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full flex items-center gap-1.5 min-h-[24px] sm:min-h-[28px]">
                                          <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                          Featured
                                        </span>
                                      )}
                                    </div>
                                    <h3 className="font-semibold text-base sm:text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-relaxed">
                                      {resource.title}
                                    </h3>
                                    {resource.description && (
                                      <p className="text-sm sm:text-base text-muted-foreground line-clamp-2 leading-relaxed">
                                        {resource.description}
                                      </p>
                                    )}
                                  </div>

                                  <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-border">
                                    {resource.url && (
                                      <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full inline-flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 bg-muted hover:bg-muted/80 dark:bg-muted/50 dark:hover:bg-muted/70 text-foreground font-medium rounded-xl transition-colors min-h-[44px] touch-manipulation group/link"
                                      >
                                        <span>View Resource</span>
                                        <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 group-hover/link:translate-x-1 transition-transform" />
                                      </a>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </section>
          )}

          {!isLoading && filteredResources.length === 0 && (
            <section>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card>
                  <CardContent className="py-16 sm:py-20 text-center">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4 sm:mb-5">
                      <Library className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg sm:text-xl mb-2 sm:mb-3">
                      {debouncedSearchQuery || selectedCategory || showSavedOnly
                        ? 'No resources match your filters'
                        : 'No resources available yet'}
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base mb-5 sm:mb-6">
                      {debouncedSearchQuery || selectedCategory || showSavedOnly
                        ? 'Try adjusting your search or filters'
                        : 'Check back soon for curated resources!'}
                    </p>
                    {(debouncedSearchQuery || selectedCategory || showSavedOnly) && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery('')
                          setSelectedCategory(null)
                          setShowSavedOnly(false)
                        }}
                        className="min-h-[44px]"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
