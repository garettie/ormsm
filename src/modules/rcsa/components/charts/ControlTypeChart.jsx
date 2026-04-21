import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { CONTROL_TYPES, CT_COLOR_MAP } from '../../utils/riskLevels'
import DarkTooltip from '../DarkTooltip'
import LegendRow from '../LegendRow'

export default function ControlTypeChart({ data, onClick }) {
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
              <Cell key={d.name} fill={CT_COLOR_MAP[d.name]} />
            ))}
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
