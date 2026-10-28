"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DailyData {
  date: string;
  consistencyScore: number;
  totalReviews: number;
}

interface ConsistencyTrendChartProps {
  data: DailyData[];
  onDateClick?: (date: string) => void;
}

export function ConsistencyTrendChart({ data, onDateClick }: ConsistencyTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        No data available for selected period
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
        <p className="text-xs font-medium text-foreground">
          {new Date(data.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </p>
        <p className="mt-1 text-sm font-semibold text-accent">
          {data.consistencyScore.toFixed(1)}% consistency
        </p>
        <p className="text-xs text-muted">{data.totalReviews} reviews</p>
      </div>
    );
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          onClick={(e) => e?.activeLabel && onDateClick?.(e.activeLabel as string)}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
            }}
            stroke="var(--color-muted)"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            stroke="var(--color-muted)"
            style={{ fontSize: "12px" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="consistencyScore"
            stroke="var(--color-accent)"
            strokeWidth={2}
            dot={{ fill: "var(--color-accent)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, style: { cursor: "pointer" } }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
