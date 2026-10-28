"use client";

import { useSyncExternalStore } from "react";
import { Card, CardContent, CardHeader } from "@/components";
import { MonitorIcon, MoonIcon, SunIcon } from "@/components/Icons";
import { ErrorBanner, LoadingLine } from "@/components/review/ReviewParts";
import { useApi } from "@/lib/client/api";
import { THEME_EVENT, readPreference, savePreference } from "@/lib/theme";
import type { ThemePreference } from "@/lib/theme";

interface Health { status: string; store: string; mode: string; notice: string; retainContent: boolean }

function subscribe(cb: () => void) {
  window.addEventListener(THEME_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(THEME_EVENT, cb); window.removeEventListener("storage", cb); };
}

const OPTIONS: { value: ThemePreference; label: string; description: string; Icon: typeof SunIcon }[] = [
  { value: "light", label: "Light", description: "Warm paper surfaces", Icon: SunIcon },
  { value: "dark", label: "Dark", description: "Ink-black surfaces", Icon: MoonIcon },
  { value: "system", label: "System", description: "Follow your device", Icon: MonitorIcon },
];

export default function SettingsPage() {
  const pref = useSyncExternalStore(subscribe, readPreference, () => "system" as ThemePreference);
  const health = useApi<Health>("/api/health");

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Preferences</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">Only settings that currently work are shown here.</p>
      </header>

      <Card variant="elevated">
        <CardHeader title="Appearance" description="Stored in this browser only." />
        <CardContent>
          <fieldset>
            <legend className="sr-only">Theme</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {OPTIONS.map(({ value, label, description, Icon }) => (
                <label key={value} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors focus-within:ring-2 focus-within:ring-ring ${pref === value ? "border-accent bg-accent-muted" : "border-border bg-surface hover:bg-surface-hover"}`}>
                  <input type="radio" name="theme" value={value} checked={pref === value} onChange={() => savePreference(value)} className="sr-only" />
                  <Icon className="mt-0.5 h-5 w-5 text-accent" />
                  <span>
                    <span className="block text-sm font-medium text-foreground">{label}</span>
                    <span className="block text-xs text-muted">{description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      <Card variant="elevated">
        <CardHeader title="Environment" description="Read from the server." />
        <CardContent>
          {health.state.status === "loading" && <LoadingLine label="Checking server…" />}
          {health.state.status === "error" && <ErrorBanner error={health.state.error} onRetry={health.reload} title="Server unreachable" />}
          {health.state.status === "ready" && (
            <dl className="grid gap-4 text-sm sm:grid-cols-3">
              <div><dt className="text-xs uppercase tracking-wider text-muted">Mode</dt><dd className="mt-1 text-foreground">Local demo, no authentication</dd></div>
              <div><dt className="text-xs uppercase tracking-wider text-muted">Storage</dt><dd className="mt-1 text-foreground">{health.state.data.store === "file" ? "Local JSON file (development only)" : health.state.data.store}</dd></div>
              <div><dt className="text-xs uppercase tracking-wider text-muted">Submitted text</dt><dd className="mt-1 text-foreground">{health.state.data.retainContent ? "Retained in review records" : "Not retained (fingerprint only)"}</dd></div>
            </dl>
          )}
          <p className="mt-4 text-xs text-muted">Workspace name, timezone, notifications, team members and API keys are not implemented, so they are not shown.</p>
        </CardContent>
      </Card>
    </div>
  );
}
