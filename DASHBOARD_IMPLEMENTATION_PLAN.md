# Brand Intelligence Dashboard - Implementation Plan

## AUDIT FINDINGS

### Existing Architecture ✅
- **Backend**: Next.js 16 API routes, JSON file-based store
- **Auth**: Demo mode with single shared workspace (DEMO_ORG_ID)
- **Data Models**: ReviewRun, BrandRule, ReviewListItem, Summary
- **Review Workflow**: Submit → Validate → Save → Display in History
- **Content Retention**: Configurable via INKLOOM_RETAIN_CONTENT (default: false)
- **API Endpoints**:
  - `GET /api/summary` - Returns brands, rules, reviews counts
  - `GET /api/reviews?limit&cursor&brandId` - Paginated review list
  - `GET /api/reviews/{id}` - Single review detail
  - `POST /api/reviews` - Create review (runs validation)
  - `GET /api/brands` - List brands with counts
  - `GET /api/brands/{id}/rules` - List rules for brand

### Data Available for Analytics
- ✅ Review outcomes: "no_rules_triggered", "findings_require_review"
- ✅ Finding severity: "error", "warning"
- ✅ Rule types: 8 types (absolute-claim, restricted-phrase, etc.)
- ✅ Timestamps: createdAt on all reviews
- ✅ Rule violations: findings array with ruleStableId, severity
- ✅ Content metrics: contentLength, summary.total/errors/warnings

### Data NOT Available
- ❌ No channel metadata (website/social/email)
- ❌ No approval workflow states
- ❌ No before/after validation pairs (no correction tracking)
- ❌ No notification/alert system
- ❌ No user activity log

### Current Charting Libraries
- **None installed** - Need to add recharts (React + Next.js compatible)

### Issues Found During Audit
1. ✅ **Brand Repair navigation fixed** (completed earlier)
2. ✅ **Review persistence working**
3. ✅ **All 25 backend tests passing**

---

## IMPLEMENTATION PLAN

### Phase 1: Add Recharts Library
- Install recharts (React charting library, 3.5MB gzipped)
- Verify compatibility with Next.js 16 and React 19

### Phase 2: Create Analytics API Endpoint
**File**: `backend/src/middleware/api.ts`
- Add `/api/analytics?startDate&endDate&brandId` endpoint
- Return:
  - Daily consistency scores (% of reviews passing)
  - Rule violation rankings (top 10 most violated rules)
  - Review outcome distribution
  - Daily review counts
- Use existing store methods + aggregation logic
- Validate date ranges
- Apply authorization

### Phase 3: Upgrade Dashboard Overview Page
**File**: `frontend/src/app/dashboard/page.tsx`

**KPI Cards**:
1. Brand Consistency Score (% of reviews with no findings)
2. Reviews Completed (total count)
3. Rule Violations Detected (total findings)
4. Reviews Requiring Attention (findings_require_review count)

**Charts**:
1. **Consistency Trend Line Chart**
   - X-axis: Date
   - Y-axis: Consistency % (reviews passing / total reviews)
   - Time range selector: 7d, 30d, 90d
   - Click data point → filter reviews by date

2. **Rule Violations Ranking Bar Chart**
   - Horizontal bars
   - Show top 10 most violated rules
   - Include severity badges
   - Click bar → filter to rule's findings

3. **Review Outcome Distribution Donut Chart**
   - Segments: Passed, Failed
   - Center: Total reviews
   - Click segment → filter reviews by outcome

4. **Recent Activity Feed** (existing + enhanced)
   - Show last 10 reviews with timestamps
   - Link to review detail
   - Link to Brand Repair for reviews with findings

### Phase 4: Add Rule Analytics View
**File**: `frontend/src/app/dashboard/brand-guidelines/page.tsx` (enhance existing)
- Add analytics section showing:
  - Rule violation counts
  - Last triggered timestamp
  - Severity distribution
  - Link to filtered review history

### Phase 5: Add Filters and Drill-Down
**Components**:
- DateRangePicker component
- OutcomeFilter component
- SeverityFilter component
- Apply filters to all charts and metrics
- Preserve filter state in URL params

### Phase 6: Add Export Functionality
**Files**: 
- `frontend/src/lib/export.ts` - Export utilities
- Add "Export CSV" button to dashboard
- Export filtered data:
  - Review ID, Date, Brand, Outcome, Findings Count, Errors, Warnings
  - Rule ID, Name, Type, Severity, Violation Count

### Phase 7: Empty, Loading, Error States
- Skeleton loaders for all charts
- Empty state: "No reviews yet" with CTA to Content Review
- Error state: Show error message + retry button
- Partial data state: Show what's available + explain what's missing

### Phase 8: Testing
- Add analytics calculation tests
- Test date range filtering
- Test empty datasets
- Test CSV export
- Run typecheck, lint, build
- Manual end-to-end testing

---

## IMPLEMENTATION PRIORITIES

### Must Have (MVP)
1. ✅ Recharts library
2. ✅ Analytics API endpoint
3. ✅ 4 KPI cards with real data
4. ✅ 3 interactive charts (Consistency Trend, Rule Violations, Outcome Distribution)
5. ✅ Date range filtering (7d, 30d, 90d)
6. ✅ Click-to-filter interactions
7. ✅ CSV export
8. ✅ Empty/loading/error states

### Should Have
1. Rule analytics in Brand Guidelines
2. URL-based filter persistence
3. Custom date range picker

### Won't Have (Missing Data)
1. Channel comparison (no channel metadata)
2. Correction effectiveness (no before/after tracking)
3. Approval workflow tracking (no approval states)
4. Real-time alerts (no notification system)
5. Activity log (no event tracking beyond reviews)

---

## CALCULATION METHODOLOGIES

### Brand Consistency Score
```
consistency_score = (reviews_with_no_findings / total_reviews) * 100
```
- Only count completed reviews
- Empty dataset → Show "N/A" instead of 0%
- Comparison: Previous period if enough data

### Daily Consistency
```
daily_consistency = (daily_passing_reviews / daily_total_reviews) * 100
```
- Days without reviews → null data point (gap in chart)
- Don't extrapolate or fill missing days

### Rule Violation Ranking
```
For each rule:
  violation_count = COUNT(findings WHERE ruleStableId = rule.stableId)
ORDER BY violation_count DESC
LIMIT 10
```

### Review Outcome Distribution
```
passed = COUNT(reviews WHERE outcome = "no_rules_triggered")
failed = COUNT(reviews WHERE outcome = "findings_require_review")
```

---

## FILES TO CREATE/MODIFY

### New Files
1. `frontend/src/components/charts/ConsistencyTrendChart.tsx`
2. `frontend/src/components/charts/RuleViolationsChart.tsx`
3. `frontend/src/components/charts/OutcomeDistributionChart.tsx`
4. `frontend/src/components/dashboard/KPICard.tsx`
5. `frontend/src/components/dashboard/DateRangeSelector.tsx`
6. `frontend/src/lib/analytics.ts` - Client-side calculations
7. `frontend/src/lib/export.ts` - CSV export utilities
8. `backend/src/services/analytics.ts` - Analytics aggregation logic

### Modified Files
1. `backend/src/middleware/api.ts` - Add analytics endpoint
2. `frontend/src/app/dashboard/page.tsx` - Complete rebuild with charts
3. `frontend/package.json` - Add recharts dependency

---

## TECHNICAL DECISIONS

### Why Recharts?
- React-first, declarative API
- Next.js compatible (no window dependencies)
- SSR-friendly
- Good accessibility support
- Reasonable bundle size (~350KB)
- Active maintenance

### Why Not Others?
- Chart.js: Imperative API, harder to integrate with React
- D3: Too low-level, larger learning curve
- Victory: Larger bundle, less maintained
- Nivo: Heavier, more complex

### Data Fetching Strategy
- Fetch analytics data separately from summary
- Cache analytics for 60 seconds
- Use existing `useApi` hook
- Show stale data while revalidating

### Filter State Management
- Store in URL search params
- Parse on mount
- Update on filter change
- Persist across navigation

---

## ESTIMATED IMPLEMENTATION TIME

- Phase 1: 15 minutes (install recharts)
- Phase 2: 60 minutes (analytics API)
- Phase 3: 120 minutes (dashboard with charts)
- Phase 4: 30 minutes (rule analytics)
- Phase 5: 45 minutes (filters)
- Phase 6: 30 minutes (export)
- Phase 7: 30 minutes (states)
- Phase 8: 45 minutes (testing)

**Total**: ~6 hours

---

## SUCCESS CRITERIA

✅ Dashboard displays real review data
✅ All charts are interactive and filterable
✅ Click chart → filter reviews
✅ Date range filtering works (7d/30d/90d)
✅ CSV export works with filtered data
✅ Empty state shows helpful guidance
✅ Error states allow retry
✅ Loading states use skeletons
✅ All TypeScript checks pass
✅ All backend tests pass
✅ Build succeeds
✅ Mobile responsive
✅ No hydration errors
✅ Existing features preserved

---

## NEXT STEPS

1. Get approval for recharts library addition
2. Begin Phase 1: Install recharts
3. Proceed through phases sequentially
4. Test after each phase
5. Document any issues discovered
