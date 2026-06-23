import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { RISK_LEVELS, RISK_COLORS, shortDept } from '../../utils/riskLevels'
import DarkTooltip from '../DarkTooltip'
import LegendRow from '../LegendRow'
import type { ChartDataItem } from '../../types'
import { useState, useEffect, useMemo } from 'react'

interface ProcessRiskChartProps {
  data: ChartDataItem[];
}

interface TickPayload {
  value: string;
}

interface TickProps {
  x?: number;
  y?: number;
  payload?: TickPayload;
}

function ProcessTick({ x = 0, y = 0, payload }: TickProps) {
  const raw = payload?.value ?? "";
  const sepIdx = raw.lastIndexOf("||");
  const pName = sepIdx >= 0 ? raw.slice(0, sepIdx) : raw;
  const dept = sepIdx >= 0 ? raw.slice(sepIdx + 2) : "";

  const xPos = x - 4;
  const shortDeptName = dept ? shortDept(dept) : "";

  // Wrapping logic for process name (wrap at space near 22 chars)
  const threshold = 22;
  let line1 = pName;
  let line2 = "";

  if (pName.length > threshold) {
    const mid = pName.lastIndexOf(" ", threshold);
    const bp = mid > 0 ? mid : threshold;
    line1 = pName.slice(0, bp);
    line2 = pName.slice(bp).trim();
  }

  // Adjust dy offsets based on line counts to center text vertically
  if (line2 && shortDeptName) {
    return (
      <text x={xPos} y={y} textAnchor="end" fill="#334155" fontSize={11} fontWeight={600}>
        <tspan x={xPos} dy="-0.95em">{line1}</tspan>
        <tspan x={xPos} dy="1.15em">{line2}</tspan>
        <tspan x={xPos} dy="1.25em" fill="#94a3b8" fontSize={9} fontWeight={600} style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {shortDeptName}
        </tspan>
      </text>
    );
  } else if (shortDeptName) {
    return (
      <text x={xPos} y={y} textAnchor="end" fill="#334155" fontSize={11} fontWeight={600}>
        <tspan x={xPos} dy="-0.35em">{line1}</tspan>
        <tspan x={xPos} dy="1.15em" fill="#94a3b8" fontSize={9} fontWeight={600} style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {shortDeptName}
        </tspan>
      </text>
    );
  } else {
    if (line2) {
      return (
        <text x={xPos} y={y} textAnchor="end" fill="#334155" fontSize={11} fontWeight={600}>
          <tspan x={xPos} dy="-0.35em">{line1}</tspan>
          <tspan x={xPos} dy="1.15em">{line2}</tspan>
        </text>
      );
    }
    return (
      <text x={xPos} y={y} textAnchor="end" fill="#334155" fontSize={11} fontWeight={600} dominantBaseline="middle">
        {line1}
      </text>
    );
  }
}

export default function ProcessRiskChart({ data }: ProcessRiskChartProps) {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 640 : false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      displayName: isMobile ? (item.name as string).split("||")[0] : item.name,
    }));
  }, [data, isMobile]);

  return (
    <div className="flex flex-col">
      <div className="max-h-72 overflow-y-auto overflow-visible">
        <div style={{ height: Math.max(260, data.length * 48) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: isMobile ? -10 : -20, right: isMobile ? 10 : 30 }}
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
                dataKey="displayName"
                tick={isMobile ? <ProcessTick /> : <ProcessTick />}
                axisLine={false}
                tickLine={false}
                width={isMobile ? 140 : 220}
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
                  barSize={18}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
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
