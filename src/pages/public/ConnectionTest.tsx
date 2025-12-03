import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'

export function ConnectionTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [results, setResults] = useState<any>(null)

  const testConnection = async () => {
    setStatus('testing')
    setResults(null)

    const tests = {
      envVars: {
        url: import.meta.env.VITE_SUPABASE_URL,
        hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      connection: null as any,
      auth: null as any,
      database: null as any,
    }

    try {
      // Test 1: Check environment variables
      console.log('Test 1: Environment Variables', tests.envVars)

      // Test 2: Test Supabase connection with timeout
      try {
        if (!supabase) {
          tests.connection = {
            success: false,
            error: 'Supabase client is not initialized',
            code: 'NO_CLIENT',
          }
        } else {
          const { error: healthError } = await supabase
            .from('profiles')
            .select('count', { count: 'exact', head: true })
            .limit(1)

          tests.connection = {
            success: !healthError,
            error: healthError?.message,
            code: healthError?.code,
          }
        }
      } catch (err: any) {
        tests.connection = {
          success: false,
          error: err.message || 'Connection timeout - tables may not exist',
          code: 'TIMEOUT',
        }
      }
      console.log('Test 2: Connection', tests.connection)

      // Test 3: Test auth (always works if URL is correct)
      try {
        if (!supabase) {
          tests.auth = {
            success: false,
            hasSession: false,
            error: 'Supabase client is not initialized',
          }
        } else {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
          tests.auth = {
            success: !sessionError,
            hasSession: !!sessionData.session,
            error: sessionError?.message,
          }
        }
      } catch (err: any) {
        tests.auth = {
          success: false,
          hasSession: false,
          error: err.message || 'Auth timeout',
        }
      }
      console.log('Test 3: Auth', tests.auth)

      // Test 4: Test database - check if tables exist (with timeout handling)
      if (!supabase) {
        tests.database = {
          profiles: { exists: false, count: 0, error: 'Supabase client is not initialized' },
          checklist_categories: { exists: false, count: 0, error: 'Supabase client is not initialized' },
          modules: { exists: false, count: 0, error: 'Supabase client is not initialized' },
          discussion_prompts: { exists: false, count: 0, error: 'Supabase client is not initialized' },
        }
      } else {
        const tableTests = await Promise.allSettled([
          supabase.from('profiles').select('count', { count: 'exact', head: true }).limit(1),
          supabase.from('checklist_categories').select('count', { count: 'exact', head: true }).limit(1),
          supabase.from('modules').select('count', { count: 'exact', head: true }).limit(1),
          supabase.from('discussion_prompts').select('count', { count: 'exact', head: true }).limit(1),
        ])

      tests.database = {
        profiles: {
          exists: tableTests[0].status === 'fulfilled' && !(tableTests[0].value as any).error,
          count: tableTests[0].status === 'fulfilled' ? (tableTests[0].value as any).count : 0,
          error: tableTests[0].status === 'fulfilled' ? (tableTests[0].value as any).error?.message : 'Timeout or table does not exist'
        },
        checklist_categories: {
          exists: tableTests[1].status === 'fulfilled' && !(tableTests[1].value as any).error,
          count: tableTests[1].status === 'fulfilled' ? (tableTests[1].value as any).count : 0,
          error: tableTests[1].status === 'fulfilled' ? (tableTests[1].value as any).error?.message : 'Timeout or table does not exist'
        },
        modules: {
          exists: tableTests[2].status === 'fulfilled' && !(tableTests[2].value as any).error,
          count: tableTests[2].status === 'fulfilled' ? (tableTests[2].value as any).count : 0,
          error: tableTests[2].status === 'fulfilled' ? (tableTests[2].value as any).error?.message : 'Timeout or table does not exist'
        },
        discussion_prompts: {
          exists: tableTests[3].status === 'fulfilled' && !(tableTests[3].value as any).error,
          count: tableTests[3].status === 'fulfilled' ? (tableTests[3].value as any).count : 0,
          error: tableTests[3].status === 'fulfilled' ? (tableTests[3].value as any).error?.message : 'Timeout or table does not exist'
        },
      }
      }
      console.log('Test 4: Database Tables', tests.database)

      setResults(tests)
      setStatus('success')
    } catch (error) {
      console.error('Connection test failed:', error)
      setResults({ ...tests, criticalError: error })
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Supabase Connection Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Button
                  onClick={testConnection}
                  disabled={status === 'testing'}
                  isLoading={status === 'testing'}
                >
                  {status === 'testing' ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>

              {results && (
                <div className="space-y-4 mt-6">
                  {/* Environment Variables */}
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <h3 className="font-semibold mb-2">1. Environment Variables</h3>
                    <div className="space-y-1 text-sm">
                      <p>URL: <span className={results.envVars.url ? 'text-green-600' : 'text-red-600'}>
                        {results.envVars.url || 'Missing'}
                      </span></p>
                      <p>Anon Key: <span className={results.envVars.hasKey ? 'text-green-600' : 'text-red-600'}>
                        {results.envVars.hasKey ? 'Present' : 'Missing'}
                      </span></p>
                    </div>
                  </div>

                  {/* Connection */}
                  <div className={`p-4 rounded-lg ${results.connection?.success ? 'bg-green-50' : 'bg-red-50'}`}>
                    <h3 className="font-semibold mb-2">2. Supabase Connection</h3>
                    <div className="space-y-1 text-sm">
                      <p>Status: <span className={results.connection?.success ? 'text-green-600' : 'text-red-600'}>
                        {results.connection?.success ? 'Connected ✓' : 'Failed ✗'}
                      </span></p>
                      {results.connection?.error && (
                        <p className="text-red-600">Error: {results.connection.error}</p>
                      )}
                      {results.connection?.code && (
                        <p className="text-red-600">Code: {results.connection.code}</p>
                      )}
                    </div>
                  </div>

                  {/* Auth */}
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <h3 className="font-semibold mb-2">3. Authentication</h3>
                    <div className="space-y-1 text-sm">
                      <p>Auth Working: <span className={results.auth?.success ? 'text-green-600' : 'text-red-600'}>
                        {results.auth?.success ? 'Yes ✓' : 'No ✗'}
                      </span></p>
                      <p>Logged In: <span className={results.auth?.hasSession ? 'text-green-600' : 'text-yellow-600'}>
                        {results.auth?.hasSession ? 'Yes' : 'No (expected)'}
                      </span></p>
                      {results.auth?.error && (
                        <p className="text-red-600">Error: {results.auth.error}</p>
                      )}
                    </div>
                  </div>

                  {/* Database Tables */}
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <h3 className="font-semibold mb-2">4. Database Tables</h3>
                    <div className="space-y-2 text-sm">
                      {Object.entries(results.database || {}).map(([table, info]: [string, any]) => (
                        <div key={table} className="flex items-center justify-between p-2 bg-white rounded">
                          <span className="font-mono">{table}</span>
                          <div className="flex items-center gap-4">
                            <span className={info.exists ? 'text-green-600' : 'text-red-600'}>
                              {info.exists ? `✓ (${info.count} rows)` : '✗ Not Found'}
                            </span>
                            {info.error && (
                              <span className="text-xs text-red-600">{info.error}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Critical Error */}
                  {results.criticalError && (
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h3 className="font-semibold mb-2 text-red-700">Critical Error</h3>
                      <pre className="text-xs text-red-600 overflow-auto">
                        {JSON.stringify(results.criticalError, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Diagnosis */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-2 text-blue-700">Diagnosis</h3>
                    <div className="text-sm space-y-2">
                      {!results.envVars.url && (
                        <p className="text-red-600">⚠️ Missing VITE_SUPABASE_URL in .env file</p>
                      )}
                      {!results.envVars.hasKey && (
                        <p className="text-red-600">⚠️ Missing VITE_SUPABASE_ANON_KEY in .env file</p>
                      )}
                      {!results.connection?.success && (
                        <p className="text-red-600">⚠️ Cannot connect to Supabase - Check your URL and key</p>
                      )}
                      {results.connection?.success && !results.database?.profiles?.exists && (
                        <p className="text-yellow-600">⚠️ Database tables not created - Run fresh-install.sql</p>
                      )}
                      {results.connection?.success && results.database?.profiles?.exists && (
                        <p className="text-green-600">✓ Everything looks good!</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Troubleshooting Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-1">1. If environment variables are missing:</h4>
                <p className="text-neutral-600">Check your <code className="bg-neutral-100 px-1 rounded">.env</code> file has:</p>
                <pre className="bg-neutral-900 text-neutral-100 p-2 rounded mt-1 text-xs">
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-1">2. If connection fails:</h4>
                <ul className="list-disc list-inside text-neutral-600 space-y-1">
                  <li>Verify your Supabase project URL is correct</li>
                  <li>Check that your anon key is valid</li>
                  <li>Ensure your Supabase project is active (not paused)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-1">3. If tables don't exist:</h4>
                <p className="text-neutral-600">Run the database setup:</p>
                <ol className="list-decimal list-inside text-neutral-600 space-y-1 ml-2">
                  <li>Go to Supabase Dashboard → SQL Editor</li>
                  <li>Copy contents of <code className="bg-neutral-100 px-1 rounded">supabase/fresh-install.sql</code></li>
                  <li>Paste and run the SQL</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
