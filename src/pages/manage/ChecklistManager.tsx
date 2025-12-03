import { useState } from 'react'
import { motion } from 'framer-motion'
import { SEO } from '../../components/SEO'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle,
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
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { cn } from '../../lib/utils'
import type { ChecklistCategory, ChecklistItem } from '../../types/database'

interface CategoryWithItems extends ChecklistCategory {
  checklist_items: ChecklistItem[]
}

interface CategoryFormData {
  name: string
  description: string
  icon: string
  sort_order: number
}

interface ItemFormData {
  title: string
  description: string
  is_required: boolean
  sort_order: number
}

export function ChecklistManager() {
  const queryClient = useQueryClient()
  const [editingCategory, setEditingCategory] = useState<CategoryWithItems | null>(null)
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showItemForm, setShowItemForm] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({
    name: '',
    description: '',
    icon: '',
    sort_order: 0,
  })

  const [itemForm, setItemForm] = useState<ItemFormData>({
    title: '',
    description: '',
    is_required: false,
    sort_order: 0,
  })

  const { data: categories, isLoading } = useQuery({
    queryKey: ['manage-checklist'],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }
      const { data, error } = await supabase
        .from('checklist_categories')
        .select(`
          *,
          checklist_items (*)
        `)
        .order('sort_order')

      if (error) throw error
      return data as CategoryWithItems[]
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }
      const { error } = await supabase
        .from('checklist_categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-checklist'] })
      toast.success('Category deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete category')
    },
  })

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }
      const { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-checklist'] })
      toast.success('Item deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete item')
    },
  })

  const saveCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData & { id?: string }) => {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }
      if (data.id) {
        const { error } = await supabase
          .from('checklist_categories')
          // @ts-expect-error - Supabase type inference issue
          .update(data)
          .eq('id', data.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('checklist_categories')
          // @ts-expect-error - Supabase type inference issue
          .insert(data)

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-checklist'] })
      toast.success('Category saved successfully')
      setShowCategoryForm(false)
      setEditingCategory(null)
      setCategoryForm({ name: '', description: '', icon: '', sort_order: 0 })
    },
    onError: () => {
      toast.error('Failed to save category')
    },
  })

  const saveItemMutation = useMutation({
    mutationFn: async (data: ItemFormData & { id?: string; category_id: string }) => {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }
      if (data.id) {
        const { error } = await supabase
          .from('checklist_items')
          // @ts-expect-error - Supabase type inference issue
          .update(data)
          .eq('id', data.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('checklist_items')
          // @ts-expect-error - Supabase type inference issue
          .insert(data)

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-checklist'] })
      toast.success('Item saved successfully')
      setShowItemForm(false)
      setEditingItem(null)
      setSelectedCategoryId(null)
      setItemForm({ title: '', description: '', is_required: false, sort_order: 0 })
    },
    onError: () => {
      toast.error('Failed to save item')
    },
  })

  const handleEditCategory = (category: CategoryWithItems) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      sort_order: category.sort_order,
    })
    setShowCategoryForm(true)
  }

  const handleEditItem = (item: ChecklistItem) => {
    setEditingItem(item)
    setItemForm({
      title: item.title,
      description: item.description || '',
      is_required: item.is_required,
      sort_order: item.sort_order,
    })
    setSelectedCategoryId(item.category_id)
    setShowItemForm(true)
  }

  const handleSaveCategory = () => {
    if (!categoryForm.name) {
      toast.error('Category name is required')
      return
    }

    saveCategoryMutation.mutate({
      ...categoryForm,
      id: editingCategory?.id,
    })
  }

  const handleSaveItem = () => {
    if (!itemForm.title || !selectedCategoryId) {
      toast.error('Item title and category are required')
      return
    }

    saveItemMutation.mutate({
      ...itemForm,
      id: editingItem?.id,
      category_id: selectedCategoryId,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-islamic-gold mx-auto mb-4" />
          <p className="text-muted-foreground">Loading checklist data...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title="Checklist Manager"
        description="Manage checklist items and categories"
        path="/manage/checklist"
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
                  Checklist Manager
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage checklist categories and items
                </p>
              </div>
              <Button
                onClick={() => {
                  setEditingCategory(null)
                  setCategoryForm({ name: '', description: '', icon: '', sort_order: 0 })
                  setShowCategoryForm(true)
                }}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Category
              </Button>
            </div>
          </motion.div>

          {/* Categories */}
          <div className="space-y-4">
            {categories?.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                        {category.icon || '📋'}
                      </div>
                      <div>
                        <CardTitle>{category.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCategoryId(category.id)
                          setEditingItem(null)
                          setItemForm({ title: '', description: '', is_required: false, sort_order: 0 })
                          setShowItemForm(true)
                        }}
                        leftIcon={<Plus className="h-4 w-4" />}
                      >
                        Add Item
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Delete this category and all its items?')) {
                            deleteCategoryMutation.mutate(category.id)
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.checklist_items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-card/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">{item.title}</p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            )}
                          </div>
                          {item.is_required && (
                            <span className="text-xs bg-secondary/20 text-secondary-700 px-2 py-1 rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm('Delete this item?')) {
                                deleteItemMutation.mutate(item.id)
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {category.checklist_items.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No items yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Category Form Dialog */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => {
                  setShowCategoryForm(false)
                  setEditingCategory(null)
                }}
                className="p-2 hover:bg-card/30 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <Input
                label="Name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows={3}
                  className={cn(
                    "w-full rounded-xl border border-input bg-background",
                    "px-4 py-3 text-sm resize-none",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  )}
                />
              </div>
              <Input
                label="Icon (emoji)"
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
              />
              <Input
                label="Sort Order"
                type="number"
                value={categoryForm.sort_order}
                onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: parseInt(e.target.value) })}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveCategory}
                  disabled={saveCategoryMutation.isPending}
                  isLoading={saveCategoryMutation.isPending}
                  leftIcon={<Save className="h-4 w-4" />}
                  className="flex-1"
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCategoryForm(false)
                    setEditingCategory(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Form Dialog */}
      {showItemForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {editingItem ? 'Edit Item' : 'Add Item'}
              </h3>
              <button
                onClick={() => {
                  setShowItemForm(false)
                  setEditingItem(null)
                  setSelectedCategoryId(null)
                }}
                className="p-2 hover:bg-card/30 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <Input
                label="Title"
                value={itemForm.title}
                onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  rows={3}
                  className={cn(
                    "w-full rounded-xl border border-input bg-background",
                    "px-4 py-3 text-sm resize-none",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  )}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_required"
                  checked={itemForm.is_required}
                  onChange={(e) => setItemForm({ ...itemForm, is_required: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="is_required" className="text-sm font-medium text-foreground">
                  Required Item
                </label>
              </div>
              <Input
                label="Sort Order"
                type="number"
                value={itemForm.sort_order}
                onChange={(e) => setItemForm({ ...itemForm, sort_order: parseInt(e.target.value) })}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveItem}
                  disabled={saveItemMutation.isPending}
                  isLoading={saveItemMutation.isPending}
                  leftIcon={<Save className="h-4 w-4" />}
                  className="flex-1"
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowItemForm(false)
                    setEditingItem(null)
                    setSelectedCategoryId(null)
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
