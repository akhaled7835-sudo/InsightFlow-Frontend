import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react'

const insights = [
  {
    icon: TrendingUp,
    tone: 'text-success',
    bg: 'bg-success/15',
    title: 'Revenue is accelerating',
    body: 'Q3 revenue grew 18.2% MoM, driven mainly by the Enterprise tier in the North America region.',
  },
  {
    icon: AlertTriangle,
    tone: 'text-warning',
    bg: 'bg-warning/15',
    title: 'Churn risk detected',
    body: 'Accounts inactive for 21+ days rose 6%. Consider a re-engagement campaign for 340 at-risk users.',
  },
  {
    icon: Lightbulb,
    tone: 'text-primary',
    bg: 'bg-primary/15',
    title: 'Optimization opportunity',
    body: 'Bundling the Pro and Analytics add-on could lift average order value by an estimated $42.',
  },
]

export function AiInsights() {
  return (
    <section id="insights" className="py-24">
      <div className="mx-auto w-[min(1120px,calc(100%-1.5rem))]">
        <div className="glass relative overflow-hidden rounded-3xl p-8 sm:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/15 blur-[100px]"
          />

          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Powered by AI
              </span>
              <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Your analyst, on demand
              </h2>
              <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                Ask questions in plain English and InsightFlow explains what
                changed, why it matters, and what to do next — grounded in your
                actual data, not guesswork.
              </p>

              <div className="mt-6 rounded-xl border border-border bg-background/60 p-4">
                <p className="text-xs text-muted-foreground">You asked</p>
                <p className="mt-1 text-sm font-medium">
                  &ldquo;Why did revenue jump last month?&rdquo;
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {insights.map((insight) => (
                <div
                  key={insight.title}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${insight.bg} ${insight.tone}`}
                  >
                    <insight.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{insight.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {insight.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
