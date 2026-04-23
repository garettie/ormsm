import { useMemo, memo, type FC } from "react";
import { X } from "lucide-react";
import { MultiSelect } from "../ui/MultiSelect";
import type { ProcessedContact } from "../../types";

interface FiltersProps {
  data: ProcessedContact[];
  filters: {
    departments: string[];
    locations: string[];
    levels: string[];
    statuses: string[];
  };
  onFilterChange: (
    type: "departments" | "locations" | "levels" | "statuses",
    value: string[],
  ) => void;
  onClear: () => void;
}

export const Filters: FC<FiltersProps> = memo(({
  data,
  filters,
  onFilterChange,
  onClear,
}) => {
  const uniqueDepts = useMemo(
    () =>
      Array.from(new Set(data.map((c) => c.department).filter(Boolean))).sort(),
    [data],
  );
  const uniqueLocs = useMemo(
    () =>
      Array.from(new Set(data.map((c) => c.location).filter(Boolean))).sort(),
    [data],
  );
  const uniqueLevels = useMemo(
    () =>
      Array.from(
        new Set(data.map((c) => c.level || c.position).filter(Boolean)),
      ).sort(),
    [data],
  );
  const uniqueStatuses = [
    "Severe",
    "Moderate",
    "Slight",
    "Safe",
    "No Response",
  ];

  const hasActiveFilters = 
    filters.departments.length > 0 || 
    filters.locations.length > 0 || 
    filters.levels.length > 0 || 
    filters.statuses.length > 0;

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filters</div>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-600 transition-colors bg-gray-50 hover:bg-red-50 px-2 py-1 rounded-md border border-gray-100 hover:border-red-100"
          >
            <X className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MultiSelect
          label="Department"
          options={uniqueDepts}
          selected={filters.departments}
          onChange={(val) => onFilterChange("departments", val)}
          placeholder="Select Department"
        />
        <MultiSelect
          label="Location"
          options={uniqueLocs}
          selected={filters.locations}
          onChange={(val) => onFilterChange("locations", val)}
          placeholder="Select Location"
        />
        <MultiSelect
          label="Level/Position"
          options={uniqueLevels}
          selected={filters.levels}
          onChange={(val) => onFilterChange("levels", val)}
          placeholder="Select Level"
        />
        <MultiSelect
          label="Status"
          options={uniqueStatuses}
          selected={filters.statuses}
          onChange={(val) => onFilterChange("statuses", val)}
          placeholder="Select Status"
        />
      </div>
    </div>
  );
});
