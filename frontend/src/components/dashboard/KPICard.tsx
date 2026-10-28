import Link from "next/link";

interface KPICardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
  };
  href?: string;
  icon?: React.ReactNode;
}

export function KPICard({ label, value, subtitle, trend, href, icon }: KPICardProps) {
  const content = (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <dt className="text-xs font-medium uppercase tracking-wider text-muted">{label}</dt>
        <dd className="mt-2 flex items-baseline gap-2">
          <span className="font-heading text-3xl font-semibold text-foreground">
            {value}
          </span>
          {trend && (
            <span
              className={`text-sm font-medium ${
                trend.value > 0
                  ? "text-success"
                  : trend.value < 0
                  ? "text-error"
                  : "text-muted"
              }`}
            >
              {trend.value > 0 && "+"}
              {trend.value}% {trend.label}
            </span>
          )}
        </dd>
        {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
      </div>
      {icon && (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
          {icon}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-lg border border-border bg-surface p-5 transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      {content}
    </div>
  );
}
