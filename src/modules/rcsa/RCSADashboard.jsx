import { useState, useEffect, useRef, Suspense } from "react";
import { ShieldAlert, Loader, BarChart3, GitMerge } from "lucide-react";
import { supabase } from "./lib/supabase";
import { useDashboardData } from "./hooks/useDashboardData";
import { getRiskLevel } from "./utils/riskLevels";
import { generateMockRisks } from "./utils/mockData";

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

export default function RCSADashboard({ demoMode }) {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deptFilter, setDeptFilter] = useState([]);
  const [periodFilter, setPeriodFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);

  const [riskLevelFilter, setRiskLevelFilter] = useState([]);
  const [heatmapFilter, setHeatmapFilter] = useState(null);

  const [controlTypeFilter, setControlTypeFilter] = useState(null);
  const [rootCauseFilter, setRootCauseFilter] = useState(null);
  const [treatmentFilter, setTreatmentFilter] = useState(null);
  const [eventTypeFilter, setEventTypeFilter] = useState(null);
  const [inherentRiskFilter, setInherentRiskFilter] = useState([]);
  const [controlRatingFilter, setControlRatingFilter] = useState([]);

  const [kpiModal, setKpiModal] = useState(null);
  const [sankeyView, setSankeyView] = useState(true);
  const [registerModal, setRegisterModal] = useState(false);

  const sankeyMounted = useRef(false);
  if (sankeyView) sankeyMounted.current = true;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      if (demoMode) {
        setTimeout(() => {
          setRisks(generateMockRisks(100));
          setLoading(false);
        }, 400);
        return;
      }
      try {
        const [risksRes] = await Promise.all([
          supabase.from("risks").select("*"),
        ]);
        if (risksRes.error) throw risksRes.error;
        setRisks(risksRes.data);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [demoMode]);

  const data = useDashboardData({
    risks,
    deptFilter,
    periodFilter,
    statusFilter,
    riskLevelFilter,
    heatmapFilter,

    controlTypeFilter,
    rootCauseFilter,
    treatmentFilter,
    eventTypeFilter,
    inherentRiskFilter,
    controlRatingFilter,
  });

  const clearAllFilters = () => {
    setDeptFilter([]);
    setPeriodFilter([]);
    setStatusFilter([]);

    setRiskLevelFilter([]);
    setHeatmapFilter(null);
    setControlTypeFilter(null);
    setRootCauseFilter(null);
    setTreatmentFilter(null);
    setEventTypeFilter(null);
    setInherentRiskFilter([]);
    setControlRatingFilter([]);
  };

  const handlePieClick = (chartData, setFilterFn) => {
    if (chartData?.name) {
      setFilterFn((prev) => (prev === chartData.name ? null : chartData.name));
    }
  };

  const handleEventTypeClick = (chartData) => {
    if (chartData?.activePayload?.[0]) {
      const name = chartData.activeLabel;
      setEventTypeFilter((prev) => (prev === name ? null : name));
    }
  };

  const handleSankeyNodeClick = (layer, name) => {
    if (layer === 0)
      setRootCauseFilter((prev) => (prev === name ? null : name));
    if (layer === 1)
      setEventTypeFilter((prev) => (prev === name ? null : name));
    if (layer === 2) {
      setRiskLevelFilter((prev) =>
        prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name],
      );
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #fecaca",
            borderRadius: 12,
            padding: "32px 40px",
            textAlign: "center",
            maxWidth: 420,
          }}
        >
          <ShieldAlert size={32} color="#ef4444" />
          <div
            style={{
              marginTop: 12,
              fontSize: 16,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Failed to load data
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: "#64748b" }}>
            {error}
          </div>
          <button
            onClick={() => {
              setError(null);
              setDemoMode(true);
            }}
            style={{
              marginTop: 20,
              padding: "8px 24px",
              background: "#f1f5f9",
              color: "#334155",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Load Demo Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <DashboardHeader
        periods={data.periods}
        deptFilter={deptFilter}
        setDeptFilter={setDeptFilter}
        periodFilter={periodFilter}
        setPeriodFilter={setPeriodFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        inherentRiskFilter={inherentRiskFilter}
        setInherentRiskFilter={setInherentRiskFilter}
        controlRatingFilter={controlRatingFilter}
        setControlRatingFilter={setControlRatingFilter}
        riskLevelFilter={riskLevelFilter}
        setRiskLevelFilter={setRiskLevelFilter}
        controlTypeFilter={controlTypeFilter}
        setControlTypeFilter={setControlTypeFilter}
        rootCauseFilter={rootCauseFilter}
        setRootCauseFilter={setRootCauseFilter}
        treatmentFilter={treatmentFilter}
        setTreatmentFilter={setTreatmentFilter}
        eventTypeFilter={eventTypeFilter}
        setEventTypeFilter={setEventTypeFilter}
        heatmapFilter={heatmapFilter}
        setHeatmapFilter={setHeatmapFilter}
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
        riskLevelFilter={riskLevelFilter}
        setRiskLevelFilter={setRiskLevelFilter}
        setKpiModal={setKpiModal}
      />

      {/* Charts: 2-column layout — left: 2×2 small charts, right: stacked tall charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 items-start">
        {/* Left: 2×2 grid of small charts */}
        <div className="grid grid-cols-2 gap-4 items-start">
          <SectionCard title="Control Types">
            <ControlTypeChart
              data={data.controlTypeData}
              onClick={(d) => handlePieClick(d, setControlTypeFilter)}
            />
          </SectionCard>

          <SectionCard title="Root Cause">
            <RootCauseChart
              data={data.rootCauseData}
              onClick={(d) => handlePieClick(d, setRootCauseFilter)}
            />
          </SectionCard>

          <SectionCard title="Inherent Risk Heatmap">
            <InherentRiskHeatmap
              risks={data.filtered}
              heatmapFilter={heatmapFilter}
              setHeatmapFilter={setHeatmapFilter}
              getRiskLevel={getRiskLevel}
            />
          </SectionCard>

          <SectionCard title="Risk Treatment">
            <RiskTreatmentChart
              data={data.treatmentData}
              onClick={(d) => handlePieClick(d, setTreatmentFilter)}
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
