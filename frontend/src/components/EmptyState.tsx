import {
  ShieldCheckIcon,
  FileTextIcon,
  BookOpenIcon,
  HistoryIcon,
  SettingsIcon,
  SearchIcon,
} from "./Icons";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: "shield" | "file" | "book" | "history" | "settings" | "search";
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

const iconMap = {
  shield: ShieldCheckIcon,
  file: FileTextIcon,
  book: BookOpenIcon,
  history: HistoryIcon,
  settings: SettingsIcon,
  search: SearchIcon,
};

export function EmptyState({
  title,
  description,
  icon = "shield",
  action,
  className = "",
}: EmptyStateProps) {
  const IconComponent = iconMap[icon];

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-muted text-accent">
        <IconComponent className="w-6 h-6" ariaHidden={true} />
      </div>
      <h3 className="mb-2 text-base font-heading font-semibold text-foreground">{title}</h3>
      <p className="mb-4 max-w-sm text-sm text-muted">{description}</p>
      {action && (
        <a
          href={action.href}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-colors"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
