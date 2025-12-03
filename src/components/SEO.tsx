import { Helmet } from 'react-helmet-async'
import { SEO_CONFIG } from '../lib/seo'

interface SEOProps {
  title: string
  description: string
  path?: string
  type?: 'website' | 'article'
  noIndex?: boolean
  jsonLd?: Record<string, unknown>
}

export function SEO({
  title,
  description,
  path = '',
  type = 'website',
  noIndex = false,
  jsonLd,
}: SEOProps) {
  const { siteName, siteUrl, twitterHandle, locale } = SEO_CONFIG

  // Format title with site name suffix (unless it already includes it)
  const formattedTitle = title.includes(siteName) ? title : `${title} - ${siteName}`

  // Build canonical URL
  const canonicalUrl = `${siteUrl}${path}`

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  )
}

// Pre-built JSON-LD schemas
export const jsonLdSchemas = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NikahPrep',
    description: 'Islamic Marriage Preparation Platform',
    url: SEO_CONFIG.siteUrl,
  },

  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NikahPrep',
    description: SEO_CONFIG.defaultDescription,
    url: SEO_CONFIG.siteUrl,
  },

  breadcrumb: (items: Array<{ name: string; url: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SEO_CONFIG.siteUrl}${item.url}`,
    })),
  }),
}

