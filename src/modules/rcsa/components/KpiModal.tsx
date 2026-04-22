import RiskRegister from "./RiskRegister";
import type { RiskRecord } from "../types";

interface KpiModalProps {
  kpiModal: string | null;
  setKpiModal: (val: string | null) => void;
  filtered: RiskRecord[];
}

export default function KpiModal({ kpiModal, setKpiModal, filtered }: KpiModalProps) {
  if (!kpiModal) return null;

  return (
    <div
      onClick={() => setKpiModal(null)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.4)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        backdropFilter: "blur(4px)",
      }}
      className="animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[1200px] max-h-[90vh] flex flex-col"
      >
        <RiskRegister
          risks={
            kpiModal === "open"
              ? filtered.filter((r) => r.status === "Open")
              : filtered.filter(
                  (r) =>
                    r.action_plan_deadline &&
                    r.status !== "Closed" &&
                    new Date(r.action_plan_deadline) < new Date(),
                )
          }
          title={kpiModal === "open" ? "Open Risks" : "Overdue Risks"}
          onClose={() => setKpiModal(null)}
        />
      </div>
    </div>
  );
}
