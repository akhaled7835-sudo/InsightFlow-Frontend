import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: '/mo',
    description: 'For individuals exploring their data.',
    features: [
      '3 file uploads per day',
      '8-language AI insights & RTL support',
      'Automatic data cleaning',
      'Basic AI summaries',
    ],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mo',
    description: 'For teams that live in their metrics.',
    features: [
      'Unlimited daily file uploads',
      'Up to 5M rows per file',
      'Advanced AI insights & forecasts',
      'Export reports to PDF & Excel (.xlsx)',
      'Priority support',
    ],
    cta: 'Start 14-day trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations with scale and compliance needs.',
    features: [
      'SSO & SCIM provisioning',
      'Role-based access control',
      'SOC 2 & custom data residency',
      'Dedicated success manager',
    ],
    cta: 'Contact sales',
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto w-[min(1120px,calc(100%-1.5rem))]">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">Pricing</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple pricing that scales with you
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Start free, upgrade when you&apos;re ready. No hidden fees, cancel
            anytime.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                plan.highlighted
                  ? 'border-primary bg-card shadow-2xl shadow-primary/20'
                  : 'border-border bg-card'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-medium">{plan.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {plan.description}
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">
                  {plan.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </div>

              <Button
                className={`mt-6 ${
                  plan.highlighted
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {plan.cta}
              </Button>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
