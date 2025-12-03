import { motion } from 'framer-motion'
import { Star, ExternalLink, BookOpen, GraduationCap, Users, DollarSign, Heart, FileText, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { useFavoriteResources, type FavoriteResource } from '../../hooks/useFavoriteResources'
import { Skeleton } from '../ui/Skeleton'
import { cn } from '../../lib/utils'

const categoryConfig: Record<string, { icon: typeof BookOpen; color: string; bgColor: string }> = {
  Books: { icon: BookOpen, color: 'text-primary', bgColor: 'bg-primary/10 dark:bg-primary/20' },
  Scholarly: { icon: GraduationCap, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  Counseling: { icon: Users, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  Finance: { icon: DollarSign, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  Duas: { icon: Heart, color: 'text-pink-600 dark:text-pink-400', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
  Courses: { icon: FileText, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
}

interface FavoriteResourcePreviewProps {
  resource: FavoriteResource
}

function FavoriteResourcePreview({ resource }: FavoriteResourcePreviewProps) {
  const config = categoryConfig[resource.category] || categoryConfig.Books
  const CategoryIcon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-3 sm:p-4 rounded-xl bg-card/30 hover:bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-200 group"
      >
        <div className="flex items-start gap-3">
          <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0', config.bgColor)}>
            <CategoryIcon className={cn('h-5 w-5', config.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-1">
              {resource.title}
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground capitalize">{resource.category}</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  )
}

export function FavoriteResourcesCard() {
  const { data, isLoading, error } = useFavoriteResources()
  const navigate = useNavigate()

  const handleViewAll = () => {
    navigate('/resources?favorites=true')
  }

  return (
    <Card padding="none">
      <CardHeader className="border-b border-border px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Star className="h-5 w-5 sm:h-6 sm:w-6 text-primary fill-primary" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl">Favorite Resources</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Quick access to your saved resources
              </p>
            </div>
          </div>
          {!isLoading && !error && data && data.totalCount > 0 && (
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-xs sm:text-sm font-semibold">
                {data.totalCount}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 sm:p-8">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Failed to load favorites</p>
          </div>
        ) : !data || data.totalCount === 0 ? (
          <div className="text-center py-8 sm:py-10">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted/50 mb-4">
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
              No favorites yet
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Browse resources and add your favorites for quick access
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/resources')}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Browse Resources
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {data.preview.map((resource) => (
                <FavoriteResourcePreview key={resource.id} resource={resource} />
              ))}
            </div>

            {/* View All Button */}
            {data.totalCount > data.preview.length && (
              <div className="pt-2 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={handleViewAll}
                  className="w-full"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  View All {data.totalCount} Favorites
                </Button>
              </div>
            )}
            {data.totalCount <= data.preview.length && (
              <div className="pt-2 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={handleViewAll}
                  className="w-full"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  View in Resources
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

