/**
 * Backend barrel export - exposes API handlers and types to the frontend.
 * Frontend Next.js API routes import from this module.
 */

export { api } from "./config/runtime.ts";
export type { Api } from "./middleware/api.ts";
export type { 
  Brand, 
  BrandRule, 
  BrandWithCounts,
  ReviewRun, 
  ReviewListItem,
  ReviewFindingRecord,
  Summary,
  Store 
} from "./store/types.ts";
export type { AnalyticsData, DailyConsistency, RuleViolation, OutcomeDistribution } from "./services/analytics.ts";
