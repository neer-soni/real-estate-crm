import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Super Admin
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@realestate.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@realestate.com",
      password: adminPassword,
      role: "SUPER_ADMIN",
      phone: "+91 98765 43210",
    },
  });
  console.log("✅ Super Admin created:", admin.email);

  // Create Client accounts
  const clientPassword = await bcrypt.hash("client123", 12);
  const client1 = await prisma.user.upsert({
    where: { email: "rahul@clientfirm.com" },
    update: {},
    create: {
      name: "Rahul Sharma",
      email: "rahul@clientfirm.com",
      password: clientPassword,
      role: "CLIENT",
      phone: "+91 98765 11111",
      company: "Sharma Realty",
    },
  });

  const client2 = await prisma.user.upsert({
    where: { email: "priya@homesellers.com" },
    update: {},
    create: {
      name: "Priya Verma",
      email: "priya@homesellers.com",
      password: clientPassword,
      role: "CLIENT",
      phone: "+91 98765 22222",
      company: "HomeSellers India",
    },
  });
  console.log("✅ Client accounts created");

  // Create Properties
  const properties = [
    {
      name: "DLF The Crest 3BHK Premium",
      description: "Ultra-luxury 3BHK apartment with panoramic views of the Aravalli hills. Premium fittings by Italian designers, private elevator lobby, and smart home automation throughout.",
      builderName: "DLF Ltd",
      propertyType: "APARTMENT" as const,
      transactionType: "PURCHASE" as const,
      price: 42500000,
      area: 2850,
      bhk: "THREE_BHK" as const,
      locality: "Sector 54",
      city: "Gurgaon",
      state: "Haryana",
      pinCode: "122011",
      amenities: ["Swimming Pool", "Gym", "Clubhouse", "Parking", "Security", "Lift", "Power Backup", "CCTV", "Garden", "Jogging Track"],
      floorNumber: 12,
      totalFloors: 25,
      parking: "2 Covered",
      furnishedStatus: "SEMI_FURNISHED" as const,
      propertyStatus: "READY_TO_MOVE" as const,
      isFeatured: true,
      reraNumber: "RERA-HR-GGN-2024-0154",
      createdById: admin.id,
    },
    {
      name: "Prestige Lakeside Habitat Villa",
      description: "Stunning 4BHK independent villa with private garden, lake-facing views, Italian marble flooring, and modular kitchen with premium appliances.",
      builderName: "Prestige Group",
      propertyType: "VILLA" as const,
      transactionType: "PURCHASE" as const,
      price: 85000000,
      area: 4200,
      bhk: "FOUR_BHK" as const,
      locality: "Whitefield",
      city: "Bangalore",
      state: "Karnataka",
      pinCode: "560066",
      amenities: ["Swimming Pool", "Gym", "Clubhouse", "Parking", "Security", "Garden", "Children Play Area", "Sports Facility", "Intercom"],
      totalFloors: 3,
      parking: "3 Covered + 1 Open",
      furnishedStatus: "FULLY_FURNISHED" as const,
      propertyStatus: "READY_TO_MOVE" as const,
      isFeatured: true,
      reraNumber: "RERA-KA-BLR-2023-0892",
      createdById: admin.id,
    },
    {
      name: "Godrej Air 2BHK Smart Home",
      description: "Modern 2BHK apartment with smart home features, energy-efficient design, and green certification. Close to IT hubs and metro station.",
      builderName: "Godrej Properties",
      propertyType: "APARTMENT" as const,
      transactionType: "PURCHASE" as const,
      price: 15500000,
      area: 1150,
      bhk: "TWO_BHK" as const,
      locality: "Sector 85",
      city: "Gurgaon",
      state: "Haryana",
      pinCode: "122004",
      amenities: ["Swimming Pool", "Gym", "Parking", "Security", "Lift", "Power Backup", "Rain Water Harvesting", "Wi-Fi"],
      floorNumber: 8,
      totalFloors: 18,
      parking: "1 Covered",
      furnishedStatus: "UNFURNISHED" as const,
      propertyStatus: "POSSESSION_3_MONTHS" as const,
      isFeatured: false,
      createdById: admin.id,
    },
    {
      name: "Emaar Palm Heights 3BHK",
      description: "Premium 3BHK with golf course views, spacious balconies, and world-class amenities. Located in the heart of Golf Course Extension Road.",
      builderName: "Emaar India",
      propertyType: "APARTMENT" as const,
      transactionType: "PURCHASE" as const,
      price: 32000000,
      area: 2100,
      bhk: "THREE_BHK" as const,
      locality: "Sector 77",
      city: "Gurgaon",
      state: "Haryana",
      pinCode: "122004",
      amenities: ["Swimming Pool", "Gym", "Clubhouse", "Parking", "Security", "Lift", "Garden", "Jogging Track", "Children Play Area"],
      floorNumber: 15,
      totalFloors: 30,
      parking: "2 Covered",
      furnishedStatus: "SEMI_FURNISHED" as const,
      propertyStatus: "READY_TO_MOVE" as const,
      isFeatured: true,
      reraNumber: "RERA-HR-GGN-2023-0678",
      createdById: admin.id,
    },
    {
      name: "Lodha The Park 1BHK Studio",
      description: "Compact luxury 1BHK studio apartment ideal for young professionals. Premium location with easy access to Lower Parel and BKC.",
      builderName: "Lodha Group",
      propertyType: "APARTMENT" as const,
      transactionType: "RENT" as const,
      price: 55000,
      area: 650,
      bhk: "ONE_BHK" as const,
      locality: "Worli",
      city: "Mumbai",
      state: "Maharashtra",
      pinCode: "400018",
      amenities: ["Gym", "Parking", "Security", "Lift", "Power Backup", "CCTV", "Swimming Pool"],
      floorNumber: 22,
      totalFloors: 45,
      parking: "1 Covered",
      furnishedStatus: "FULLY_FURNISHED" as const,
      propertyStatus: "READY_TO_MOVE" as const,
      isFeatured: false,
      createdById: admin.id,
    },
    {
      name: "Brigade Utopia 4BHK Penthouse",
      description: "Exclusive penthouse with private terrace garden, panoramic city views, duplex layout, and dedicated home theater room.",
      builderName: "Brigade Group",
      propertyType: "APARTMENT" as const,
      transactionType: "PURCHASE" as const,
      price: 120000000,
      area: 5500,
      bhk: "FOUR_BHK" as const,
      locality: "Varthur",
      city: "Bangalore",
      state: "Karnataka",
      pinCode: "560087",
      amenities: ["Swimming Pool", "Gym", "Clubhouse", "Parking", "Security", "Lift", "Garden", "Sports Facility", "Community Hall", "Intercom", "CCTV"],
      floorNumber: 28,
      totalFloors: 28,
      parking: "3 Covered",
      furnishedStatus: "FULLY_FURNISHED" as const,
      propertyStatus: "READY_TO_MOVE" as const,
      isFeatured: true,
      createdById: admin.id,
    },
    {
      name: "Commercial Office Space - Cyber City",
      description: "Grade A commercial office space in the heart of Cyber City. Plug-and-play setup with modern interiors, meeting rooms, and reception area.",
      builderName: "DLF Ltd",
      propertyType: "OFFICE" as const,
      transactionType: "RENT" as const,
      price: 250000,
      area: 3200,
      bhk: "FIVE_PLUS_BHK" as const,
      locality: "Cyber City",
      city: "Gurgaon",
      state: "Haryana",
      pinCode: "122002",
      amenities: ["Parking", "Security", "Lift", "Power Backup", "CCTV", "Fire Safety", "Wi-Fi", "Maintenance Staff"],
      floorNumber: 6,
      totalFloors: 12,
      parking: "10 Covered",
      furnishedStatus: "FULLY_FURNISHED" as const,
      propertyStatus: "READY_TO_MOVE" as const,
      isFeatured: false,
      createdById: admin.id,
    },
    {
      name: "Residential Plot - Sector 108",
      description: "Prime residential plot in a gated community with all amenities. Perfect for building your dream home. SCO and residential zoning approved.",
      builderName: "BPTP Ltd",
      propertyType: "PLOT" as const,
      transactionType: "PURCHASE" as const,
      price: 28000000,
      area: 2400,
      bhk: "FIVE_PLUS_BHK" as const,
      locality: "Sector 108",
      city: "Gurgaon",
      state: "Haryana",
      pinCode: "122006",
      amenities: ["Security", "Garden", "Jogging Track", "Children Play Area"],
      propertyStatus: "READY_TO_MOVE" as const,
      isFeatured: false,
      createdById: admin.id,
    },
    {
      name: "Sobha Dream Acres 2BHK",
      description: "Affordable luxury 2BHK in a sprawling 81-acre township. Close to Panathur Road and ORR. Excellent rental yield potential.",
      builderName: "Sobha Ltd",
      propertyType: "APARTMENT" as const,
      transactionType: "PURCHASE" as const,
      price: 9500000,
      area: 1020,
      bhk: "TWO_BHK" as const,
      locality: "Panathur",
      city: "Bangalore",
      state: "Karnataka",
      pinCode: "560087",
      amenities: ["Swimming Pool", "Gym", "Clubhouse", "Parking", "Security", "Lift", "Garden", "Jogging Track", "Children Play Area", "Sports Facility"],
      floorNumber: 5,
      totalFloors: 14,
      parking: "1 Covered",
      furnishedStatus: "UNFURNISHED" as const,
      propertyStatus: "UNDER_CONSTRUCTION" as const,
      isFeatured: false,
      createdById: admin.id,
    },
    {
      name: "M3M Golf Estate 5BHK Ultra Luxury",
      description: "Ultra-luxury 5BHK duplex villa apartment with private pool, golf course views, and imported marble. The epitome of luxury living in Gurgaon.",
      builderName: "M3M India",
      propertyType: "VILLA" as const,
      transactionType: "PURCHASE" as const,
      price: 175000000,
      area: 7800,
      bhk: "FIVE_PLUS_BHK" as const,
      locality: "Sector 65",
      city: "Gurgaon",
      state: "Haryana",
      pinCode: "122102",
      amenities: ["Swimming Pool", "Gym", "Clubhouse", "Parking", "Security", "Lift", "Garden", "Jogging Track", "Sports Facility", "Community Hall", "Temple", "ATM"],
      totalFloors: 4,
      parking: "4 Covered + 2 Open",
      furnishedStatus: "FULLY_FURNISHED" as const,
      propertyStatus: "READY_TO_MOVE" as const,
      isFeatured: true,
      reraNumber: "RERA-HR-GGN-2022-0345",
      createdById: admin.id,
    },
  ];

  for (const prop of properties) {
    await prisma.property.create({ data: prop });
  }
  console.log(`✅ ${properties.length} properties created`);

  // Create Leads
  const leads = [
    {
      name: "Amit Khanna", phone: "+91 99887 11111", email: "amit.k@gmail.com", whatsapp: "+91 99887 11111",
      source: "AI_AGENT" as const, budget: 35000000, transactionType: "PURCHASE" as const,
      preferredLocality: "Sector 54", preferredCity: "Gurgaon", preferredBHK: "THREE_BHK" as const,
      preferredPropertyType: "APARTMENT" as const, readyToMoveRequired: true,
      urgencyLevel: "HIGH" as const, additionalNotes: "Looking for golf course facing apartments",
      score: 82, classification: "HOT" as const, status: "SITE_VISIT" as const,
      purchaseIntent: "Very High - Ready to buy/rent", buyingTimeline: "1-3 months",
      followUpPriority: "Immediate - Contact within 24 hours", closingProbability: 53,
    },
    {
      name: "Sneha Patel", phone: "+91 99887 22222", email: "sneha.p@outlook.com",
      source: "WEBSITE" as const, budget: 15000000, transactionType: "PURCHASE" as const,
      preferredCity: "Bangalore", preferredBHK: "TWO_BHK" as const,
      preferredPropertyType: "APARTMENT" as const,
      urgencyLevel: "MEDIUM" as const, additionalNotes: "First time buyer, needs loan assistance",
      score: 55, classification: "WARM" as const, status: "CONTACTED" as const,
      purchaseIntent: "High - Actively looking", buyingTimeline: "3-6 months",
      followUpPriority: "High - Contact within 48 hours", closingProbability: 36,
    },
    {
      name: "Raj Malhotra", phone: "+91 99887 33333",
      source: "REFERRAL" as const, budget: 90000000, transactionType: "PURCHASE" as const,
      preferredLocality: "Whitefield", preferredCity: "Bangalore", preferredBHK: "FOUR_BHK" as const,
      preferredPropertyType: "VILLA" as const, readyToMoveRequired: true,
      urgencyLevel: "URGENT" as const, investmentPurpose: true,
      score: 91, classification: "HOT" as const, status: "NEGOTIATION" as const,
      purchaseIntent: "Very High - Ready to buy/rent", buyingTimeline: "Within 1 month",
      followUpPriority: "Immediate - Contact within 24 hours", closingProbability: 59,
    },
    {
      name: "Divya Nair", email: "divya.nair@yahoo.com",
      source: "SOCIAL_MEDIA" as const, preferredCity: "Mumbai",
      preferredPropertyType: "APARTMENT" as const,
      score: 18, classification: "COLD" as const, status: "NEW" as const,
      purchaseIntent: "Low - Early stage inquiry", buyingTimeline: "6+ months or undecided",
      followUpPriority: "Low - Nurture via automated updates", closingProbability: 12,
    },
    {
      name: "Vikram Singh", phone: "+91 99887 55555", email: "vikram.s@corp.com", whatsapp: "+91 99887 55555",
      source: "AI_AGENT" as const, budget: 50000, transactionType: "RENT" as const,
      preferredLocality: "Worli", preferredCity: "Mumbai", preferredBHK: "ONE_BHK" as const,
      preferredPropertyType: "APARTMENT" as const, readyToMoveRequired: true,
      urgencyLevel: "HIGH" as const, additionalNotes: "Relocating for work, needs furnished apartment",
      score: 75, classification: "HOT" as const, status: "MEETING_SCHEDULED" as const,
      purchaseIntent: "Very High - Ready to buy/rent", buyingTimeline: "Within 1 month",
      followUpPriority: "Immediate - Contact within 24 hours", closingProbability: 49,
    },
    {
      name: "Neha Gupta", phone: "+91 99887 66666",
      source: "WALK_IN" as const, budget: 28000000, transactionType: "PURCHASE" as const,
      preferredLocality: "Sector 108", preferredCity: "Gurgaon",
      preferredPropertyType: "PLOT" as const,
      urgencyLevel: "MEDIUM" as const,
      score: 48, classification: "WARM" as const, status: "CONTACTED" as const,
      purchaseIntent: "High - Actively looking", buyingTimeline: "3-6 months",
      followUpPriority: "High - Contact within 48 hours", closingProbability: 31,
    },
    {
      name: "Arjun Reddy", phone: "+91 99887 77777", email: "arjun.r@tech.co",
      source: "AI_AGENT" as const, budget: 10000000, transactionType: "PURCHASE" as const,
      preferredCity: "Bangalore", preferredBHK: "TWO_BHK" as const,
      preferredPropertyType: "APARTMENT" as const,
      urgencyLevel: "LOW" as const,
      score: 38, classification: "WARM" as const, status: "NEW" as const,
      purchaseIntent: "Medium - Exploring options", buyingTimeline: "6+ months or undecided",
      followUpPriority: "Medium - Contact within a week", closingProbability: 25,
    },
    {
      name: "Kavita Joshi", phone: "+91 99887 88888", whatsapp: "+91 99887 88888",
      source: "PHONE" as const, budget: 250000, transactionType: "RENT" as const,
      preferredLocality: "Cyber City", preferredCity: "Gurgaon",
      preferredPropertyType: "OFFICE" as const,
      urgencyLevel: "URGENT" as const, additionalNotes: "Need office space for 25-member team, immediate",
      score: 68, classification: "HOT" as const, status: "SITE_VISIT" as const,
      purchaseIntent: "Very High - Ready to buy/rent", buyingTimeline: "Within 1 month",
      followUpPriority: "Immediate - Contact within 24 hours", closingProbability: 44,
    },
  ];

  for (const lead of leads) {
    const created = await prisma.lead.create({ data: lead });
    // Assign some leads to clients
    if (["Amit Khanna", "Sneha Patel", "Vikram Singh", "Neha Gupta"].includes(lead.name)) {
      await prisma.leadAssignment.create({
        data: { leadId: created.id, userId: client1.id },
      });
    }
    if (["Raj Malhotra", "Arjun Reddy", "Kavita Joshi"].includes(lead.name)) {
      await prisma.leadAssignment.create({
        data: { leadId: created.id, userId: client2.id },
      });
    }
  }
  console.log(`✅ ${leads.length} leads created with assignments`);

  console.log("\n🎉 Seeding complete!");
  console.log("─────────────────────────────────");
  console.log("Login credentials:");
  console.log("  Super Admin: admin@realestate.com / admin123");
  console.log("  Client 1:    rahul@clientfirm.com / client123");
  console.log("  Client 2:    priya@homesellers.com / client123");
  console.log("─────────────────────────────────");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
