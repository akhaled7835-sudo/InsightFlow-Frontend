import { ArrowUpRight, TrendingUp, Users, DollarSign, Activity } from 'lucide-react'

const bars = [42, 58, 47, 72, 63, 85, 78, 96, 88, 74, 92, 100]

const kpis = [
  { label: 'Revenue', value: '$284.5K', delta: '+18.2%', icon: DollarSign },
  { label: 'Active users', value: '12,480', delta: '+9.4%', icon: Users },
  { label: 'Conversion', value: '4.83%', delta: '+2.1%', icon: TrendingUp },
]

export function DashboardMock() {
  return (
    <div className="glass overflow-hidden rounded-2xl p-4 shadow-2xl shadow-black/40 sm:p-5">
      {/* window bar */}
      <div className="mb-4 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-destructive/80" />
        <span className="h-3 w-3 rounded-full bg-warning/80" />
        <span className="h-3 w-3 rounded-full bg-success/80" />
        <div className="ml-3 flex items-center gap-2 rounded-md bg-secondary px-3 py-1 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5 text-primary" />
          Q3_sales_report.xlsx — cleaned
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border bg-background/60 p-3">
            <div className="flex items-center justify-between">
              <kpi.icon className="h-4 w-4 text-primary" />
              <span className="flex items-center gap-0.5 text-xs font-medium text-success">
                <ArrowUpRight className="h-3 w-3" />
                {kpi.delta}
              </span>
            </div>
            <p className="mt-2 text-lg font-semibold tracking-tight">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* chart */}
      <div className="mt-3 rounded-xl border border-border bg-background/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Revenue overview</p>
            <p className="text-xs text-muted-foreground">Last 12 months</p>
          </div>
          <span className="rounded-md bg-primary/15 px-2 py-1 text-xs font-medium text-primary">
            AI forecast on
          </span>
        </div>
        <div className="flex h-32 items-end gap-1.5">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md bg-gradient-to-t from-primary/40 to-primary transition-all"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
