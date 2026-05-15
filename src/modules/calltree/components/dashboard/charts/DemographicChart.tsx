import { useMemo, memo, type FC } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ProcessedContact } from "../../../types";
import { COLORS, STATUS_ORDER } from "../../../lib/constants";
import { getStatusColor } from "../../../../../lib/utils";

interface DemographicChartProps {
  data: ProcessedContact[];
  category: "department" | "location";
  title: string;
  notificationCategory?: "emergency" | "broadcast" | "poll";
  statusOrder?: string[];
  statusColors?: Record<string, { bg: string; text: string; border: string }>;
}

const TOOLTIP_CONTENT_STYLE = { borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } as const;
const TOOLTIP_ITEM_STYLE = { fontSize: '11px', fontWeight: 500 } as const;
const TOOLTIP_CURSOR = { fill: '#f9fafb' } as const;

export const DemographicChart: FC<DemographicChartProps> = memo(({
  data,
  category,
  title,
  notificationCategory,
  statusOrder: externalStatusOrder,
  statusColors,
}) => {
  const statusOrder = useMemo(() => {
    if (externalStatusOrder) return externalStatusOrder;
    if (notificationCategory === "broadcast") return ["Responded", "No Response"];
    return [...STATUS_ORDER];
  }, [notificationCategory, externalStatusOrder]);

  const getFill = (status: string, index: number): string => {
    if (statusColors?.[status]) return statusColors[status].border;
    const fixed = COLORS[status as keyof typeof COLORS];
    if (fixed) return fixed;
    return getStatusColor(status, index, statusOrder.length).border;
  };

  const getLegendColor = (status: string, index: number): string => {
    if (statusColors?.[status]) return statusColors[status].text;
    const fixed = COLORS[status as keyof typeof COLORS];
    if (fixed) return fixed;
    return getStatusColor(status, index, statusOrder.length).text;
  };

  const chartData = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    const totals: Record<string, number> = {};

    data.forEach((c) => {
      const key = c[category] || "Unknown";
      if (!counts[key]) counts[key] = {};
      if (!totals[key]) totals[key] = 0;

      const status = c.status || "No Response";
      counts[key][status] = (counts[key][status] || 0) + 1;
      totals[key]++;
    });

    const result = Object.keys(counts)
      .map((key) => ({
        name: key,
        ...counts[key],
        total: totals[key],
      }))
      .sort((a, b) => b.total - a.total);

    return result;
  }, [data, category]);

  const containerHeight = Math.min(
    Math.max(chartData.length * 50 + 80, 300),
    600,
  );

  return (
    <div
      className="glass-card p-4 flex flex-col"
      style={{ height: containerHeight }}
    >
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex-shrink-0">
        {title}
      </h3>
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
        <div style={{ height: Math.max(chartData.length * 50, 240) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 90, left: 10, bottom: 0 }}
              barSize={20}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11, fill: "#374151", fontWeight: 500 }}
                width={140}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <Tooltip
                cursor={TOOLTIP_CURSOR}
                contentStyle={TOOLTIP_CONTENT_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                content={() => (
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    {statusOrder.map((status, i) => (
                      <span
                        key={status}
                        className="text-[11px] font-semibold"
                        style={{ color: getLegendColor(status, i) }}
                      >
                        {status}
                      </span>
                    ))}
                  </div>
                )}
              />
              {statusOrder.map((status, i) => (
                <Bar
                  key={status}
                  dataKey={status}
                  stackId="a"
                  fill={getFill(status, i)}
                  radius={[0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});
