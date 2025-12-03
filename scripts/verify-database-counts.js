/**
 * Database Count Verification Script
 * Verifies that all required data exists in the database
 * Run: node scripts/verify-database-counts.js
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })
dotenv.config({ path: join(__dirname, '..', '.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const SUCCESS_CRITERIA = {
  checklistItems: { min: 30, expected: 31 },
  modules: { min: 5, expected: 5 },
  discussionPrompts: { min: 15, expected: 16 },
  resources: { min: 15, expected: 24 },
}

async function verifyCounts() {
  console.log('🔍 Verifying database counts...\n')

  const results = {
    checklistItems: { count: 0, status: 'pending' },
    modules: { count: 0, status: 'pending' },
    discussionPrompts: { count: 0, status: 'pending' },
    resources: { count: 0, status: 'pending' },
  }

  try {
    // Check checklist items
    const { count: checklistCount, error: checklistError } = await supabase
      .from('checklist_items')
      .select('*', { count: 'exact', head: true })

    if (checklistError) {
      console.error('❌ Error checking checklist_items:', checklistError.message)
      results.checklistItems.status = 'error'
    } else {
      results.checklistItems.count = checklistCount || 0
      results.checklistItems.status = 
        checklistCount >= SUCCESS_CRITERIA.checklistItems.min ? 'pass' : 'fail'
    }

    // Check modules
    const { count: modulesCount, error: modulesError } = await supabase
      .from('modules')
      .select('*', { count: 'exact', head: true })

    if (modulesError) {
      console.error('❌ Error checking modules:', modulesError.message)
      results.modules.status = 'error'
    } else {
      results.modules.count = modulesCount || 0
      results.modules.status = 
        modulesCount >= SUCCESS_CRITERIA.modules.min ? 'pass' : 'fail'
    }

    // Check discussion prompts
    const { count: promptsCount, error: promptsError } = await supabase
      .from('discussion_prompts')
      .select('*', { count: 'exact', head: true })

    if (promptsError) {
      console.error('❌ Error checking discussion_prompts:', promptsError.message)
      results.discussionPrompts.status = 'error'
    } else {
      results.discussionPrompts.count = promptsCount || 0
      results.discussionPrompts.status = 
        promptsCount >= SUCCESS_CRITERIA.discussionPrompts.min ? 'pass' : 'fail'
    }

    // Check resources
    const { count: resourcesCount, error: resourcesError } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })

    if (resourcesError) {
      console.error('❌ Error checking resources:', resourcesError.message)
      results.resources.status = 'error'
    } else {
      results.resources.count = resourcesCount || 0
      results.resources.status = 
        resourcesCount >= SUCCESS_CRITERIA.resources.min ? 'pass' : 'fail'
    }

    // Print results
    console.log('📊 Verification Results:\n')
    
    const printResult = (name, result, criteria) => {
      const icon = result.status === 'pass' ? '✅' : result.status === 'error' ? '❌' : '⚠️'
      const status = result.status === 'pass' ? 'PASS' : result.status === 'error' ? 'ERROR' : 'FAIL'
      console.log(`${icon} ${name}:`)
      console.log(`   Count: ${result.count} (Expected: ${criteria.expected}, Minimum: ${criteria.min})`)
      console.log(`   Status: ${status}\n`)
    }

    printResult('Checklist Items', results.checklistItems, SUCCESS_CRITERIA.checklistItems)
    printResult('Modules', results.modules, SUCCESS_CRITERIA.modules)
    printResult('Discussion Prompts', results.discussionPrompts, SUCCESS_CRITERIA.discussionPrompts)
    printResult('Resources', results.resources, SUCCESS_CRITERIA.resources)

    // Summary
    const allPassed = Object.values(results).every(r => r.status === 'pass')
    const hasErrors = Object.values(results).some(r => r.status === 'error')

    console.log('─'.repeat(50))
    if (allPassed) {
      console.log('✅ All counts meet success criteria!')
      process.exit(0)
    } else if (hasErrors) {
      console.log('❌ Some checks failed due to errors. Please check your database connection.')
      process.exit(1)
    } else {
      console.log('⚠️  Some counts are below minimum requirements.')
      console.log('   Please run seed data migrations to populate the database.')
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    process.exit(1)
  }
}

verifyCounts()

