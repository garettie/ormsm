import type { RiskLevel, ControlRating, ControlType, RiskTreatment, RootCause, ImplementationRating } from "../types";

export const RISK_COLORS: Record<RiskLevel, string> = {
  Minor: "#22c55e",
  Moderate: "#f59e0b",
  Major: "#f97316",
  Critical: "#ef4444",
};
export const RISK_BG: Record<RiskLevel, string> = {
  Minor: "#dcfce7",
  Moderate: "#fef3c7",
  Major: "#ffedd5",
  Critical: "#fee2e2",
};
export const RISK_TEXT: Record<RiskLevel, string> = {
  Minor: "#15803d",
  Moderate: "#92400e",
  Major: "#9a3412",
  Critical: "#991b1b",
};
export const RISK_LEVELS: RiskLevel[] = ["Minor", "Moderate", "Major", "Critical"];

export const CONTROLS_LABEL_COLORS: Record<ControlRating, string> = {
  Strong: "#22c55e",
  Satisfactory: "#f59e0b",
  "Needs Improvement": "#f97316",
  Unsatisfactory: "#ef4444",
};

export const IMPLEMENTATION_COLORS: Record<ImplementationRating, string> = {
  "Fully Implemented": "#22c55e",
  "Mostly Implemented": "#f59e0b",
  "Partially Implemented": "#f97316",
  "Not Implemented": "#ef4444",
};

export const CONTROL_BG: Record<ControlRating, string> = {
  Strong: "#dcfce7",
  Satisfactory: "#fef3c7",
  "Needs Improvement": "#ffedd5",
  Unsatisfactory: "#fee2e2",
};

export const CONTROL_TEXT: Record<ControlRating, string> = {
  Strong: "#15803d",
  Satisfactory: "#92400e",
  "Needs Improvement": "#9a3412",
  Unsatisfactory: "#991b1b",
};

export const DEPARTMENTS = [
  "Accounting Department",
  "Branch Banking Group",
  "Compliance Monitoring Office",
  "Credit Department",
  "Digital Banking Department",
  "Human Resource Department",
  "Information Technology Department",
  "Internal Audit Department",
  "Legal Department",
  "Loans and Assets Management Department",
  "Marketing Department",
  "Risk Management Office",
  "Security and Safety Department",
  "Treasury Department",
];

export const EVENT_TYPES = [
  "Execution delivery and process management",
  "Business disruption and system failures",
  "External fraud",
  "Employment practices and workplace safety",
  "Internal fraud",
  "Damage to physical assets",
  "Clients products and business practices",
];

export const TREATMENT_TYPES: RiskTreatment[] = ["Accept", "Avoid", "Reduce", "Transfer"];
export const ROOT_CAUSES: RootCause[] = ["People", "Process", "Systems", "External Events"];
export const CONTROL_TYPES: ControlType[] = ["Preventive", "Detective", "Corrective", "None"];

export const TREATMENT_COLOR_MAP: Record<RiskTreatment, string> = {
  Accept: "#22c55e",
  Avoid: "#ef4444",
  Reduce: "#f59e0b",
  Transfer: "#6366f1",
};
export const RC_COLOR_MAP: Record<RootCause, string> = {
  People: "#3b82f6",
  Process: "#22c55e",
  Systems: "#f59e0b",
  "External Events": "#ef4444",
};
export const CT_COLOR_MAP: Record<ControlType, string> = {
  Preventive: "#3b82f6",
  Detective: "#f59e0b",
  Corrective: "#22c55e",
  None: "#94a3b8",
};

export function getRiskLevel(score: number): RiskLevel {
  if (score === undefined || score === null || isNaN(score)) return "Minor" as RiskLevel;
  if (score <= 3) return "Minor";
  if (score <= 6) return "Moderate";
  if (score <= 9) return "Major";
  return "Critical";
}

export function getRiskLevelSmall(score: number): RiskLevel {
  if (score === undefined || score === null || isNaN(score)) return "Minor" as RiskLevel;
  if (score === 1) return "Minor";
  if (score === 2) return "Moderate";
  if (score === 3) return "Major";
  return "Critical";
}

export function getControlsLabel(score: number): ControlRating {
  if (score === undefined || score === null || isNaN(score)) return "Strong" as ControlRating;
  if (score <= 3) return "Strong";
  if (score <= 6) return "Satisfactory";
  if (score <= 9) return "Needs Improvement";
  return "Unsatisfactory";
}

export function getControlsLabelSmall(score: number): ControlRating {
  if (score === undefined || score === null || isNaN(score)) return "Strong" as ControlRating;
  if (score === 1) return "Strong";
  if (score === 2) return "Satisfactory";
  if (score === 3) return "Needs Improvement";
  return "Unsatisfactory";
}

export function getImplementationLabel(score: number): ImplementationRating {
  if (score === undefined || score === null || isNaN(score)) return "Fully Implemented" as ImplementationRating;
  if (score <= 1) return "Fully Implemented";
  if (score <= 2) return "Mostly Implemented";
  if (score <= 3) return "Partially Implemented";
  return "Not Implemented";
}

export function shortDept(name: string): string {
  return name
    .replace(" Department", "")
    .replace(" Group", "")
    .replace(" Office", "")
    .replace(" Management", "")
    .replace(" Monitoring", "");
}
