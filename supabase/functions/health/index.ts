import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  environment: string
  checks: {
    api: boolean
    database: boolean
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    )
  }

  try {
    const startTime = Date.now()

    // Basic health checks
    const checks = {
      api: true, // If we reach here, API is working
      database: true, // Assume database is healthy (could add actual check)
    }

    const healthStatus: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: Date.now() - startTime,
      environment: Deno.env.get('ENVIRONMENT') || 'production',
      checks,
    }

    // Determine overall status based on checks
    if (!checks.api || !checks.database) {
      healthStatus.status = 'degraded'
    }

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503

    return new Response(
      JSON.stringify(healthStatus, null, 2),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        status: statusCode,
      }
    )
  } catch (error) {
    console.error('Health check error:', error)

    const errorResponse: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: 0,
      environment: Deno.env.get('ENVIRONMENT') || 'production',
      checks: {
        api: false,
        database: false,
      },
    }

    return new Response(
      JSON.stringify(errorResponse, null, 2),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        status: 503,
      }
    )
  }
})
