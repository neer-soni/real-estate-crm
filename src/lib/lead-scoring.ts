// Lead scoring engine - rule-based qualification
// Scores leads 0-100 based on completeness of requirements

interface LeadData {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  budget?: number | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  transactionType?: string | null;
  preferredLocality?: string | null;
  preferredCity?: string | null;
  preferredBHK?: string | null;
  preferredPropertyType?: string | null;
  readyToMoveRequired?: boolean | null;
  possessionTimeline?: string | null;
  minArea?: number | null;
  maxArea?: number | null;
  amenitiesRequired?: string[] | null;
  urgencyLevel?: string | null;
  moveInDate?: Date | string | null;
  investmentPurpose?: boolean | null;
  additionalNotes?: string | null;
}

export interface LeadScoringResult {
  score: number;
  classification: "COLD" | "WARM" | "HOT";
  purchaseIntent: string;
  buyingTimeline: string;
  followUpPriority: string;
  closingProbability: number;
  insights: string;
}

export function calculateLeadScore(lead: LeadData): LeadScoringResult {
  let score = 0;
  const reasons: string[] = [];

  // ── Contact information (max 15 pts) ─────────────────────────────────────
  // Phone is the single most important field — without it follow-up is impossible
  if (lead.name)      { score += 2; }
  if (lead.phone)     { score += 10; reasons.push("Phone provided"); }
  if (lead.email)     { score += 2;  reasons.push("Email provided"); }
  if (lead.whatsapp)  { score += 1;  reasons.push("WhatsApp provided"); }

  // ── Budget clarity (max 30 pts) ───────────────────────────────────────────
  // Knowing the budget is the strongest purchase signal in real estate
  if (lead.budget) {
    score += 20;
    reasons.push("Clear budget specified");
  } else if (lead.budgetMin && lead.budgetMax) {
    score += 18;                                    // range is nearly as good as exact
    reasons.push("Budget range specified");
  } else if (lead.budgetMin || lead.budgetMax) {
    score += 10;
    reasons.push("Partial budget info");
  }
  // Knowing Buy vs Rent is fundamental — worth more than before
  if (lead.transactionType) {
    score += 12;
    reasons.push(`Transaction type: ${lead.transactionType}`);
  }

  // ── Location preference (max 20 pts) ──────────────────────────────────────
  // Specific locality = serious buyer who has done research
  if (lead.preferredLocality) {
    score += 12;
    reasons.push("Specific locality preferred");
  }
  if (lead.preferredCity) {
    score += 8;
    reasons.push("City specified");
  }

  // ── Property specifications (max 15 pts) ──────────────────────────────────
  if (lead.preferredBHK) {
    score += 4;
    reasons.push("BHK preference set");
  }
  if (lead.preferredPropertyType) {
    score += 4;
    reasons.push("Property type specified");
  }
  if (lead.minArea || lead.maxArea) {
    score += 4;
    reasons.push("Area requirements specified");
  }
  if (lead.amenitiesRequired && lead.amenitiesRequired.length > 0) {
    score += 3;
    reasons.push(`${lead.amenitiesRequired.length} amenities required`);
  }

  // ── Timeline & Urgency (max 15 pts) ───────────────────────────────────────
  if (lead.urgencyLevel) {
    const urgencyScores: Record<string, number> = {
      URGENT: 10,
      HIGH:    8,
      MEDIUM:  4,
      LOW:     1,
    };
    const urgencyScore = urgencyScores[lead.urgencyLevel] || 0;
    score += urgencyScore;
    reasons.push(`Urgency: ${lead.urgencyLevel}`);
  }
  if (lead.moveInDate) {
    score += 4;
    reasons.push("Move-in date specified");
  }
  if (lead.possessionTimeline) {
    score += 1;
    reasons.push("Possession timeline provided");
  }

  // ── Additional signals (max 5 pts) ────────────────────────────────────────
  if (lead.readyToMoveRequired) {
    score += 3;
    reasons.push("Wants ready-to-move");
  }
  if (lead.investmentPurpose) {
    score += 1;
    reasons.push("Investment purpose");
  }
  if (lead.additionalNotes) {
    score += 1;
    reasons.push("Additional notes provided");
  }

  // Cap at 100
  score = Math.min(score, 100);

  // Classification
  let classification: "COLD" | "WARM" | "HOT";
  if (score >= 61) classification = "HOT";
  else if (score >= 31) classification = "WARM";
  else classification = "COLD";

  // Purchase intent
  let purchaseIntent: string;
  if (score >= 70) purchaseIntent = "Very High - Ready to buy/rent";
  else if (score >= 50) purchaseIntent = "High - Actively looking";
  else if (score >= 30) purchaseIntent = "Medium - Exploring options";
  else purchaseIntent = "Low - Early stage inquiry";

  // Buying timeline
  let buyingTimeline: string;
  if (lead.urgencyLevel === "URGENT") buyingTimeline = "Within 1 month";
  else if (lead.urgencyLevel === "HIGH") buyingTimeline = "1-3 months";
  else if (lead.moveInDate) {
    const moveIn = new Date(lead.moveInDate);
    const now = new Date();
    const diffMonths = (moveIn.getFullYear() - now.getFullYear()) * 12 + (moveIn.getMonth() - now.getMonth());
    buyingTimeline = diffMonths <= 1 ? "Within 1 month" :
                     diffMonths <= 3 ? "1-3 months" :
                     diffMonths <= 6 ? "3-6 months" : "6+ months";
  } else if (lead.urgencyLevel === "MEDIUM") buyingTimeline = "3-6 months";
  else buyingTimeline = "6+ months or undecided";

  // Follow-up priority
  let followUpPriority: string;
  if (score >= 70) followUpPriority = "Immediate - Contact within 24 hours";
  else if (score >= 50) followUpPriority = "High - Contact within 48 hours";
  else if (score >= 30) followUpPriority = "Medium - Contact within a week";
  else followUpPriority = "Low - Nurture via automated updates";

  // Closing probability
  const closingProbability = Math.round(score * 0.65);

  // Insights
  const insights = reasons.length > 0
    ? `Lead has ${reasons.length} qualifying factors: ${reasons.join(", ")}. ${classification === "HOT" ? "This is a high-priority lead that should be contacted immediately." : classification === "WARM" ? "This lead shows good potential and needs nurturing." : "This lead needs more qualification. Follow up to gather more information."}`
    : "Insufficient data to qualify this lead. Gather more information.";

  return {
    score,
    classification,
    purchaseIntent,
    buyingTimeline,
    followUpPriority,
    closingProbability,
    insights,
  };
}
