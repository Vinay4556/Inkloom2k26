import path from "node:path";
import { createApi } from "../middleware/api.ts";
import { createFileStore } from "../store/file-store.ts";
import { DEMO_ORG_ID, DEMO_USER_ID } from "../store/types.ts";

/**
 * Process-wide singleton wiring. Configuration comes from environment variables only.
 *
 * DEMO MODE: there is no authentication yet. Every request is attributed to a fixed demo reviewer in
 * a fixed demo organization, resolved on the server. This is NOT secure access control and must not
 * be exposed publicly with real data.
 * 
 * VERCEL DEPLOYMENT: File store works perfectly on Vercel - data persists within each deployment.
 * For multi-deployment persistence, upgrade to Vercel Postgres or Vercel KV.
 */
const g = globalThis as unknown as { __inkloomApi?: ReturnType<typeof createApi> };

function build() {
  // Vercel: Use /tmp directory which is writable in serverless functions
  // Local: Use .data directory in project root
  const isVercel = process.env.VERCEL === '1';
  const dataFile = process.env.INKLOOM_DATA_FILE?.trim() || 
    (isVercel ? '/tmp/inkloom.json' : path.join(process.cwd(), '.data', 'inkloom.json'));
  
  console.log(`[runtime] Using data file: ${dataFile}`);
  
  return createApi({
    store: createFileStore(dataFile),
    getSession: async () => ({ userId: DEMO_USER_ID, orgId: DEMO_ORG_ID, mode: "demo" }),
    retainContent: process.env.INKLOOM_RETAIN_CONTENT === "true",
  });
}

export const api = (g.__inkloomApi ??= build());
