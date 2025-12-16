// Database types matching the existing Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          first_name: string | null
          last_name: string | null
          date_of_birth: string | null
          age: number | null
          gender: 'male' | 'female' | 'prefer_not_to_say' | null
          marital_status: 'Single' | 'Engaged' | 'Researching' | null
          country: string | null
          city: string | null
          partner_name: string | null
          partner_email: string | null
          partner_using_app: boolean | null
          avatar_url: string | null
          partner_status: 'searching' | 'engaged' | 'planning' | null
          wedding_date: string | null
          profile_visibility: 'public' | 'private' | null
          green_theme: 'emerald' | 'forest' | 'mint' | 'sage' | 'jade' | null
          theme_mode: 'light' | 'dark' | 'system' | null
          notification_preferences: Json | null
          role: 'user' | 'admin' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          first_name?: string | null
          last_name?: string | null
          date_of_birth?: string | null
          age?: number | null
          gender?: 'male' | 'female' | 'prefer_not_to_say' | null
          marital_status?: 'Single' | 'Engaged' | 'Researching' | null
          country?: string | null
          city?: string | null
          partner_name?: string | null
          partner_email?: string | null
          partner_using_app?: boolean | null
          avatar_url?: string | null
          partner_status?: 'searching' | 'engaged' | 'planning' | null
          wedding_date?: string | null
          profile_visibility?: 'public' | 'private' | null
          green_theme?: 'emerald' | 'forest' | 'mint' | 'sage' | 'jade' | null
          theme_mode?: 'light' | 'dark' | 'system' | null
          notification_preferences?: Json | null
          role?: 'user' | 'admin' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          first_name?: string | null
          last_name?: string | null
          date_of_birth?: string | null
          age?: number | null
          gender?: 'male' | 'female' | 'prefer_not_to_say' | null
          marital_status?: 'Single' | 'Engaged' | 'Researching' | null
          country?: string | null
          city?: string | null
          partner_name?: string | null
          partner_email?: string | null
          partner_using_app?: boolean | null
          avatar_url?: string | null
          partner_status?: 'searching' | 'engaged' | 'planning' | null
          wedding_date?: string | null
          profile_visibility?: 'public' | 'private' | null
          green_theme?: 'emerald' | 'forest' | 'mint' | 'sage' | 'jade' | null
          theme_mode?: 'light' | 'dark' | 'system' | null
          notification_preferences?: Json | null
          role?: 'user' | 'admin' | null
          created_at?: string
          updated_at?: string
        }
      }
      app_settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          updated_at?: string
        }
      }
      checklist_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      checklist_items: {
        Row: {
          id: string
          category_id: string
          title: string
          description: string | null
          is_required: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          title: string
          description?: string | null
          is_required?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          title?: string
          description?: string | null
          is_required?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      user_checklist_progress: {
        Row: {
          id: string
          user_id: string
          item_id: string
          is_completed: boolean
          completed_at: string | null
          notes: string | null
          discuss_with_partner: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          is_completed?: boolean
          completed_at?: string | null
          notes?: string | null
          discuss_with_partner?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          is_completed?: boolean
          completed_at?: string | null
          notes?: string | null
          discuss_with_partner?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          title: string
          description: string | null
          content: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          content: string | null
          video_url: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          content?: string | null
          video_url?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          title?: string
          content?: string | null
          video_url?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_module_progress: {
        Row: {
          id: string
          user_id: string
          module_id: string
          lesson_id: string | null
          is_completed: boolean
          completed_at: string | null
          quiz_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id: string
          lesson_id?: string | null
          is_completed?: boolean
          completed_at?: string | null
          quiz_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: string
          lesson_id?: string | null
          is_completed?: boolean
          completed_at?: string | null
          quiz_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      discussion_prompts: {
        Row: {
          id: string
          category: string
          title: string
          description: string | null
          questions: Json
          tips: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          title: string
          description?: string | null
          questions?: Json
          tips?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          title?: string
          description?: string | null
          questions?: Json
          tips?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      user_discussion_answers: {
        Row: {
          id: string
          user_id: string
          prompt_id: string
          answer: string | null
          is_discussed: boolean
          follow_up_notes: string | null
          discussed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt_id: string
          answer?: string | null
          is_discussed?: boolean
          follow_up_notes?: string | null
          discussed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt_id?: string
          answer?: string | null
          is_discussed?: boolean
          follow_up_notes?: string | null
          discussed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      couples: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          relationship_status: 'engaged' | 'married' | 'preparing'
          connected_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          relationship_status?: 'engaged' | 'married' | 'preparing'
          connected_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          relationship_status?: 'engaged' | 'married' | 'preparing'
          connected_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      partner_invitations: {
        Row: {
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
        Insert: {
          id?: string
          inviter_id: string
          invitee_email?: string | null
          invitation_code?: string | null
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          invitation_type: 'email' | 'code'
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          inviter_id?: string
          invitee_email?: string | null
          invitation_code?: string | null
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          invitation_type?: 'email' | 'code'
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          related_entity_type: string | null
          related_entity_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          related_entity_type?: string | null
          related_entity_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          related_entity_type?: string | null
          related_entity_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      user_discussion_notes: {
        Row: {
          id: string
          user_id: string
          prompt_id: string
          notes: string | null
          is_discussed: boolean
          discussed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt_id: string
          notes?: string | null
          is_discussed?: boolean
          discussed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt_id?: string
          notes?: string | null
          is_discussed?: boolean
          discussed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          title: string
          description: string | null
          url: string
          category: 'Books' | 'Scholarly' | 'Counseling' | 'Finance' | 'Duas' | 'Courses'
          is_featured: boolean
          order_index: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          url: string
          category: 'Books' | 'Scholarly' | 'Counseling' | 'Finance' | 'Duas' | 'Courses'
          is_featured?: boolean
          order_index?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          url?: string
          category?: 'Books' | 'Scholarly' | 'Counseling' | 'Finance' | 'Duas' | 'Courses'
          is_featured?: boolean
          order_index?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      user_resource_favorites: {
        Row: {
          id: string
          user_id: string
          resource_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource_id?: string
          created_at?: string
        }
      }
      user_saved_resources: {
        Row: {
          id: string
          user_id: string
          resource_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource_id?: string
          created_at?: string
        }
      }
      user_financial_data: {
        Row: {
          id: string
          user_id: string
          data_type: 'mahr' | 'budget' | 'savings' | 'cost_split'
          data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          data_type: 'mahr' | 'budget' | 'savings' | 'cost_split'
          data: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          data_type?: 'mahr' | 'budget' | 'savings' | 'cost_split'
          data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          income_his: number
          income_hers: number
          expense_housing: number
          expense_utilities: number
          expense_transportation: number
          expense_food: number
          expense_insurance: number
          expense_debt: number
          expense_entertainment: number
          expense_dining: number
          expense_clothing: number
          expense_gifts: number
          expense_charity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          income_his?: number
          income_hers?: number
          expense_housing?: number
          expense_utilities?: number
          expense_transportation?: number
          expense_food?: number
          expense_insurance?: number
          expense_debt?: number
          expense_entertainment?: number
          expense_dining?: number
          expense_clothing?: number
          expense_gifts?: number
          expense_charity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          income_his?: number
          income_hers?: number
          expense_housing?: number
          expense_utilities?: number
          expense_transportation?: number
          expense_food?: number
          expense_insurance?: number
          expense_debt?: number
          expense_entertainment?: number
          expense_dining?: number
          expense_clothing?: number
          expense_gifts?: number
          expense_charity?: number
          created_at?: string
          updated_at?: string
        }
      }
      mahr: {
        Row: {
          id: string
          user_id: string
          amount: number
          amount_paid: number
          status: 'Paid' | 'Pending' | 'Partial'
          deferred_schedule: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount?: number
          amount_paid?: number
          status?: 'Paid' | 'Pending' | 'Partial'
          deferred_schedule?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          amount_paid?: number
          status?: 'Paid' | 'Pending' | 'Partial'
          deferred_schedule?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      wedding_budgets: {
        Row: {
          id: string
          user_id: string
          venue_planned: number
          venue_spent: number
          catering_planned: number
          catering_spent: number
          photography_planned: number
          photography_spent: number
          clothing_planned: number
          clothing_spent: number
          decor_planned: number
          decor_spent: number
          invitations_planned: number
          invitations_spent: number
          other_planned: number
          other_spent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          venue_planned?: number
          venue_spent?: number
          catering_planned?: number
          catering_spent?: number
          photography_planned?: number
          photography_spent?: number
          clothing_planned?: number
          clothing_spent?: number
          decor_planned?: number
          decor_spent?: number
          invitations_planned?: number
          invitations_spent?: number
          other_planned?: number
          other_spent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          venue_planned?: number
          venue_spent?: number
          catering_planned?: number
          catering_spent?: number
          photography_planned?: number
          photography_spent?: number
          clothing_planned?: number
          clothing_spent?: number
          decor_planned?: number
          decor_spent?: number
          invitations_planned?: number
          invitations_spent?: number
          other_planned?: number
          other_spent?: number
          created_at?: string
          updated_at?: string
        }
      }
      savings_goals: {
        Row: {
          id: string
          user_id: string
          emergency_fund_goal: number
          emergency_fund_current: number
          house_goal: number
          house_current: number
          other_goal_name: string | null
          other_goal_amount: number
          other_goal_current: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          emergency_fund_goal?: number
          emergency_fund_current?: number
          house_goal?: number
          house_current?: number
          other_goal_name?: string | null
          other_goal_amount?: number
          other_goal_current?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          emergency_fund_goal?: number
          emergency_fund_current?: number
          house_goal?: number
          house_current?: number
          other_goal_name?: string | null
          other_goal_amount?: number
          other_goal_current?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: 'light' | 'dark' | 'system'
          notifications_enabled: boolean
          email_updates: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: 'light' | 'dark' | 'system'
          notifications_enabled?: boolean
          email_updates?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: 'light' | 'dark' | 'system'
          notifications_enabled?: boolean
          email_updates?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      partner_status: 'searching' | 'engaged' | 'planning'
      content_type: 'article' | 'video' | 'audio' | 'pdf' | 'link'
      financial_data_type: 'mahr' | 'budget' | 'savings' | 'cost_split'
      theme_preference: 'light' | 'dark' | 'system'
      user_role: 'user' | 'admin'
    }
  }
}

// Notification Preferences Type
export interface NotificationPreferences {
  toasts_enabled: boolean
  categories: {
    success: boolean
    error: boolean
    reminders: boolean
    milestones: boolean
    auto_save: boolean
    network: boolean
    export: boolean
    copy: boolean
  }
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row'] & {
  is_admin?: boolean // Computed helper: role === 'admin'
  notification_preferences?: NotificationPreferences // Typed notification preferences
}
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type ChecklistCategory = Database['public']['Tables']['checklist_categories']['Row']
export type ChecklistItem = Database['public']['Tables']['checklist_items']['Row']
export type UserChecklistProgress = Database['public']['Tables']['user_checklist_progress']['Row']

export type Module = Database['public']['Tables']['modules']['Row']
export type Lesson = Database['public']['Tables']['lessons']['Row']
export type UserModuleProgress = Database['public']['Tables']['user_module_progress']['Row']

export type DiscussionPrompt = Database['public']['Tables']['discussion_prompts']['Row']
export type UserDiscussionNote = Database['public']['Tables']['user_discussion_notes']['Row']

export type Resource = Database['public']['Tables']['resources']['Row']
export type UserResourceFavorite = Database['public']['Tables']['user_resource_favorites']['Row']
export type UserSavedResource = Database['public']['Tables']['user_saved_resources']['Row']

export type UserFinancialData = Database['public']['Tables']['user_financial_data']['Row']
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']

export type AppSettings = Database['public']['Tables']['app_settings']['Row']

// Extended types with relations
export interface ChecklistCategoryWithItems extends ChecklistCategory {
  items: ChecklistItem[]
}

export interface ChecklistItemWithProgress extends ChecklistItem {
  progress?: UserChecklistProgress
}

export interface ModuleWithLessons extends Module {
  lessons: Lesson[]
}

export interface ModuleWithProgress extends Module {
  progress?: UserModuleProgress[]
  completedLessons: number
  totalLessons: number
}

export interface DiscussionPromptWithNotes extends DiscussionPrompt {
  notes?: UserDiscussionNote
}

export interface ResourceWithSaved extends Resource {
  isSaved: boolean
}
