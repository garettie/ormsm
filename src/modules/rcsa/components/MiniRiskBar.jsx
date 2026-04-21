import { useState } from 'react'
import { RISK_LEVELS, RISK_COLORS, getRiskLevel } from '../utils/riskLevels'

export default function MiniRiskBar({ risks, onLevelClick, activeLevel }) {
    const [hovered, setHovered] = useState(null)
    const counts = { Minor: 0, Moderate: 0, Major: 0, Critical: 0 }
    if (risks) {
        risks.forEach(r => counts[getRiskLevel(r.residual_risk_score)]++)
    }
    const maxCount = Math.max(...Object.values(counts), 1)

    return (
        <div className="relative flex items-end h-10 gap-1 pb-0.5 ml-2">
            {RISK_LEVELS.map(l => {
                const count = counts[l];
                // Provide a visually distinct scale: 
                // A height percentage that highlights larger values but keeps small ones visible
                const heightPct = count > 0 ? Math.max((count / maxCount) * 100, 15) : 8;
                return (
                    <div
                        key={l}
                        onMouseEnter={() => setHovered(l)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={(e) => { e.stopPropagation(); onLevelClick?.(l) }}
                        className="w-2.5 sm:w-3 cursor-pointer transition-all duration-300"
                        style={{
                            height: `${heightPct}%`,
                            backgroundColor: RISK_COLORS[l],
                            opacity: activeLevel?.length > 0 && !activeLevel.includes(l) ? 0.3 : 1,
                            transform: hovered === l ? 'scaleY(1.1)' : 'scaleY(1)',
                            transformOrigin: 'bottom',
                        }}
                    />
                )
            })}

            {hovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg border border-gray-100 whitespace-nowrap pointer-events-none z-10">
                    <span style={{ color: RISK_COLORS[hovered], fontWeight: 700 }}>{hovered}</span>
                    {': '}
                    <strong className="text-gray-700">{counts[hovered]}</strong>
                </div>
            )}
        </div>
    )
}
