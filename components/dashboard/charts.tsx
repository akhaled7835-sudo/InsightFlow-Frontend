'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const revenueData = [
  { month: 'Jan', revenue: 42000, forecast: 40000 },
  { month: 'Feb', revenue: 48000, forecast: 46000 },
  { month: 'Mar', revenue: 45000, forecast: 47000 },
  { month: 'Apr', revenue: 61000, forecast: 55000 },
  { month: 'May', revenue: 58000, forecast: 60000 },
  { month: 'Jun', revenue: 72000, forecast: 68000 },
  { month: 'Jul', revenue: 84000, forecast: 78000 },
  { month: 'Aug', revenue: 79000, forecast: 82000 },
  { month: 'Sep', revenue: 96000, forecast: 90000 },
]

const salesData = [
  { channel: 'Direct', sales: 4200 },
  { channel: 'Referral', sales: 3100 },
  { channel: 'Organic', sales: 5400 },
  { channel: 'Paid', sales: 2800 },
  { channel: 'Social', sales: 3600 },
  { channel: 'Email', sales: 4100 },
]

const customerData = [
  { name: 'Enterprise', value: 42, color: '#3b82f6' },
  { name: 'Pro', value: 33, color: '#10b981' },
  { name: 'Starter', value: 18, color: '#f59e0b' },
  { name: 'Free', value: 7, color: '#64748b' },
]

function TooltipBox({
  active,
  payload,
  label,
  suffix = '',
  prefix = '',
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
  suffix?: string
  prefix?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-xl">
      {label && <p className="mb-1 font-medium text-popover-foreground">{label}</p>}
      {payload.map((item) => (
        <p key={item.name} className="flex items-center gap-2 text-muted-foreground">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="capitalize">{item.name}</span>
          <span className="ml-auto font-medium text-popover-foreground">
            {prefix}
            {item.value.toLocaleString()}
            {suffix}
          </span>
        </p>
      ))}
    </div>
  )
}

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={revenueData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis
          dataKey="month"
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v / 1000}k`}
        />
        <Tooltip content={<TooltipBox prefix="$" />} cursor={{ stroke: '#334155' }} />
        <Area
          type="monotone"
          dataKey="forecast"
          stroke="#64748b"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          fill="transparent"
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#3b82f6"
          strokeWidth={2.5}
          fill="url(#revFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function SalesChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={salesData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis
          dataKey="channel"
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v / 1000}k`}
        />
        <Tooltip content={<TooltipBox />} cursor={{ fill: '#1e293b' }} />
        <Bar dataKey="sales" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CustomerChart() {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ResponsiveContainer width="100%" height={200} className="max-w-[220px]">
        <PieChart>
          <Pie
            data={customerData}
            dataKey="value"
            nameKey="name"
            innerRadius={52}
            outerRadius={82}
            paddingAngle={3}
            stroke="none"
          >
            {customerData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<TooltipBox suffix="%" />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:flex-col">
        {customerData.map((c) => (
          <div key={c.name} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
            <span className="text-muted-foreground">{c.name}</span>
            <span className="ml-auto font-medium">{c.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
