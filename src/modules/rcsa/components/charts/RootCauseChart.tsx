import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LabelList } from 'recharts'
import { ROOT_CAUSES, RC_COLOR_MAP } from '../../utils/riskLevels'
import type { RootCause, ChartDataItem } from '../../types'
import DarkTooltip from '../DarkTooltip'
import LegendRow from '../LegendRow'

interface RootCauseChartProps {
  data: ChartDataItem[];
  onClick: (data: ChartDataItem) => void;
}

export default function RootCauseChart({ data, onClick }: RootCauseChartProps) {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0)
  const maxVal = Math.max(...data.map(d => d.value || 0))
  const maxPct = total > 0 ? Math.round((maxVal / total) * 100) : 0

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
              <Cell key={d.name} fill={RC_COLOR_MAP[d.name as RootCause]} />
            ))}
            <LabelList
              dataKey="value"
              position="outside"
              formatter={(val) => val === maxVal ? `${maxPct}%` : ''}
              style={{ fontWeight: 'bold', fontSize: 11 }}
            />
          </Pie>
          <Tooltip content={<DarkTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <LegendRow
        items={ROOT_CAUSES.map((rc) => ({
          label: rc,
          color: RC_COLOR_MAP[rc],
        }))}
      />
    </div>
  )
}
