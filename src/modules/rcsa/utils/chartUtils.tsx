import { Sector } from "recharts";

interface DonutProps {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
}

export const renderActiveDonut = (props: DonutProps) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius - 2}
      outerRadius={outerRadius + 5}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      style={{ filter: "brightness(1.1)", transition: "all 0.15s ease" }}
    />
  );
};

interface TickPayload {
  value: string;
}

type TickProps = {
  x?: number;
  y?: number;
  payload?: TickPayload;
};

export function WrapTick({ x = 0, y = 0, payload }: TickProps) {
  const text = payload?.value ?? "";
  if (text.length <= 28) {
    return (
      <text
        x={x - 4}
        y={y}
        textAnchor="end"
        fill="#475569"
        fontSize={11}
        dominantBaseline="middle"
      >
        {text}
      </text>
    );
  }
  const mid = text.lastIndexOf(" ", 28);
  const bp = mid > 0 ? mid : 28;
  const xPos = x - 4;
  return (
    <text
      x={xPos}
      y={y}
      textAnchor="end"
      fill="#475569"
      fontSize={11}
      dominantBaseline="middle"
    >
      <tspan x={xPos} dy="-0.6em">
        {text.slice(0, bp)}
      </tspan>
      <tspan x={xPos} dy="1.2em">
        {text.slice(bp + 1)}
      </tspan>
    </text>
  );
}
