import { X } from "lucide-react";
import { 
  DEPARTMENTS, 
  RISK_LEVELS, 
  CONTROLS_LABEL_COLORS, 
  shortDept,
} from "../utils/riskLevels";
import { MultiSelect } from "../../../components/MultiSelect";
import type { FilterState } from "../types";

interface DashboardHeaderProps {
  periods: string[];
  filters: FilterState;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  clearAllFilters: () => void;
}

export default function DashboardHeader({
  periods,
  filters,
  onFilterChange,
  clearAllFilters,
}: DashboardHeaderProps) {
  const hasActiveFilters = 
    filters.deptFilter.length > 0 || filters.periodFilter.length > 0 || filters.statusFilter.length > 0 || 
    filters.inherentRiskFilter.length > 0 || filters.controlRatingFilter.length > 0 || filters.riskLevelFilter.length > 0 || 
    filters.controlTypeFilter || filters.rootCauseFilter || filters.treatmentFilter || 
    filters.eventTypeFilter || filters.heatmapFilter;

  const hasChartPills = filters.controlTypeFilter || filters.rootCauseFilter || filters.treatmentFilter || filters.eventTypeFilter || filters.heatmapFilter;

  return (
    <div className="mb-6">
      {/* Primary row: Filter dropdowns — grid layout matching Call Tree */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
        <MultiSelect
          label="All Departments"
          options={DEPARTMENTS}
          selected={filters.deptFilter}
          onChange={(val) => onFilterChange("deptFilter", val)}
          formatLabel={shortDept}
        />
        <MultiSelect
          label="All Periods"
          options={periods}
          selected={filters.periodFilter}
          onChange={(val) => onFilterChange("periodFilter", val)}
        />
        <MultiSelect
          label="All Statuses"
          options={["Open", "In Progress", "Closed"]}
          selected={filters.statusFilter}
          onChange={(val) => onFilterChange("statusFilter", val)}
        />
        <MultiSelect
          label="Inherent Risk"
          options={RISK_LEVELS}
          selected={filters.inherentRiskFilter}
          onChange={(val) => onFilterChange("inherentRiskFilter", val)}
        />
        <MultiSelect
          label="Control Rating"
          options={Object.keys(CONTROLS_LABEL_COLORS)}
          selected={filters.controlRatingFilter}
          onChange={(val) => onFilterChange("controlRatingFilter", val)}
        />
        <MultiSelect
          label="Residual Risk"
          options={RISK_LEVELS}
          selected={filters.riskLevelFilter}
          onChange={(val) => onFilterChange("riskLevelFilter", val)}
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
              {filters.controlTypeFilter && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-accent-light text-accent-primary">
                  Control: {filters.controlTypeFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange("controlTypeFilter", null)} />
                </span>
              )}
              {filters.rootCauseFilter && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-accent-light text-accent-primary">
                  Cause: {filters.rootCauseFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange("rootCauseFilter", null)} />
                </span>
              )}
              {filters.treatmentFilter && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-accent-light text-accent-primary">
                  Treatment: {filters.treatmentFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange("treatmentFilter", null)} />
                </span>
              )}
              {filters.eventTypeFilter && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-accent-light text-accent-primary">
                  Event: {filters.eventTypeFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange("eventTypeFilter", null)} />
                </span>
              )}
              {filters.heatmapFilter && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-accent-light text-accent-primary">
                  Heatmap: L{filters.heatmapFilter.l}×I{filters.heatmapFilter.i}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange("heatmapFilter", null)} />
                </span>
              )}

            </>
          )}
        </div>
      )}
    </div>
  );
}
