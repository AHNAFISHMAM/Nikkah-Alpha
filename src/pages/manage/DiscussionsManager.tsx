import { useState } from 'react'
import { motion } from 'framer-motion'
import { SEO } from '../../components/SEO'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MessageCircle,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  ArrowLeft,
  Save,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { CustomDropdown } from '../../components/ui/CustomDropdown'
import { cn } from '../../lib/utils'
import type { DiscussionPrompt } from '../../types/database'

interface PromptFormData {
  title: string
  description: string
  category: string
  sort_order: number
}

const DISCUSSION_CATEGORIES = [
  'Household',
  'Financial',
  'Living',
  'Family Planning',
  'Communication',
  'Career',
  'Education',
  'Social',
  'Family',
  'Parenting',
  'Decision Making',
  'Health',
  'Lifestyle',
  'Spiritual',
] as const

export function DiscussionsManager() {
  const queryClient = useQueryClient()
  const [editingPrompt, setEditingPrompt] = useState<DiscussionPrompt | null>(null)
  const [showPromptForm, setShowPromptForm] = useState(false)

  const [promptForm, setPromptForm] = useState<PromptFormData>({
    title: '',
    description: '',
    category: '',
    sort_order: 0,
  })

      const { data: prompts, isLoading } = useQuery({
    queryKey: ['manage-discussions'],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }
      const { data, error } = await supabase
        .from('discussion_prompts')
        .select('*')
        .order('sort_order')

      if (error) throw error
      return data as DiscussionPrompt[]
    },
  })

  const deletePromptMutation = useMutation({
    mutationFn: async (promptId: string) => {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }
      const { error } = await supabase
        .from('discussion_prompts')
        .delete()
        .eq('id', promptId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-discussions'] })
      queryClient.invalidateQueries({ queryKey: ['discussions'] })
      toast.success('Prompt deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete prompt')
    },
  })

  const savePromptMutation = useMutation({
    mutationFn: async (data: PromptFormData & { id?: string }) => {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }
      if (data.id) {
        const { error } = await supabase
          .from('discussion_prompts')
          .update({
            title: data.title,
            description: data.description || null,
            category: data.category,
            sort_order: data.sort_order,
          } as any)
          .eq('id', data.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('discussion_prompts')
          .insert({
            title: data.title,
            description: data.description || null,
            category: data.category,
            sort_order: data.sort_order,
          } as any)

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-discussions'] })
      queryClient.invalidateQueries({ queryKey: ['discussions'] })
      toast.success('Prompt saved successfully')
      setShowPromptForm(false)
      setEditingPrompt(null)
      setPromptForm({ title: '', description: '', category: '', order_index: 0 })
    },
    onError: () => {
      toast.error('Failed to save prompt')
    },
  })

  const handleEditPrompt = (prompt: DiscussionPrompt) => {
    setEditingPrompt(prompt)
    setPromptForm({
      title: prompt.title,
      description: prompt.description || '',
      category: prompt.category,
      sort_order: prompt.sort_order || 0,
    })
    setShowPromptForm(true)
  }

  const handleSavePrompt = () => {
    if (!promptForm.title || !promptForm.category) {
      toast.error('Title and category are required')
      return
    }

    savePromptMutation.mutate({
      ...promptForm,
      id: editingPrompt?.id,
    })
  }

  const groupedPrompts = prompts?.reduce((acc, prompt) => {
    const category = prompt.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(prompt)
    return acc
  }, {} as Record<string, DiscussionPrompt[]>)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-islamic-gold mx-auto mb-4" />
          <p className="text-muted-foreground">Loading discussions...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title="Discussions Manager"
        description="Manage discussion prompts"
        path="/manage/discussions"
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
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Discussions Manager
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage discussion prompts and questions
                </p>
              </div>
              <Button
                onClick={() => {
                  setEditingPrompt(null)
                  setPromptForm({ title: '', description: '', category: '', order_index: 0 })
                  setShowPromptForm(true)
                }}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Prompt
              </Button>
            </div>
          </motion.div>

          {/* Prompts by Category */}
          <div className="space-y-6">
            {groupedPrompts && Object.entries(groupedPrompts)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([category, categoryPrompts]) => (
                <div key={category}>
                  <h2 className="text-lg font-semibold text-foreground capitalize mb-3">
                    {category}
                    <span className="ml-2 text-sm text-muted-foreground font-normal">
                      ({categoryPrompts.length} prompts)
                    </span>
                  </h2>
                  <div className="space-y-3">
                    {categoryPrompts
                      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                      .map((prompt) => (
                        <Card key={prompt.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-3">
                                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded mt-0.5 whitespace-nowrap">
                                    #{prompt.sort_order || 0}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-foreground mb-1">
                                      {prompt.title}
                                    </h3>
                                    {prompt.description && (
                                      <p className="text-sm text-muted-foreground">
                                        {prompt.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditPrompt(prompt)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm('Delete this discussion prompt? This action cannot be undone.')) {
                                      deletePromptMutation.mutate(prompt.id)
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}

            {(!prompts || prompts.length === 0) && (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    No discussion prompts yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by creating your first prompt
                  </p>
                  <Button
                    onClick={() => {
                      setEditingPrompt(null)
                      setPromptForm({ title: '', description: '', category: '', order_index: 0 })
                      setShowPromptForm(true)
                    }}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Add Prompt
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Prompt Form Dialog */}
      {showPromptForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {editingPrompt ? 'Edit Prompt' : 'Add Prompt'}
              </h3>
              <button
                onClick={() => {
                  setShowPromptForm(false)
                  setEditingPrompt(null)
                }}
                className="p-2 hover:bg-card/30 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <Input
                label="Title"
                value={promptForm.title}
                onChange={(e) => setPromptForm({ ...promptForm, title: e.target.value })}
                placeholder="e.g., Daily Household Chores Division"
                required
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={promptForm.description}
                  onChange={(e) => setPromptForm({ ...promptForm, description: e.target.value })}
                  rows={4}
                  placeholder="Discuss who will handle cooking, cleaning, laundry, grocery shopping, and other daily tasks..."
                  className={cn(
                    "w-full rounded-xl border border-input bg-background",
                    "px-4 py-3 text-sm resize-none",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Category
                  <span className="text-destructive ml-1">*</span>
                </label>
                <CustomDropdown
                  id="category"
                  value={promptForm.category}
                  onChange={(value) => setPromptForm({ ...promptForm, category: value })}
                  placeholder="Select a category"
                  options={DISCUSSION_CATEGORIES.map((cat) => ({
                    value: cat,
                    label: cat,
                  }))}
                  className="w-full"
                />
              </div>
              <Input
                label="Order Index"
                type="number"
                value={promptForm.sort_order}
                onChange={(e) => setPromptForm({ ...promptForm, sort_order: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min="0"
              />
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSavePrompt}
                  disabled={savePromptMutation.isPending}
                  isLoading={savePromptMutation.isPending}
                  leftIcon={<Save className="h-4 w-4" />}
                  className="flex-1"
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPromptForm(false)
                    setEditingPrompt(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
