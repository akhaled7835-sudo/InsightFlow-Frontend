const testimonials = [
  {
    quote:
      'InsightFlow replaced three tools and a weekly reporting meeting. We upload the export and the dashboard is just… ready.',
    name: 'Sofia Martinez',
    role: 'Head of Ops, Northwind',
    initials: 'SM',
  },
  {
    quote:
      'The AI insights caught a churn spike we would have missed for weeks. It paid for itself in the first month.',
    name: 'James Okafor',
    role: 'Growth Lead, Lumen',
    initials: 'JO',
  },
  {
    quote:
      'Our non-technical team finally understands the numbers. The auto-cleaning alone saves us hours every week.',
    name: 'Priya Nair',
    role: 'Finance Manager, Vertex',
    initials: 'PN',
  },
  {
    quote:
      'It feels like Linear and Stripe had a data baby. Fast, gorgeous, and genuinely useful.',
    name: 'Daniel Cho',
    role: 'Founder, Cascade',
    initials: 'DC',
  },
]

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="mx-auto w-[min(1120px,calc(100%-1.5rem))]">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">Testimonials</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Loved by teams who move fast
          </h2>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6"
            >
              <blockquote className="text-pretty leading-relaxed text-foreground/90">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-medium text-primary">
                  {t.initials}
                </span>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
