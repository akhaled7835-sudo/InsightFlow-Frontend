import { RevenueChart, SalesChart, CustomerChart } from './charts'

export function ChartsSection() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="glass rounded-2xl p-5 lg:col-span-2">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold tracking-tight">Revenue Overview</h3>
            <p className="text-sm text-muted-foreground">Actual vs AI forecast</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-full bg-primary" /> Actual
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded-full bg-muted-foreground" /> Forecast
            </span>
          </div>
        </div>
        <RevenueChart />
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold tracking-tight">Customers</h3>
          <p className="text-sm text-muted-foreground">By plan tier</p>
        </div>
        <CustomerChart />
      </div>

      <div className="glass rounded-2xl p-5 lg:col-span-3">
        <div className="mb-4">
          <h3 className="text-base font-semibold tracking-tight">Sales by Channel</h3>
          <p className="text-sm text-muted-foreground">Units sold this quarter</p>
        </div>
        <SalesChart />
      </div>
    </div>
  )
}
