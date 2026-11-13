'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { RightSidebar } from './right-sidebar'

export function DashboardShell({
  children,
  activeItem = 'Overview',
}: {
  children: React.ReactNode
  activeItem?: string
}) {
  const [mobileNav, setMobileNav] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* fixed left sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border lg:block">
        <Sidebar activeItem={activeItem} />
      </aside>

      {/* mobile sidebar overlay */}
      {mobileNav && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setMobileNav(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 animate-float-up border-r border-border bg-card">
            <Sidebar onClose={() => setMobileNav(false)} activeItem={activeItem} />
          </div>
        </div>
      )}

      {/* main column */}
      <div className="lg:pl-64 xl:pr-80">
        <Topbar onMenu={() => setMobileNav(true)} />
        <main className="px-4 py-6 sm:px-6">{children}</main>
      </div>

      {/* fixed right sidebar (xl) */}
      <aside className="fixed inset-y-0 right-0 top-[65px] z-30 hidden w-80 overflow-y-auto border-l border-border xl:block">
        <RightSidebar />
      </aside>
    </div>
  )
}
