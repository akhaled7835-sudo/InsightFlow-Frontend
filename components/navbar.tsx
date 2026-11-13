'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BarChart3, Menu, X } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'

const links = [
  { label: 'Features', href: '#features' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Insights', href: '#insights' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-3 w-[min(1120px,calc(100%-1.5rem))]">
        <nav className="glass flex items-center justify-between rounded-2xl px-4 py-2.5 shadow-lg shadow-black/20">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="text-base font-semibold tracking-tight">InsightFlow</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Sign in
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Try Live Demo
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {open && (
          <div className="glass mt-2 flex flex-col gap-1 rounded-2xl p-3 md:hidden">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full">Sign in</Button>
              </Link>
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Try Live Demo
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
