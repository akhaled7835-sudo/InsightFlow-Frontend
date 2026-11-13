'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    q: 'What file formats can I upload?',
    a: 'InsightFlow supports Excel (.xlsx) and CSV files. We automatically detect sheets, headers, and column types on upload.',
  },
  {
    q: 'How does the automatic data cleaning work?',
    a: 'On upload, we scan for duplicate rows, missing values, inconsistent date and number formats, and outliers, then apply safe fixes. You can review and undo every change.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All data is encrypted in transit and at rest, we are SOC 2 Type II compliant, and Enterprise plans support SSO, RBAC, and custom data residency.',
  },
  {
    q: 'Do I need to know SQL or write code?',
    a: 'Not at all. Dashboards are generated automatically and everything is editable through a visual interface. You can also ask questions in plain English.',
  },
  {
    q: 'Can I share dashboards with my team?',
    a: 'Absolutely. Share live, always-up-to-date dashboards via link, invite teammates to your workspace, or export to PDF and PNG.',
  },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24">
      <div className="mx-auto w-[min(760px,calc(100%-1.5rem))]">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">FAQ</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-border bg-card"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium">{faq.q}</span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    {isOpen ? (
                      <Minus className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                  </span>
                </button>
                {isOpen && (
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
