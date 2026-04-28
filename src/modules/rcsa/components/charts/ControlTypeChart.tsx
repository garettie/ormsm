import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LabelList } from 'recharts'
import { CONTROL_TYPES, CT_COLOR_MAP } from '../../utils/riskLevels'
import type { ControlType, ChartDataItem } from '../../types'
import DarkTooltip from '../DarkTooltip'
import LegendRow from '../LegendRow'

interface ControlTypeChartProps {
  data: ChartDataItem[];
  onClick: (data: ChartDataItem) => void;
}

export default function ControlTypeChart({ data, onClick }: ControlTypeChartProps) {
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
              <Cell key={d.name} fill={CT_COLOR_MAP[d.name as ControlType]} />
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
        items={CONTROL_TYPES.map((ct) => ({
          label: ct,
          color: CT_COLOR_MAP[ct],
        }))}
      />
    </div>
  )
}
