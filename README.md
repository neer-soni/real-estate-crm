# RealEstateAI - AI-Powered CRM & Property Management

A modern, production-ready SaaS web application for Real Estate Agencies and AI Agents. This platform serves as a central hub for managing properties, clients, and leads, featuring an automated AI scoring engine and a premium glassmorphism dashboard.

## 🚀 Live Demo
- **Production URL**: https://real-estate-crm-one-gamma.vercel.app

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Framer Motion
- **UI Components**: ShadCN UI + Radix Primitives
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma v5
- **Authentication**: NextAuth.js v5 (Auth.js)
- **State Management**: React Query / TanStack Query v5
- **Charts**: Recharts
- **Deployment**: Vercel

---

## 🏗 Architecture & Core Features

### 1. Role-Based Access Control (RBAC)
- **Super Admin**: Full access. Can manage properties, clients, leads, view analytics, and assign leads.
- **Client**: Restricted access. Can only view and manage leads explicitly assigned to them.

### 2. Automated Lead Scoring Engine
Incoming leads are automatically scored (0-100) based on criteria like budget, urgency, timeline, and property match. They are classified into:
- 🔥 **HOT** (61-100): Ready to buy/rent immediately
- ☀️ **WARM** (31-60): Actively looking but timeline is 3-6 months
- ❄️ **COLD** (0-30): Early stage inquiry

### 3. AI Agent Integration
The system provides REST endpoints designed specifically for AI Agents (like chatbots or voice agents) to interact with the CRM:
- **Search API**: Allows the AI to query properties using fuzzy matching (city, locality, budget buffer).
- **Lead Intake API**: Allows the AI to submit gathered lead data, which triggers the auto-scoring engine and generates a shareable web link for the client.

---

## 🗄️ Database Models (Prisma)

1. **User**: Super Admins and Clients.
2. **Property**: Real estate listings (Apartment, Villa, Plot, Commercial, Office).
3. **PropertyImage**: Associated images for a property.
4. **Lead**: Potential buyers/renters with detailed requirements and AI scoring insights.
5. **LeadAssignment**: Mapping table linking Leads to assigned Clients.
6. **LeadNote**: Chronological notes/updates added to a lead by users.
7. **AuditLog**: System tracker for critical actions (e.g., status changes, deletions).

---

## 🔌 API Reference

### Authentication Routes
- `POST /api/auth/[...nextauth]` - Handles login/session via NextAuth Credentials provider.

### Properties (`/api/properties`)
- `GET /api/properties` 
  - **Query Params**: `page`, `limit`, `search`, `type`, `bhk`, `status`, `availability`, `minPrice`, `maxPrice`, `sortBy`
  - **Description**: Fetch paginated properties with advanced filtering.
- `POST /api/properties`
  - **Description**: Create a new property listing (Admin only).
- `GET /api/properties/:id`
  - **Description**: Fetch a single property with its images and associated leads.
- `PUT /api/properties/:id`
  - **Description**: Update an existing property.
- `DELETE /api/properties/:id`
  - **Description**: Delete a property.
- `PATCH /api/properties/status`
  - **Body**: `{ id, availability }` (ACTIVE, DISABLED, SOLD)
- `PATCH /api/properties/feature`
  - **Body**: `{ id, isFeatured }`

### Leads (`/api/leads`)
- `GET /api/leads`
  - **Query Params**: `page`, `limit`, `search`, `status`, `classification`, `source`
  - **Description**: Fetch leads. Clients only see assigned leads; Admins see all.
- `POST /api/leads`
  - **Description**: Create a new lead manually from the dashboard. Triggers scoring engine.
- `GET /api/leads/:id`
  - **Description**: Fetch a single lead with assignments and notes.
- `PUT /api/leads/:id`
  - **Description**: Update a lead. Automatically recalculates the score.
- `DELETE /api/leads/:id`
  - **Description**: Delete a lead.
- `PATCH /api/leads/status`
  - **Body**: `{ id, status }` (Moves lead across the Kanban pipeline).
- `PATCH /api/leads/assign`
  - **Body**: `{ leadId, userIds[] }`
  - **Description**: Assign a lead to one or multiple clients (Admin only).
- `GET /api/leads/analytics`
  - **Description**: Fetches aggregated statistics for the dashboard (conversion rates, funnels, pipeline).

### Clients (`/api/clients`)
- `GET /api/clients`
  - **Description**: List all user accounts with their assignment counts (Admin only).
- `POST /api/clients`
  - **Body**: `{ name, email, password, phone, company, role }` or `{ _action: "toggleActive", id, isActive }`
  - **Description**: Create a new user account or activate/deactivate an existing one.

### AI Agent Endpoints (`/api/agent`)
- `POST /api/agent/search`
  - **Body**: `{ city, locality, bhk, propertyType, transactionType, budget, readyToMove }`
  - **Description**: Fuzzy search for properties with a built-in 15% budget buffer to suggest close matches.
- `POST /api/agent/lead`
  - **Body**: `{ ...leadData, conversationHistory }`
  - **Description**: AI submits a qualified lead. The system auto-scores it and returns a `shareUrl` that the AI can send back to the user.

### Utilities
- `POST /api/upload/images`
  - **Description**: Temporary local file upload handler (saves to `/public/uploads`). Can be swapped for Cloudinary/Supabase Storage.

---

## 💻 Local Development
1. Clone repository
2. Run `npm install`
3. Configure `.env.local`
4. Run `npx prisma generate`
5. Run `npx prisma db push`
6. Run `npm run dev`
