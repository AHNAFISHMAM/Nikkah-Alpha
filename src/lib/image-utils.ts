import { logError, logDebug } from './logger'

/**
 * Image handling utilities for cache-busting, placeholders, and error handling
 */

/**
 * Generate a cache-busted image URL
 */
export function getImageUrl(baseUrl: string | null | undefined, refreshKey?: number): string {
  if (!baseUrl) return ''
  
  const separator = baseUrl.includes('?') ? '&' : '?'
  const cacheParam = refreshKey ? `refresh=${refreshKey}` : `refresh=${Date.now()}`
  return `${baseUrl}${separator}${cacheParam}`
}

/**
 * Generate a placeholder image using canvas
 */
export function generatePlaceholder(
  text: string,
  width: number = 400,
  height: number = 300,
  color: string = 'hsl(46 72% 68%)' // islamic-gold default
): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    // Server-side: return a simple data URL
    return `data:image/svg+xml,${encodeURIComponent(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
        <text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
      </svg>`
    )}`
  }

  try {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return generatePlaceholder(text, width, height, color) // Fallback to SVG
    }

    // Background
    ctx.fillStyle = color
    ctx.fillRect(0, 0, width, height)

    // Text
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 24px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, width / 2, height / 2)

    return canvas.toDataURL()
  } catch (error) {
    logError('Error generating placeholder', error, 'image-utils')
    // Fallback to SVG
    return `data:image/svg+xml,${encodeURIComponent(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
        <text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
      </svg>`
    )}`
  }
}

/**
 * Default fallback image
 */
export const FALLBACK_IMAGE = generatePlaceholder('Image', 400, 300)

/**
 * Image loading handler with error fallback
 */
export function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const img = e.currentTarget
  img.style.opacity = '1'
  logDebug(`Image loaded: ${img.src}`, undefined, 'image-utils')
}

/**
 * Image error handler with fallback
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback: string = FALLBACK_IMAGE
) {
  const img = e.currentTarget
  const originalSrc = img.src
  
  // Only set fallback if not already set to prevent infinite loop
  if (!img.src.includes('data:image') && !img.src.includes('placeholder')) {
    logError(`Image failed to load: ${originalSrc}`, undefined, 'image-utils')
    img.src = fallback
  }
}

/**
 * Image component props helper
 */
export interface ImageProps {
  src: string | null | undefined
  alt: string
  refreshKey?: number
  fallback?: string
  className?: string
  loading?: 'lazy' | 'eager'
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}

/**
 * Get optimized image props
 */
export function getImageProps({
  src,
  alt,
  refreshKey,
  fallback = FALLBACK_IMAGE,
  loading = 'lazy',
  onLoad,
  onError,
}: ImageProps) {
  const imageUrl = src ? getImageUrl(src, refreshKey) : fallback

  return {
    src: imageUrl,
    alt,
    loading,
    onLoad: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      handleImageLoad(e)
      onLoad?.(e)
    },
    onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      handleImageError(e, fallback)
      onError?.(e)
    },
    style: { opacity: 1, transition: 'opacity 0.3s' },
  }
}

