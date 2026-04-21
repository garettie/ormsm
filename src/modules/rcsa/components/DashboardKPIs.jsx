import {
  ClipboardList,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ShieldAlert,
} from "lucide-react";
import KpiCard from "./KpiCard";
import MiniRiskBar from "./MiniRiskBar";

export default function DashboardKPIs({
  filtered,
  closedCount,
  openCount,
  riskLevelFilter,
  setRiskLevelFilter,
  avgControlsScore,
  avgControlsLabel,
  controlsColor,
  avgResidualScore,
  avgResidualLevel,
  residualColor,
  overdue,
  setKpiModal,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <KpiCard
        label="Risks Identified"
        value={filtered.length}
        sub={`${closedCount} closed · ${openCount} open`}
        accentColor="#0f172a"
        icon={ClipboardList}
        borderColor="#94a3b8"
      >
        <MiniRiskBar
          risks={filtered}
          onLevelClick={(l) => setRiskLevelFilter(prev => 
            prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]
          )}
          activeLevel={riskLevelFilter}
        />
      </KpiCard>
      <KpiCard
        label="Avg Controls Rating"
        value={filtered.length ? avgControlsScore.toFixed(1) : "—"}
        sub={avgControlsLabel}
        accentColor={controlsColor}
        icon={ShieldCheck}
        borderColor={controlsColor}
      />
      <KpiCard
        label="Avg Residual Risk"
        value={filtered.length ? avgResidualScore.toFixed(1) : "—"}
        sub={avgResidualLevel}
        accentColor={residualColor}
        icon={AlertTriangle}
        borderColor={residualColor}
      />
      <KpiCard
        label="Open Risks"
        value={openCount}
        sub="Pending treatment"
        accentColor="#f59e0b"
        icon={Clock}
        borderColor="#f59e0b"
        onClick={() => setKpiModal("open")}
      />
      <KpiCard
        label="Overdue Risks"
        value={overdue}
        sub="Past deadline"
        accentColor={overdue > 0 ? "#ef4444" : "#22c55e"}
        icon={ShieldAlert}
        borderColor={overdue > 0 ? "#ef4444" : "#22c55e"}
        onClick={() => setKpiModal("overdue")}
      />
    </div>
  );
}
