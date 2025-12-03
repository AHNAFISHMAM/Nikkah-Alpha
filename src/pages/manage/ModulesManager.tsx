import { useState } from 'react'
import { motion } from 'framer-motion'
import { SEO } from '../../components/SEO'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Search,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Label } from '../../components/ui/Label'
import { Dialog } from '../../components/ui/Dialog'
import type { Module } from '../../types/database'

interface ModuleFormData {
  title: string
  description: string
  sort_order: number
}

export function ModulesManager() {
  const queryClient = useQueryClient()
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [showModuleForm, setShowModuleForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'sort_order' | 'title' | 'created_at'>('sort_order')

  const [moduleForm, setModuleForm] = useState<ModuleFormData>({
    title: '',
    description: '',
    sort_order: 0,
  })

  const { data: modules, isLoading } = useQuery({
    queryKey: ['manage-modules'],
    queryFn: async () => {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('sort_order')

      if (error) throw error
      return data as Module[]
    },
  })

  // Filter and sort modules
  const filteredAndSortedModules = modules
    ?.filter((module) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        module.title.toLowerCase().includes(query) ||
        module.description?.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'sort_order') {
        return a.sort_order - b.sort_order
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      }
      if (sortBy === 'created_at') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return 0
    })

  const saveModuleMutation = useMutation({
    mutationFn: async (formData: ModuleFormData & { id?: string }) => {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }

      if (formData.id) {
        // Update existing module
        const { data, error } = await (supabase
          .from('modules') as any)
          .update({
            title: formData.title,
            description: formData.description || null,
            sort_order: formData.sort_order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', formData.id)
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        // Create new module
        const { data, error } = await (supabase
          .from('modules') as any)
          .insert({
            id: `module-${Date.now()}`,
            title: formData.title,
            description: formData.description || null,
            sort_order: formData.sort_order,
          })
          .select()
          .single()

        if (error) throw error
        return data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-modules'] })
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      toast.success(editingModule ? 'Module updated successfully' : 'Module created successfully')
      setShowModuleForm(false)
      setEditingModule(null)
      setModuleForm({ title: '', description: '', sort_order: 0 })
    },
    onError: (error: any) => {
      toast.error(editingModule ? 'Failed to update module' : 'Failed to create module')
      console.error('Module save error:', error)
    },
  })

  const deleteModuleMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }
      const { error } = await supabase.from('modules').delete().eq('id', moduleId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-modules'] })
      queryClient.invalidateQueries({ queryKey: ['modules'] })
      toast.success('Module deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete module')
    },
  })

  const reorderModuleMutation = useMutation({
    mutationFn: async ({ moduleId, newOrder }: { moduleId: string; newOrder: number }) => {
      if (!supabase) {
        throw new Error('Supabase is not configured')
      }
      const { error } = await (supabase
        .from('modules') as any)
        .update({ sort_order: newOrder, updated_at: new Date().toISOString() })
        .eq('id', moduleId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-modules'] })
      queryClient.invalidateQueries({ queryKey: ['modules'] })
    },
  })

  const handleEditModule = (module: Module) => {
    setEditingModule(module)
    setModuleForm({
      title: module.title,
      description: module.description || '',
      sort_order: module.sort_order,
    })
    setShowModuleForm(true)
  }

  const handleSaveModule = () => {
    if (!moduleForm.title.trim()) {
      toast.error('Module title is required')
      return
    }

    if (moduleForm.sort_order < 0) {
      toast.error('Sort order must be 0 or greater')
      return
    }

    saveModuleMutation.mutate({
      ...moduleForm,
      id: editingModule?.id,
    })
  }

  const handleDeleteModule = (moduleId: string, moduleTitle: string) => {
    if (
      confirm(
        `Are you sure you want to delete "${moduleTitle}"?\n\nThis will also delete all user notes and progress for this module.`
      )
    ) {
      deleteModuleMutation.mutate(moduleId)
    }
  }

  const handleMoveUp = (module: Module) => {
    if (!modules) return
    const currentIndex = modules.findIndex((m) => m.id === module.id)
    if (currentIndex <= 0) return

    const previousModule = modules[currentIndex - 1]
    reorderModuleMutation.mutate({
      moduleId: module.id,
      newOrder: previousModule.sort_order,
    })
    reorderModuleMutation.mutate({
      moduleId: previousModule.id,
      newOrder: module.sort_order,
    })
  }

  const handleMoveDown = (module: Module) => {
    if (!modules) return
    const currentIndex = modules.findIndex((m) => m.id === module.id)
    if (currentIndex >= modules.length - 1) return

    const nextModule = modules[currentIndex + 1]
    reorderModuleMutation.mutate({
      moduleId: module.id,
      newOrder: nextModule.sort_order,
    })
    reorderModuleMutation.mutate({
      moduleId: nextModule.id,
      newOrder: module.sort_order,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading modules...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title="Modules Manager"
        description="Manage learning modules"
        path="/manage/modules"
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
            <Link
              to="/manage"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Management</span>
            </Link>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Modules Manager</h1>
                <p className="text-muted-foreground mt-1">Manage learning modules and content</p>
              </div>
              <Button
                onClick={() => {
                  setEditingModule(null)
                  setModuleForm({ title: '', description: '', sort_order: 0 })
                  setShowModuleForm(true)
                }}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Create New Module
              </Button>
            </div>
          </motion.div>

          {/* Search and Sort */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search modules by title or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="sm:w-48">
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as 'sort_order' | 'title' | 'created_at')
                      }
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="sort_order">Sort by Order</option>
                      <option value="title">Sort by Title</option>
                      <option value="created_at">Sort by Date</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Modules Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {!filteredAndSortedModules || filteredAndSortedModules.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? 'No modules found' : 'No modules yet'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery
                      ? 'Try adjusting your search query'
                      : 'Create your first learning module to get started'}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={() => {
                        setEditingModule(null)
                        setModuleForm({ title: '', description: '', sort_order: 0 })
                        setShowModuleForm(true)
                      }}
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                      Create First Module
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-4 font-semibold text-sm">Order</th>
                          <th className="text-left p-4 font-semibold text-sm">Title</th>
                          <th className="text-left p-4 font-semibold text-sm">Description</th>
                          <th className="text-left p-4 font-semibold text-sm">Created</th>
                          <th className="text-right p-4 font-semibold text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAndSortedModules.map((module) => (
                          <tr
                            key={module.id}
                            className="border-b border-border hover:bg-muted/50 transition-colors"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{module.sort_order}</span>
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => handleMoveUp(module)}
                                    disabled={
                                      !modules ||
                                      modules.findIndex((m) => m.id === module.id) === 0
                                    }
                                    className="p-1 hover:bg-accent rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Move up"
                                  >
                                    <ArrowUp className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleMoveDown(module)}
                                    disabled={
                                      !modules ||
                                      modules.findIndex((m) => m.id === module.id) ===
                                        modules.length - 1
                                    }
                                    className="p-1 hover:bg-accent rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Move down"
                                  >
                                    <ArrowDown className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-medium">{module.title}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                                {module.description || 'No description'}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm text-muted-foreground">
                                {new Date(module.created_at).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditModule(module)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteModule(module.id, module.title)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      {/* Create/Edit Module Dialog */}
      <Dialog
        isOpen={showModuleForm}
        onClose={() => {
          setShowModuleForm(false)
          setEditingModule(null)
          setModuleForm({ title: '', description: '', sort_order: 0 })
        }}
        title={editingModule ? 'Edit Module' : 'Create New Module'}
        description={
          editingModule
            ? 'Update module information and content'
            : 'Add a new learning module to the system'
        }
        maxWidth="2xl"
        icon={<BookOpen className="h-5 w-5" />}
      >
        <div className="space-y-6">
          <div>
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={moduleForm.title}
              onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
              placeholder="Enter module title"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={moduleForm.description}
              onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
              placeholder="Enter module description"
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="sort_order">
              Sort Order <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sort_order"
              type="number"
              min="0"
              value={moduleForm.sort_order}
              onChange={(e) =>
                setModuleForm({ ...moduleForm, sort_order: parseInt(e.target.value) || 0 })
              }
              placeholder="0"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Lower numbers appear first. Use 0, 1, 2, etc.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => {
                setShowModuleForm(false)
                setEditingModule(null)
                setModuleForm({ title: '', description: '', sort_order: 0 })
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveModule}
              disabled={saveModuleMutation.isPending}
              leftIcon={
                saveModuleMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : undefined
              }
            >
              {saveModuleMutation.isPending
                ? 'Saving...'
                : editingModule
                  ? 'Update Module'
                  : 'Create Module'}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}

