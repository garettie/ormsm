import { Filter, X } from "lucide-react";
import { 
  DEPARTMENTS, 
  RISK_LEVELS, 
  CONTROLS_LABEL_COLORS, 
  shortDept,
  RISK_COLORS,
  RISK_BG,
  RISK_TEXT,
  CONTROL_BG,
  CONTROL_TEXT
} from "../utils/riskLevels";
import MultiFilter from "./MultiFilter";

export default function DashboardHeader({
  periods,
  deptFilter,
  setDeptFilter,
  periodFilter,
  setPeriodFilter,
  statusFilter,
  setStatusFilter,
  inherentRiskFilter,
  setInherentRiskFilter,
  controlRatingFilter,
  setControlRatingFilter,
  riskLevelFilter,
  setRiskLevelFilter,
  controlTypeFilter,
  setControlTypeFilter,
  rootCauseFilter,
  setRootCauseFilter,
  treatmentFilter,
  setTreatmentFilter,
  eventTypeFilter,
  setEventTypeFilter,
  heatmapFilter,
  setHeatmapFilter,
  clearAllFilters,
}) {
  const hasActiveFilters = 
    deptFilter.length > 0 || periodFilter.length > 0 || statusFilter.length > 0 || 
    inherentRiskFilter.length > 0 || controlRatingFilter.length > 0 || riskLevelFilter.length > 0 || 
    controlTypeFilter || rootCauseFilter || treatmentFilter || 
    eventTypeFilter || heatmapFilter;

  const hasChartPills = controlTypeFilter || rootCauseFilter || treatmentFilter || eventTypeFilter || heatmapFilter;

  return (
    <div className="mb-6">
      {/* Primary row: Filter dropdowns — grid layout matching Call Tree */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
        <MultiFilter
          label="All Departments"
          options={DEPARTMENTS}
          selected={deptFilter}
          onChange={setDeptFilter}
          formatLabel={shortDept}
        />
        <MultiFilter
          label="All Periods"
          options={periods}
          selected={periodFilter}
          onChange={setPeriodFilter}
        />
        <MultiFilter
          label="All Statuses"
          options={["Open", "In Progress", "Closed"]}
          selected={statusFilter}
          onChange={setStatusFilter}
        />
        <MultiFilter
          label="Inherent Risk"
          options={RISK_LEVELS}
          selected={inherentRiskFilter}
          onChange={setInherentRiskFilter}
        />
        <MultiFilter
          label="Control Rating"
          options={Object.keys(CONTROLS_LABEL_COLORS)}
          selected={controlRatingFilter}
          onChange={setControlRatingFilter}
        />
        <MultiFilter
          label="Residual Risk"
          options={RISK_LEVELS}
          selected={riskLevelFilter}
          onChange={setRiskLevelFilter}
        />
      </div>

      {/* Secondary row: Chart filter pills + clear button */}
      {(hasActiveFilters || hasChartPills) && (
        <div className="flex items-center gap-2 flex-wrap">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
            >
              Clear Filters
            </button>
          )}
          {hasChartPills && (
            <>
              <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wide">
                Active:
              </span>
              {controlTypeFilter && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-accent-light text-accent-primary">
                  Control: {controlTypeFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setControlTypeFilter(null)} />
                </span>
              )}
              {rootCauseFilter && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-accent-light text-accent-primary">
                  Cause: {rootCauseFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setRootCauseFilter(null)} />
                </span>
              )}
              {treatmentFilter && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-accent-light text-accent-primary">
                  Treatment: {treatmentFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setTreatmentFilter(null)} />
                </span>
              )}
              {eventTypeFilter && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-accent-light text-accent-primary">
                  Event: {eventTypeFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setEventTypeFilter(null)} />
                </span>
              )}
              {heatmapFilter && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-accent-light text-accent-primary">
                  Heatmap: L{heatmapFilter.l}×I{heatmapFilter.i}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setHeatmapFilter(null)} />
                </span>
              )}

            </>
          )}
        </div>
      )}
    </div>
  );
}
