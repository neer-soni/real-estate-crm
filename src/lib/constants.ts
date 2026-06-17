export const APP_NAME = "RealEstateAI";
export const APP_DESCRIPTION = "AI-Powered Real Estate CRM & Property Management";

export const PROPERTY_TYPES = [
  { value: "APARTMENT", label: "Apartment" },
  { value: "VILLA", label: "Villa" },
  { value: "PLOT", label: "Plot" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "OFFICE", label: "Office" },
] as const;

export const TRANSACTION_TYPES = [
  { value: "RENT", label: "Rent" },
  { value: "PURCHASE", label: "Purchase" },
] as const;

export const BHK_OPTIONS = [
  { value: "ONE_BHK", label: "1 BHK" },
  { value: "TWO_BHK", label: "2 BHK" },
  { value: "THREE_BHK", label: "3 BHK" },
  { value: "FOUR_BHK", label: "4 BHK" },
  { value: "FIVE_PLUS_BHK", label: "5+ BHK" },
] as const;

export const FURNISHED_STATUS = [
  { value: "UNFURNISHED", label: "Unfurnished" },
  { value: "SEMI_FURNISHED", label: "Semi Furnished" },
  { value: "FULLY_FURNISHED", label: "Fully Furnished" },
] as const;

export const PROPERTY_STATUS = [
  { value: "READY_TO_MOVE", label: "Ready To Move" },
  { value: "UNDER_CONSTRUCTION", label: "Under Construction" },
  { value: "POSSESSION_3_MONTHS", label: "Possession in 3 Months" },
  { value: "POSSESSION_6_MONTHS", label: "Possession in 6 Months" },
  { value: "POSSESSION_1_YEAR", label: "Possession in 1 Year" },
  { value: "POSSESSION_2_YEARS", label: "Possession in 2 Years" },
] as const;

export const AVAILABILITY_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DISABLED", label: "Disabled" },
  { value: "SOLD", label: "Sold" },
] as const;

export const LEAD_SOURCES = [
  { value: "AI_AGENT", label: "AI Agent" },
  { value: "WEBSITE", label: "Website" },
  { value: "REFERRAL", label: "Referral" },
  { value: "SOCIAL_MEDIA", label: "Social Media" },
  { value: "WALK_IN", label: "Walk In" },
  { value: "PHONE", label: "Phone" },
  { value: "OTHER", label: "Other" },
] as const;

export const LEAD_STATUSES = [
  { value: "NEW", label: "New Lead", color: "bg-blue-500" },
  { value: "CONTACTED", label: "Contacted", color: "bg-yellow-500" },
  { value: "MEETING_SCHEDULED", label: "Meeting Scheduled", color: "bg-purple-500" },
  { value: "SITE_VISIT", label: "Site Visit", color: "bg-indigo-500" },
  { value: "NEGOTIATION", label: "Negotiation", color: "bg-orange-500" },
  { value: "CLOSED_WON", label: "Closed Won", color: "bg-green-500" },
  { value: "CLOSED_LOST", label: "Closed Lost", color: "bg-red-500" },
] as const;

export const URGENCY_LEVELS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
] as const;

export const COMMON_AMENITIES = [
  "Swimming Pool",
  "Gym",
  "Parking",
  "Security",
  "Power Backup",
  "Lift",
  "Garden",
  "Clubhouse",
  "Children Play Area",
  "Sports Facility",
  "Jogging Track",
  "Rain Water Harvesting",
  "Intercom",
  "CCTV",
  "Fire Safety",
  "Gas Pipeline",
  "Water Purifier",
  "Maintenance Staff",
  "Waste Disposal",
  "Wi-Fi",
  "Community Hall",
  "Temple",
  "Shopping Center",
  "ATM",
  "Visitor Parking",
] as const;

export const BUDGET_RANGES = [
  { min: 0, max: 2500000, label: "Under ₹25 L" },
  { min: 2500000, max: 5000000, label: "₹25 L - ₹50 L" },
  { min: 5000000, max: 10000000, label: "₹50 L - ₹1 Cr" },
  { min: 10000000, max: 20000000, label: "₹1 Cr - ₹2 Cr" },
  { min: 20000000, max: 50000000, label: "₹2 Cr - ₹5 Cr" },
  { min: 50000000, max: Infinity, label: "Above ₹5 Cr" },
] as const;

export const PAGE_SIZE = 12;
