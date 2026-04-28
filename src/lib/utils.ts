import { lazy, type ComponentType } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Enhanced lazy loader that catches ChunkLoadErrors (caused by new deployments)
 * and triggers a full page reload to fetch the latest assets.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): ComponentType<any> {
  return lazy(() =>
    factory().catch((error) => {
      const isChunkLoadFailed =
        error.name === "ChunkLoadError" ||
        /loading.*chunk.*failed/i.test(error.message);

      if (isChunkLoadFailed) {
        // Simple reload to get new manifest
        window.location.reload();
      }
      throw error;
    }),
  );
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  // Strip timezone to treat DB "UTC" as local wall clock
  const date = new Date(iso.replace("Z", "").split("+")[0]);
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
  // Shift local wall clock to UTC ISO string
  const shifted = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return shifted.toISOString();
}

export function formatDuration(start: string, end: string): string {
  const parse = (iso: string) => new Date(iso.replace("Z", "").split("+")[0]);
  const startDate = parse(start);
  const endDate = parse(end);
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
  const date = new Date(iso.replace("Z", "").split("+")[0]);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatTimeShort(iso: string): string {
  const date = new Date(iso.replace("Z", "").split("+")[0]);
  return date.toLocaleTimeString("en-US", {
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