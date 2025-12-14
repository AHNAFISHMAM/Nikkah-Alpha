import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { 
  UserPlus, 
  Mail, 
  Copy, 
  Check, 
  X, 
  Clock, 
  Heart,
  QrCode,
} from 'lucide-react'
import { usePartner } from '../../hooks/usePartner'
import { usePartnerProfile } from '../../hooks/usePartnerProfile'
import { 
  useSentInvitations, 
  useSendEmailInvitation, 
  useGenerateInvitationCode,
  useAcceptInvitation,
  useCancelInvitation,
  useReceivedInvitations
} from '../../hooks/usePartnerInvitations'
import { useDisconnectPartner } from '../../hooks/useDisconnectPartner'
import { useEnhancedRealtimePartnerInvitations } from '../../hooks/useEnhancedRealtimePartnerInvitations'
import { ConflictResolutionBanner, Conflict } from './ConflictResolutionBanner'
import { formatDistanceToNow } from 'date-fns'
import { toastWithPreferences } from '../../lib/toast'
import { logError } from '../../lib/error-handler'

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function PartnerConnectionCard() {
  // Enhanced real-time updates
  useEnhancedRealtimePartnerInvitations()

  const { data: partnerId, isLoading: partnerLoading, isRefetching: partnerRefetching } = usePartner()
  const { data: partnerProfile, isLoading: partnerProfileLoading } = usePartnerProfile()
  const { data: sentInvitations, isRefetching: sentInvitationsRefetching } = useSentInvitations()
  const { data: receivedInvitations, isRefetching: receivedInvitationsRefetching } = useReceivedInvitations()
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showCodeForm, setShowCodeForm] = useState(false)
  const [partnerEmail, setPartnerEmail] = useState('')
  const [invitationCode, setInvitationCode] = useState('')
  const [conflict, setConflict] = useState<Conflict | null>(null)

  // Mobile: Prevent double-tap
  const lastTapTimeRef = useRef<number>(0)
  const lastActionRef = useRef<string>('')

  const sendEmailMutation = useSendEmailInvitation()
  const generateCodeMutation = useGenerateInvitationCode()
  const acceptMutation = useAcceptInvitation()
  const cancelMutation = useCancelInvitation()
  const disconnectMutation = useDisconnectPartner()

  const pendingSentInvitation = useMemo(
    () => sentInvitations?.find(inv => inv.status === 'pending'),
    [sentInvitations]
  )
  const pendingReceivedInvitation = useMemo(
    () => receivedInvitations?.[0],
    [receivedInvitations]
  )

  // Show loading state if partner is being refetched or mutations are in progress
  const isUpdating = useMemo(
    () =>
      partnerRefetching ||
      sentInvitationsRefetching ||
      receivedInvitationsRefetching ||
      acceptMutation.isPending ||
      sendEmailMutation.isPending ||
      generateCodeMutation.isPending ||
      cancelMutation.isPending,
    [
      partnerRefetching,
      sentInvitationsRefetching,
      receivedInvitationsRefetching,
      acceptMutation.isPending,
      sendEmailMutation.isPending,
      generateCodeMutation.isPending,
      cancelMutation.isPending,
    ]
  )

  // Mobile: Prevent double-tap with action deduplication
  const handleAction = useCallback(
    (action: () => void, actionKey: string) => {
      const now = Date.now()
      // Prevent same action within 500ms
      if (now - lastTapTimeRef.current < 500 && lastActionRef.current === actionKey) {
        return
      }
      lastTapTimeRef.current = now
      lastActionRef.current = actionKey
      action()
    },
    []
  )

  // Reset local state when partner is connected
  useEffect(() => {
    if (partnerId) {
      setShowEmailForm(false)
      setShowCodeForm(false)
      setPartnerEmail('')
      setInvitationCode('')
    }
  }, [partnerId])

  // Reset form state when pending invitation appears (after sending)
  useEffect(() => {
    if (pendingSentInvitation) {
      setShowEmailForm(false)
      setShowCodeForm(false)
      setPartnerEmail('')
    }
  }, [pendingSentInvitation])

  // Handle conflict resolution
  const handleConflictResolve = useCallback(
    (action: 'server' | 'local' | 'dismiss') => {
      if (action === 'server') {
        // Refetch from server
        window.location.reload() // Simple approach - could be more sophisticated
      } else if (action === 'local') {
        // Keep local state (user's choice)
        setConflict(null)
      } else {
        // Dismiss
        setConflict(null)
      }
    },
    []
  )

  // Loading state
  if (partnerLoading || isUpdating) {
    return (
      <motion.div variants={itemVariants}>
        <Card padding="none">
          <CardHeader className="border-b border-border px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-muted animate-pulse" />
              <div className="flex-1">
                <div className="h-5 w-32 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>
    )
  }

  // User has partner - show connected state
  if (partnerId) {
    return (
      <motion.div variants={itemVariants}>
        <Card padding="none">
          <CardHeader className="border-b border-border px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400 fill-green-600 dark:fill-green-400" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Partner Connected</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  You're connected with your partner
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center p-6 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="text-center">
                  <Heart className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-3 fill-green-600 dark:fill-green-400" />
                  <p className="text-sm sm:text-base font-medium text-foreground mb-1">
                    Partner Connected
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    You can now share answers and collaborate together
                  </p>
                </div>
              </div>

              {/* Partner Email Section */}
              {partnerProfileLoading ? (
                <div className="p-3 sm:p-4 bg-muted/30 dark:bg-muted/20 rounded-lg sm:rounded-xl border border-border/50 animate-pulse">
                  <div className="flex items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="h-4 w-4 sm:h-5 sm:w-5 bg-muted rounded flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="h-3 w-20 bg-muted rounded mb-2" />
                        <div className="h-4 w-32 sm:w-40 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="h-9 w-16 sm:w-20 bg-muted rounded flex-shrink-0" />
                  </div>
                </div>
              ) : partnerProfile?.email ? (
                <div className="p-3 sm:p-4 bg-muted/30 dark:bg-muted/20 rounded-lg sm:rounded-xl border border-border/50">
                  <div className="flex items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">Partner Email</p>
                        <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                          {partnerProfile.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(partnerProfile.email || '')
                          toastWithPreferences.copy('Email copied!')
                        } catch (error) {
                          logError('Failed to copy email', error, 'PartnerConnectionCard')
                          toastWithPreferences.error('Failed to copy email')
                        }
                      }}
                      className="min-h-[44px] sm:min-h-0 flex-shrink-0"
                      leftIcon={<Copy className="h-4 w-4" />}
                      aria-label="Copy partner email"
                    >
                      <span className="hidden sm:inline">Copy</span>
                    </Button>
                  </div>
                </div>
              ) : null}

              <Button
                onClick={() => {
                  if (confirm('Are you sure you want to disconnect from your partner? This action cannot be undone.')) {
                    disconnectMutation.mutate()
                  }
                }}
                variant="outline"
                disabled={disconnectMutation.isPending}
                isLoading={disconnectMutation.isPending}
                className="w-full min-h-[44px] text-error hover:text-error hover:bg-error/10 border-error/20"
                leftIcon={<X className="h-4 w-4" />}
              >
                Disconnect Partner
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Pending received invitation - show accept/decline
  if (pendingReceivedInvitation) {
    return (
      <motion.div variants={itemVariants}>
        <Card padding="none">
          <CardHeader className="border-b border-border px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Partner Invitation</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  You have a pending invitation
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20">
                <p className="text-sm font-medium text-foreground mb-2">
                  Partner wants to connect with you
                </p>
                <p className="text-xs text-muted-foreground">
                  Expires {formatDistanceToNow(new Date(pendingReceivedInvitation.expires_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() =>
                    handleAction(() => {
                      acceptMutation.mutate(
                        { invitationId: pendingReceivedInvitation.id },
                        {
                          onSuccess: async () => {
                            // Force immediate UI update by resetting local state
                            setShowEmailForm(false)
                            setShowCodeForm(false)
                            // Wait a brief moment for queries to refetch
                            await new Promise((resolve) => setTimeout(resolve, 100))
                          },
                          onError: (error: Error) => {
                            // Check for conflict errors
                            if (error.message?.includes('already') || error.message?.includes('conflict')) {
                              setConflict({
                                id: pendingReceivedInvitation.id,
                                type: 'already_processed',
                                message: error.message,
                              })
                            }
                          },
                        }
                      )
                    }, `accept-${pendingReceivedInvitation.id}`)
                  }
                  disabled={acceptMutation.isPending || isUpdating}
                  isLoading={acceptMutation.isPending || isUpdating}
                  className="flex-1 min-h-[44px]"
                  leftIcon={<Check className="h-4 w-4" />}
                >
                  Accept Invitation
                </Button>
                <Button
                  onClick={() =>
                    handleAction(() => cancelMutation.mutate(pendingReceivedInvitation.id), `decline-${pendingReceivedInvitation.id}`)
                  }
                  variant="outline"
                  disabled={cancelMutation.isPending || isUpdating}
                  className="flex-1 min-h-[44px]"
                  leftIcon={<X className="h-4 w-4" />}
                >
                  Decline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Pending sent invitation - show status
  if (pendingSentInvitation) {
    const isCodeInvitation = pendingSentInvitation.invitation_type === 'code'
    const isExpired = new Date(pendingSentInvitation.expires_at) < new Date()

    return (
      <motion.div variants={itemVariants}>
        <Card padding="none">
          <CardHeader className="border-b border-border px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Pending Invitation</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Waiting for partner to accept
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-4">
              {isCodeInvitation && pendingSentInvitation.invitation_code ? (
                <div className="space-y-3">
                  <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Invitation Code</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-lg sm:text-xl font-mono font-bold text-primary bg-background px-4 py-2 rounded-lg border border-primary/30">
                        {pendingSentInvitation.invitation_code}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(pendingSentInvitation.invitation_code || '')
                            toastWithPreferences.copy('Code copied!')
                          } catch (error) {
                            logError('Failed to copy code', error, 'PartnerConnectionCard')
                            toastWithPreferences.error('Failed to copy code')
                          }
                        }}
                        className="min-h-[44px]"
                        leftIcon={<Copy className="h-4 w-4" />}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Share this code with your partner. They can enter it in their app to connect.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Invitation sent to {pendingSentInvitation.invitee_email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    They'll receive an email with instructions to connect
                  </p>
                </div>
              )}
              
              {isExpired && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    This invitation has expired. Please create a new one.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() =>
                    handleAction(() => cancelMutation.mutate(pendingSentInvitation.id), `cancel-${pendingSentInvitation.id}`)
                  }
                  variant="outline"
                  disabled={cancelMutation.isPending || isUpdating}
                  className="flex-1 min-h-[44px]"
                >
                  Cancel Invitation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // No partner, no invitations - show connection options
  // Don't show options if we're currently accepting an invitation (wait for partner status to update)
  if (acceptMutation.isPending || isUpdating) {
    return (
      <motion.div variants={itemVariants}>
        <Card padding="none">
          <CardHeader className="border-b border-border px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-muted animate-pulse" />
              <div className="flex-1">
                <div className="h-5 w-32 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div variants={itemVariants}>
      <Card padding="none">
        <CardHeader className="border-b border-border px-6 py-5 sm:px-8 sm:py-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
              <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl">Connect with Partner</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Link accounts to share answers and collaborate
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <div className="space-y-4">
            {/* Email Invitation Option */}
            {!showEmailForm && !showCodeForm && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={() => handleAction(() => setShowEmailForm(true), 'show-email-form')}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 min-h-[100px]"
                  leftIcon={<Mail className="h-5 w-5" />}
                  disabled={isUpdating}
                >
                  <span className="font-semibold">Invite by Email</span>
                  <span className="text-xs text-muted-foreground">Send invitation via email</span>
                </Button>
                <Button
                  onClick={() =>
                    handleAction(() => {
                      generateCodeMutation.mutate(undefined, {
                        onSuccess: async () => {
                          // Don't show code form - let it transition to pending invitation state
                          // The pending invitation state will show the code
                          setShowCodeForm(false)
                        },
                      })
                    }, 'generate-code')
                  }
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 min-h-[100px]"
                  disabled={generateCodeMutation.isPending || isUpdating}
                  isLoading={generateCodeMutation.isPending || isUpdating}
                  leftIcon={<QrCode className="h-5 w-5" />}
                >
                  <span className="font-semibold">Get Invitation Code</span>
                  <span className="text-xs text-muted-foreground">Share a code with your partner</span>
                </Button>
                </div>
                <div className="text-center">
                  <button
                    onClick={() => setShowCodeForm(true)}
                    className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                  >
                    Have a code? Enter it here
                  </button>
                </div>
              </div>
            )}

            {/* Email Form */}
            {showEmailForm && (
              <div className="space-y-4">
                <Input
                  label="Partner's Email"
                  type="email"
                  placeholder="partner@example.com"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  leftIcon={<Mail className="h-4 w-4" />}
                />
                <div className="flex gap-3">
                  <Button
                    onClick={() =>
                      handleAction(() => {
                        sendEmailMutation.mutate(partnerEmail, {
                          onSuccess: async () => {
                            setShowEmailForm(false)
                            setPartnerEmail('')
                            // Wait for queries to refetch and show pending state
                            await new Promise((resolve) => setTimeout(resolve, 200))
                          },
                          onError: (error: Error) => {
                            // Check for conflict errors
                            if (error.message?.includes('already') || error.message?.includes('pending')) {
                              setConflict({
                                id: 'send-email',
                                type: 'state_conflict',
                                message: error.message,
                              })
                            }
                          },
                        })
                      }, `send-email-${partnerEmail}`)
                    }
                    disabled={!partnerEmail || sendEmailMutation.isPending || isUpdating}
                    isLoading={sendEmailMutation.isPending || isUpdating}
                    className="flex-1 min-h-[44px]"
                  >
                    Send Invitation
                  </Button>
                  <Button
                    onClick={() => {
                      setShowEmailForm(false)
                      setPartnerEmail('')
                    }}
                    variant="outline"
                    className="min-h-[44px]"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Code Entry Form (for partner to enter code from someone else) */}
            {showCodeForm && !pendingSentInvitation && !generateCodeMutation.isPending && (
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Your Invitation Code</p>
                  {(generateCodeMutation.data?.invitation_code || pendingSentInvitation?.invitation_code) ? (
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-lg sm:text-xl font-mono font-bold text-primary bg-background px-4 py-2 rounded-lg border border-primary/30">
                        {pendingSentInvitation?.invitation_code || generateCodeMutation.data?.invitation_code}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const codeToCopy = pendingSentInvitation?.invitation_code || generateCodeMutation.data?.invitation_code || ''
                            await navigator.clipboard.writeText(codeToCopy)
                            toastWithPreferences.copy('Code copied!')
                          } catch (error) {
                            logError('Failed to copy code', error, 'PartnerConnectionCard')
                            toastWithPreferences.error('Failed to copy code')
                          }
                        }}
                        className="min-h-[44px]"
                        leftIcon={<Copy className="h-4 w-4" />}
                      >
                        Copy
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Generating code...</p>
                  )}
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-3">Or enter a code from your partner</p>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter invitation code"
                      value={invitationCode}
                      onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                      className="flex-1"
                      leftIcon={<QrCode className="h-4 w-4" />}
                    />
                    <Button
                      onClick={() =>
                        handleAction(() => {
                          acceptMutation.mutate(
                            { invitationCode },
                            {
                              onSuccess: async () => {
                                // Force immediate UI update by resetting local state
                                setShowEmailForm(false)
                                setShowCodeForm(false)
                                setInvitationCode('')
                                // Wait a brief moment for queries to refetch
                                await new Promise((resolve) => setTimeout(resolve, 100))
                              },
                              onError: (error: Error) => {
                                // Check for conflict errors
                                if (error.message?.includes('already') || error.message?.includes('conflict')) {
                                  setConflict({
                                    id: invitationCode,
                                    type: 'already_processed',
                                    message: error.message,
                                  })
                                }
                              },
                            }
                          )
                        }, `accept-code-${invitationCode}`)
                      }
                      disabled={!invitationCode || acceptMutation.isPending || isUpdating}
                      isLoading={acceptMutation.isPending || isUpdating}
                      className="min-h-[44px]"
                    >
                      Connect
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setShowCodeForm(false)
                    setInvitationCode('')
                  }}
                  variant="ghost"
                  className="w-full min-h-[44px]"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Conflict Resolution Banner */}
      <ConflictResolutionBanner conflict={conflict} onResolve={handleConflictResolve} />
    </motion.div>
  )
}

