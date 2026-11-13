import { Button } from '@/components/ui/button'
import { BarChart3, ArrowRight } from 'lucide-react'

const columns = [
  {
    title: 'Product',
    links: ['Features', 'Dashboards', 'AI Insights', 'Pricing', 'Changelog'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Blog', 'Customers', 'Contact'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'Guides', 'API', 'Status', 'Security'],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border">
      {/* CTA */}
      <div className="mx-auto w-[min(1120px,calc(100%-1.5rem))] py-20">
        <div className="glass relative overflow-hidden rounded-3xl px-8 py-14 text-center sm:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]"
          />
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to see what your data is hiding?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-muted-foreground">
            Join thousands of teams turning spreadsheets into decisions with
            InsightFlow.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border bg-card/40 text-foreground hover:bg-card"
            >
              Book a demo
            </Button>
          </div>
        </div>
      </div>

      {/* links */}
      <div className="mx-auto w-[min(1120px,calc(100%-1.5rem))] pb-12">
        <div className="grid gap-10 border-t border-border pt-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <a href="#" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </span>
              <span className="text-base font-semibold tracking-tight">
                InsightFlow
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              AI-powered analytics that turn raw spreadsheets into interactive
              dashboards and business insights.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-medium">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} InsightFlow, Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground">
              Terms
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
