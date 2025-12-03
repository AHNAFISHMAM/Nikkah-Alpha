import { motion } from 'framer-motion'
import { SEO } from '../../components/SEO'
import { useQuery } from '@tanstack/react-query'
import {
  Library,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  ArrowLeft,
  ExternalLink,
  FileText,
  Video,
  Headphones,
  Link as LinkIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import type { Resource } from '../../types/database'

const typeIcons = {
  article: FileText,
  video: Video,
  audio: Headphones,
  course: Library,
  book: Library,
  tool: LinkIcon,
}

export function ResourcesManager() {
  const { data: resources, isLoading } = useQuery({
    queryKey: ['manage-resources'],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('sort_order')

      if (error) throw error
      return data as Resource[]
    },
  })

  const groupedResources = resources?.reduce((acc, resource) => {
    const category = resource.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(resource)
    return acc
  }, {} as Record<string, Resource[]>)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-islamic-gold mx-auto mb-4" />
          <p className="text-muted-foreground">Loading resources...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title="Resources Manager"
        description="Manage resources library"
        path="/manage/resources"
        noIndex
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background via-60% to-islamic-purple/5">
        <div className="w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link to="/manage" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Management</span>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Resources Manager
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage resource library content
                </p>
              </div>
              <Button
                onClick={() => toast('Resource creation coming soon')}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Resource
              </Button>
            </div>
          </motion.div>

          {/* Resources by Category */}
          <div className="space-y-6">
            {groupedResources && Object.entries(groupedResources).map(([category, categoryResources]) => (
              <div key={category}>
                <h2 className="text-lg font-semibold text-foreground capitalize mb-3">
                  {category}
                  <span className="ml-2 text-sm text-muted-foreground font-normal">
                    ({categoryResources.length} resources)
                  </span>
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {categoryResources.map((resource) => {
                    const TypeIcon = typeIcons[resource.content_type as keyof typeof typeIcons] || FileText
                    return (
                      <Card key={resource.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <TypeIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-foreground mb-0.5">
                                    {resource.title}
                                  </h3>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    by {resource.author}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toast('Resource editing coming soon')}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toast('Delete functionality coming soon')}
                                  >
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                              {resource.description && (
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {resource.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full capitalize">
                                  {resource.content_type}
                                </span>
                                {resource.url && (
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    View
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}

            {(!resources || resources.length === 0) && (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <Library className="h-8 w-8 text-secondary-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    No resources yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by adding your first resource
                  </p>
                  <Button
                    onClick={() => toast('Resource creation coming soon')}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Add Resource
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
