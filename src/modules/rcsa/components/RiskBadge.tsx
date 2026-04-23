import { memo } from 'react';
import { RISK_BG, RISK_TEXT, getRiskLevel } from '../utils/riskLevels'
import type { RiskLevel } from '../types';

const RISK_BORDER: Record<RiskLevel, string> = {
  Minor: '#bbf7d0',
  Moderate: '#fde68a',
  Major: '#fed7aa',
  Critical: '#fecaca',
}

export default memo(function RiskBadge({ score }: { score: number }) {
  const level = getRiskLevel(score)
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: RISK_BG[level],
        color: RISK_TEXT[level],
        borderColor: RISK_BORDER[level] || RISK_BG[level],
      }}
    >
      {score ? `${score} - ${level}` : '—'}
    </span>
  )
})
