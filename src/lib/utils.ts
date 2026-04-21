import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatPhoneNumber(num: string | null | undefined): string {
  if (!num) return "—";
  const cleaned = num.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned[0] === "1") {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return num;
}

export function localNowAsUTC(d: Date = new Date()): string {
  const utc = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
  return utc.toISOString();
}

export function formatDuration(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours % 24}h`;
  }
  if (diffHours > 0) {
    return `${diffHours}h ${diffMins % 60}m`;
  }
  if (diffMins > 0) {
    return `${diffMins}m`;
  }
  return "0m";
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatTimeShort(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getRiskLevel(score: number): "Minor" | "Moderate" | "Major" | "Critical" {
  if (score <= 3) return "Minor";
  if (score <= 6) return "Moderate";
  if (score <= 9) return "Major";
  return "Critical";
}

export function getControlsLabel(score: number): "Strong" | "Satisfactory" | "Needs Improvement" | "Unsatisfactory" {
  if (score <= 3) return "Strong";
  if (score <= 6) return "Satisfactory";
  if (score <= 9) return "Needs Improvement";
  return "Unsatisfactory";
}