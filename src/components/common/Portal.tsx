import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
  children: React.ReactNode
  containerId?: string
}

export function Portal({ children, containerId = 'portal-root' }: PortalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    let portalContainer = document.getElementById(containerId)
    
    if (!portalContainer) {
      portalContainer = document.createElement('div')
      portalContainer.id = containerId
      portalContainer.style.position = 'fixed'
      portalContainer.style.top = '0'
      portalContainer.style.left = '0'
      portalContainer.style.zIndex = '9999'
      portalContainer.style.pointerEvents = 'none'
      document.body.appendChild(portalContainer)
    }
    
    setContainer(portalContainer)
  }, [containerId])

  if (!container) return null

  return createPortal(
    <div style={{ pointerEvents: 'auto' }}>
      {children}
    </div>,
    container
  )
}

