"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Card, CardContent, CardHeader } from "@/components";
import { DemoPill, ErrorBanner, LoadingLine } from "@/components/review/ReviewParts";
import { ApiError, apiGet, apiPatch, apiPost, describeError, useApi } from "@/lib/client/api";
import { RULE_TYPES, SEVERITIES, getRuleTypeLabel } from "@/lib/review-engine";
import type { RuleType, Severity } from "@/lib/review-engine";
import type { Brand, BrandRule, BrandWithCounts } from "@/backend";

const inputCls = "w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
const btnPrimary = "rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50";
const btnGhost = "rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-hover disabled:opacity-50";

function Field({ label, id, error, children, hint }: { label: string; id: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-foreground">{label}</label>
      {children}
      {error ? <p id={`${id}-err`} className="mt-1 text-xs text-error">{error}</p> : hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

function BrandForm({ onCreated, onCancel }: { onCreated: (b: Brand) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<ApiError | null>(null);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try { onCreated((await apiPost<Brand>("/api/brands", { name, description, tone })).data); }
    catch (x) { setErr(x instanceof ApiError ? x : new ApiError(0, "unknown", describeError(x))); }
    finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-border bg-surface p-5" aria-label="Create brand">
      <Field label="Brand name" id="nb-name" error={err?.fields?.name}><input id="nb-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required /></Field>
      <Field label="Description" id="nb-desc" error={err?.fields?.description}><textarea id="nb-desc" className={inputCls} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} /></Field>
      <Field label="Tone of voice" id="nb-tone" error={err?.fields?.tone}><input id="nb-tone" className={inputCls} value={tone} onChange={(e) => setTone(e.target.value)} maxLength={200} /></Field>
      {err && !err.fields && <ErrorBanner error={err} title="Brand was not created" />}
      <div className="flex gap-2"><button className={btnPrimary} disabled={busy}>{busy ? "Creating…" : "Create brand"}</button><button type="button" className={btnGhost} onClick={onCancel}>Cancel</button></div>
    </form>
  );
}

function RuleForm({ brandId, rule, onSaved, onCancel }: { brandId: string; rule?: BrandRule; onSaved: (r: BrandRule) => void; onCancel: () => void }) {
  const [name, setName] = useState(rule?.name ?? "");
  const [type, setType] = useState<RuleType>(rule?.type ?? "restricted-phrase");
  const [severity, setSeverity] = useState<Severity>(rule?.severity ?? "warning");
  const [patterns, setPatterns] = useState((rule?.patterns ?? []).join("\n"));
  const [description, setDescription] = useState(rule?.description ?? "");
  const [suggestion, setSuggestion] = useState(rule?.suggestion ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<ApiError | null>(null);
  const key = rule?.id ?? "new";
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    const body = { name, type, severity, patterns: patterns.split("\n").map((p) => p.trim()).filter(Boolean), description, suggestion };
    try {
      const path = `/api/brands/${encodeURIComponent(brandId)}/rules`;
      const res = rule ? await apiPatch<BrandRule>(`${path}/${encodeURIComponent(rule.id)}`, body) : await apiPost<BrandRule>(path, body);
      onSaved(res.data);
    } catch (x) { setErr(x instanceof ApiError ? x : new ApiError(0, "unknown", describeError(x))); }
    finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-border bg-surface-hover p-5" aria-label={rule ? `Edit rule ${rule.name}` : "Add rule"}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Rule name" id={`r-name-${key}`} error={err?.fields?.name}><input id={`r-name-${key}`} className={inputCls} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required /></Field>
        <Field label="Type" id={`r-type-${key}`} error={err?.fields?.type}>
          <select id={`r-type-${key}`} className={inputCls} value={type} onChange={(e) => setType(e.target.value as RuleType)}>{RULE_TYPES.map((t) => <option key={t} value={t}>{getRuleTypeLabel(t)}</option>)}</select>
        </Field>
        <Field label="Severity" id={`r-sev-${key}`} error={err?.fields?.severity}>
          <select id={`r-sev-${key}`} className={inputCls} value={severity} onChange={(e) => setSeverity(e.target.value as Severity)}>{SEVERITIES.map((s) => <option key={s} value={s}>{s === "error" ? "Error (blocking)" : "Warning (advisory)"}</option>)}</select>
        </Field>
      </div>
      <Field label="Phrases to match" id={`r-pat-${key}`} error={err?.fields?.patterns} hint="One per line. Case-insensitive, matched as literal text anywhere in the content.">
        <textarea id={`r-pat-${key}`} className={`${inputCls} font-mono`} rows={4} value={patterns} onChange={(e) => setPatterns(e.target.value)} required />
      </Field>
      <Field label="Explanation shown with findings" id={`r-desc-${key}`} error={err?.fields?.description}><textarea id={`r-desc-${key}`} className={inputCls} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} required /></Field>
      <Field label="Suggested correction" id={`r-sug-${key}`} error={err?.fields?.suggestion}><textarea id={`r-sug-${key}`} className={inputCls} rows={2} value={suggestion} onChange={(e) => setSuggestion(e.target.value)} maxLength={500} /></Field>
      {err && (!err.fields || err.fields.body) && <ErrorBanner error={err} title="Rule was not saved" />}
      <div className="flex gap-2"><button className={btnPrimary} disabled={busy}>{busy ? "Saving…" : rule ? "Save changes" : "Add rule"}</button><button type="button" className={btnGhost} onClick={onCancel}>Cancel</button></div>
    </form>
  );
}

export default function BrandGuidelinesPage() {
  const brands = useApi<BrandWithCounts[]>("/api/brands");
  const [picked, setPicked] = useState<string | null>(null);
  const [creatingBrand, setCreatingBrand] = useState(false);
  const list = brands.state.status === "ready" ? brands.state.data : [];
  const brand = list.find((b) => b.id === (picked ?? list[0]?.id)) ?? null;
  const rules = useApi<BrandRule[]>(brand ? `/api/brands/${encodeURIComponent(brand.id)}/rules` : null);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [busyRule, setBusyRule] = useState<string | null>(null);

  const refreshCounts = async () => {
    try {
      const r = await apiGet<BrandWithCounts[]>("/api/brands");
      brands.setData(() => r.data);
    } catch (e) { setToggleError(`Rule saved, but brand counts could not be refreshed: ${describeError(e)}`); }
  };

  const toggle = async (r: BrandRule) => {
    if (!brand) return;
    setBusyRule(r.id); setToggleError(null);
    try {
      const { data } = await apiPatch<BrandRule>(`/api/brands/${encodeURIComponent(brand.id)}/rules/${encodeURIComponent(r.id)}`, { enabled: !r.enabled });
      rules.setData((prev) => prev.map((x) => (x.id === data.id ? data : x)));
      await refreshCounts();
    } catch (e) { setToggleError(describeError(e)); }
    finally { setBusyRule(null); }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Guidelines</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold text-foreground">Brand guidelines</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">Brands and the rules reviews are checked against. Editing a rule creates a new version; past reviews keep the version they used.</p>
        </div>
        <button type="button" className={btnGhost} onClick={() => setCreatingBrand((v) => !v)} aria-expanded={creatingBrand}>New brand</button>
      </header>

      {creatingBrand && <BrandForm onCancel={() => setCreatingBrand(false)} onCreated={(b) => { setCreatingBrand(false); setPicked(b.id); brands.reload(); }} />}
      {brands.state.status === "loading" && <LoadingLine label="Loading brands…" />}
      {brands.state.status === "error" && <ErrorBanner error={brands.state.error} onRetry={brands.reload} title="Could not load brands" />}

      {list.length > 0 && (
        <div role="tablist" aria-label="Brands" className="flex flex-wrap gap-2 border-b border-border pb-3">
          {list.map((b) => (
            <button key={b.id} role="tab" aria-selected={b.id === brand?.id} type="button" onClick={() => { setPicked(b.id); setEditing(null); }}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${b.id === brand?.id ? "border-transparent bg-accent text-accent-foreground" : "border-border bg-surface text-foreground hover:bg-surface-hover"}`}>
              {b.name}
            </button>
          ))}
        </div>
      )}

      {brand && (
        <>
          <section className="space-y-2" aria-labelledby="brand-name">
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="brand-name" className="font-heading text-2xl font-semibold text-foreground">{brand.name}</h2>
              {brand.isDemo && <DemoPill />}
            </div>
            {brand.description && <p className="max-w-2xl text-sm text-muted">{brand.description}</p>}
            {brand.tone && <p className="text-sm text-muted"><span className="font-medium text-foreground">Tone: </span>{brand.tone}</p>}
            {brand.isDemo && <p className="text-xs text-muted">Illustrative demo rules, not verified legal or commercial guidance.</p>}
          </section>

          <Card variant="elevated">
            <CardHeader title="Rules" description={`${brand.enabledRuleCount} of ${brand.ruleCount} enabled`} action={<button type="button" className={btnPrimary} onClick={() => setEditing("new")}>Add rule</button>} />
            <CardContent className="space-y-4">
              {editing === "new" && (
                <RuleForm brandId={brand.id} onCancel={() => setEditing(null)} onSaved={(r) => { rules.setData((p) => [...p, r]); void refreshCounts(); setEditing(null); }} />
              )}
              {toggleError && <ErrorBanner error={toggleError} title="Could not update the rule" />}
              {rules.state.status === "loading" && <LoadingLine label="Loading rules…" />}
              {rules.state.status === "error" && <ErrorBanner error={rules.state.error} onRetry={rules.reload} title="Could not load rules" />}
              {rules.state.status === "ready" && rules.state.data.length === 0 && editing !== "new" && <p className="text-sm text-muted">No rules yet. Add one to start reviewing content for this brand.</p>}
              {rules.state.status === "ready" && (
                <ul className="divide-y divide-border">
                  {rules.state.data.map((r) => (
                    <li key={r.id} className="py-5">
                      {editing === r.id ? (
                        <RuleForm brandId={brand.id} rule={r} onCancel={() => setEditing(null)} onSaved={(u) => { rules.setData((p) => p.map((x) => (x.id === u.id ? u : x))); setEditing(null); }} />
                      ) : (
                        <div className={`space-y-3 ${r.enabled ? "" : "opacity-70"}`}>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h3 className="font-heading text-lg font-semibold text-foreground">{r.name}</h3>
                              <p className="text-xs text-muted">{getRuleTypeLabel(r.type)} · {r.severity === "error" ? "Error (blocking)" : "Warning (advisory)"} · version {r.version} · <span className="font-mono">{r.stableId}</span></p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button type="button" role="switch" aria-checked={r.enabled} aria-label={`${r.enabled ? "Disable" : "Enable"} ${r.name}`} disabled={busyRule === r.id} onClick={() => toggle(r)}
                                className={`relative h-6 w-11 rounded-full border transition-colors disabled:opacity-50 ${r.enabled ? "border-transparent bg-accent" : "border-border-strong bg-surface-hover"}`}>
                                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-all ${r.enabled ? "left-[22px]" : "left-0.5"}`} />
                              </button>
                              <button type="button" className={btnGhost} onClick={() => setEditing(r.id)}>Edit</button>
                            </div>
                          </div>
                          <p className="text-sm text-muted">{r.description}</p>
                          <ul className="flex flex-wrap gap-1.5" aria-label="Phrases">{r.patterns.map((p) => <li key={p} className="rounded border border-border bg-background px-2 py-0.5 font-mono text-xs text-foreground">{p}</li>)}</ul>
                          {r.suggestion && <p className="text-sm text-muted"><span className="font-medium text-foreground">Suggested correction: </span>{r.suggestion}</p>}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted">Approved-facts and evidence registers are not implemented yet. Brand editing (name, description, tone) is available through the API but has no screen yet.</p>
        </>
      )}
    </div>
  );
}
