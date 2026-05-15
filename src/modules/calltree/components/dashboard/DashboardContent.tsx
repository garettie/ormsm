import { useState, useMemo, useCallback } from "react";
import { Filters } from "./Filters";
import { KPICard } from "./KPICard";
import { StatusDonut } from "./charts/StatusDonut";
import { ResponseDonut } from "./charts/ResponseDonut";
import { ResponseTimeline } from "./charts/ResponseTimeline";
import { DemographicChart } from "./charts/DemographicChart";
import { ResponsesTable } from "./tables/ResponsesTable";
import { UnknownTable, PendingTable } from "./tables/AuxiliaryTables";
import { COLORS } from "../../lib/constants";
import { getStatusColor } from "../../../../lib/utils";
import type { DashboardData } from "../../types";
import {
  Users,
  CheckCircle,
  ShieldCheck,
  AlertCircle,
  Clock,
} from "lucide-react";

interface DashboardContentProps {
  data: DashboardData;
  storageKey?: string; // If provided, persists filters to localStorage (for IncidentHistory)
  onRefresh?: () => void;
}

interface FilterState {
  departments: string[];
  locations: string[];
  levels: string[];
  statuses: string[];
}

export function DashboardContent({
  data,
  storageKey,
  onRefresh,
}: DashboardContentProps) {
  const [filters, setFilters] = useState<FilterState>(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          return JSON.parse(saved) as FilterState;
        }
      } catch {
        // ignore
      }
    }
    return {
      departments: [],
      locations: [],
      levels: [],
      statuses: [],
    };
  });

  const uniqueDepartments = useMemo(
    () =>
      Array.from(new Set(data.contacts.map((c) => c.department).filter(Boolean))).sort(),
    [data.contacts],
  );
  const uniqueLocations = useMemo(
    () =>
      Array.from(new Set(data.contacts.map((c) => c.location).filter(Boolean))).sort(),
    [data.contacts],
  );
  const uniqueLevels = useMemo(
    () =>
      Array.from(new Set(data.contacts.map((c) => c.level || c.position).filter(Boolean))).sort(),
    [data.contacts],
  );

  const effectiveFilters = useMemo(() => ({
    departments: data.isTargeted && filters.departments.length === 0
      ? uniqueDepartments
      : filters.departments,
    locations: data.isTargeted && filters.locations.length === 0
      ? uniqueLocations
      : filters.locations,
    levels: data.isTargeted && filters.levels.length === 0
      ? uniqueLevels
      : filters.levels,
    statuses: filters.statuses,
  }), [filters, data.isTargeted, uniqueDepartments, uniqueLocations, uniqueLevels]);

  const handleFilterChange = useCallback(
    (type: keyof typeof filters, value: string[]) => {
      setFilters((prev) => {
        const next = { ...prev, [type]: value };
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(next));
        }
        return next;
      });
    },
    [storageKey],
  );

  const handleClearFilters = useCallback(() => {
    const cleared = {
      departments: [],
      locations: [],
      levels: [],
      statuses: [],
    };
    setFilters(cleared);
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const filteredData = useMemo(() => {
    return data.contacts.filter((c) => {
      if (
        effectiveFilters.departments.length > 0 &&
        !effectiveFilters.departments.includes(c.department)
      )
        return false;
      if (
        effectiveFilters.locations.length > 0 &&
        !effectiveFilters.locations.includes(c.location)
      )
        return false;
      if (
        effectiveFilters.levels.length > 0 &&
        !effectiveFilters.levels.includes(c.level || c.position)
      )
        return false;
      if (effectiveFilters.statuses.length > 0 && !effectiveFilters.statuses.includes(c.status))
        return false;
      return true;
    });
  }, [data.contacts, effectiveFilters]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const responded = filteredData.filter(
      (c) => c.status !== "No Response",
    ).length;
    const safe = filteredData.filter((c) => c.status === "Safe").length;
    const slight = filteredData.filter((c) => c.status === "Slight").length;
    const moderate = filteredData.filter((c) => c.status === "Moderate").length;
    const severe = filteredData.filter((c) => c.status === "Severe").length;
    const affected = slight + moderate + severe;
    const pending = filteredData.filter(
      (c) => c.status === "No Response",
    ).length;

    return {
      total,
      responded,
      safe,
      affected,
      slight,
      moderate,
      severe,
      pending,
    };
  }, [filteredData]);

  const respondedData = useMemo(() => filteredData.filter((c) => c.status !== "No Response"), [filteredData]);
  const pendingData = useMemo(() => filteredData.filter((c) => c.status === "No Response"), [filteredData]);

  const handleResponseAdded = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    } else {
      console.warn(
        "Manual response added, but no refresh handler provided. Data may be stale until next auto-refresh.",
      );
    }
  }, [onRefresh]);

  const isPoll = data.notificationCategory === "poll";

  const pollStatusOrder = useMemo(() => {
    if (!isPoll || !data.pollOptions) return undefined;
    return [...data.pollOptions.map((o) => o.label), "Invalid", "No Response"];
  }, [isPoll, data.pollOptions]);

  const pollStatusColors = useMemo(() => {
    if (!isPoll || !data.pollOptions) return undefined;
    const colors: Record<string, { bg: string; text: string; border: string }> = {};
    data.pollOptions.forEach((opt, i) => {
      colors[opt.label] = getStatusColor(opt.label, i, data.pollOptions!.length);
    });
    return colors;
  }, [isPoll, data.pollOptions]);

  return (
    <div className="animate-in fade-in duration-500">
      <Filters
        data={data.contacts}
        filters={effectiveFilters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* KPI Grid */}
      {data.notificationCategory === "broadcast" || isPoll ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <KPICard
            label="Total Contacts"
            value={stats.total.toLocaleString()}
            subtext={`${data.contacts.length} in DB`}
            color={COLORS["No Response"]}
            icon={Users}
          />
          <KPICard
            label="Responded"
            value={stats.responded.toLocaleString()}
            subtext={
              stats.total > 0
                ? `${Math.round((stats.responded / stats.total) * 100)}% response rate`
                : "0%"
            }
            color={COLORS.Responded || COLORS.Primary}
            icon={CheckCircle}
          />
          <KPICard
            label="Pending"
            value={stats.pending.toLocaleString()}
            subtext={
              stats.total > 0
                ? `${Math.round((stats.pending / stats.total) * 100)}% awaiting`
                : "0%"
            }
            color={COLORS.Moderate}
            icon={Clock}
          />
        </div>
      ) : (
        (() => {
          const respondedStatuses = ["Safe", "Slight", "Moderate", "Severe"];
          const affectedStatuses = ["Slight", "Moderate", "Severe"];

          const isRespondedActive =
            effectiveFilters.statuses.length === respondedStatuses.length &&
            respondedStatuses.every((s) => effectiveFilters.statuses.includes(s));
          const isSafeActive =
            effectiveFilters.statuses.length === 1 && effectiveFilters.statuses.includes("Safe");
          const isAffectedActive =
            effectiveFilters.statuses.length === affectedStatuses.length &&
            affectedStatuses.every((s) => effectiveFilters.statuses.includes(s));
          const isPendingActive =
            effectiveFilters.statuses.length === 1 &&
            effectiveFilters.statuses.includes("No Response");

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <KPICard
                label="Total Contacts"
                value={stats.total.toLocaleString()}
                subtext={`${data.contacts.length} in DB`}
                color={COLORS["No Response"]}
                onClick={() => handleFilterChange("statuses", [])}
                isActive={effectiveFilters.statuses.length === 0}
                icon={Users}
              />
              <KPICard
                label="Responded"
                value={stats.responded.toLocaleString()}
                subtext={
                  stats.total > 0
                    ? `${Math.round((stats.responded / stats.total) * 100)}% response rate`
                    : "0%"
                }
                color={COLORS.Primary}
                onClick={() =>
                  handleFilterChange(
                    "statuses",
                    isRespondedActive ? [] : respondedStatuses,
                  )
                }
                isActive={isRespondedActive}
                icon={CheckCircle}
              />
              <KPICard
                label="Safe"
                value={stats.safe.toLocaleString()}
                subtext={
                  stats.responded > 0
                    ? `${Math.round((stats.safe / stats.responded) * 100)}% of responders`
                    : "0%"
                }
                color={COLORS.Safe}
                onClick={() =>
                  handleFilterChange("statuses", isSafeActive ? [] : ["Safe"])
                }
                isActive={isSafeActive}
                icon={ShieldCheck}
              />
              <KPICard
                label="Affected"
                value={stats.affected.toLocaleString()}
                subtext={
                  stats.responded > 0
                    ? `${Math.round((stats.severe / stats.responded) * 100)}% Severe`
                    : "0%"
                }
                color={COLORS.Slight}
                onClick={() =>
                  handleFilterChange(
                    "statuses",
                    isAffectedActive ? [] : affectedStatuses,
                  )
                }
                isActive={isAffectedActive}
                icon={AlertCircle}
              />
              <KPICard
                label="Pending"
                value={stats.pending.toLocaleString()}
                subtext={
                  stats.total > 0
                    ? `${Math.round((stats.pending / stats.total) * 100)}% awaiting`
                    : "0%"
                }
                color={COLORS.Moderate}
                onClick={() =>
                  handleFilterChange(
                    "statuses",
                    isPendingActive ? [] : ["No Response"],
                  )
                }
                isActive={isPendingActive}
                icon={Clock}
              />
            </div>
          );
        })()
      )}

      {/* Charts Row 1 */}
      <div className={`grid grid-cols-1 gap-6 mb-6 ${data.notificationCategory === "broadcast" ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
        {data.notificationCategory !== "broadcast" && <StatusDonut data={filteredData} statusOrder={pollStatusOrder} statusColors={pollStatusColors} />}
        <ResponseDonut responded={stats.responded} total={stats.total} />
        <ResponseTimeline data={filteredData} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DemographicChart
          data={filteredData}
          category="department"
          title="Department"
          notificationCategory={data.notificationCategory}
          statusOrder={pollStatusOrder}
          statusColors={pollStatusColors}
        />
        <DemographicChart
          data={filteredData}
          category="location"
          title="Location"
          notificationCategory={data.notificationCategory}
          statusOrder={pollStatusOrder}
          statusColors={pollStatusColors}
        />
      </div>

      {/* Main Table */}
      <div className="mb-8">
        <ResponsesTable
          data={respondedData}
          statusColors={pollStatusColors}
        />
      </div>

      {/* Auxiliary Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UnknownTable data={data.unknownResponses} contacts={data.contacts} onLinked={handleResponseAdded} />
        <PendingTable
          data={pendingData}
          onResponseAdded={handleResponseAdded}
          notificationCategory={data.notificationCategory}
          pollOptions={data.pollOptions}
        />
      </div>
    </div>
  );
}
