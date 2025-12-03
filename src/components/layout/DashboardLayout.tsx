import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { DashboardNav } from './DashboardNav'
import { MobileHeader } from './MobileHeader'

export function DashboardLayout() {
  // Add class to html element to hide HTML scrollbar when dashboard layout is active
  useEffect(() => {
    // Add class to html element (document.documentElement)
    document.documentElement.classList.add('dashboard-layout-active')
    
    // Cleanup: Remove class when component unmounts
    return () => {
      document.documentElement.classList.remove('dashboard-layout-active')
    }
  }, [])

  return (
    <div className="h-screen-dynamic w-full bg-gradient-to-br from-primary/5 via-background via-70% to-islamic-purple/5 flex flex-col overflow-hidden">
      <MobileHeader />
      <DashboardNav />

      {/* Main Content Area - Reduced top padding since header is minimal */}
      <main
        className="flex-1 w-full lg:pl-56 xl:pl-64 pt-4 sm:pt-6 lg:pt-0 pb-20 lg:pb-0 overflow-y-auto overflow-x-hidden transition-all duration-300 safe-area-inset-top scroll-smooth scrollbar-thin"
        role="main"
        aria-label="Main content"
      >
        <div className="w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
