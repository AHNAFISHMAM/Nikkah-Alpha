import { supabase, isSupabaseEnabled } from './supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

/**
 * Safely get the Supabase client
 * Throws an error if Supabase is not configured
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please check your environment variables.')
  }
  return supabase
}

/**
 * Check if Supabase is available before making queries
 */
export function requireSupabase(): void {
  if (!supabase || !isSupabaseEnabled) {
    throw new Error('Supabase is not configured. Please check your environment variables.')
  }
}

/**
 * Type guard to check if Supabase is available
 */
export function isSupabaseAvailable(): boolean {
  return supabase !== null && isSupabaseEnabled
}

