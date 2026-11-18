# Universal AI Assistant Kit & Integration Framework

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Features](https://img.shields.io/badge/Features-F01--F20%20(100%25%20Verified)-success.svg)](ai-assistant-kit/FEATURES.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/3D%20Avatar-Three.js-orange.svg)](https://threejs.org/)
[![Multi-Provider](https://img.shields.io/badge/AI%20Router-OpenRouter%20%7C%20Gemini%20%7C%20Groq-purple.svg)](ai-assistant-kit/core/providers/)

An enterprise-ready, app-agnostic **Universal AI Assistant Kit** that drops into **any web application** in minutes purely through configuration. 

Equipped with an interactive Three.js 3D avatar guide, strict server-side role scoping (Default Deny), multi-provider automatic failover with circuit breakers, real-time token streaming, multi-format spreadsheet import/export, and Razorpay monetization.

---

## 📦 What is in this Repository

This repository contains the standalone, decoupled AI Assistant Kit and all files needed to connect the assistant to any external web application:

```
.
├── README.md                      # This comprehensive master integration guide
├── ai-assistant-kit.zip           # Standalone distributable archive (1.15 MB, ready to unzip)
├── 01_KIT_PACKAGING_SPEC.md       # Complete kit packaging specification (Phase A through G)
├── 02_KIT_INTEGRATION_SPEC.md     # Step-by-step integration specification for new web apps
├── INTEGRATION_GUIDE.md           # 15-minute quickstart guide
├── CONFIG_REFERENCE.md            # Complete 12-key adapter contract reference
└── ai-assistant-kit/              # Self-contained kit package source tree
    ├── index.ts                   # Master export entry point (UI Widget, Adapter Contract, Server Router)
    ├── package-deps.json          # Curated open-source dependencies & exact versions
    ├── .env.example               # Environment variable templates (zero secrets)
    ├── README.md                  # Kit technical documentation
    ├── FEATURES.md                # F01-F20 feature matrix & acceptance criteria
    ├── INTEGRATION_CHECKLIST.md   # Step-by-step checklist
    ├── CHANGELOG.md               # Version 1.0.0 release notes
    ├── adapter/                   # 12-key configuration layer (app-specific)
    │   ├── contract.ts            # Type definitions for the 12-key contract
    │   ├── app.config.ts          # Reference working configuration
    │   ├── app.config.TEMPLATE.ts # Blank starter template for new apps
    │   ├── entities/              # Entity resolvers (query, search, get, scope)
    │   ├── pages/                 # Route configs with contextual prompt chips
    │   ├── guide-flows/           # Step-by-step interactive walkthrough workflows
    │   ├── tools/                 # Safe action tools (with confirmation modal)
    │   ├── export-definitions/    # Custom document export schemas
    │   └── import-templates/      # Excel/CSV import validation schemas
    ├── assets/                    # Static assets
    │   ├── 3d/                    # 3D Avatar GLTF model, kinematics & config
    │   ├── fonts/                 # Unicode Noto Sans font for Malayalam/Indic PDF export
    │   └── icons/                 # Assistant branding and UI icons
    ├── core/                      # Core engine (100% app-independent, zero domain words)
    │   ├── ui/                    # Gemini-style chat panel, right-click menu, composer, export card
    │   ├── engine/                # Conversation state & last-dataset memory
    │   ├── providers/             # Sequential router (OpenRouter -> Gemini -> Groq) + circuit breaker
    │   ├── import-export/         # SheetJS, PapaParse, jsPDF (Unicode font), docx
    │   ├── guide/                 # On-screen 3D avatar controller, voice TTS, DOM anchor resolver
    │   ├── credits/               # Organization credit meter, atomic balance decrement
    │   ├── payments/              # Razorpay order creator & HMAC-SHA256 signature verifier
    │   ├── security/              # Server-side role scope enforcer & prompt injection guards
    │   ├── attachments/           # Multi-modal file parser & vision dispatcher
    │   ├── history/               # Per-user isolated chat persistence
    │   ├── usage/                 # Token metering & security audit logs
    │   ├── i18n/                  # Bilingual localization (English & Malayalam)
    │   └── theme/                 # CSS theme tokens & dark/light auto-switching
    ├── db/                        # Database migrations (PostgreSQL / Supabase)
    │   ├── schema/tables.sql      # Tables: credits, subscriptions, threads, audit_logs
    │   └── rules/security_policies.sql # Row Level Security (RLS) policies
    ├── server/                    # Backend server mounting kit
    │   ├── router.ts              # Drop-in Express / Node.js router
    │   └── session.ts             # Cryptographic JWT session extractor
    └── tests/                     # Automated test suites (Node.js native test runner)
        ├── role-matrix/           # RBAC isolation verification
        ├── provider-fallback/     # Fallback sequence & circuit breaker tests
        ├── import-export/         # XLSX, CSV, PDF, DOCX generation tests
        ├── guide/                 # 3D avatar kinematics & privacy eye closure tests
        └── credits-payments/      # Credit decrement & Razorpay HMAC tests
```

---

## 🚀 Quickstart: Connect the Assistant to Any Web App in 3 Steps

### Step 1: Add the Kit & Install Dependencies

You can either copy the `ai-assistant-kit/` directory or download and extract `ai-assistant-kit.zip` into your web application root:

```bash
# In your host web application root:
unzip ai-assistant-kit.zip -d ./ai-assistant-kit
```

Install the free open-source dependencies specified in `ai-assistant-kit/package-deps.json`:

```bash
npm install three @react-three/fiber @react-three/drei lucide-react papaparse xlsx jspdf jspdf-autotable docx @supabase/supabase-js razorpay
npm install -D @types/three @types/papaparse
```

Run database migrations in your PostgreSQL or Supabase SQL editor:
```bash
# Execute the SQL script in your database:
ai-assistant-kit/db/schema/tables.sql
```

---

### Step 2: Configure the 12-Key Adapter (`app.config.ts`)

Copy `ai-assistant-kit/adapter/app.config.TEMPLATE.ts` to `assistant.config.ts` in your app. Fill out the 12 keys describing your app's domain:

```typescript
import { defineAssistantConfig } from './ai-assistant-kit/adapter/contract';

export const appConfig = defineAssistantConfig({
  // 1. App Identity & Theme
  app: {
    id: 'my-web-app',
    name: 'Acme SaaS Portal',
    logo: '/logo.svg',
    languages: ['en', 'ml'],
    defaultLocale: 'en',
    theme: {
      primaryColor: '#6366f1',
      panelBg: '#0f172a',
      borderRadius: '16px',
    },
  },

  // 2. Auth Session Resolver (Server-Side)
  auth: {
    userIdField: 'user_id',
    orgIdField: 'org_id',
    roleField: 'role',
  },

  // 3. Role Hierarchy (Top to Bottom)
  roles: [
    { id: 'SUPERADMIN', name: 'Super Admin', rank: 100 },
    { id: 'ADMIN', name: 'Admin (Org Owner)', rank: 80 },
    { id: 'MANAGER', name: 'Manager', rank: 50 },
    { id: 'USER', name: 'Standard User', rank: 10 },
  ],

  // 4. Entities & Database Access (Default Deny Scoping)
  entities: [
    {
      id: 'invoices',
      label: 'Invoices',
      fields: ['id', 'invoice_number', 'amount', 'status', 'created_at'],
      displayFields: ['invoice_number', 'amount', 'status'],
      searchableFields: ['invoice_number'],
      // Strict server-side scope predicate:
      scopePredicates: {
        USER: (session) => ({ user_id: session.userId }),
        MANAGER: (session) => ({ org_id: session.orgId }),
        ADMIN: (session) => ({ org_id: session.orgId }),
        SUPERADMIN: () => ({}),
      },
      query: async (filters, session) => {
        // Query your real database (PostgreSQL, Supabase, Prisma, Drizzle, etc.)
        return await db.invoices.findMany({ where: { ...filters, org_id: session.orgId } });
      },
      get: async (id, session) => {
        return await db.invoices.findUnique({ where: { id } });
      },
      search: async (term, session) => {
        return await db.invoices.findMany({ where: { invoice_number: { contains: term } } });
      },
    },
  ],

  // 5. Pages & Contextual Suggestion Chips (Exactly 3 per page/role)
  pages: [
    {
      route: '/invoices',
      title: 'Invoices Dashboard',
      chips: {
        USER: ['Show my pending invoices', 'Export my payments as PDF', 'Guide me to pay invoice'],
        ADMIN: ['Give the list of unpaid invoices', 'Download overdue report as Excel', 'Guide me to create invoice'],
      },
    },
  ],

  // 6. Interactive 3D Avatar Walkthrough Flows
  guideFlows: [
    {
      id: 'create-invoice-guide',
      title: 'Guide: Create New Invoice',
      steps: [
        { target: '[data-guide-id="new-invoice-btn"]', message: 'Click this button to open the invoice dialog.' },
        { target: '[data-guide-id="invoice-amount"]', message: 'Enter the billing amount here.' },
        { target: '[data-guide-id="submit-invoice"]', message: 'Click submit to finalize the invoice.' },
      ],
    },
  ],

  // 7. Safe Agent Tools (Read vs Write with Confirmation Preview)
  tools: [
    {
      id: 'cancel_invoice',
      name: 'Cancel Invoice',
      description: 'Cancels an existing invoice. Requires confirmation.',
      requiresConfirmation: true, // Prompts user with interactive preview card
      handler: async (args, session) => {
        return await db.invoices.update({ where: { id: args.id }, data: { status: 'CANCELLED' } });
      },
    },
  ],

  // 8. Import Templates (Excel / CSV)
  importTemplates: [
    {
      id: 'invoices-import',
      name: 'Bulk Invoices Import',
      requiredColumns: ['invoice_number', 'amount', 'customer_email'],
      validateRow: (row) => (row.amount > 0 ? null : 'Amount must be greater than 0'),
      commitImport: async (rows, session) => {
        return await db.invoices.createMany({ data: rows });
      },
    },
  ],

  // 9. Export Definitions
  exportDefinitions: [
    {
      id: 'invoices-export',
      name: 'Invoices Ledger',
      formats: ['xlsx', 'csv', 'pdf', 'docx'],
    },
  ],

  // 10. Organization Credits & Quota
  credits: {
    freeMonthlyAllowance: 100, // 100 free requests per month
    costPerMessage: 1,
    costPerExport: 2,
    ownerRole: 'ADMIN',
  },

  // 11. Razorpay Upgrade Plans (Test Mode Supported)
  plans: {
    monthly: { id: 'plan_monthly', name: 'Pro Monthly', amount: 999, currency: 'INR' },
    annual: { id: 'plan_annual', name: 'Pro Annual', amount: 9999, currency: 'INR' },
  },

  // 12. AI Provider Priority Chain
  providers: {
    priority: ['openrouter', 'gemini', 'groq'],
    timeoutMs: 45000,
  },
});
```

---

### Step 3: Mount Backend & Embed Frontend

#### A. Backend (Express / Node.js)
In your Express backend server:

```typescript
import express from 'express';
import { mountAssistantRouter } from './ai-assistant-kit/server/router';
import { appConfig } from './assistant.config';

const app = express();
app.use(express.json());

// Mount the Assistant API endpoints at /api/assistant
mountAssistantRouter(app, '/api/assistant', appConfig);

app.listen(5000, () => console.log('Server running on port 5000'));
```

*(Next.js App Router and Pages Router handlers are also supported—see the Server Mounting section below).*

#### B. Frontend (React / Vite / Next.js)
In your main layout or root component:

```tsx
import React from 'react';
import { AssistantWidget } from './ai-assistant-kit';
import { appConfig } from './assistant.config';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Your web application */}
      <main>{children}</main>

      {/* Embed the AI Assistant (Chat side panel, Right-click context menu, 3D Avatar launcher) */}
      <AssistantWidget 
        config={appConfig}
        apiEndpoint="/api/assistant"
        session={{
          userId: 'usr_123',
          orgId: 'org_abc',
          role: 'ADMIN',
          displayName: 'John Doe',
        }}
      />
    </div>
  );
}
```

---

## 🎯 What to Do to Enable Every Feature (F01 – F20)

Below is the complete reference guide on how each feature is structured and what you need to do in your app to take full advantage of it.

---

### F01: Context-Aware Chat Side Panel & Right-Click Context Menu
- **What it does**: Provides a floating, minimalist Gemini-style docked drawer (desktop) or bottom sheet (mobile). Opened via right-click ("Ask AI Assistant") on any element or by clicking the 3D avatar launcher.
- **What to do**:
  1. Add `<AssistantWidget config={appConfig} />` to your root layout.
  2. The kit automatically attaches a global right-click event listener. Right-clicking any element captures the DOM context (text, tag, input value) and opens the drawer with context pre-populated.
  3. Custom styling: Set `app.theme` in `app.config.ts` (colors, border radii, fonts) to match your brand without editing core code.

---

### F02: Role Hierarchy & Strict Server-Side Data Scoping
- **What it does**: Enforces a strict **Default-Deny** security model. Roles and organizational scopes are derived exclusively from cryptographic JWT sessions on the server. The assistant never trusts the role claimed in the client's request.
- **What to do**:
  1. Define your app's roles in `app.config.ts` under `roles: [...]`.
  2. For every entity in `entities: [...]`, specify `scopePredicates`:
     ```typescript
     scopePredicates: {
       STUDENT: (session) => ({ student_id: session.userId }),
       MANAGER: (session) => ({ department_id: session.deptId }),
       ADMIN: (session) => ({ organization_id: session.orgId }),
     }
     ```
  3. Any attempt by a lower role to access forbidden data produces a polite refusal without disclosing whether the record even exists.

---

### F03: Private Per-User Chat History & Personalization
- **What it does**: Isolates conversation threads per user. Platform Super Admins only see anonymized aggregate metrics. The assistant greets users by name and tailors examples to their rank.
- **What to do**:
  1. Run the database migration `ai-assistant-kit/db/schema/tables.sql` to create `assistant_threads` and `assistant_messages`.
  2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or standard PostgreSQL connection) in your server `.env`.
  3. Thread history automatically loads on open and isolates by `user_id` and `organization_id`.

---

### F04: Universal Data Retrieval (A to Z)
- **What it does**: Answers arbitrary data questions ("Show overdue accounts", "What was our Q3 revenue?"). Retrieves live data via typed entity resolvers and returns only the relevant columns in clean tables with pagination.
- **What to do**:
  1. In `app.config.ts`, implement the `query` method for each entity:
     ```typescript
     query: async (filters, session) => {
       return await db.orders.findMany({ where: { ...filters, org_id: session.orgId } });
     }
     ```
  2. The assistant parses user intent, executes the query through the server-side scope enforcer, and renders formatted tables.

---

### F05: Live Entity Identification ("Who is X?")
- **What it does**: Enables questions like "Who is Dr. Aisha?" or "What is Order #4829?". Performs fuzzy live lookups across all registered entities and outputs a structured summary.
- **What to do**:
  1. Provide `searchableFields: ['name', 'email', 'sku']` on your entity config.
  2. Provide the `search` and `get` functions in `app.config.ts`.
  3. The assistant identifies the entity type dynamically and returns permitted fields without ever hallucinating credentials or dummy records.

---

### F06: App-Scoped Answers & Agent Actions (Tool-Calling Engine)
- **What it does**: Keeps the assistant focused strictly on your application domain. Read-only queries execute instantly; state-changing actions (creating, updating, deleting) trigger an interactive **Confirmation Preview Card** in the chat before execution.
- **What to do**:
  1. Configure `tools: [...]` in `app.config.ts`.
  2. Set `requiresConfirmation: true` for sensitive or destructive actions:
     ```typescript
     {
       id: 'refund_payment',
       name: 'Refund Payment',
       requiresConfirmation: true,
       handler: async ({ paymentId, reason }, session) => {
         return await paymentGateway.refund(paymentId);
       }
     }
     ```
  3. The user must click **Confirm** in the UI card before the backend executes the write operation.

---

### F07: Spreadsheet Import Agent (Excel & CSV)
- **What it does**: Ingests `.xlsx`, `.xls`, and `.csv` files uploaded in the chat. Detects column headers automatically, maps fields to entity schemas, validates records, and renders a two-stage preview modal with valid/invalid counts before importing.
- **What to do**:
  1. Define an `importTemplates: [...]` entry in `app.config.ts` specifying `requiredColumns` and `validateRow`.
  2. When a user drags a spreadsheet into the chat and says "Import these users", the kit parses the file with SheetJS/PapaParse, validates each row, displays the review modal, and calls your `commitImport` handler upon user confirmation.

---

### F08: Universal Data Exporter (XLSX, CSV, PDF, DOCX)
- **What it does**: Allows the user to ask "Export this table as Excel" or "Download as PDF". Generates files directly from memory without triggering host app DOM buttons.
- **What to do**:
  1. Define `exportDefinitions: [...]` in `app.config.ts`.
  2. The kit's conversation engine remembers the last queried dataset. When the user requests an export, `core/import-export/exporters.ts` generates:
     - **CSV**: Includes UTF-8 BOM so Excel opens non-English characters properly.
     - **Excel**: Multi-sheet workbook styled with SheetJS.
     - **PDF**: Generated via jsPDF with embedded Unicode Noto Sans fonts (supporting Malayalam, Arabic, and Indic scripts).
     - **Word**: Formatted `.docx` document.

---

### F09: Smart Contextual Prompt Chips
- **What it does**: Displays exactly 3 dynamic suggestion chips above the chat composer tailored to the user's role and current URL route.
- **What to do**:
  1. Add page configurations in `app.config.ts`:
     ```typescript
     pages: [
       {
         route: '/billing',
         chips: {
           USER: ['View my recent invoices', 'Download tax receipt', 'Guide me to update card'],
           ADMIN: ['Show overdue balances', 'Export billing ledger', 'Upgrade subscription plan'],
         },
       },
     ]
     ```
  2. As the user navigates between routes, the chips update instantly.

---

### F10: On-Screen Interactive 3D Avatar Guide Engine
- **What it does**: A Three.js 3D avatar that speaks and navigates users through multi-step workflows. Chat closes, and the avatar physically floats over the real UI elements step-by-step.
- **What to do**:
  1. Tag key DOM elements in your web application with `data-guide-id`:
     ```html
     <button data-guide-id="submit-payment-btn">Pay Now</button>
     ```
  2. Define walkthrough flows in `app.config.ts` under `guideFlows: [...]`.
  3. When the user asks "How do I pay?", the avatar flies to the element, highlights it with an animated pointer, speaks the instructions via SpeechSynthesis, and automatically closes its 3D eyes when password fields are focused for privacy.

---

### F11: Multi-Modal File Ingestion & Visual UI Diagnosis
- **What it does**: Accepts images, screenshots, PDFs, and documents via drag-and-drop or file picker. When an image is attached, the kit automatically routes to a vision model (e.g. Gemini 2.5 Flash) to diagnose error screenshots or inspect documents.
- **What to do**:
  1. Set `GEMINI_API_KEY` in your `.env`.
  2. Users can screenshot an error on your web app, paste it into the assistant (`Ctrl+V`), and ask "What went wrong?". The assistant analyzes the visual screenshot and offers corrective actions.

---

### F12: Organization Credit System & Quotas
- **What it does**: Credits belong to the organization and are managed by the Admin. Each organization starts with 100 free requests per month, which resets on the 1st of each month.
- **What to do**:
  1. Include `credits` configuration in `app.config.ts`:
     ```typescript
     credits: {
       freeMonthlyAllowance: 100,
       ownerRole: 'ADMIN',
     }
     ```
  2. The kit's server middleware calls `checkAndConsume()` atomically in PostgreSQL. When credits run out, non-admin users receive a polite notification, and the Admin is prompted to upgrade.

---

### F13: In-App Upgrade Page & Razorpay (Test Mode)
- **What it does**: Provides a built-in plan modal with Monthly and Annual cards. Generates Razorpay orders server-side, opens the Razorpay checkout modal, and verifies the payment signature using HMAC-SHA256 before upgrading the org to Premium.
- **What to do**:
  1. Set environment variables in your server `.env`:
     ```env
     RAZORPAY_KEY_ID=rzp_test_YourKeyId
     RAZORPAY_KEY_SECRET=YourSecretKey
     RAZORPAY_TEST_MODE=true
     ```
  2. Configure plan pricing in `app.config.ts` under `plans: { ... }`.
  3. Test payments verify idempotently and activate Premium status immediately.

---

### F14: Multi-Provider Sequential AI Router & Circuit Breaker
- **What it does**: Eliminates downtime with automated sequential failover:
  1. **Primary**: OpenRouter (Claude 3.5 Sonnet / Haiku / GPT-4o-mini)
  2. **Secondary**: Google Gemini (Gemini 2.5 Flash with Vision)
  3. **Tertiary**: Groq (Llama 3.3 70B ultra-low latency)
  If a provider returns 429, 500, or times out, the circuit breaker opens for 60 seconds and instantly falls back to the next provider.
- **What to do**:
  1. Set the respective API keys in your server `.env`:
     ```env
     OPENROUTER_API_KEY=sk-or-v1-...
     GEMINI_API_KEY=AIzaSy...
     GROQ_API_KEY=gsk_...
     ```
  2. The router streams response tokens using standard Server-Sent Events (SSE).

---

### F15: Performance Optimization & 3D Visual Integrity
- **What it does**: Ensures zero layout shifts and buttery-smooth 60fps performance on both desktop and mobile. 3D canvas is lazy-loaded, message lists are virtualized, and file parsing happens in web workers off the main thread.
- **What to do**:
  - Built into the kit! The Three.js kinematics engine (`core/ui/components/avatarKinematics.ts`) runs on `requestAnimationFrame` with studio lighting and preserves all 3D mesh details.

---

### F16: Open-Source-First Rule
- **What it does**: Guarantees zero proprietary paywalls or hidden vendor locks. Built strictly on proven open-source libraries (Three.js, SheetJS, PapaParse, jsPDF, docx, Supabase).
- **What to do**:
  - Review `ai-assistant-kit/package-deps.json`. All dependencies use permissive MIT, Apache-2.0, or ISC licenses.

---

### F17: Multilingual Language Switch (English & Malayalam)
- **What it does**: Default language is English with one-click switching to Malayalam. Translates UI labels, prompt chips, assistant text, and voice narration.
- **What to do**:
  1. Add supported languages in `app.config.ts`: `languages: ['en', 'ml']`.
  2. Custom strings can be extended in `ai-assistant-kit/core/i18n/locales/`.

---

### F18: Usage Metering & Security Audit Log
- **What it does**: Tracks every prompt, token count, provider used, and latency in the `ai_usage_logs` table. Every state-changing tool call is recorded in `ai_billing_audit_logs`.
- **What to do**:
  - The server middleware automatically persists audit entries. Super Admins can query aggregate usage via the built-in route `/api/assistant/admin/usage`.

---

### F19: Quality Assurance & Automated Testing
- **What it does**: Verifies the entire kit using 5 automated test suites:
  - Role-matrix RBAC isolation
  - Multi-provider fallback and circuit breaker
  - Excel, CSV, PDF, and DOCX generation
  - 3D avatar gaze and eye-closing kinematics
  - Credit decrement and Razorpay signature verification
- **What to do**:
  Run tests anytime using Node's native test runner:
  ```bash
  node --test ai-assistant-kit/tests/role-matrix/roleMatrix.test.ts ai-assistant-kit/tests/provider-fallback/fallback.test.ts ai-assistant-kit/tests/import-export/importExport.test.ts ai-assistant-kit/tests/guide/guideKinematics.test.ts ai-assistant-kit/tests/credits-payments/creditsPayments.test.ts
  ```

---

### F20: Production Deployment & Zero-Config Cloud Readiness
- **What it does**: Ready to deploy out-of-the-box on Vercel, Railway, AWS, or Docker containers. No hardcoded localhost URLs.
- **What to do**:
  1. Supply all environment variables in your hosting provider's dashboard.
  2. Run `npm run build` to verify clean compilation.

---

## 🔐 Environment Variables Reference

Create a `.env` file in your server root based on `ai-assistant-kit/.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_here

# AI Provider API Keys (Server-Side Only - Never Exposed to Client)
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxx
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx

# Database / Supabase Persistence
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh...

# Razorpay Payment Gateway (Test Mode Supported)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxx
RAZORPAY_TEST_MODE=true
```

---

## 🛠️ Framework-Specific Integration Recipes

### Next.js (App Router)
Create `app/api/assistant/[...route]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { handleAssistantRequest } from '@/ai-assistant-kit/server/router';
import { appConfig } from '@/assistant.config';

export async function POST(req: NextRequest) {
  return handleAssistantRequest(req, appConfig);
}

export async function GET(req: NextRequest) {
  return handleAssistantRequest(req, appConfig);
}
```

### Next.js (Pages Router)
Create `pages/api/assistant/[...route].ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { createAssistantNodeHandler } from '@/ai-assistant-kit/server/router';
import { appConfig } from '@/assistant.config';

export const config = { api: { bodyParser: false } };
export default createAssistantNodeHandler(appConfig);
```

### Pure HTML / Web Component
If your web application is built with vanilla HTML/JS, PHP, Django, or Rails:

```html
<!-- Load the bundled widget script -->
<script src="/ai-assistant-kit/dist/assistant.js"></script>

<!-- Add the web component anywhere in your page -->
<app-assistant
  api-url="/api/assistant"
  user-id="usr_123"
  org-id="org_abc"
  role="ADMIN"
  user-name="Alex Smith">
</app-assistant>
```

---

## 🧪 Verification Checklist

Run through this quick sanity check to ensure full integration:
- [x] Right-click anywhere opens "Ask AI Assistant" drawer.
- [x] Assistant greets user with role-appropriate prompt chips.
- [x] Ask "Who is <name>" returns live entity record.
- [x] Ask "Show unpaid records" returns filtered table.
- [x] Click "Export as PDF" generates downloadable PDF with Unicode fonts.
- [x] Upload Excel spreadsheet displays import preview modal.
- [x] Click "Guide me" launches 3D avatar on-screen walkthrough.
- [x] Avatar closes eyes when clicking into a password field.
- [x] Simulated API timeout falls back seamlessly to Gemini / Groq.
- [x] Admin can open upgrade modal and complete test Razorpay checkout.

---

## 📄 License

The AI Assistant Kit is licensed under the permissive [MIT License](LICENSE).
Feel free to embed and use it across commercial and open-source applications.
