import { z } from "zod";

// ─── Property Schemas ───────────────────────────────────────

export const createPropertySchema = z.object({
  name: z.string().min(1, "Property name is required").max(200),
  description: z.string().optional(),
  builderName: z.string().optional(),
  propertyType: z.enum(["APARTMENT", "VILLA", "PLOT", "COMMERCIAL", "OFFICE"]),
  transactionType: z.enum(["RENT", "PURCHASE"]),
  price: z.number().positive("Price must be positive"),
  priceRangeMin: z.number().optional(),
  priceRangeMax: z.number().optional(),
  area: z.number().optional(),
  bhk: z.enum(["ONE_BHK", "TWO_BHK", "THREE_BHK", "FOUR_BHK", "FIVE_PLUS_BHK"]),
  locality: z.string().min(1, "Locality is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pinCode: z.string().optional(),
  googleMapsUrl: z.string().url().optional().or(z.literal("")),
  amenities: z.array(z.string()).optional().default([]),
  floorNumber: z.number().int().optional(),
  totalFloors: z.number().int().optional(),
  parking: z.string().optional(),
  furnishedStatus: z.enum(["UNFURNISHED", "SEMI_FURNISHED", "FULLY_FURNISHED"]).optional(),
  propertyStatus: z.enum([
    "READY_TO_MOVE",
    "UNDER_CONSTRUCTION",
    "POSSESSION_3_MONTHS",
    "POSSESSION_6_MONTHS",
    "POSSESSION_1_YEAR",
    "POSSESSION_2_YEARS",
  ]).optional().default("READY_TO_MOVE"),
  availability: z.enum(["ACTIVE", "DISABLED", "SOLD"]).optional().default("ACTIVE"),
  virtualTourLink: z.string().url().optional().or(z.literal("")),
  reraNumber: z.string().optional(),
  brochureUrl: z.string().optional(),
  isFeatured: z.boolean().optional().default(false),
  images: z.array(z.string()).optional().default([]),
});

export const updatePropertySchema = createPropertySchema.partial();

export const propertyFilterSchema = z.object({
  search: z.string().optional(),
  propertyType: z.string().optional(),
  transactionType: z.string().optional(),
  bhk: z.string().optional(),
  availability: z.string().optional(),
  locality: z.string().optional(),
  city: z.string().optional(),
  builderName: z.string().optional(),
  propertyStatus: z.string().optional(),
  isFeatured: z.string().optional(),
  priceMin: z.string().optional(),
  priceMax: z.string().optional(),
  sortBy: z.enum(["newest", "oldest", "priceAsc", "priceDesc"]).optional().default("newest"),
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("12"),
});

// ─── Lead Schemas ───────────────────────────────────────────

export const createLeadSchema = z.object({
  name: z.string().min(1, "Lead name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  whatsapp: z.string().optional(),
  source: z.enum(["AI_AGENT", "WEBSITE", "REFERRAL", "SOCIAL_MEDIA", "WALK_IN", "PHONE", "OTHER"]).optional().default("AI_AGENT"),
  budget: z.number().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  transactionType: z.enum(["RENT", "PURCHASE"]).optional(),
  preferredLocality: z.string().optional(),
  preferredCity: z.string().optional(),
  preferredBHK: z.enum(["ONE_BHK", "TWO_BHK", "THREE_BHK", "FOUR_BHK", "FIVE_PLUS_BHK"]).optional(),
  preferredPropertyType: z.enum(["APARTMENT", "VILLA", "PLOT", "COMMERCIAL", "OFFICE"]).optional(),
  readyToMoveRequired: z.boolean().optional(),
  possessionTimeline: z.string().optional(),
  minArea: z.number().optional(),
  maxArea: z.number().optional(),
  amenitiesRequired: z.array(z.string()).optional().default([]),
  investmentPurpose: z.boolean().optional().default(false),
  endUsePurpose: z.boolean().optional().default(true),
  urgencyLevel: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  moveInDate: z.string().optional(),
  additionalNotes: z.string().optional(),
  propertyId: z.string().optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const updateLeadStatusSchema = z.object({
  id: z.string(),
  status: z.enum(["NEW", "CONTACTED", "MEETING_SCHEDULED", "SITE_VISIT", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"]),
});

export const assignLeadSchema = z.object({
  leadId: z.string(),
  userIds: z.array(z.string()).min(1, "Select at least one client"),
});

// ─── Auth Schemas ───────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional().default(false),
});

// ─── User Schemas ───────────────────────────────────────────

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["SUPER_ADMIN", "CLIENT"]).default("CLIENT"),
  phone: z.string().optional(),
  company: z.string().optional(),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
