import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SEO } from '../../components/SEO'
import { PAGE_SEO } from '../../lib/seo'
import {
  User,
  Calendar,
  LogOut,
  ChevronRight,
  Edit3,
  Shield,
  Bell,
  HelpCircle,
  Sparkles,
  Check,
  Palette,
  Loader2,
  Heart,
  Download,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { useProfile, useUpdateProfile } from '../../hooks/useProfile'
import { type GreenTheme } from '../../contexts/ThemeContext'
import { useGreenTheme } from '../../hooks/useGreenTheme'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { formatDate, getInitials } from '../../lib/utils'
import { logError } from '../../lib/error-handler'
import { Link } from 'react-router-dom'
import { ThemeShowcaseModal } from '../../components/profile/ThemeShowcaseModal'
import { ThemeToggle } from '../../components/common/ThemeToggle'
import { FavoriteResourcesCard } from '../../components/profile/FavoriteResourcesCard'
import { PartnerConnectionCard } from '../../components/profile/PartnerConnectionCard'
import { NotificationPreferencesCard } from '../../components/profile/NotificationPreferencesCard'
import { useRealtimeProfile } from '../../hooks/useRealtimeProfile'
import { useRealtimePartnerProfile } from '../../hooks/useRealtimePartnerProfile'
import { useRealtimeFavorites } from '../../hooks/useRealtimeFavorites'
import { useScrollToSection } from '../../hooks/useScrollToSection'
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog'
import { useExportUserData } from '../../hooks/useExportUserData'
import { useDeleteUserData } from '../../hooks/useDeleteUserData'
import { Moon, Sun } from 'lucide-react'


// Extract constants to prevent recreation
const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
} as const

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
} as const

export function Profile() {
  const { user, logout, isAuthenticated } = useAuth()
  const { data: profile } = useProfile()
  const updateProfileMutation = useUpdateProfile()
  const { greenTheme, changeTheme, getThemeMeta, allThemes, isSyncing } = useGreenTheme()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)

  // Real-time updates
  useRealtimeProfile() // Own profile updates
  useRealtimePartnerProfile() // Partner profile updates
  // Note: Enhanced real-time is now handled in PartnerConnectionCard component
  useRealtimeFavorites() // Favorite resources updates
  
  // Auto-scroll to section when hash is present in URL
  useScrollToSection()
  
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [previewTheme, setPreviewTheme] = useState<GreenTheme | null>(null)
  const [showThemeModal, setShowThemeModal] = useState(false)
  const [selectedThemeForModal, setSelectedThemeForModal] = useState<GreenTheme>(greenTheme)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const exportDataMutation = useExportUserData()
  const deleteDataMutation = useDeleteUserData()
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    partner_name: profile?.partner_name || '',
    wedding_date: profile?.wedding_date || '',
  })


  // Sync formData when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        partner_name: profile.partner_name || '',
        wedding_date: profile.wedding_date || '',
      })
    }
  }, [profile])

  // Sync selectedThemeForModal with greenTheme when it changes
  useEffect(() => {
    setSelectedThemeForModal(greenTheme)
  }, [greenTheme])

  // Handle theme preview on hover - memoized
  const handleThemePreview = useCallback((theme: GreenTheme | null) => {
    setPreviewTheme(theme)
  }, [])

  // Handle theme selection - opens modal - memoized
  const handleThemeSelect = useCallback((newTheme: GreenTheme) => {
    setSelectedThemeForModal(newTheme)
    setShowThemeModal(true)
  }, [])

  // Handle theme apply from modal - memoized
  const handleThemeApply = useCallback((newTheme: GreenTheme) => {
    const meta = getThemeMeta(newTheme)
    changeTheme(newTheme)
    setPreviewTheme(null)
    toast.success(
      `Theme changed to ${meta.label}! ${meta.description}`,
      {
        duration: 3000,
        icon: '🎨',
        style: {
          background: `linear-gradient(135deg, ${meta.color}15, ${meta.color}25)`,
          border: `1px solid ${meta.color}40`,
          color: 'var(--color-foreground)',
        },
      }
    )
  }, [changeTheme, getThemeMeta])

  // Keyboard shortcuts for theme switching (Ctrl/Cmd + 1-5)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check if Ctrl (Windows/Linux) or Cmd (Mac) is pressed
      if (e.ctrlKey || e.metaKey) {
        const num = parseInt(e.key)
        // Number keys 1-5 correspond to themes
        if (num >= 1 && num <= 5 && !isNaN(num)) {
          e.preventDefault()
          const themeIndex = num - 1
          if (allThemes[themeIndex]) {
            const meta = getThemeMeta(allThemes[themeIndex])
            changeTheme(allThemes[themeIndex])
            setPreviewTheme(null)
            toast.success(
              `Theme changed to ${meta.label}! ${meta.description}`,
              {
                duration: 3000,
                icon: '🎨',
                style: {
                  background: `linear-gradient(135deg, ${meta.color}15, ${meta.color}25)`,
                  border: `1px solid ${meta.color}40`,
                  color: 'var(--color-foreground)',
                },
              }
            )
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [allThemes, changeTheme, getThemeMeta])

  const handleLogout = async () => {
    if (isLoggingOut) return // Prevent multiple logout attempts
    
    setIsLoggingOut(true)
    try {
      await logout()
      // Wait for auth state to clear before navigating
      // This ensures ProtectedRoute sees the logged-out state
      await new Promise(resolve => setTimeout(resolve, 200))
      toast.success('Logged out successfully')
      navigate('/login', { replace: true })
    } catch (error) {
      logError(error, 'Profile.logout')
      toast.error('Failed to log out. Please try again.')
      setIsLoggingOut(false)
    }
  }

  const handleSave = async () => {
    try {
      updateProfileMutation.mutate({
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        partner_name: formData.partner_name || null,
        wedding_date: formData.wedding_date || null,
      }, {
        onSuccess: () => {
          setIsEditing(false)
        },
        onError: (error: Error) => {
          logError(error, 'Profile.handleSave')
          toast.error(error.message || 'Failed to update profile')
        },
      })
    } catch (error) {
      logError(error, 'Profile.handleSave')
      toast.error('Failed to update profile')
    }
  }


  return (
    <>
      <SEO
        title={PAGE_SEO.profile.title}
        description={PAGE_SEO.profile.description}
        path="/profile"
        noIndex
      />

      <div className="min-h-screen-dynamic w-full bg-gradient-to-br from-primary/5 via-background via-60% to-islamic-purple/5">
        <div className="w-full p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto safe-area-inset-top safe-area-inset-bottom">
          {/* Page Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 sm:mb-10"
          >
            <div className="flex items-center gap-2 text-primary text-sm font-medium mb-3">
              <User className="h-4 w-4" />
              <span>Your Account</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              Profile Settings
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Manage your account and preferences
            </p>
          </motion.div>

          {/* Main Content Container */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={CONTAINER_VARIANTS}
            className="space-y-6 sm:space-y-8"
          >
            {/* Profile Header Card */}
            <motion.div variants={ITEM_VARIANTS}>
              <Card className="overflow-hidden" padding="none">
                <div className="bg-gradient-to-r from-primary/10 via-islamic-gold/5 to-islamic-purple/10 p-6 sm:p-8 lg:p-10">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary-foreground">
                          {getInitials(
                            profile?.first_name || profile?.last_name
                              ? `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
                              : profile?.full_name || user?.email || 'U'
                          )}
                        </span>
                      </div>
                      <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-islamic-gold border border-islamic-gold shadow flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-foreground" />
                      </div>
                    </div>
                    <div className="text-center sm:text-left flex-1 space-y-3">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                          {profile?.first_name || profile?.last_name
                            ? `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
                            : profile?.full_name || 'Welcome!'}
                        </h2>
                        <p className="text-muted-foreground mt-2 text-sm sm:text-base">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Profile Information Card */}
            <motion.div variants={ITEM_VARIANTS}>
              <Card padding="none">
                <CardHeader className="border-b border-border px-6 py-5 sm:px-8 sm:py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Edit3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                          {isEditing ? 'Update your personal details' : 'View and manage your profile'}
                        </p>
                      </div>
                    </div>
                    {!isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        leftIcon={<Edit3 className="h-4 w-4" />}
                        className="flex-shrink-0"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                  {isEditing ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className="space-y-5">
                        <div>
                          <Label htmlFor="first_name">First Name</Label>
                          <Input
                            id="first_name"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            placeholder="Your first name"
                            leftIcon={<User className="h-4 w-4" />}
                          />
                        </div>

                        <div>
                          <Label htmlFor="last_name">Last Name</Label>
                          <Input
                            id="last_name"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            placeholder="Your last name"
                            leftIcon={<User className="h-4 w-4" />}
                          />
                        </div>

                        <div>
                          <Label htmlFor="partner_name">Partner Name</Label>
                          <Input
                            id="partner_name"
                            value={formData.partner_name}
                            onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                            placeholder="Your partner's name"
                            leftIcon={<Heart className="h-4 w-4" />}
                          />
                        </div>

                        <div>
                          <Label htmlFor="wedding_date">Wedding Date</Label>
                          <Input
                            id="wedding_date"
                            type="date"
                            value={formData.wedding_date}
                            onChange={(e) => setFormData({ ...formData, wedding_date: e.target.value })}
                            leftIcon={<Calendar className="h-4 w-4" />}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-border">
                        <Button
                          onClick={handleSave}
                          isLoading={updateProfileMutation.isPending}
                          className="flex-1"
                          leftIcon={<Check className="h-4 w-4" />}
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false)
                            setFormData({
                              first_name: profile?.first_name || '',
                              last_name: profile?.last_name || '',
                              partner_name: profile?.partner_name || '',
                              wedding_date: profile?.wedding_date || '',
                            })
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Name */}
                      <div className="flex flex-col p-4 rounded-xl bg-card/30 hover:bg-card/50 transition-colors border border-border/50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-xl bg-card shadow-sm flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground font-medium">Name</p>
                        </div>
                        <p className="font-semibold text-foreground text-sm sm:text-base">
                          {profile?.first_name || profile?.last_name 
                            ? `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
                            : profile?.full_name || 'Not set'}
                        </p>
                      </div>

                      {/* Partner Name */}
                      <div className="flex flex-col p-4 rounded-xl bg-card/30 hover:bg-card/50 transition-colors border border-border/50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-xl bg-card shadow-sm flex items-center justify-center flex-shrink-0">
                            <Heart className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground font-medium">Partner Name</p>
                        </div>
                        <p className="font-semibold text-foreground text-sm sm:text-base">
                          {profile?.partner_name || 'Not set'}
                        </p>
                      </div>

                      {/* Wedding Date */}
                      <div className="flex flex-col p-4 rounded-xl bg-card/30 hover:bg-card/50 transition-colors border border-border/50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-xl bg-card shadow-sm flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground font-medium">Wedding Date</p>
                        </div>
                        <p className="font-semibold text-foreground text-sm sm:text-base">
                          {profile?.wedding_date ? formatDate(profile.wedding_date) : 'Not set'}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Partner Connection Card */}
            <div id="partner-connection" className="scroll-mt-20 sm:scroll-mt-24">
              <PartnerConnectionCard />
            </div>

            {/* Appearance Settings Card - Mobile/Tablet Only */}
            <motion.div variants={ITEM_VARIANTS} className="lg:hidden">
              <Card padding="none">
                <CardHeader className="border-b border-border px-6 py-5 sm:px-8 sm:py-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Sun className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Appearance</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        Customize your display preferences
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                  <div className="space-y-6">
                    {/* Dark/Light Mode Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-card/30 hover:bg-card/50 transition-colors border border-border/50">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                          <Moon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm sm:text-base">Dark Mode</p>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            Switch between light and dark themes
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <ThemeToggle variant="button" size="md" showLabel={false} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notification Preferences Card */}
            <motion.div variants={ITEM_VARIANTS}>
              <NotificationPreferencesCard />
            </motion.div>

            {/* Favorite Resources Card */}
            <motion.div variants={ITEM_VARIANTS}>
              <FavoriteResourcesCard />
            </motion.div>

            {/* Green Theme Selector Card */}
            <motion.div variants={ITEM_VARIANTS}>
              <Card padding="none">
                <CardHeader className="border-b border-border px-6 py-5 sm:px-8 sm:py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Palette className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg sm:text-xl">Green Theme</CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                          Choose your preferred green color
                          <span className="hidden sm:inline ml-2 text-xs">
                            (Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Ctrl/Cmd + 1-5</kbd> to switch)
                          </span>
                        </p>
                      </div>
                    </div>
                    {isSyncing && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 gap-2 sm:gap-4">
                      {allThemes.map((themeValue) => {
                        const themeMeta = getThemeMeta(themeValue)
                        const isSelected = greenTheme === themeValue
                        const isPreviewing = previewTheme === themeValue

                        return (
                          <motion.button
                            key={themeValue}
                            onClick={() => handleThemeSelect(themeValue)}
                            onMouseEnter={() => handleThemePreview(themeValue)}
                            onMouseLeave={() => handleThemePreview(null)}
                            onFocus={() => handleThemePreview(themeValue)}
                            onBlur={() => handleThemePreview(null)}
                            aria-label={`Select ${themeMeta.label} theme: ${themeMeta.description}`}
                            aria-pressed={isSelected}
                            title={`${themeMeta.label}: ${themeMeta.description}`}
                            className="relative h-10 sm:h-14 rounded-lg sm:rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-manipulation group aspect-square"
                            style={{
                              backgroundColor: themeMeta.color,
                              border: isSelected
                                ? '2px solid var(--color-primary)'
                                : isPreviewing
                                ? '2px solid var(--color-primary/50)'
                                : '2px solid transparent',
                              transform: isPreviewing ? 'scale(1.05)' : 'scale(1)',
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {isSelected && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] sm:text-xs font-bold shadow-lg z-10"
                                aria-label="Selected"
                              >
                                ✓
                              </motion.span>
                            )}
                            {/* Tooltip on hover */}
                            <AnimatePresence>
                              {isPreviewing && !isSelected && (
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 5 }}
                                  className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-20"
                                >
                                  {themeMeta.label}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        )
                      })}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <p className="text-sm text-muted-foreground">
                        Current: <strong className="text-foreground capitalize">{getThemeMeta(greenTheme).label}</strong>
                      </p>
                      <p className="text-xs text-muted-foreground italic">
                        {getThemeMeta(greenTheme).description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Account Settings Card - Hidden for now */}
            {false && (
              <motion.div variants={ITEM_VARIANTS}>
                <Card padding="none">
                  <CardHeader className="border-b border-border px-6 py-5 sm:px-8 sm:py-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg sm:text-xl">Account Settings</CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                          Manage your account preferences and settings
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {/* Management Panel Link - Available to all authenticated users */}
                      {false && isAuthenticated && (
                        <>
                          <Link to="/manage">
                            <button className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-accent/50 transition-colors touch-manipulation group">
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                                  <Shield className="h-5 w-5 text-primary" />
                                </div>
                                <div className="text-left">
                                  <span className="font-semibold text-foreground block text-sm sm:text-base">Manage Content</span>
                                  <span className="text-xs sm:text-sm text-muted-foreground">Manage checklist, modules, resources, theme</span>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 group-hover:text-foreground transition-colors" />
                            </button>
                          </Link>
                        </>
                      )}
                      <button className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-accent/50 transition-colors touch-manipulation group">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 group-hover:bg-accent/80 transition-colors">
                            <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </div>
                          <span className="font-medium text-foreground text-sm sm:text-base">Notifications</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 group-hover:text-foreground transition-colors" />
                      </button>
                      <button className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-accent/50 transition-colors touch-manipulation group">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 group-hover:bg-accent/80 transition-colors">
                            <Shield className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </div>
                          <span className="font-medium text-foreground text-sm sm:text-base">Privacy & Security</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 group-hover:text-foreground transition-colors" />
                      </button>
                      <button className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-accent/50 transition-colors touch-manipulation group">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 group-hover:bg-accent/80 transition-colors">
                            <HelpCircle className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </div>
                          <span className="font-medium text-foreground text-sm sm:text-base">Help & Support</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 group-hover:text-foreground transition-colors" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Privacy & Data Management Card */}
            <motion.div variants={ITEM_VARIANTS}>
              <Card padding="none">
                <CardHeader className="border-b border-border px-6 py-5 sm:px-8 sm:py-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Privacy & Data</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        Manage your data and privacy settings
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                  <div className="space-y-4">
                    {/* Export Data Button */}
                    <Button
                      onClick={() => exportDataMutation.mutate()}
                      disabled={exportDataMutation.isPending}
                      isLoading={exportDataMutation.isPending}
                      variant="outline"
                      className="w-full min-h-[44px] justify-start"
                      leftIcon={<Download className="h-4 w-4" />}
                    >
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm sm:text-base">Export My Data</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Download all your data (GDPR)
                        </p>
                      </div>
                    </Button>

                    {/* Delete Account Button */}
                    <Button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={deleteDataMutation.isPending}
                      variant="outline"
                      className="w-full min-h-[44px] justify-start border-error/20 text-error hover:bg-error/10 hover:text-error"
                      leftIcon={<Trash2 className="h-4 w-4" />}
                    >
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm sm:text-base">Delete Account</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Permanently delete your account and data
                        </p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sign Out Card */}
            <motion.div variants={ITEM_VARIANTS}>
              <Card padding="none" className="border-red-100 dark:border-red-900/30">
                <CardContent className="p-0">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors rounded-2xl group disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-red-200 dark:group-hover:bg-red-900/40 transition-colors">
                        <LogOut className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm sm:text-base">Sign Out</p>
                        <p className="text-xs sm:text-sm text-red-400 dark:text-red-500">Log out of your account</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 flex-shrink-0" />
                  </button>
                </CardContent>
              </Card>
            </motion.div>

            {/* App Version */}
            <motion.p
              variants={ITEM_VARIANTS}
              className="text-center text-sm text-muted-foreground pb-8"
            >
              NikahPrep v1.0.0
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Theme Showcase Modal */}
      <ThemeShowcaseModal
        isOpen={showThemeModal}
        selectedTheme={selectedThemeForModal}
        onClose={() => setShowThemeModal(false)}
        onApply={handleThemeApply}
      />

      {/* Delete Account Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? This action cannot be undone. All your data will be anonymized and you will be signed out immediately."
        confirmText="Delete Account"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          setShowDeleteConfirm(false)
          deleteDataMutation.mutate()
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  )
}
