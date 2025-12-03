import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { logInfo } from '../lib/logger'

interface ImageRefreshContextType {
  refreshKey: number
  refreshImages: () => void
  hardReload: () => void
}

const ImageRefreshContext = createContext<ImageRefreshContextType | undefined>(undefined)

export function ImageRefreshProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(Date.now())

  const refreshImages = useCallback(() => {
    logInfo('🔄 Refreshing images...', 'ImageRefreshContext')
    setRefreshKey(Date.now())
  }, [])

  const hardReload = useCallback(() => {
    logInfo('🔄 Hard reloading page...', 'ImageRefreshContext')
    window.location.reload()
  }, [])

  return (
    <ImageRefreshContext.Provider value={{ refreshKey, refreshImages, hardReload }}>
      {children}
    </ImageRefreshContext.Provider>
  )
}

export function useImageRefresh() {
  const context = useContext(ImageRefreshContext)
  if (context === undefined) {
    throw new Error('useImageRefresh must be used within ImageRefreshProvider')
  }
  return context
}

