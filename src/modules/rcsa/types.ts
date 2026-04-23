export type RiskLevel = "Minor" | "Moderate" | "Major" | "Critical";
export type ControlRating = "Strong" | "Satisfactory" | "Needs Improvement" | "Unsatisfactory";
export type ControlType = "Preventive" | "Detective" | "Corrective" | "None";
export type RiskTreatment = "Accept" | "Avoid" | "Reduce" | "Transfer";
export type RootCause = "People" | "Process" | "Systems" | "External Events";
export type RiskStatus = "Open" | "In Progress" | "Closed";

export interface RiskRecord {
  id?: string | number;
  department: string;
  process_name: string;
  risk_description: string;
  possible_causes: string;
  root_cause: RootCause;
  event_type: string;
  control_description: string;
  control_type: ControlType;
  control_design: number;
  control_implementation: number;
  likelihood_score: number;
  impact_score: number;
  controls_rating: number;
  residual_risk_score: number;
  inherent_risk_score: number;
  assessment_period: string;
  risk_treatment: RiskTreatment;
  status: RiskStatus;
  action_plan: string | null;
  action_plan_deadline: string | null;
  created_at?: string;
  control_rating?: string;
}

export interface DashboardData {
  risks: RiskRecord[];
  loading: boolean;
  error: string | null;
}
