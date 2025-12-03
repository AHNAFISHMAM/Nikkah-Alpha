import { useEffect, useRef } from 'react'
import { toastWithPreferences } from '../lib/toast'
import confetti from 'canvas-confetti'
import { useAuth } from '../contexts/AuthContext'
import { useProgressStats } from './useProgressStats'
import { usePendingTasks } from './usePendingTasks'
import { useWeddingBudget } from './useWeddingBudget'
import { useModulesWithProgress } from './useModules'
import type { ModuleWithProgress } from './useModules'
import { calculateReadinessScore } from '../lib/calculations'

interface ReminderConfig {
  enabled: boolean
  lastShown: number | null
  cooldown: number // milliseconds between reminders
}

const REMINDER_COOLDOWN = {
  DAILY: 24 * 60 * 60 * 1000, // 24 hours
  WEEKLY: 7 * 24 * 60 * 60 * 1000, // 7 days
  MILESTONE: 0, // Show immediately for milestones
}

/**
 * Hook for gentle, proactive reminders throughout the app
 * Shows helpful nudges without being intrusive
 */
export function useGentleReminders() {
  const { user, profile } = useAuth()
  const { data: stats } = useProgressStats(user?.id)
  const { data: pendingTasks } = usePendingTasks(user?.id)
  const { data: weddingBudgetData } = useWeddingBudget()
  const { data: modules } = useModulesWithProgress()
  
  const remindersShownRef = useRef<Map<string, number>>(new Map())

  // Check if reminder should be shown (respects cooldown)
  const shouldShowReminder = (key: string, cooldown: number): boolean => {
    const lastShown = remindersShownRef.current.get(key)
    if (!lastShown) return true
    return Date.now() - lastShown >= cooldown
  }

  // Mark reminder as shown
  const markReminderShown = (key: string) => {
    remindersShownRef.current.set(key, Date.now())
  }

  useEffect(() => {
    if (!user || !stats) return

    const weddingDate = profile?.wedding_date ? new Date(profile.wedding_date) : null
    const daysUntilWedding = weddingDate
      ? Math.ceil((weddingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null

    // Wedding Date Milestone Reminders
    if (weddingDate && daysUntilWedding && daysUntilWedding > 0) {
      if (daysUntilWedding === 30 && shouldShowReminder('wedding-30-days', REMINDER_COOLDOWN.MILESTONE)) {
        toastWithPreferences.reminder(
          `✨ 30 days until your wedding! Time to finalize the details.`,
          {
            icon: '📅',
            duration: 5000,
          }
        )
        markReminderShown('wedding-30-days')
      } else if (daysUntilWedding === 7 && shouldShowReminder('wedding-7-days', REMINDER_COOLDOWN.MILESTONE)) {
        toastWithPreferences.reminder(
          `🎉 One week to go! You're almost there. Make sure everything is ready!`,
          {
            icon: '💍',
            duration: 5000,
          }
        )
        markReminderShown('wedding-7-days')
      } else if (daysUntilWedding === 1 && shouldShowReminder('wedding-1-day', REMINDER_COOLDOWN.MILESTONE)) {
        toastWithPreferences.reminder(
          `🌟 Tomorrow is the big day! May Allah bless your union.`,
          {
            icon: '✨',
            duration: 6000,
          }
        )
        markReminderShown('wedding-1-day')
      }
    }

    // Readiness Score Milestone Celebrations
    const readinessScore = calculateReadinessScore({
      checklistPercent: stats.checklistPercent,
      modulesCompleted: stats.modulesCompleted,
      modulesTotal: stats.modulesTotal,
      discussionsCompleted: stats.discussionsCompleted,
      discussionsTotal: stats.discussionsTotal,
    })

    const milestones = [25, 50, 75, 100]
    milestones.forEach((milestone) => {
      const key = `readiness-${milestone}`
      if (
        readinessScore.overallPercent >= milestone &&
        readinessScore.overallPercent < milestone + 5 && // Show within 5% of milestone
        shouldShowReminder(key, REMINDER_COOLDOWN.MILESTONE)
      ) {
        const messages = {
          25: { text: "You've reached 25% readiness! Keep going! 🌱", icon: '🌱' },
          50: { text: "Halfway there! 50% readiness achieved! 🎯", icon: '🎯' },
          75: { text: "Almost ready! 75% completion - you're doing amazing! ⭐", icon: '⭐' },
          100: { text: "Perfect! 100% readiness - you're fully prepared! 🎊", icon: '🎊' },
        }
        const message = messages[milestone as keyof typeof messages]
        
        // Celebrate with confetti for milestones
        if (milestone >= 50) {
          confetti({
            particleCount: milestone === 100 ? 200 : 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'],
          })
        }
        
        toastWithPreferences.milestone(message.text, {
          icon: message.icon,
          duration: 5000,
        })
        markReminderShown(key)
      }
    })

    // Pending Tasks Reminder (gentle nudge)
    if (pendingTasks && pendingTasks.length > 0) {
      const requiredTasks = pendingTasks.filter(task => task.is_required)
      if (requiredTasks.length > 0 && shouldShowReminder('pending-required-tasks', REMINDER_COOLDOWN.DAILY)) {
        toastWithPreferences.reminder(
          `💡 You have ${requiredTasks.length} required ${requiredTasks.length === 1 ? 'task' : 'tasks'} pending. Consider completing them soon.`,
          {
            icon: '📋',
            duration: 4000,
          }
        )
        markReminderShown('pending-required-tasks')
      }
    }

    // Module Completion Nudge
    if (modules && Array.isArray(modules) && modules.length > 0 && stats.modulesTotal > 0) {
      const completionRate = (stats.modulesCompleted / stats.modulesTotal) * 100
      if (
        completionRate < 50 &&
        stats.modulesCompleted < stats.modulesTotal &&
        shouldShowReminder('module-completion-nudge', REMINDER_COOLDOWN.WEEKLY)
      ) {
        toastWithPreferences.reminder(
          `📚 You've completed ${stats.modulesCompleted} of ${stats.modulesTotal} modules. Continue learning to strengthen your preparation!`,
          {
            icon: '📖',
            duration: 4000,
          }
        )
        markReminderShown('module-completion-nudge')
      }
    }

    // Budget Reminder (if budget is set but incomplete)
    if (weddingBudgetData) {
      const hasBudget = Object.values(weddingBudgetData).some(
        (value) => typeof value === 'number' && value > 0
      )
      if (hasBudget && shouldShowReminder('budget-review', REMINDER_COOLDOWN.WEEKLY)) {
        toastWithPreferences.reminder(
          `💰 Remember to review your wedding budget regularly to stay on track.`,
          {
            icon: '💵',
            duration: 4000,
          }
        )
        markReminderShown('budget-review')
      }
    }

    // Discussion Reminder
    if (stats.discussionsTotal > 0) {
      const discussionRate = (stats.discussionsCompleted / stats.discussionsTotal) * 100
      if (
        discussionRate < 50 &&
        stats.discussionsCompleted < stats.discussionsTotal &&
        shouldShowReminder('discussion-nudge', REMINDER_COOLDOWN.WEEKLY)
      ) {
        toastWithPreferences.reminder(
          `💬 Have you discussed important topics with your partner? ${stats.discussionsCompleted} of ${stats.discussionsTotal} discussions completed.`,
          {
            icon: '💭',
            duration: 4000,
          }
        )
        markReminderShown('discussion-nudge')
      }
    }
  }, [user, profile, stats, pendingTasks, weddingBudgetData, modules])
}

