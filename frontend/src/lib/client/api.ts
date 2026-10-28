"use client";

import { useCallback, useEffect, useState } from "react";

export class ApiError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;
  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

interface Envelope<T> { data: T; nextCursor?: string | null }

async function request<T>(path: string, init?: RequestInit): Promise<Envelope<T>> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: { ...(init?.body ? { "content-type": "application/json" } : {}), ...init?.headers },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "network", "Could not reach the Inkloom server. Check that the app is running, then try again.");
  }
  if (res.status === 204) return { data: undefined as T };
  let payload: unknown = null;
  try { payload = await res.json(); } catch { /* non-JSON error body */ }
  if (!res.ok) {
    const err = (payload as { error?: { code?: string; message?: string; fields?: Record<string, string> } } | null)?.error;
    throw new ApiError(res.status, err?.code ?? "http_error", err?.message ?? `Request failed (${res.status}).`, err?.fields);
  }
  return payload as Envelope<T>;
}

export const apiGet = <T,>(path: string) => request<T>(path);
export const apiPost = <T,>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) });
export const apiPatch = <T,>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
export const apiDelete = (path: string) => request<void>(path, { method: "DELETE" });

export type AsyncState<T> =
  | { status: "loading" }
  | { status: "error"; error: ApiError }
  | { status: "ready"; data: T; nextCursor: string | null };

export function useApi<T>(path: string | null) {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    apiGet<T>(path)
      .then((r) => { if (!cancelled) setState({ status: "ready", data: r.data, nextCursor: r.nextCursor ?? null }); })
      .catch((e: unknown) => {
        if (!cancelled) setState({ status: "error", error: e instanceof ApiError ? e : new ApiError(0, "unknown", "Unexpected error.") });
      });
    return () => { cancelled = true; };
  }, [path, nonce]);

  const reload = useCallback(() => { setState({ status: "loading" }); setNonce((n) => n + 1); }, []);
  /** Replace data locally after a confirmed server response (no optimistic updates). */
  const setData = useCallback((updater: (prev: T) => T) => {
    setState((s) => (s.status === "ready" ? { ...s, data: updater(s.data) } : s));
  }, []);
  return { state, reload, setData };
}

export function describeError(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  return "Unexpected error.";
}
