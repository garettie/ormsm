export interface Contact {
  id?: string;
  number: string;
  name: string;
  department: string;
  location: string;
  position: string;
  level?: string;
  date?: Date;
}

export interface Response {
  id?: string;
  uid?: string;
  contact: string;
  contents: string;
  datetime: string;
}

export type Status = string;

export interface ProcessedContact extends Contact {
  status: Status;
  responseContent?: string;
  responseTime?: string;
  rawResponse?: string;
  matchType?: "phone" | "name" | "manual" | "alt-phone";
  cleanNumber: string;
}

export interface DashboardData {
  contacts: ProcessedContact[];
  unknownResponses: Response[];
  lastUpdated: Date;
  isTargeted?: boolean;
  notificationCategory?: "emergency" | "broadcast";
}

export interface Incident {
  id: number;
  name: string;
  type: "test" | "actual";
  start_time: string;
  end_time: string | null;
  is_targeted?: boolean;
  notification_category?: "emergency" | "broadcast";
}

export interface EventContact extends Contact {
  incident_id: number;
}
