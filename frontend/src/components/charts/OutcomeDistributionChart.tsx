"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface OutcomeData {
  passed: number;
  failed: number;
}

interface OutcomeDistributionChartProps {
  data: OutcomeData;
  onSegmentClick?: (outcome: "passed" | "failed") => void;
}

const COLORS = {
  passed: "var(--color-success)",
  failed: "var(--color-error)",
};

export function OutcomeDistributionChart({ data, onSegmentClick }: OutcomeDistributionChartProps) {
  const total = data.passed + data.failed;

  if (total === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        No reviews in selected period
      </div>
    );
  }

  const chartData = [
    { name: "Passed", value: data.passed, color: COLORS.passed, key: "passed" as const },
    { name: "Failed", value: data.failed, color: COLORS.failed, key: "failed" as const },
  ].filter((item) => item.value > 0); // Only show non-zero segments

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    
    const data = payload[0];
    const percentage = ((data.value / total) * 100).toFixed(1);
    
    return (
      <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
        <p className="text-xs font-medium text-foreground">{data.name}</p>
        <p className="mt-1 text-sm font-semibold text-accent">
          {data.value} reviews ({percentage}%)
        </p>
      </div>
    );
  };

  const handleClick = (entry: any) => {
    onSegmentClick?.(entry.key);
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            label={(entry) => `${entry.name}: ${entry.value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            onClick={handleClick}
            style={{ cursor: "pointer" }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
