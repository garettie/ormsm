import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from "recharts";
import { WrapTick } from "../../utils/chartUtils";
import DarkTooltip from "../DarkTooltip";

export default function EventTypeChart({ data, onClick }: { data: any[]; onClick: (d: any) => void }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 36)}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 80 }}>
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
          width={210}
        />
        <Tooltip content={<DarkTooltip />} cursor={false} />
        <Bar
          dataKey="value"
          fill="#16a34a"
          name="Risks"
          barSize={16}
          onClick={onClick}
          style={{ cursor: "pointer" }}
        >
          <LabelList
            dataKey="value"
            position="right"
            style={{ fontSize: 11, fontWeight: 600, fill: "#475569" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
