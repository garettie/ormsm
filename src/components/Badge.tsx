import type { FC, ReactNode } from "react";
import { cn } from "../lib/utils";

export const RISK_COLORS = {
  Minor: { bg: "#e6f4ea", text: "#34a853", border: "#34a853" },
  Moderate: { bg: "#fef7e0", text: "#f9ab00", border: "#f9ab00" },
  Major: { bg: "#fff3e0", text: "#ff6d00", border: "#ff6d00" },
  Critical: { bg: "#fce8e6", text: "#d93025", border: "#d93025" },
} as const;

export const STATUS_COLORS = {
  Safe: { bg: "#e6f4ea", text: "#34a853", border: "#34a853" },
  Slight: { bg: "#fef7e0", text: "#f9ab00", border: "#f9ab00" },
  Moderate: { bg: "#fff3e0", text: "#ff6d00", border: "#ff6d00" },
  Severe: { bg: "#fce8e6", text: "#d93025", border: "#d93025" },
  "No Response": { bg: "#f1f5f9", text: "#64748b", border: "#cbd5e1" },
  Responded: { bg: "#e8f4f8", text: "#0284c7", border: "#0284c7" },
  Invalid: { bg: "#fff7ed", text: "#f97316", border: "#f97316" },
} as const;

export const CONTROL_COLORS = {
  Strong: { bg: "#e6f4ea", text: "#34a853", border: "#34a853" },
  Satisfactory: { bg: "#fef7e0", text: "#f9ab00", border: "#f9ab00" },
  "Needs Improvement": { bg: "#fff3e0", text: "#ff6d00", border: "#ff6d00" },
  Unsatisfactory: { bg: "#fce8e6", text: "#d93025", border: "#d93025" },
} as const;

interface BadgeProps {
  label: ReactNode;
  colors?: { bg: string; text: string; border: string };
  showBorder?: boolean;
  variant?: "default" | "compact";
  className?: string;
}

export const Badge: FC<BadgeProps> = ({
  label,
  colors,
  showBorder = true,
  variant = "default",
  className,
}) => {
  const c = colors ?? { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full border",
        variant === "default" && "text-xs font-medium",
        variant === "compact" &&
          "text-[11px] font-mono font-bold uppercase tracking-wide shadow-sm",
        className,
      )}
      style={{
        backgroundColor: c.bg,
        color: c.text,
        borderColor: showBorder ? `${c.border}40` : "transparent",
      }}
    >
      {label}
    </span>
  );
};

interface RiskBadgeProps {
  level: keyof typeof RISK_COLORS;
  score?: number;
}

export const RiskBadge: FC<RiskBadgeProps> = ({ level, score }) => {
  const c = RISK_COLORS[level] ?? RISK_COLORS.Minor;

  return (
    <Badge
      label={`${level}${score !== undefined ? ` ${score}` : ""}`}
      variant="compact"
      colors={c}
    />
  );
};
