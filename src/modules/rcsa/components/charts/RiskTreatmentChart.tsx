import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { TREATMENT_TYPES, TREATMENT_COLOR_MAP } from '../../utils/riskLevels'
import type { RiskTreatment, ChartDataItem } from '../../types'
import DarkTooltip from '../DarkTooltip'
import LegendRow from '../LegendRow'

interface RiskTreatmentChartProps {
  data: ChartDataItem[];
  onClick: (data: ChartDataItem) => void;
}

export default function RiskTreatmentChart({ data, onClick }: RiskTreatmentChartProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={82}
            dataKey="value"
            stroke="#ffffff"
            strokeWidth={2}
            onClick={onClick}
            style={{ cursor: 'pointer' }}
          >
            {data.map((d: ChartDataItem) => (
              <Cell key={d.name} fill={TREATMENT_COLOR_MAP[d.name as RiskTreatment]} />
            ))}
          </Pie>
          <Tooltip content={<DarkTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <LegendRow
        items={TREATMENT_TYPES.map((t) => ({
          label: t,
          color: TREATMENT_COLOR_MAP[t],
        }))}
      />
    </div>
  )
}
