import { MoreMenu } from '../common/MoreMenu'

export function MobileHeader() {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 bg-transparent z-50 pointer-events-none">
      {/* Floating Hamburger Button - Top Right with Safe Area Support */}
      <div className="absolute top-3 right-4 safe-area-inset-top safe-area-inset-right pointer-events-auto">
        <div className="relative">
          {/* Backdrop circle for visibility on any background */}
          <div className="absolute inset-0 bg-background/90 dark:bg-background/85 backdrop-blur-md rounded-full shadow-lg border border-border/50 -z-10 transition-all duration-200 hover:shadow-xl hover:bg-background/95 dark:hover:bg-background/90" />
          <div className="relative">
            <MoreMenu />
          </div>
        </div>
      </div>
    </header>
  )
}

