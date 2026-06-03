import { useState, useEffect, useRef } from "react";
import { ShieldAlert, Loader, BarChart3, GitMerge } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useDashboardData } from "./hooks/useDashboardData";
import { getRiskLevel } from "./utils/riskLevels";
import type { RiskRecord, FilterState } from "./types";

import DashboardHeader from "./components/DashboardHeader";
import DashboardKPIs from "./components/DashboardKPIs";
import KpiModal from "./components/KpiModal";
import RiskRegisterModal from "./components/RiskRegisterModal";

import SectionCard from "./components/SectionCard";

import RiskRegister from "./components/RiskRegister";
import InherentRiskHeatmap from "./components/charts/InherentRiskHeatmap";
import ControlTypeChart from "./components/charts/ControlTypeChart";
import RootCauseChart from "./components/charts/RootCauseChart";
import EventTypeChart from "./components/charts/EventTypeChart";
import SankeyEventType from "./components/charts/SankeyEventType";
import RiskTreatmentChart from "./components/charts/RiskTreatmentChart";
import DepartmentRiskChart from "./components/charts/DepartmentRiskChart";

export default function RCSADashboard() {
  const [risks, setRisks] = useState<RiskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    deptFilter: [],
    periodFilter: [],
    statusFilter: [],
    riskLevelFilter: [],
    heatmapFilter: null,
    controlTypeFilter: null,
    rootCauseFilter: null,
    treatmentFilter: null,
    eventTypeFilter: null,
    inherentRiskFilter: [],
    controlRatingFilter: [],
  });

  const [kpiModal, setKpiModal] = useState<string | null>(null);
  const [sankeyView, setSankeyView] = useState(true);
  const [registerModal, setRegisterModal] = useState(false);

  const sankeyMounted = useRef(false);

  useEffect(() => {
    if (sankeyView) sankeyMounted.current = true;
  }, [sankeyView]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const { data: risksData, error: risksError } = await supabase.from("risks").select("*");
        if (risksError) throw risksError;
        setRisks(risksData || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const data = useDashboardData({
    risks,
    ...filters,
    drillDept: null,
  });

  const clearAllFilters = () => {
    setFilters({
      deptFilter: [],
      periodFilter: [],
      statusFilter: [],
      riskLevelFilter: [],
      heatmapFilter: null,
      controlTypeFilter: null,
      rootCauseFilter: null,
      treatmentFilter: null,
      eventTypeFilter: null,
      inherentRiskFilter: [],
      controlRatingFilter: [],
    });
  };

  const handlePieClick = (chartData: { name?: string }, field: "controlTypeFilter" | "rootCauseFilter" | "treatmentFilter") => {
    const name = chartData?.name;
    if (name) {
      setFilters((prev) => ({ ...prev, [field]: prev[field] === name ? null : name }));
    }
  };

  const handleEventTypeClick = (chartData: unknown) => {
    const data = chartData as { activeLabel?: string };
    const name = data?.activeLabel;
    if (name) {
      setFilters((prev) => ({ ...prev, eventTypeFilter: prev.eventTypeFilter === name ? null : name }));
    }
  };

  const handleSankeyNodeClick = (layer: number, name: string) => {
    if (layer === 0)
      setFilters((prev) => ({ ...prev, rootCauseFilter: prev.rootCauseFilter === name ? null : name }));
    if (layer === 1)
      setFilters((prev) => ({ ...prev, eventTypeFilter: prev.eventTypeFilter === name ? null : name }));
    if (layer === 2) {
      setFilters((prev) => ({
        ...prev,
        riskLevelFilter: prev.riskLevelFilter.includes(name)
          ? prev.riskLevelFilter.filter((x) => x !== name)
          : [...prev.riskLevelFilter, name],
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader
          size={32}
          color="#64748b"
          className="animate-spin"
        />
        <div className="mt-3 text-sm text-slate-500">
          Loading RCSA data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-white border border-red-200 rounded-xl p-8 sm:px-10 text-center max-w-[420px] shadow-sm">
          <ShieldAlert size={32} className="text-red-500 mx-auto" />
          <div className="mt-3 text-base font-bold text-slate-900">
            Failed to load data
          </div>
          <div className="mt-2 text-[13px] text-slate-500 leading-relaxed">
            {error}
          </div>
          <button
            onClick={() => {
              setError(null);
              import("./utils/mockData").then(({ RISKS }) => {
                setRisks(RISKS);
              });
            }}
            className="mt-5 px-6 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-[13px] font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Load Demo Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
      <DashboardHeader
        periods={data.periods}
        filters={filters}
        onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        clearAllFilters={clearAllFilters}
      />

      {/* KPI Grid */}
      <DashboardKPIs
        filtered={data.filtered}
        closedCount={data.closedCount}
        openCount={data.openCount}
        overdue={data.overdue}
        avgControlsScore={data.avgControlsScore}
        avgControlsLabel={data.avgControlsLabel}
        controlsColor={data.controlsColor}
        avgResidualScore={data.avgResidualScore}
        avgResidualLevel={data.avgResidualLevel}
        residualColor={data.residualColor}
        riskLevelFilter={filters.riskLevelFilter}
        setRiskLevelFilter={(val) => {
          if (typeof val === 'function') {
            setFilters(prev => ({ ...prev, riskLevelFilter: val(prev.riskLevelFilter) }));
          } else {
            setFilters(prev => ({ ...prev, riskLevelFilter: val }));
          }
        }}
        setKpiModal={setKpiModal}
      />

      {/* Charts: 2-column layout — left: 2×2 small charts, right: stacked tall charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 items-start">
        {/* Left: 2×2 grid of small charts (stacks on mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <SectionCard title="Control Types">
            <ControlTypeChart
              data={data.controlTypeData}
              onClick={(d) => handlePieClick(d, "controlTypeFilter")}
            />
          </SectionCard>

          <SectionCard title="Root Cause">
            <RootCauseChart
              data={data.rootCauseData}
              onClick={(d) => handlePieClick(d, "rootCauseFilter")}
            />
          </SectionCard>

          <SectionCard title="Inherent Risk Heatmap">
            <InherentRiskHeatmap
              risks={data.filtered}
              heatmapFilter={filters.heatmapFilter}
              setHeatmapFilter={(val) => setFilters(prev => ({ ...prev, heatmapFilter: val }))}
              getRiskLevel={getRiskLevel}
            />
          </SectionCard>

          <SectionCard title="Risk Treatment">
            <RiskTreatmentChart
              data={data.treatmentData}
              onClick={(d) => handlePieClick(d, "treatmentFilter")}
            />
          </SectionCard>
        </div>

        {/* Right: Stacked tall charts */}
        <div className="flex flex-col gap-6">
          <SectionCard
            title="Event Type"
            action={
              <div className="flex gap-0.5">
                {[
                  { icon: BarChart3, active: !sankeyView },
                  { icon: GitMerge, active: sankeyView },
                ].map(({ icon: Icon, active }, i) => (
                  <button
                    key={i}
                    onClick={() => setSankeyView(i === 1)}
                    className={`p-1 rounded transition-colors ${
                      active
                        ? "bg-gray-100 text-gray-700"
                        : "text-gray-300 hover:text-gray-500"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            }
            style={{
              minHeight: sankeyView ? 420 : undefined,
              transition: "min-height 0.2s ease",
            }}
          >
            <div style={{ display: sankeyView ? "none" : "block" }}>
              <EventTypeChart
                data={data.eventTypeData}
                onClick={handleEventTypeClick}
              />
            </div>
{sankeyMounted.current && (
                <div style={{ display: sankeyView ? "block" : "none" }}>
                  <SankeyEventType
                    risks={data.filtered}
                    onNodeClick={handleSankeyNodeClick}
                  />
                </div>
              )}
          </SectionCard>

          <SectionCard title="Residual Risk by Department">
            <DepartmentRiskChart data={data.deptBarData} />
          </SectionCard>
        </div>
      </div>

      {/* Risk Register */}
      <div className="mb-8">
        <RiskRegister
          risks={data.registerRisks}
          onOpenModal={() => setRegisterModal(true)}
        />
      </div>

      <KpiModal
        kpiModal={kpiModal}
        setKpiModal={setKpiModal}
        filtered={data.filtered}
      />

      {registerModal && (
        <RiskRegisterModal
          risks={data.registerRisks}
          onClose={() => setRegisterModal(false)}
        />
      )}
    </div>
  );
}
