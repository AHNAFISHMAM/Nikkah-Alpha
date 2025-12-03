import { useMemo } from 'react'
import type { Profile } from '../types/database'
import type { ProgressStats } from './useProgressStats'
import { calculateReadinessScore } from '../lib/calculations'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: Date
}

export interface PersonalizedGreeting {
  greeting: string
  message: string
  celebration?: string
}

export interface Recommendation {
  id: string
  title: string
  description: string
  action: string
  link: string
  priority: 'high' | 'medium' | 'low'
}

/**
 * Hook to generate personalized content for user profile
 */
export function useProfilePersonalization(
  profile: Profile | null | undefined,
  stats: ProgressStats | null | undefined
) {
  // Personalized greeting based on time and context
  const greeting = useMemo((): PersonalizedGreeting => {
    if (!profile) {
      return {
        greeting: 'Welcome!',
        message: 'Complete your profile to get started',
      }
    }

    const hour = new Date().getHours()
    let timeGreeting = 'Hello'
    if (hour < 12) timeGreeting = 'Good morning'
    else if (hour < 17) timeGreeting = 'Good afternoon'
    else timeGreeting = 'Good evening'

    const firstName = profile.first_name || profile.full_name?.split(' ')[0] || 'there'
    const isReturning = profile.updated_at && 
      new Date(profile.updated_at).getTime() < Date.now() - 24 * 60 * 60 * 1000

    let message = ''
    let celebration: string | undefined

    // Celebration messages for milestones
    if (stats) {
      const readinessScore = calculateReadinessScore({
        checklistPercent: stats.checklistPercent,
        modulesCompleted: stats.modulesCompleted,
        modulesTotal: stats.modulesTotal,
        discussionsCompleted: stats.discussionsCompleted,
        discussionsTotal: stats.discussionsTotal,
      })

      if (readinessScore.overallPercent === 100) {
        celebration = '🎉 You\'re 100% ready!'
        message = 'Congratulations on completing your preparation journey!'
      } else if (readinessScore.overallPercent >= 75) {
        celebration = '🌟 Almost there!'
        message = `You're ${readinessScore.overallPercent}% ready for your blessed union`
      } else if (stats.checklistPercent >= 50) {
        message = `Great progress! You've completed ${stats.checklistPercent}% of your checklist`
      } else if (stats.modulesCompleted > 0) {
        message = `You've completed ${stats.modulesCompleted} module${stats.modulesCompleted > 1 ? 's' : ''}!`
      } else if (stats.checklistCompleted > 0) {
        message = `You've completed ${stats.checklistCompleted} checklist item${stats.checklistCompleted > 1 ? 's' : ''}!`
      } else {
        message = isReturning ? 'Welcome back! Ready to continue your journey?' : 'Let\'s start your preparation journey'
      }
    } else {
      message = isReturning ? 'Welcome back!' : 'Let\'s get started'
    }

    return {
      greeting: `${timeGreeting}, ${firstName}`,
      message,
      celebration,
    }
  }, [profile, stats])

  // Calculate achievements based on progress
  const achievements = useMemo((): Achievement[] => {
    const allAchievements: Achievement[] = [
      {
        id: 'first-checklist',
        title: 'Getting Started',
        description: 'Complete your first checklist item',
        icon: '✓',
        unlocked: (stats?.checklistCompleted || 0) > 0,
      },
      {
        id: 'checklist-25',
        title: 'Making Progress',
        description: 'Complete 25% of checklist',
        icon: '📋',
        unlocked: (stats?.checklistPercent || 0) >= 25,
      },
      {
        id: 'checklist-50',
        title: 'Halfway There',
        description: 'Complete 50% of checklist',
        icon: '🎯',
        unlocked: (stats?.checklistPercent || 0) >= 50,
      },
      {
        id: 'checklist-100',
        title: 'Checklist Master',
        description: 'Complete entire checklist',
        icon: '🏆',
        unlocked: (stats?.checklistPercent || 0) >= 100,
      },
      {
        id: 'first-module',
        title: 'Learner',
        description: 'Complete your first module',
        icon: '📚',
        unlocked: (stats?.modulesCompleted || 0) > 0,
      },
      {
        id: 'all-modules',
        title: 'Scholar',
        description: 'Complete all modules',
        icon: '🎓',
        unlocked: (stats?.modulesCompleted || 0) >= (stats?.modulesTotal || 0) && (stats?.modulesTotal || 0) > 0,
      },
      {
        id: 'first-discussion',
        title: 'Conversation Starter',
        description: 'Complete your first discussion',
        icon: '💬',
        unlocked: (stats?.discussionsCompleted || 0) > 0,
      },
      {
        id: 'budget-set',
        title: 'Planner',
        description: 'Set your wedding budget',
        icon: '💰',
        unlocked: stats?.hasBudget || false,
      },
      {
        id: 'partner-connected',
        title: 'Together',
        description: 'Connect with your partner',
        icon: '💑',
        unlocked: !!profile?.partner_name,
      },
      {
        id: 'wedding-date-set',
        title: 'Countdown Begins',
        description: 'Set your wedding date',
        icon: '📅',
        unlocked: !!profile?.wedding_date,
      },
    ]

    return allAchievements
  }, [profile, stats])

  // Generate personalized recommendations
  const recommendations = useMemo((): Recommendation[] => {
    const recs: Recommendation[] = []

    // High priority: Essential setup
    if (!profile?.first_name && !profile?.full_name) {
      recs.push({
        id: 'complete-profile',
        title: 'Complete Your Profile',
        description: 'Add your name and basic information',
        action: 'Edit Profile',
        link: '/profile',
        priority: 'high',
      })
    }

    if (!profile?.wedding_date) {
      recs.push({
        id: 'set-wedding-date',
        title: 'Set Your Wedding Date',
        description: 'Add your wedding date to track your countdown',
        action: 'Set Date',
        link: '/profile',
        priority: 'high',
      })
    }

    if (!stats?.hasBudget) {
      recs.push({
        id: 'set-budget',
        title: 'Set Your Wedding Budget',
        description: 'Plan your finances for your special day',
        action: 'Set Budget',
        link: '/financial',
        priority: 'high',
      })
    }

    // Medium priority: Progress-based
    if (stats) {
      if (stats.checklistPercent < 25 && stats.checklistCompleted === 0) {
        recs.push({
          id: 'start-checklist',
          title: 'Start Your Checklist',
          description: 'Begin completing your preparation checklist',
          action: 'View Checklist',
          link: '/checklist',
          priority: 'medium',
        })
      } else if (stats.checklistPercent < 50) {
        recs.push({
          id: 'continue-checklist',
          title: 'Continue Your Checklist',
          description: `You're ${stats.checklistPercent}% done. Keep going!`,
          action: 'Continue',
          link: '/checklist',
          priority: 'medium',
        })
      }

      if (stats.modulesCompleted === 0) {
        recs.push({
          id: 'start-modules',
          title: 'Start Learning',
          description: 'Begin your first module to learn about marriage',
          action: 'View Modules',
          link: '/learn',
          priority: 'medium',
        })
      } else if (stats.modulesCompleted < stats.modulesTotal) {
        recs.push({
          id: 'continue-modules',
          title: 'Continue Learning',
          description: `Complete ${stats.modulesTotal - stats.modulesCompleted} more module${stats.modulesTotal - stats.modulesCompleted > 1 ? 's' : ''}`,
          action: 'Continue',
          link: '/learn',
          priority: 'medium',
        })
      }

      if (stats.discussionsCompleted === 0) {
        recs.push({
          id: 'start-discussions',
          title: 'Start Discussions',
          description: 'Have important conversations with your partner',
          action: 'View Discussions',
          link: '/discuss',
          priority: 'medium',
        })
      } else if (stats.discussionsCompleted < stats.discussionsTotal) {
        recs.push({
          id: 'continue-discussions',
          title: 'Continue Discussions',
          description: `Complete ${stats.discussionsTotal - stats.discussionsCompleted} more discussion${stats.discussionsTotal - stats.discussionsCompleted > 1 ? 's' : ''}`,
          action: 'Continue',
          link: '/discuss',
          priority: 'medium',
        })
      }
    }

    // Partner connection
    if (!profile?.partner_name) {
      recs.push({
        id: 'connect-partner',
        title: 'Connect with Partner',
        description: 'Invite your partner to join and collaborate',
        action: 'Connect',
        link: '/profile',
        priority: 'medium',
      })
    }

    // Low priority: Enhancements
    if (stats && stats.checklistPercent >= 75) {
      recs.push({
        id: 'review-progress',
        title: 'Review Your Progress',
        description: 'You\'re doing great! Review your dashboard',
        action: 'View Dashboard',
        link: '/dashboard',
        priority: 'low',
      })
    }

    // Sort by priority: high -> medium -> low
    return recs.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }, [profile, stats])

  // Get next step (highest priority recommendation)
  const nextStep = useMemo(() => {
    return recommendations[0] || null
  }, [recommendations])

  return {
    greeting,
    achievements,
    recommendations,
    nextStep,
  }
}

