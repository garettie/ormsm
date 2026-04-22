import { memo, useMemo, type FC } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ProcessedContact } from '../../../types';
import { COLORS, STATUS_ORDER } from '../../../lib/constants';

interface StatusDonutProps {
  data: ProcessedContact[];
}

const TOOLTIP_CONTENT_STYLE = { borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' } as const;
const TOOLTIP_ITEM_STYLE = { fontSize: '12px', fontWeight: 500 } as const;

export const StatusDonut: FC<StatusDonutProps> = memo(({ data }) => {

  const chartData = useMemo(() => STATUS_ORDER.map(status => {
    const count = data.filter(c => c.status === status).length;
    return { name: status, value: count };
  }).filter(d => d.value > 0), [data]);

  const total = data.length;

  return (
    <div className="glass-card p-4 h-[300px] flex flex-col">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Status Distribution
      </h3>
      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip 
                contentStyle={TOOLTIP_CONTENT_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
            />
            <Legend 
                verticalAlign="bottom" 
                height={36} 
                content={() => (
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    {chartData.map((entry) => (
                      <span
                        key={entry.name}
                        className="text-[11px] font-semibold"
                        style={{ color: COLORS[entry.name as keyof typeof COLORS] }}
                      >
                        {entry.name}
                      </span>
                    ))}
                  </div>
                )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
            <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{total}</div>
                <div className="text-[10px] text-gray-400 font-medium uppercase">Total</div>
            </div>
        </div>
      </div>
    </div>
  );
});
