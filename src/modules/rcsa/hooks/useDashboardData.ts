import { useMemo } from "react";
import type { RiskRecord } from "../types";
import {
  getRiskLevel,
  getControlsLabel,
  CONTROLS_LABEL_COLORS,
  RISK_COLORS,
  TREATMENT_TYPES,
  ROOT_CAUSES,
  CONTROL_TYPES,
  EVENT_TYPES,
  DEPARTMENTS,
} from "../utils/riskLevels";

interface DashboardFilters {
  risks: RiskRecord[];
  deptFilter: string[];
  periodFilter: string[];
  statusFilter: string[];
  riskLevelFilter: string[];
  heatmapFilter: { l: number; i: number } | null;
  drillDept: string | null;
  controlTypeFilter: string | null;
  rootCauseFilter: string | null;
  treatmentFilter: string | null;
  eventTypeFilter: string | null;
  inherentRiskFilter: string[];
  controlRatingFilter: string[];
}

export function useDashboardData({
  risks,
  deptFilter,
  periodFilter,
  statusFilter,
  riskLevelFilter,
  heatmapFilter,
  drillDept,
  controlTypeFilter,
  rootCauseFilter,
  treatmentFilter,
  eventTypeFilter,
  inherentRiskFilter,
  controlRatingFilter,
}: DashboardFilters) {
  const periods = useMemo(() => {
    const set = new Set(risks.map((r) => r.assessment_period).filter(Boolean));
    return [...set].sort() as string[];
  }, [risks]);

  const filtered = useMemo(
    () =>
      risks.filter((r) => {
        if (deptFilter.length > 0 && !deptFilter.includes(r.department))
          return false;
        if (
          periodFilter.length > 0 &&
          !periodFilter.includes(r.assessment_period)
        )
          return false;
        if (statusFilter.length > 0 && !statusFilter.includes(r.status))
          return false;
        if (controlTypeFilter && r.control_type !== controlTypeFilter)
          return false;
        if (rootCauseFilter && r.root_cause !== rootCauseFilter) return false;
        if (treatmentFilter && r.risk_treatment !== treatmentFilter)
          return false;
        if (eventTypeFilter && r.event_type !== eventTypeFilter) return false;
        if (
          riskLevelFilter.length > 0 &&
          !riskLevelFilter.includes(getRiskLevel(r.residual_risk_score))
        )
          return false;
        if (
          inherentRiskFilter.length > 0 &&
          !inherentRiskFilter.includes(
            getRiskLevel(r.likelihood_score * r.impact_score),
          )
        )
          return false;
        if (
          controlRatingFilter.length > 0 &&
          !controlRatingFilter.includes(r.control_rating ?? "")
        )
          return false;
        if (
          heatmapFilter &&
          (r.likelihood_score !== heatmapFilter.l ||
            r.impact_score !== heatmapFilter.i)
        )
          return false;
        return true;
      }),
    [
      risks,
      deptFilter,
      periodFilter,
      statusFilter,
      controlTypeFilter,
      rootCauseFilter,
      treatmentFilter,
      eventTypeFilter,
      riskLevelFilter,
      inherentRiskFilter,
      controlRatingFilter,
      heatmapFilter,
    ],
  );

  const registerRisks = filtered;

  const openCount = useMemo(
    () => filtered.filter((r) => r.status === "Open").length,
    [filtered],
  );
  const closedCount = useMemo(
    () => filtered.filter((r) => r.status === "Closed").length,
    [filtered],
  );
  const overdue = useMemo(
    () =>
      filtered.filter(
        (r) =>
          r.action_plan_deadline &&
          r.status !== "Closed" &&
          new Date(r.action_plan_deadline) < new Date(),
      ).length,
    [filtered],
  );

  const avgControlsScore = useMemo(() => {
    if (!filtered.length) return 0;
    return (
      filtered.reduce((s, r) => s + r.controls_rating, 0) / filtered.length
    );
  }, [filtered]);
  const avgControlsLabel = getControlsLabel(Math.round(avgControlsScore));
  const controlsColor = CONTROLS_LABEL_COLORS[avgControlsLabel];

  const avgResidualScore = useMemo(() => {
    if (!filtered.length) return 0;
    return (
      filtered.reduce((s, r) => s + r.residual_risk_score, 0) / filtered.length
    );
  }, [filtered]);
  const avgResidualLevel = getRiskLevel(Math.round(avgResidualScore));
  const residualColor = RISK_COLORS[avgResidualLevel];

  const treatmentData = useMemo(
    () =>
      TREATMENT_TYPES.map((t) => ({
        name: t,
        value: filtered.filter((r) => r.risk_treatment === t).length,
      })),
    [filtered],
  );

  const rootCauseData = useMemo(
    () =>
      ROOT_CAUSES.map((rc) => ({
        name: rc,
        value: filtered.filter((r) => r.root_cause === rc).length,
      })),
    [filtered],
  );

  const controlTypeData = useMemo(
    () =>
      CONTROL_TYPES.map((ct) => ({
        name: ct,
        value: filtered.filter((r) => r.control_type === ct).length,
      })),
    [filtered],
  );

  const eventTypeData = useMemo(
    () =>
      EVENT_TYPES.map((et) => ({
        name: et,
        value: filtered.filter((r) => r.event_type === et).length,
      }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value),
    [filtered],
  );

  const deptBarData = useMemo(
    () =>
      DEPARTMENTS.map((dept) => {
        const dr = filtered.filter((r) => r.department === dept);
        if (!dr.length) return null;
        return {
          name: dept,
          Minor: dr.filter(
            (r) => getRiskLevel(r.residual_risk_score) === "Minor",
          ).length,
          Moderate: dr.filter(
            (r) => getRiskLevel(r.residual_risk_score) === "Moderate",
          ).length,
          Major: dr.filter(
            (r) => getRiskLevel(r.residual_risk_score) === "Major",
          ).length,
          Critical: dr.filter(
            (r) => getRiskLevel(r.residual_risk_score) === "Critical",
          ).length,
          total: dr.length,
        };
      })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => b.total - a.total),
    [filtered],
  );

  const drillRisks = drillDept
    ? filtered.filter((r) => r.department === drillDept)
    : [];

  return {
    periods,
    filtered,
    registerRisks,
    openCount,
    closedCount,
    overdue,
    avgControlsScore,
    avgControlsLabel,
    controlsColor,
    avgResidualScore,
    avgResidualLevel,
    residualColor,
    treatmentData,
    rootCauseData,
    controlTypeData,
    eventTypeData,
    deptBarData,
    drillRisks,
  };
}
