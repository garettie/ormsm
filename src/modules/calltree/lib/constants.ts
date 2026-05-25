import type { Status } from "../types";

// Backwards compatibility for CallTree module
// Use src/lib/constants.ts for other modules

export const STATUS_MAPPING: Record<string, Status> = {
  "1": "Safe",
  "1.0": "Safe",
  safe: "Safe",
  unaffected: "Safe",
  ok: "Safe",
  "2": "Slight",
  "2.0": "Slight",
  slight: "Slight",
  minor: "Slight",
  "3": "Moderate",
  "3.0": "Moderate",
  moderate: "Moderate",
  "4": "Severe",
  "4.0": "Severe",
  severe: "Severe",
  help: "Severe",
  critical: "Severe",
};

export const COLORS = {
  Safe: "#34a853",
  SafeBg: "#e6f4ea",
  Slight: "#f9ab00",
  SlightBg: "#fef7e0",
  Moderate: "#ff6d00",
  ModerateBg: "#fff3e0",
  Severe: "#d93025",
  SevereBg: "#fce8e6",
  "No Response": "#80868b",
  Responded: "#0284c7",
  Invalid: "#f97316",
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

export const CATEGORY_CONFIG = {
  emergency: { label: "Emergency", color: "red" },
  broadcast: { label: "Broadcast", color: "blue" },
  poll: { label: "Poll", color: "purple" },
} as const;

export type NotificationCategory = keyof typeof CATEGORY_CONFIG;