interface DateRangeSelectorProps {
  value: number;
  onChange: (days: number) => void;
}

const PRESETS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Date range selector">
      {PRESETS.map((preset) => (
        <button
          key={preset.days}
          type="button"
          onClick={() => onChange(preset.days)}
          aria-pressed={value === preset.days}
          className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            value === preset.days
              ? "border-transparent bg-accent text-accent-foreground"
              : "border-border bg-surface text-foreground hover:bg-surface-hover"
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
