export const RISK_COLORS = {
  Minor: "#22c55e",
  Moderate: "#f59e0b",
  Major: "#f97316",
  Critical: "#ef4444",
};
export const RISK_BG = {
  Minor: "#dcfce7",
  Moderate: "#fef3c7",
  Major: "#ffedd5",
  Critical: "#fee2e2",
};
export const RISK_TEXT = {
  Minor: "#15803d",
  Moderate: "#92400e",
  Major: "#9a3412",
  Critical: "#991b1b",
};
export const RISK_LEVELS = ["Minor", "Moderate", "Major", "Critical"];

export const CONTROLS_LABEL_COLORS = {
  Strong: "#22c55e",
  Satisfactory: "#f59e0b",
  "Needs Improvement": "#f97316",
  Unsatisfactory: "#ef4444",
};

export const CONTROL_BG = {
  Strong: "#dcfce7",
  Satisfactory: "#fef3c7",
  "Needs Improvement": "#ffedd5",
  Unsatisfactory: "#fee2e2",
};

export const CONTROL_TEXT = {
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

export const TREATMENT_TYPES = ["Accept", "Avoid", "Reduce", "Transfer"];
export const ROOT_CAUSES = ["People", "Process", "Systems", "External Events"];
export const CONTROL_TYPES = ["Preventive", "Detective", "Corrective", "None"];

export const TREATMENT_COLOR_MAP = {
  Accept: "#22c55e",
  Avoid: "#ef4444",
  Reduce: "#f59e0b",
  Transfer: "#6366f1",
};
export const RC_COLOR_MAP = {
  People: "#3b82f6",
  Process: "#22c55e",
  Systems: "#f59e0b",
  "External Events": "#ef4444",
};
export const CT_COLOR_MAP = {
  Preventive: "#3b82f6",
  Detective: "#f59e0b",
  Corrective: "#22c55e",
  None: "#94a3b8",
};

export function getRiskLevel(score) {
  if (score <= 3) return "Minor";
  if (score <= 6) return "Moderate";
  if (score <= 9) return "Major";
  return "Critical";
}

export function getControlsLabel(score) {
  if (score <= 3) return "Strong";
  if (score <= 6) return "Satisfactory";
  if (score <= 9) return "Needs Improvement";
  return "Unsatisfactory";
}

export function shortDept(name) {
  return name
    .replace(" Department", "")
    .replace(" Group", "")
    .replace(" Office", "")
    .replace(" Management", "")
    .replace(" Monitoring", "");
}
