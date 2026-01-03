# Monitoring & Performance Setup Guide

## Overview

This guide covers setting up comprehensive monitoring and performance tracking for the Nikkah Alpha application.

---

## Table of Contents

1. [Error Tracking (Sentry)](#error-tracking-sentry)
2. [Performance Monitoring](#performance-monitoring)
3. [Uptime Monitoring](#uptime-monitoring)
4. [Analytics (Optional)](#analytics-optional)
5. [Database Monitoring](#database-monitoring)
6. [Alerting](#alerting)

---

## Error Tracking (Sentry)

### Setup

1. **Create Sentry Account**
   - Go to https://sentry.io
   - Create a new project (React)
   - Copy your DSN

2. **Install Sentry**
   ```bash
   npm install @sentry/react
   ```

3. **Configure Sentry**

   Update `src/lib/error-handler.ts`:
   ```typescript
   import * as Sentry from '@sentry/react'
   import { ENV } from '../config/environment'

   // Initialize Sentry in production
   if (ENV.isProduction) {
     Sentry.init({
       dsn: import.meta.env.VITE_SENTRY_DSN,
       environment: ENV.MODE,
       integrations: [
         new Sentry.BrowserTracing(),
         new Sentry.Replay({
           maskAllText: false,
           blockAllMedia: false,
         }),
       ],
       tracesSampleRate: 0.1, // 10% of transactions
       replaysSessionSampleRate: 0.1,
       replaysOnErrorSampleRate: 1.0,
     })
   }

   // Then update the handleError function:
   export function handleError(error: unknown, context?: string): void {
     const friendlyMessage = getUserFriendlyError(error)

     if (ENV.isProduction && import.meta.env.VITE_SENTRY_DSN) {
       Sentry.captureException(error, {
         tags: { context },
         level: 'error',
       })
     }

     // ... rest of function
   }
   ```

4. **Add Environment Variable**
   ```bash
   # In Vercel/Netlify dashboard or .env
   VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
   ```

5. **Wrap App with Sentry**

   Update `src/main.tsx`:
   ```typescript
   import * as Sentry from '@sentry/react'
   import { ENV } from './config/environment'

   if (ENV.isProduction) {
     Sentry.init({
       // ... configuration
     })
   }

   ReactDOM.createRoot(document.getElementById('root')!).render(
     <React.StrictMode>
       <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
         <App />
       </Sentry.ErrorBoundary>
     </React.StrictMode>
   )
   ```

---

## Performance Monitoring

### Core Web Vitals

Already tracked via `src/lib/performance.ts`. Ensure it's imported in main.tsx:

```typescript
import './lib/performance'  // Tracks LCP, FID, CLS automatically
```

### Lighthouse CI

Add to `.github/workflows/ci.yml`:
```yaml
  lighthouse:
    name: Lighthouse Performance Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://your-site.com
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### Bundle Size Monitoring

Add to `package.json`:
```json
{
  "scripts": {
    "analyze": "vite-bundle-visualizer"
  }
}
```

Run after builds:
```bash
npm run build
npm run analyze
```

---

## Uptime Monitoring

### Option 1: UptimeRobot (Free)

1. Go to https://uptimerobot.com
2. Create account
3. Add monitors:
   - **Main App**: `https://yoursite.com`
     - Type: HTTP(s)
     - Interval: 5 minutes
   - **Health Check**: `https://your-project.supabase.co/functions/v1/health`
     - Type: HTTP(s)
     - Interval: 5 minutes
   - **Supabase**: `https://your-project.supabase.co`
     - Type: HTTP(s)
     - Interval: 5 minutes

4. Configure alerts:
   - Email notifications
   - SMS (optional, paid)
   - Webhook to Slack (optional)

### Option 2: Pingdom

Similar setup to UptimeRobot but with more features.

### Health Check Endpoint

Already created at `supabase/functions/health/index.ts`.

**Test it:**
```bash
curl https://your-project.supabase.co/functions/v1/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-03T...",
  "version": "1.0.0",
  "checks": {
    "api": true,
    "database": true
  }
}
```

---

## Analytics (Optional)

### Google Analytics 4

1. **Create GA4 Property**
   - Go to https://analytics.google.com
   - Create new property
   - Get Measurement ID

2. **Install React GA4**
   ```bash
   npm install react-ga4
   ```

3. **Initialize in App**

   Create `src/lib/analytics.ts`:
   ```typescript
   import ReactGA from 'react-ga4'
   import { ENV } from '../config/environment'

   export function initializeAnalytics() {
     if (ENV.isProduction && import.meta.env.VITE_GA_MEASUREMENT_ID) {
       ReactGA.initialize(import.meta.env.VITE_GA_MEASUREMENT_ID)
     }
   }

   export function trackPageView(path: string) {
     if (ENV.isProduction) {
       ReactGA.send({ hitType: 'pageview', page: path })
     }
   }
   ```

4. **Track Route Changes**

   Update `src/App.tsx`:
   ```typescript
   import { useLocation } from 'react-router-dom'
   import { useEffect } from 'react'
   import { trackPageView } from './lib/analytics'

   function App() {
     const location = useLocation()

     useEffect(() => {
       trackPageView(location.pathname + location.search)
     }, [location])

     // ... rest of component
   }
   ```

5. **Add Environment Variable**
   ```bash
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

---

## Database Monitoring

### Supabase Dashboard Monitoring

1. **Database Metrics**
   - Go to Supabase Dashboard → Database → Metrics
   - Monitor:
     - Connection count
     - Query performance
     - Database size
     - Table sizes

2. **API Usage**
   - Dashboard → API → Usage
   - Monitor:
     - Request count
     - Error rate
     - Response times

3. **Logs**
   - Dashboard → Logs
   - Filter by:
     - Errors
     - Slow queries
     - Auth events

### Query Performance

Add to SQL queries for monitoring:
```sql
-- Monitor slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
```

---

## Alerting

### Sentry Alerts

1. **Configure Alerts**
   - Sentry Dashboard → Alerts
   - Create alert rules:
     - Error rate > threshold
     - New error types
     - Performance degradation

2. **Notification Channels**
   - Email
   - Slack integration
   - PagerDuty (for on-call)

### UptimeRobot Alerts

Configure in UptimeRobot:
- Email on downtime
- Webhook to Slack
- SMS for critical services

### Supabase Alerts

1. **Set up Webhooks**
   - Dashboard → Database → Webhooks
   - Send to Slack/Discord/Email

2. **Monitor Events**
   - New user signups
   - Failed auth attempts
   - Database errors

---

## Monitoring Dashboard

### Option 1: Grafana (Advanced)

For comprehensive monitoring, set up Grafana:
- Connect to Supabase metrics
- Create custom dashboards
- Set up complex alerting

### Option 2: Simple Status Page

Create a status page using:
- **Statuspage.io** (Atlassian)
- **Status.io**
- **Self-hosted**: https://github.com/cachethq/cachet

---

## Key Metrics to Track

### Application Performance
- ✅ Page load time (< 3 seconds target)
- ✅ Time to Interactive (< 5 seconds target)
- ✅ First Contentful Paint (< 1.8 seconds target)
- ✅ Largest Contentful Paint (< 2.5 seconds target)
- ✅ Cumulative Layout Shift (< 0.1 target)

### Error Tracking
- ✅ Error rate (< 1% target)
- ✅ Unhandled exceptions
- ✅ API errors
- ✅ Database errors

### Uptime
- ✅ Application uptime (> 99.9% target)
- ✅ API uptime
- ✅ Database uptime

### User Engagement
- ✅ Active users
- ✅ Session duration
- ✅ Page views
- ✅ Bounce rate

### Business Metrics
- ✅ New signups
- ✅ Partner connections
- ✅ Module completions
- ✅ Checklist progress

---

## Monitoring Checklist

### Initial Setup
- [ ] Sentry error tracking configured
- [ ] Performance monitoring enabled
- [ ] Uptime monitors created
- [ ] Health check endpoint deployed
- [ ] Alert notifications configured
- [ ] Analytics initialized (if using)

### Regular Reviews
- [ ] Weekly: Review error trends
- [ ] Weekly: Check performance metrics
- [ ] Monthly: Review uptime reports
- [ ] Monthly: Analyze user behavior
- [ ] Quarterly: Audit monitoring setup

---

## Best Practices

1. **Set Realistic Thresholds**
   - Don't alert on every minor issue
   - Focus on user-impacting problems

2. **Aggregate Similar Errors**
   - Group related errors in Sentry
   - Avoid alert fatigue

3. **Document Incidents**
   - Create postmortems for major issues
   - Learn from failures

4. **Regular Health Checks**
   - Test monitoring systems monthly
   - Verify alerts are working

5. **Privacy Compliance**
   - Mask sensitive data in error logs
   - Follow GDPR/privacy regulations
   - Don't log PII (personally identifiable information)

---

## Troubleshooting

### Sentry Not Reporting Errors
- Check DSN is correct
- Verify environment is production
- Check network requests in DevTools

### Performance Metrics Not Showing
- Ensure `performance.ts` is imported
- Check browser console for errors
- Verify in production mode

### Health Check Failing
- Check Edge Function logs in Supabase
- Verify CORS configuration
- Test manually with curl

---

## Cost Optimization

### Free Tiers
- **Sentry**: 5K errors/month free
- **UptimeRobot**: 50 monitors free
- **Google Analytics**: Completely free
- **Supabase Logs**: Included in free tier (7 days retention)

### Paid Recommendations
- **Sentry Pro**: $26/month (recommended for production)
- **Supabase Pro**: $25/month (better logs, backups)
- **UptimeRobot Pro**: $7/month (1-minute checks)

---

## Related Documentation

- [Deployment Guide](../DEPLOYMENT.md)
- [Security Documentation](../SECURITY.md)
- [Database Schema](./DATABASE_SCHEMA.md)

---

**Last Updated**: January 2026
