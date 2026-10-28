"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface RuleViolationData {
  ruleStableId: string;
  ruleName: string;
  violationCount: number;
  severity: "error" | "warning";
}

interface RuleViolationsChartProps {
  data: RuleViolationData[];
  onRuleClick?: (ruleStableId: string) => void;
}

export function RuleViolationsChart({ data, onRuleClick }: RuleViolationsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        No rule violations in selected period
      </div>
    );
  }

  // Truncate long rule names
  const chartData = data.map((item) => ({
    ...item,
    displayName: item.ruleName.length > 25 ? item.ruleName.substring(0, 25) + "..." : item.ruleName,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
        <p className="text-xs font-medium text-foreground">{data.ruleName}</p>
        <p className="mt-1 text-sm font-semibold text-accent">
          {data.violationCount} violations
        </p>
        <p className="text-xs text-muted capitalize">{data.severity}</p>
      </div>
    );
  };

  const handleClick = (data: any) => {
    if (data && data.ruleStableId) {
      onRuleClick?.(data.ruleStableId);
    }
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis type="number" stroke="var(--color-muted)" style={{ fontSize: "12px" }} />
          <YAxis
            type="category"
            dataKey="displayName"
            stroke="var(--color-muted)"
            style={{ fontSize: "11px" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="violationCount"
            onClick={handleClick}
            cursor="pointer"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.severity === "error" ? "var(--color-error)" : "var(--color-warning)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
