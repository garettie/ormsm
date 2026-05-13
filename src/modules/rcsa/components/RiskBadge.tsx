import { memo } from 'react';
import { Badge, RISK_COLORS } from '../../../components/Badge';
import { getRiskLevel } from '../utils/riskLevels'

export default memo(function RiskBadge({ score }: { score: number }) {
  const level = getRiskLevel(score)
  const colors = RISK_COLORS[level]
  const label = score ? `${score} - ${level}` : '\u2014'
  return <Badge label={label} variant="compact" colors={colors} />
})
