import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { logError } from '../lib/error-handler'
import { toastWithPreferences } from '../lib/toast'
import { useMutationDeduplication } from '../utils/mutationDeduplication'

export interface PartnerInvitation {
  id: string
  inviter_id: string
  invitee_email: string | null
  invitation_code: string | null
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  invitation_type: 'email' | 'code'
  expires_at: string
  accepted_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Hook to fetch user's sent invitations
 */
export function useSentInvitations() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['partner-invitations', 'sent', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      if (!supabase) throw new Error('Supabase is not configured')

      const { data, error } = await supabase
        .from('partner_invitations')
        .select('*')
        .eq('inviter_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        logError(error, 'useSentInvitations')
        throw error
      }

      return (data || []) as PartnerInvitation[]
    },
    enabled: !!user?.id,
    staleTime: 0, // Always refetch when invalidated (for real-time updates)
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to fetch user's received invitations (by email)
 */
export function useReceivedInvitations() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['partner-invitations', 'received', user?.id],
    queryFn: async () => {
      if (!user?.id || !user?.email) return []
      if (!supabase) throw new Error('Supabase is not configured')

      const { data, error } = await supabase
        .from('partner_invitations')
        .select('*')
        .eq('invitee_email', user.email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        logError(error, 'useReceivedInvitations')
        throw error
      }

      return (data || []) as PartnerInvitation[]
    },
    enabled: !!user?.id && !!user?.email,
    staleTime: 0, // Always refetch when invalidated (for real-time updates)
    refetchOnWindowFocus: true,
  })
}

/**
 * Hook to send email invitation
 */
export function useSendEmailInvitation() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { shouldAllow, clear } = useMutationDeduplication()

  return useMutation({
    mutationFn: async (partnerEmail: string) => {
      if (!user?.id) throw new Error('User not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      // Deduplication: prevent duplicate sends
      const emailKey = partnerEmail.toLowerCase().trim()
      if (!shouldAllow('send_email', emailKey, 2000)) {
        throw new Error('Please wait before sending another invitation to this email')
      }

      // Check if user already has a partner
      const { data: existingPartner } = await supabase.rpc('get_partner_id', {
        current_user_id: user.id,
      })

      if (existingPartner) {
        throw new Error('You already have a partner connected')
      }

      // Check if email is valid
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(partnerEmail)) {
        throw new Error('Please enter a valid email address')
      }

      // Check if user is trying to invite themselves
      if (partnerEmail.toLowerCase().trim() === user.email?.toLowerCase()) {
        throw new Error('You cannot invite yourself')
      }

      // Check rate limit
      const { data: rateLimitCheck, error: rateLimitError } = await supabase.rpc('check_invitation_rate_limit', {
        p_user_id: user.id,
        p_max_per_day: 10,
        p_max_failed_attempts: 5,
      })

      if (rateLimitError) {
        logError(rateLimitError, 'useSendEmailInvitation.rateLimit')
        throw new Error('Failed to check rate limit')
      }

      if (!rateLimitCheck?.allowed) {
        throw new Error(rateLimitCheck?.message || 'Rate limit exceeded. Please try again later.')
      }

      // Create invitation
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

      const { data, error } = await supabase
        .from('partner_invitations')
        .insert({
          inviter_id: user.id,
          invitee_email: partnerEmail.toLowerCase().trim(),
          invitation_type: 'email',
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single()

      if (error) {
        logError(error, 'useSendEmailInvitation')
        // Handle unique constraint violation (one active invitation per user)
        if (error.code === '23505') {
          throw new Error('You already have a pending invitation. Please cancel it first.')
        }
        throw error
      }

      // Create audit log
      try {
        await supabase.rpc('create_audit_log', {
          p_user_id: user.id,
          p_action: 'invitation_sent',
          p_entity_type: 'partner_invitation',
          p_entity_id: data.id,
          p_metadata: { invitation_type: 'email', invitee_email: partnerEmail },
        })
      } catch (auditError) {
        // Non-critical, log but don't fail
        console.warn('Failed to create audit log:', auditError)
      }

      return data as PartnerInvitation
    },
    onSuccess: async (data, partnerEmail) => {
      // Clear deduplication record on success
      clear('send_email', partnerEmail.toLowerCase().trim())
      
      // Invalidate and refetch sent invitations to show pending state
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['partner-invitations', 'sent', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['partner-invitations', 'received', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['partner', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] }),
      ])
      
      // Force immediate refetch to update UI
      await queryClient.refetchQueries({ 
        queryKey: ['partner-invitations', 'sent', user?.id],
        type: 'active',
      })
      
      toastWithPreferences.success('Invitation sent! Your partner will receive an email.')
    },
    onError: (error: Error, partnerEmail) => {
      // Clear deduplication record on error so user can retry
      clear('send_email', partnerEmail.toLowerCase().trim())
      toastWithPreferences.error(error.message || 'Failed to send invitation')
    },
  })
}

/**
 * Hook to generate invitation code
 */
export function useGenerateInvitationCode() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { shouldAllow, clear } = useMutationDeduplication()

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      // Deduplication: prevent duplicate code generation
      if (!shouldAllow('generate_code', user.id, 2000)) {
        throw new Error('Please wait before generating another code')
      }

      // Check if user already has a partner
      const { data: existingPartner } = await supabase.rpc('get_partner_id', {
        current_user_id: user.id,
      })

      if (existingPartner) {
        throw new Error('You already have a partner connected')
      }

      // Check rate limit
      const { data: rateLimitCheck, error: rateLimitError } = await supabase.rpc('check_invitation_rate_limit', {
        p_user_id: user.id,
        p_max_per_day: 10,
        p_max_failed_attempts: 5,
      })

      if (rateLimitError) {
        logError(rateLimitError, 'useGenerateInvitationCode.rateLimit')
        throw new Error('Failed to check rate limit')
      }

      if (!rateLimitCheck?.allowed) {
        throw new Error(rateLimitCheck?.message || 'Rate limit exceeded. Please try again later.')
      }

      // Generate code using RPC function
      const { data: code, error: codeError } = await supabase.rpc('generate_invitation_code')

      if (codeError) {
        logError(codeError, 'useGenerateInvitationCode.generateCode')
        throw codeError
      }

      // Create invitation with code
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

      const { data, error } = await supabase
        .from('partner_invitations')
        .insert({
          inviter_id: user.id,
          invitation_code: code,
          invitation_type: 'code',
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single()

      if (error) {
        logError(error, 'useGenerateInvitationCode.createInvitation')
        // Handle unique constraint violation (one active invitation per user)
        if (error.code === '23505') {
          throw new Error('You already have a pending invitation. Please cancel it first.')
        }
        throw error
      }

      // Create audit log
      try {
        await supabase.rpc('create_audit_log', {
          p_user_id: user.id,
          p_action: 'invitation_code_generated',
          p_entity_type: 'partner_invitation',
          p_entity_id: data.id,
          p_metadata: { invitation_type: 'code', invitation_code: code },
        })
      } catch (auditError) {
        // Non-critical, log but don't fail
        console.warn('Failed to create audit log:', auditError)
      }

      return data as PartnerInvitation
    },
    onSuccess: async () => {
      // Clear deduplication record on success
      clear('generate_code', user.id)
      
      // Invalidate and refetch sent invitations to show pending state
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['partner-invitations', 'sent', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['partner-invitations', 'received', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['partner', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] }),
      ])
      
      // Force immediate refetch to update UI
      await queryClient.refetchQueries({ 
        queryKey: ['partner-invitations', 'sent', user?.id],
        type: 'active',
      })
    },
    onError: (error: Error) => {
      // Clear deduplication record on error so user can retry
      clear('generate_code', user.id)
      toastWithPreferences.error(error.message || 'Failed to generate invitation code')
    },
  })
}

/**
 * Hook to accept invitation (by ID or code)
 */
export function useAcceptInvitation() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { shouldAllow, clear } = useMutationDeduplication()

  return useMutation({
    mutationFn: async ({ invitationId, invitationCode }: { invitationId?: string; invitationCode?: string }) => {
      if (!user?.id) throw new Error('User not authenticated')
      if (!supabase) throw new Error('Supabase is not configured')

      // Deduplication: prevent duplicate accept attempts
      const acceptKey = invitationId || invitationCode || 'unknown'
      if (!shouldAllow('accept', acceptKey, 2000)) {
        throw new Error('Please wait before trying again')
      }

      let invitationIdToUse = invitationId

      // If code provided, find invitation by code
      if (invitationCode && !invitationId) {
        const { data: invitation, error: findError } = await supabase
          .from('partner_invitations')
          .select('id')
          .eq('invitation_code', invitationCode.toUpperCase().trim())
          .eq('status', 'pending')
          .gt('expires_at', new Date().toISOString())
          .single()

        if (findError || !invitation) {
          // Record failed attempt for brute force protection
          try {
            await supabase.rpc('record_failed_invitation_attempt', {
              p_user_id: user.id,
            })
          } catch (recordError) {
            // Non-critical, log but don't fail
            console.warn('Failed to record failed attempt:', recordError)
          }
          throw new Error('Invalid or expired invitation code')
        }

        invitationIdToUse = invitation.id
      }

      if (!invitationIdToUse) {
        throw new Error('Invitation ID or code required')
      }

      // Accept invitation using RPC function
      const { data, error } = await supabase.rpc('accept_partner_invitation', {
        invitation_id_param: invitationIdToUse,
        current_user_id_param: user.id,
      })

      if (error) {
        logError(error, 'useAcceptInvitation')
        // Record failed attempt if it's a validation error
        if (error.message?.includes('Invalid') || error.message?.includes('expired') || error.message?.includes('already')) {
          try {
            await supabase.rpc('record_failed_invitation_attempt', {
              p_user_id: user.id,
            })
          } catch (recordError) {
            // Non-critical
            console.warn('Failed to record failed attempt:', recordError)
          }
        }
        throw error
      }

      return data
    },
    onMutate: async ({ invitationId, invitationCode }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['partner', user?.id] })
      await queryClient.cancelQueries({ queryKey: ['partner-invitations', 'sent', user?.id] })
      await queryClient.cancelQueries({ queryKey: ['partner-invitations', 'received', user?.id] })
      
      // Snapshot previous values for rollback
      const previousPartner = queryClient.getQueryData(['partner', user?.id])
      const previousSentInvitations = queryClient.getQueryData(['partner-invitations', 'sent', user?.id])
      const previousReceivedInvitations = queryClient.getQueryData(['partner-invitations', 'received', user?.id])
      
      return { previousPartner, previousSentInvitations, previousReceivedInvitations, invitationId, invitationCode }
    },
    onSuccess: async (partnerId, variables, context) => {
      // Clear deduplication record on success
      const acceptKey = context?.invitationId || context?.invitationCode || 'unknown'
      clear('accept', acceptKey)
      
      console.log('[useAcceptInvitation] Success! Partner ID:', partnerId)
      
      // Optimistically set partner ID for immediate UI update
      if (partnerId) {
        queryClient.setQueryData(['partner', user?.id], partnerId)
        console.log('[useAcceptInvitation] Set partner ID in cache:', partnerId)
      }
      
      // Invalidate and refetch all related queries with correct keys
      // Use invalidateQueries to trigger React Query to refetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['partner', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['partner-profile'] }),
        queryClient.invalidateQueries({ queryKey: ['profile', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['partner-invitations', 'sent', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['partner-invitations', 'received', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['discussions', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count', user?.id] }),
      ])
      
      // Force immediate refetch of partner status (this will update the UI)
      await queryClient.refetchQueries({ 
        queryKey: ['partner', user?.id],
        type: 'active', // Only refetch active queries
      })
      
      // Also refetch invitations to clear pending states
      await Promise.all([
        queryClient.refetchQueries({ 
          queryKey: ['partner-invitations', 'sent', user?.id],
          type: 'active',
        }),
        queryClient.refetchQueries({ 
          queryKey: ['partner-invitations', 'received', user?.id],
          type: 'active',
        }),
      ])
      
      console.log('[useAcceptInvitation] Queries invalidated and refetched')
      
      toastWithPreferences.milestone('🎉 Partner connected successfully!')
    },
    onError: (error: Error, variables, context) => {
      // Clear deduplication record on error so user can retry
      const acceptKey = variables.invitationId || variables.invitationCode || 'unknown'
      clear('accept', acceptKey)
      
      // Rollback optimistic updates on error
      if (context?.previousPartner) {
        queryClient.setQueryData(['partner', user?.id], context.previousPartner)
      }
      if (context?.previousSentInvitations) {
        queryClient.setQueryData(['partner-invitations', 'sent', user?.id], context.previousSentInvitations)
      }
      if (context?.previousReceivedInvitations) {
        queryClient.setQueryData(['partner-invitations', 'received', user?.id], context.previousReceivedInvitations)
      }
      
      toastWithPreferences.error(error.message || 'Failed to accept invitation')
    },
  })
}

/**
 * Hook to cancel/decline invitation
 */
export function useCancelInvitation() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { shouldAllow, clear } = useMutationDeduplication()

  return useMutation({
    mutationFn: async (invitationId: string) => {
      if (!supabase) throw new Error('Supabase is not configured')
      if (!user?.id) throw new Error('User not authenticated')

      // Deduplication: prevent duplicate cancel attempts
      if (!shouldAllow('cancel', invitationId, 2000)) {
        throw new Error('Please wait before trying again')
      }

      const { error } = await supabase
        .from('partner_invitations')
        .update({ status: 'declined', updated_at: new Date().toISOString() })
        .eq('id', invitationId)

      if (error) {
        logError(error, 'useCancelInvitation')
        throw error
      }

      // Create audit log
      try {
        await supabase.rpc('create_audit_log', {
          p_user_id: user.id,
          p_action: 'invitation_declined',
          p_entity_type: 'partner_invitation',
          p_entity_id: invitationId,
          p_metadata: null,
        })
      } catch (auditError) {
        // Non-critical, log but don't fail
        console.warn('Failed to create audit log:', auditError)
      }
    },
    onSuccess: async (_, invitationId) => {
      // Clear deduplication record on success
      clear('cancel', invitationId)
      
      // Invalidate and refetch invitations to update UI
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['partner-invitations', 'sent', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['partner-invitations', 'received', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['partner', user?.id] }),
      ])
      
      // Force immediate refetch
      await Promise.all([
        queryClient.refetchQueries({ 
          queryKey: ['partner-invitations', 'sent', user?.id],
          type: 'active',
        }),
        queryClient.refetchQueries({ 
          queryKey: ['partner-invitations', 'received', user?.id],
          type: 'active',
        }),
      ])
      
      toastWithPreferences.success('Invitation cancelled')
    },
    onError: (_, invitationId) => {
      // Clear deduplication record on error so user can retry
      clear('cancel', invitationId)
      toastWithPreferences.error('Failed to cancel invitation')
    },
  })
}

