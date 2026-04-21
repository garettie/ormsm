import type { FC, ReactNode } from "react";

export const RISK_COLORS = {
  Minor: { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" },
  Moderate: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  Major: { bg: "#ffedd5", text: "#9a3412", border: "#fed7aa" },
  Critical: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
} as const;

export const STATUS_COLORS = {
  Safe: { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" },
  Slight: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  Moderate: { bg: "#ffedd5", text: "#9a3412", border: "#fed7aa" },
  Severe: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
  "No Response": { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" },
} as const;

export const CONTROL_COLORS = {
  Strong: { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" },
  Satisfactory: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  "Needs Improvement": { bg: "#ffedd5", text: "#9a3412", border: "#fed7aa" },
  Unsatisfactory: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
} as const;

interface BadgeProps {
  label: ReactNode;
  colors?: { bg: string; text: string; border: string };
  showBorder?: boolean;
}

export const Badge: FC<BadgeProps> = ({ label, colors, showBorder = true }) => {
  const c = colors ?? { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" };

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: c.bg,
        color: c.text,
        borderColor: showBorder ? c.border : "transparent",
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
  const colors = RISK_COLORS[level] ?? RISK_COLORS.Minor;

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
    >
      {level} {score !== undefined && `(${score})`}
    </span>
  );
};