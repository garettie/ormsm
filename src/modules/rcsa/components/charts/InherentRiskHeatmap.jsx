import { useMemo, useState, useRef } from 'react'
import { RISK_LEVELS, RISK_COLORS } from '../../utils/riskLevels'
import LegendRow from '../LegendRow'

export default function InherentRiskHeatmap({ risks, heatmapFilter, setHeatmapFilter, getRiskLevel }) {
    const [hoveredHeatCell, setHoveredHeatCell] = useState(null)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const containerRef = useRef(null)

    const heatmapCounts = useMemo(() => {
        const counts = {};
        risks.forEach((r) => {
            const k = `${r.likelihood_score}-${r.impact_score}`;
            counts[k] = (counts[k] || 0) + 1;
        });
        return counts;
    }, [risks]);

    const getHeatCellResidual = (l, i) => {
        const cellRisks = risks.filter(
            (r) => r.likelihood_score === l && r.impact_score === i,
        );
        if (!cellRisks.length) return null;
        const breakdown = { Minor: 0, Moderate: 0, Major: 0, Critical: 0 };
        cellRisks.forEach((r) => breakdown[getRiskLevel(r.residual_risk_score)]++);
        return { count: cellRisks.length, breakdown };
    };

    const hmColor = (l, i) => {
        const s = l * i;
        if (s <= 3) return { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" };
        if (s <= 6) return { bg: "#fef3c7", text: "#92400e", border: "#fde68a" };
        if (s <= 9) return { bg: "#ffedd5", text: "#9a3412", border: "#fed7aa" };
        return { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" };
    };

    const isHeatSelected = (l, i) =>
        heatmapFilter && heatmapFilter.l === l && heatmapFilter.i === i;

    const handleHeatClick = (l, i) => {
        if (heatmapFilter && heatmapFilter.l === l && heatmapFilter.i === i) {
            setHeatmapFilter(null);
        } else {
            setHeatmapFilter({ l, i });
        }
    };

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <>
            <div
                style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    marginBottom: 12,
                    textAlign: "center",
                }}
            >
                Risk count by Likelihood × Impact
            </div>
            <div style={{ position: "relative" }} ref={containerRef} onMouseMove={handleMouseMove}>
                <table
                    style={{
                        borderCollapse: "separate",
                        borderSpacing: 4,
                        margin: "0 auto",
                    }}
                >
                    <thead>
                        <tr>
                            <th
                                style={{
                                    width: 72,
                                    fontSize: 10,
                                    color: "#94a3b8",
                                    textAlign: "right",
                                    paddingRight: 6,
                                    fontWeight: 600,
                                }}
                            ></th>
                            {["Minor", "Moderate", "Major", "Critical"].map((l) => (
                                <th
                                    key={l}
                                    style={{
                                        fontSize: 10,
                                        color: "#64748b",
                                        fontWeight: 600,
                                        textAlign: "center",
                                        width: 56,
                                        paddingBottom: 4,
                                    }}
                                >
                                    {l}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[4, 3, 2, 1].map((l) => (
                            <tr key={l}>
                                <td
                                    style={{
                                        fontSize: 10,
                                        color: "#64748b",
                                        fontWeight: 600,
                                        paddingRight: 6,
                                        textAlign: "right",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {["Rare", "Possible", "Probable", "Frequent"][l - 1]}
                                </td>
                                {[1, 2, 3, 4].map((i) => {
                                    const count = heatmapCounts[`${l}-${i}`] || 0;
                                    const cellKey = `${l}-${i}`;
                                    const { bg, text, border } = hmColor(l, i);
                                    const selected = isHeatSelected(l, i);
                                    const isHov = hoveredHeatCell === cellKey;
                                    return (
                                        <td
                                            key={i}
                                            onClick={() => count > 0 && handleHeatClick(l, i)}
                                            onMouseEnter={() =>
                                                count > 0 && setHoveredHeatCell(cellKey)
                                            }
                                            onMouseLeave={() => setHoveredHeatCell(null)}
                                            style={{
                                                width: 56,
                                                height: 44,
                                                textAlign: "center",
                                                background: count > 0 ? bg : "#f8fafc",
                                                color: count > 0 ? text : "#cbd5e1",
                                                fontSize: count > 0 ? 17 : 13,
                                                fontWeight: 700,
                                                border: selected
                                                    ? `2px solid #0f172a`
                                                    : `1px solid ${count > 0 ? border : "#e2e8f0"}`,
                                                borderRadius: 8,
                                                cursor: count > 0 ? "pointer" : "default",
                                                transform: isHov ? "scale(1.18)" : "scale(1)",
                                                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                                boxShadow: isHov ? "0 4px 12px rgba(0,0,0,0.12)" : "none",
                                                position: "relative",
                                                zIndex: isHov ? 5 : 1,
                                            }}
                                        >
                                            {count > 0 ? count : "·"}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Mouse-following tooltip */}
                {hoveredHeatCell &&
                    (() => {
                        const [hl, hi] = hoveredHeatCell.split("-").map(Number);
                        const info = getHeatCellResidual(hl, hi);
                        if (!info) return null;
                        const inherentScore = hl * hi;
                        return (
                            <div
                                style={{
                                    position: "absolute",
                                    left: mousePos.x + 12,
                                    top: mousePos.y - 10,
                                    background: "#fff",
                                    color: "#334155",
                                    padding: "10px 14px",
                                    borderRadius: 8,
                                    fontSize: 12,
                                    fontWeight: 500,
                                    whiteSpace: "nowrap",
                                    pointerEvents: "none",
                                    zIndex: 50,
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    border: "1px solid #f1f5f9",
                                    transition: "left 0.08s ease, top 0.08s ease",
                                }}
                            >
                                <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4 }}>
                                    Inherent: {getRiskLevel(inherentScore)} ({inherentScore})
                                </div>
                                <div style={{ marginBottom: 4 }}>
                                    <strong>{info.count}</strong> risk{info.count !== 1 ? "s" : ""}
                                </div>
                                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>
                                    Residual breakdown:
                                </div>
                                {RISK_LEVELS.filter((lv) => info.breakdown[lv] > 0).map((lv) => (
                                    <div key={lv} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <span style={{ color: RISK_COLORS[lv], fontWeight: 700 }}>{lv}</span>
                                        {': '}
                                        <strong>{info.breakdown[lv]}</strong>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
            </div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 8,
                }}
            >
                <LegendRow
                    items={RISK_LEVELS.map((l) => ({
                        label: l,
                        color: RISK_COLORS[l],
                    }))}
                />
                {heatmapFilter && (
                    <button
                        onClick={() => setHeatmapFilter(null)}
                        style={{
                            background: "#fee2e2",
                            color: "#991b1b",
                            border: "none",
                            borderRadius: 6,
                            padding: "2px 8px",
                            fontSize: 10,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                        }}
                    >
                        Clear filter
                    </button>
                )}
            </div>
        </>
    )
}
