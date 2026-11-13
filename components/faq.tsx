'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  const { t } = useTranslation()

  const faqs = [
    { q: t.faq1Q, a: t.faq1A },
    { q: t.faq2Q, a: t.faq2A },
    { q: t.faq3Q, a: t.faq3A },
    { q: t.faq4Q, a: t.faq4A },
    { q: t.faq5Q, a: t.faq5A },
  ]

  return (
    <section id="faq" className="py-24">
      <div className="mx-auto w-[min(760px,calc(100%-1.5rem))]">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">{t.faq}</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{t.faqTitle}</h2>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i
            return (
              <div key={i} className="rounded-2xl border border-border bg-card">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start"
                >
                  <span className="text-sm font-medium">{faq.q}</span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>
                {isOpen && (
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}