import { Sector } from "recharts";

export const renderActiveDonut = (props: any) => {
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

export function WrapTick({ x, y, payload }: any) {
  const text = payload.value;
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
  return (
    <text
      x={x - 4}
      y={y}
      textAnchor="end"
      fill="#475569"
      fontSize={11}
      dominantBaseline="middle"
    >
      <tspan x={x - 4} dy="-0.6em">
        {text.slice(0, bp)}
      </tspan>
      <tspan x={x - 4} dy="1.2em">
        {text.slice(bp + 1)}
      </tspan>
    </text>
  );
}
