import { RISK_BG, RISK_TEXT } from "../utils/riskLevels";

export default function FilterIndicators({
  heatmapFilter,
  setHeatmapFilter,
  drillDept,
  setDrillDept,
}) {
  const activeFilters = [
    heatmapFilter,
    drillDept,
  ].filter(Boolean);

  if (activeFilters.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 10,
        padding: "8px 16px",
        background: "#eff6ff",
        borderRadius: 8,
        fontSize: 12,
        color: "#2563eb",
      }}
    >
      <span style={{ fontWeight: 600 }}>Active chart filters:</span>
      
      {drillDept && (
        <span
          style={{
            background: "#e0e7ff",
            color: "#3730a3",
            padding: "2px 8px",
            borderRadius: 5,
            fontSize: 11,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          Drilled: {drillDept}
          <span
            onClick={() => setDrillDept(null)}
            style={{ cursor: "pointer", fontWeight: 700 }}
          >
            ×
          </span>
        </span>
      )}

      {heatmapFilter && (
        <span
          style={{
            background: "#e0e7ff",
            color: "#3730a3",
            padding: "2px 8px",
            borderRadius: 5,
            fontSize: 11,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          L{heatmapFilter.l}×I{heatmapFilter.i} heatmap cell
          <span
            onClick={() => setHeatmapFilter(null)}
            style={{ cursor: "pointer", fontWeight: 700 }}
          >
            ×
          </span>
        </span>
      )}


    </div>
  );
}
