import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  } else if (price >= 1000) {
    return `₹${(price / 1000).toFixed(1)}K`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
}

export function formatArea(area: number): string {
  return `${area.toLocaleString("en-IN")} sq ft`;
}

export function formatBHK(bhk: string): string {
  const map: Record<string, string> = {
    ONE_BHK: "1 BHK",
    TWO_BHK: "2 BHK",
    THREE_BHK: "3 BHK",
    FOUR_BHK: "4 BHK",
    FIVE_PLUS_BHK: "5+ BHK",
  };
  return map[bhk] || bhk;
}

export function formatPropertyType(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

export function formatTransactionType(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

export function formatPropertyStatus(status: string): string {
  const map: Record<string, string> = {
    READY_TO_MOVE: "Ready To Move",
    UNDER_CONSTRUCTION: "Under Construction",
    POSSESSION_3_MONTHS: "Possession in 3 Months",
    POSSESSION_6_MONTHS: "Possession in 6 Months",
    POSSESSION_1_YEAR: "Possession in 1 Year",
    POSSESSION_2_YEARS: "Possession in 2 Years",
  };
  return map[status] || status;
}

export function formatAvailability(availability: string): string {
  return availability.charAt(0) + availability.slice(1).toLowerCase();
}

export function formatLeadStatus(status: string): string {
  const map: Record<string, string> = {
    NEW: "New Lead",
    CONTACTED: "Contacted",
    MEETING_SCHEDULED: "Meeting Scheduled",
    SITE_VISIT: "Site Visit",
    NEGOTIATION: "Negotiation",
    CLOSED_WON: "Closed Won",
    CLOSED_LOST: "Closed Lost",
  };
  return map[status] || status;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getLeadClassification(score: number): "COLD" | "WARM" | "HOT" {
  if (score >= 61) return "HOT";
  if (score >= 31) return "WARM";
  return "COLD";
}

export function getLeadScoreColor(classification: string): string {
  switch (classification) {
    case "HOT":
      return "text-red-500 bg-red-500/10 border-red-500/20";
    case "WARM":
      return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    case "COLD":
      return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    default:
      return "text-gray-500 bg-gray-500/10 border-gray-500/20";
  }
}

export function generateShareToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}
