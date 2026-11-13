import {
  UploadCloud,
  Wand2,
  LayoutDashboard,
  Gauge,
  Brain,
  ShieldCheck,
} from 'lucide-react'

const features = [
  {
    icon: UploadCloud,
    title: 'Upload anything',
    description:
      'Drag and drop Excel or CSV files of any size. InsightFlow parses sheets, headers, and types instantly.',
  },
  {
    icon: Wand2,
    title: 'Automatic cleaning',
    description:
      'Duplicate rows, missing values, and inconsistent formats are detected and fixed before analysis.',
  },
  {
    icon: LayoutDashboard,
    title: 'Interactive dashboards',
    description:
      'Generate polished, filterable dashboards in seconds — then customize every chart with a click.',
  },
  {
    icon: Gauge,
    title: 'KPI tracking',
    description:
      'Pin the metrics that matter and watch them update live as new data flows into your workspace.',
  },
  {
    icon: Brain,
    title: 'AI insights',
    description:
      'Get plain-language explanations of trends, anomalies, and opportunities hidden in your numbers.',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise security',
    description:
      'SOC 2 Type II, encryption at rest and in transit, and granular role-based access controls.',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto w-[min(1120px,calc(100%-1.5rem))]">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-primary">Features</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to understand your data
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            From messy spreadsheet to boardroom-ready insight — InsightFlow
            handles the entire pipeline so your team can focus on decisions.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-medium">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
