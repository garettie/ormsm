// Unified color constants for both CallTree and RCSA modules
// Use this instead of duplicating across modules

// CallTree status colors
export const STATUS_COLORS = {
  Safe: "#34a853",
  SafeBg: "#e6f4ea",
  Slight: "#f9ab00",
  SlightBg: "#fef7e0",
  Moderate: "#ff6d00",
  ModerateBg: "#fff3e0",
  Severe: "#d93025",
  SevereBg: "#fce8e6",
  "No Response": "#80868b",
  Primary: "#1e8e3e",
  Light: "#e6f4ea",
  Pending: "#e8eaed",
} as const;

export const STATUS_ORDER = [
  "Safe",
  "Slight",
  "Moderate",
  "Severe",
  "No Response",
] as const;

// RCSA risk levels
export const RISK_COLORS = {
  Minor: "#22c55e",
  Moderate: "#f59e0b",
  Major: "#f97316",
  Critical: "#ef4444",
} as const;

export const RISK_BG = {
  Minor: "#dcfce7",
  Moderate: "#fef3c7",
  Major: "#ffedd5",
  Critical: "#fee2e2",
} as const;

export const RISK_TEXT = {
  Minor: "#15803d",
  Moderate: "#92400e",
  Major: "#9a3412",
  Critical: "#991b1b",
} as const;

export const RISK_LEVELS = ["Minor", "Moderate", "Major", "Critical"] as const;

// RCSA control ratings
export const CONTROL_COLORS = {
  Strong: "#22c55e",
  Satisfactory: "#f59e0b",
  "Needs Improvement": "#f97316",
  Unsatisfactory: "#ef4444",
} as const;

export const CONTROL_BG = {
  Strong: "#dcfce7",
  Satisfactory: "#fef3c7",
  "Needs Improvement": "#ffedd5",
  Unsatisfactory: "#fee2e2",
} as const;

export const CONTROL_TEXT = {
  Strong: "#15803d",
  Satisfactory: "#92400e",
  "Needs Improvement": "#9a3412",
  Unsatisfactory: "#991b1b",
} as const;

// Shared constants
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
] as const;

export const TREATMENT_TYPES = ["Accept", "Avoid", "Reduce", "Transfer"] as const;
export const ROOT_CAUSES = ["People", "Process", "Systems", "External Events"] as const;
export const CONTROL_TYPES = ["Preventive", "Detective", "Corrective", "None"] as const;

export const TREATMENT_COLOR_MAP = {
  Accept: "#22c55e",
  Avoid: "#ef4444",
  Reduce: "#f59e0b",
  Transfer: "#6366f1",
} as const;

export const RC_COLOR_MAP = {
  People: "#3b82f6",
  Process: "#22c55e",
  Systems: "#f59e0b",
  "External Events": "#ef4444",
} as const;

export const CT_COLOR_MAP = {
  Preventive: "#3b82f6",
  Detective: "#f59e0b",
  Corrective: "#22c55e",
  None: "#94a3b8",
} as const;