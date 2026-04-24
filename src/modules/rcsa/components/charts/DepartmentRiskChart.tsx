import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { RISK_LEVELS, RISK_COLORS } from '../../utils/riskLevels'
import { WrapTick } from '../../utils/chartUtils'
import DarkTooltip from '../DarkTooltip'
import LegendRow from '../LegendRow'
import type { ChartDataItem } from '../../types'

interface DepartmentRiskChartProps {
  data: ChartDataItem[];
}

export default function DepartmentRiskChart({ data }: DepartmentRiskChartProps) {
  return (
    <div className="flex flex-col">
      {/* Scrollable chart area */}
      <div className="max-h-72 overflow-y-auto">
        <div style={{ height: Math.max(260, data.length * 30) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 0, right: 80 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={<WrapTick />}
                axisLine={false}
                tickLine={false}
                width={200}
                interval={0}
              />
              <Tooltip content={<DarkTooltip />} cursor={false} />
              {RISK_LEVELS.map((level) => (
                <Bar
                  key={level}
                  dataKey={level}
                  stackId="a"
                  fill={RISK_COLORS[level]}
                  name={level}
                  barSize={14}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Sticky legend at bottom */}
      <div className="pt-3 border-t border-gray-100 mt-2">
        <LegendRow
          items={RISK_LEVELS.map((l) => ({
            label: l,
            color: RISK_COLORS[l],
          }))}
        />
      </div>
    </div>
  )
}
