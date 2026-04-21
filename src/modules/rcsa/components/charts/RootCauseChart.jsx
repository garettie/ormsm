import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { ROOT_CAUSES, RC_COLOR_MAP } from '../../utils/riskLevels'
import DarkTooltip from '../DarkTooltip'
import LegendRow from '../LegendRow'

export default function RootCauseChart({ data, onClick }) {
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
            {data.map((d) => (
              <Cell key={d.name} fill={RC_COLOR_MAP[d.name]} />
            ))}
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
