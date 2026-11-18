# AI Assistant Kit — Master Integration & Architecture Guide

Welcome to the **AI Assistant Kit** — a self-contained, enterprise-grade, multi-tenant AI assistant framework with an interactive Three.js 3D avatar guide, strict server-side role scoping, multi-provider fallback resilience, spreadsheet ingestion/export, and Razorpay payment gating.

This guide provides everything needed to integrate the kit into any modern web application without touching the kit's core engine code.

---

## 1. Overview and Architecture

The AI Assistant Kit separates application concerns into two distinct layers:
1. **Core (App-Independent)**: Contains the chat side panel UI, 3D avatar renderer and kinematics, sequential multi-provider router, tool execution engine, streaming SSE transport, credit meter, payment verifier, and document parsers/exporters.
2. **Adapter (App-Specific)**: A single declarative configuration defining your application's entities, role access predicates, page routes, prompt chips, interactive walkthrough flows, and branding tokens.

```
+-----------------------------------------------------------------------------------------+
|                                    HOST APPLICATION                                     |
|  (User clicks 'Ask AI Assistant' in right-click context menu, or taps 3D avatar launcher) |
+--------------------------------------------+--------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                AI ASSISTANT KIT — CORE UI                               |
|  - Gemini-style floating panel (desktop dock / mobile bottom sheet)                      |
|  - Three.js 3D avatar with warm studio 3-point lighting and gaze tracking               |
|  - Real-time token streaming with Markdown, tables, code blocks, and suggestion chips   |
|  - Multi-format export card (CSV with BOM, XLSX, Word DOCX, and PDF with Unicode font)  |
+--------------------------------------------+--------------------------------------------+
                                             |  (SSE Stream: POST /api/assistant/chat)
                                             v
+-----------------------------------------------------------------------------------------+
|                              AI ASSISTANT KIT — SERVER KIT                              |
|  +-----------------------------------------------------------------------------------+  |
|  | Middleware: Session Extractor -> Auth JWT Check -> Role Scope -> Credit Meter    |  |
|  +-----------------------------------------------------------------------------------+  |
|                                            |                                            |
|                                            v                                            |
|  +-----------------------------------------------------------------------------------+  |
|  | Multi-Provider Sequential Fallback Router:                                        |  |
|  | Primary: OpenRouter  ====(on fail/429/timeout)===> Secondary: Google Gemini (Vision)|
|  |                      ====(on fail/429/timeout)===> Tertiary: Groq (High-Speed)    |  |
|  +-----------------------------------------------------------------------------------+  |
|                                            |                                            |
|                                            v                                            |
|  +-----------------------------------------------------------------------------------+  |
|  | Tool Execution & Scoped Query Engine (Default Deny):                              |  |
|  | - Read queries execute within session's verified scope predicate                 |  |
|  | - Destructive/Write actions require interactive confirmation card with preview    |  |
|  +-----------------------------------------------------------------------------------+  |
+--------------------------------------------+--------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                              APP ADAPTER CONTRACT (12 KEYS)                             |
|  App Identity | Roles & Hierarchy | Entity Handlers | Guide Flows | Import/Export Rules |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Feature List A to Z (F01–F20)

### F01. Chat Side Panel Opened by Right-Click
- **What**: Docked side panel (desktop) or draggable bottom sheet (mobile). Opened from right-click context menu ("Ask AI Assistant") or bottom-right 3D avatar.
- **Behavior Rules**: Minimalist Gemini style; themed via adapter design tokens; Esc closes, Enter sends, Shift+Enter newlines; lazy-loaded.
- **Kit Paths**: `core/ui/Panel.tsx`, `core/ui/ContextMenu.tsx`, `core/ui/Composer.tsx`, `core/theme/tokens.ts`
- **Adapter Fields**: `app.theme`, `app.name`, `app.logo`
- **Env Vars**: None.
- **How to Test**: Right-click any page element; confirm assistant opens with captured text badge; press Esc to close; verify mobile bottom sheet at width <= 640px.

### F02. Role Hierarchy with Strict Server-Side Data Scoping
- **What**: Role hierarchy enforcing server-side scoping (Default Deny). Users only ever see data permitted by their verified session role.
- **Behavior Rules**: Roles derived from cryptographically signed session tokens; client body role tampering rejected; polite refusals without leaking data existence.
- **Kit Paths**: `core/security/scopeEnforcer.ts`, `core/security/sessionResolver.ts`, `server/middleware/auth.ts`
- **Adapter Fields**: `auth`, `roles[]`, `entities[].scopePredicates`
- **Env Vars**: `JWT_SECRET`
- **How to Test**: Run role-matrix test: student querying another student's balance returns polite refusal; manager querying other sector data returns refusal.

### F03. Private Per-User Chat History and Personalization
- **What**: Completely partitioned conversation threads per user ID.
- **Behavior Rules**: Users cannot see or request another user's conversations; Super Admin sees aggregate usage counts only; assistant greets user by name.
- **Kit Paths**: `core/history/historyStore.ts`, `core/history/historyApi.ts`, `server/routes/history.ts`, `db/schema/tables.sql`
- **Adapter Fields**: `auth.userIdField`, `app.personalizationExamples`
- **Env Vars**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- **How to Test**: Create chats under User A and User B; verify API rejects User A attempting to fetch User B's thread ID with 403 Forbidden.

### F04. Universal Data Retrieval (A to Z)
- **What**: Assistant retrieves any entity data permitted by user role via typed tools.
- **Behavior Rules**: Shows ONLY requested columns; sensible table sorting and pagination; multiple matches trigger disambiguation.
- **Kit Paths**: `core/tools/builtin/queryTool.ts`, `core/engine/datasetState.ts`, `core/tools/registry.ts`
- **Adapter Fields**: `entities[].fields`, `entities[].displayFields`, `entities[].query`
- **Env Vars**: None.
- **How to Test**: Ask for records with negative balance; confirm returned table contains only negative balance records and relevant dues columns.

### F05. Entity Identification ("Who is X?")
- **What**: Live search across all entities matching names, IDs, or partial strings.
- **Behavior Rules**: Never falls back to generic app overview or demo credentials; returns identity, role/type, and permitted details.
- **Kit Paths**: `core/tools/builtin/searchTool.ts`, `core/tools/registry.ts`
- **Adapter Fields**: `entities[].searchableFields`, `entities[].search`, `entities[].get`
- **Env Vars**: None.
- **How to Test**: Ask "who is <name>"; verifies live entity match; ask for nonexistent entity; returns "Not found" without reciting application features.

### F06. App-Scoped Answers and Agent Actions
- **What**: Tool calling engine for read and write agent actions with scope protection.
- **Behavior Rules**: Off-topic queries politely redirected; read tools execute directly; write tools require confirmation preview.
- **Kit Paths**: `core/tools/registry.ts`, `core/tools/confirmationFlow.ts`, `core/security/scopeGuard.ts`
- **Adapter Fields**: `tools[]`, `scopeGuard`
- **Env Vars**: None.
- **How to Test**: Ask general trivia; verify polite app-topic redirect; trigger record deletion tool; verify confirmation card with preview appears before execution.

### F07. Import Through the Assistant
- **What**: Uploads Excel (.xlsx, .xls) or CSV spreadsheet and imports records.
- **Behavior Rules**: Header detection, field mapping, duplicate detection, and two-stage preview modal before executing.
- **Kit Paths**: `core/import-export/parsers.ts`, `core/import-export/validators.ts`, `core/ui/ImportPreview.tsx`
- **Adapter Fields**: `importTemplates[]`
- **Env Vars**: None.
- **How to Test**: Upload spreadsheet file; verify preview modal displays valid row count, invalid row count, and field mappings; confirm import executes.

### F08. Export Through the Assistant
- **What**: Generates CSV, Excel (.xlsx), PDF, and Word (.docx) files directly in chat.
- **Behavior Rules**: Conversation-scoped dataset memory enables "export the last answer"; embeds Unicode Noto Sans font for Malayalam PDF support.
- **Kit Paths**: `core/import-export/exporters.ts`, `core/engine/datasetState.ts`, `core/ui/ExportCard.tsx`, `assets/fonts/`
- **Adapter Fields**: `exportDefinitions[]`
- **Env Vars**: None.
- **How to Test**: Request filtered report; prompt "export this as PDF"; download generated file; verify Malayalam characters render cleanly without garbage glyphs.

### F09. Attachments and Screenshot Diagnosis
- **What**: Attaches images, PDFs, Excel, and CSV files via drag-and-drop, file picker, or clipboard paste.
- **Behavior Rules**: Preview thumbnail/chip in composer; vision model routes screenshot errors and provides diagnostic remediation.
- **Kit Paths**: `core/attachments/intake.ts`, `core/attachments/preview.ts`, `core/attachments/readers.ts`, `core/providers/visionRouting.ts`
- **Adapter Fields**: None.
- **Env Vars**: `MAX_FILE_SIZE_BYTES`
- **How to Test**: Paste screenshot of an error into composer; verify image chip appears; send message; assistant analyzes screenshot and suggests remediation.

### F10. Role- and Page-Aware Suggestion Chips
- **What**: Exactly THREE contextually relevant suggestion chips displayed above composer.
- **Behavior Rules**: Chip 1 = personalized next action; Chip 2 = current page action; Chip 3 = global site example. Refreshes on route change; computed cheaply without LLM calls.
- **Kit Paths**: `core/ui/SuggestionChips.tsx`, `server/routes/chips.ts`
- **Adapter Fields**: `pages[].chips`, `roles[].id`
- **Env Vars**: None.
- **How to Test**: Navigate across routes; verify exactly 3 chips render and update to reflect current page capabilities.

### F11. Guide Mode with 3D Avatar
- **What**: Procedural Three.js 3D mascot walks across real screens and guides users step-by-step.
- **Behavior Rules**: Highlights target element with spotlight ring; speaks instructions via Web Speech Synthesis (EN/ML); closes eyes on password fields.
- **Kit Paths**: `core/guide/guideEngine.ts`, `core/guide/avatarController.ts`, `core/guide/highlighter.ts`, `core/guide/voiceNarration.ts`, `assets/3d/`
- **Adapter Fields**: `guideFlows[]`, `pages[].guideAnchorIds`
- **Env Vars**: None.
- **How to Test**: Say "guide me to register"; verify chat closes, 3D mascot walks to inputs, speaks step prompt, and closes eyes when user focuses password field.

### F12. Credit System and Plans
- **What**: Admin-owned monthly credit balance (100 free credits/month).
- **Behavior Rules**: Free plan restricts assistant usage to Admin; non-admin roles blocked with upgrade prompt until Premium; atomic server-side deduction.
- **Kit Paths**: `core/credits/creditMeter.ts`, `core/credits/atomicDecrement.ts`, `core/credits/monthlyReset.ts`, `server/middleware/creditCheck.ts`
- **Adapter Fields**: `credits`
- **Env Vars**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- **How to Test**: Exhaust 100 credits; verify subsequent messages return 402 Payment Required with upgrade button; test monthly reset.

### F13. Upgrade Page and Razorpay (Test Mode)
- **What**: In-app subscription view with monthly/annual plans and Razorpay checkout.
- **Behavior Rules**: Server creates order; Razorpay Checkout modal opens; server verifies HMAC SHA256 signature and activates Premium idempotently.
- **Kit Paths**: `core/payments/razorpayOrder.ts`, `core/payments/signatureVerifier.ts`, `core/payments/premiumActivation.ts`, `core/ui/UpgradePage.tsx`
- **Adapter Fields**: `plans`
- **Env Vars**: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_TEST_MODE`
- **How to Test**: Complete checkout with Razorpay test card; verify payment signature verifies on server and organization activates Premium immediately.

### F14. Multi-Provider AI Router
- **What**: Sequential resilient router: OpenRouter -> Gemini -> Groq.
- **Behavior Rules**: Cascades to next provider ONLY on error/timeout; 3-strike circuit breaker (60s cooldown); streaming token delivery.
- **Kit Paths**: `core/providers/router.ts`, `core/providers/openrouter.ts`, `core/providers/gemini.ts`, `core/providers/groq.ts`, `core/providers/circuitBreaker.ts`
- **Adapter Fields**: `providers`
- **Env Vars**: `OPENROUTER_API_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`
- **How to Test**: Invalidate OpenRouter API key; verify request automatically succeeds via Gemini fallback.

### F15. Performance and 3D Integrity
- **What**: Fast, lightweight experience without degrading 3D mascot visual fidelity.
- **Behavior Rules**: Code-split widget; virtualized lists; debounced input; Three.js 29-mesh character with 3-point warm lighting remains 100% intact.
- **Kit Paths**: `core/ui/Panel.tsx`, `assets/3d/avatarModel.ts`, `assets/3d/avatarKinematics.ts`
- **Adapter Fields**: `app.theme`
- **Env Vars**: None.
- **How to Test**: Run bundle analyzer; verify assistant chunk loads asynchronously; confirm 3D avatar animations and triangle count are unchanged.

### F16. Open-Source-First Rule
- **What**: Built strictly with free, permissively licensed open-source libraries.
- **Behavior Rules**: Zero proprietary paywalled dependencies; seamless npm/bun install.
- **Kit Paths**: `package-deps.json`, `core/import-export/`, `assets/3d/`
- **Adapter Fields**: None.
- **Env Vars**: None.
- **How to Test**: Inspect `package-deps.json`; verify all libraries carry MIT or Apache-2.0 licences.

### F17. Language (English Default, Malayalam Optional)
- **What**: Bilingual support across UI labels, chat responses, and guide voice narration.
- **Behavior Rules**: Responds in English or Malayalam based on user language or input; understands dictated Malayalam.
- **Kit Paths**: `core/i18n/index.ts`, `core/i18n/locales/en.ts`, `core/i18n/locales/ml.ts`, `core/guide/voiceNarration.ts`
- **Adapter Fields**: `app.languages`, `app.defaultLocale`
- **Env Vars**: None.
- **How to Test**: Select Malayalam in settings; verify assistant labels, suggestions, and responses render in Malayalam script.

### F18. Usage Metering and Audit Log
- **What**: Detailed usage metrics and immutable audit logging for administrative actions.
- **Behavior Rules**: Records timestamp, user ID, role, tool name, parameters, and result for all write, import, and export actions.
- **Kit Paths**: `core/usage/metering.ts`, `core/usage/auditLog.ts`, `server/routes/superAdmin.ts`, `db/schema/tables.sql`
- **Adapter Fields**: `roles[]`
- **Env Vars**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- **How to Test**: Trigger record creation; check `assistant_audit_logs` table; verify complete execution event is recorded.

### F19. Quality Assurance and Delivery
- **What**: Automated test matrix validating all roles across all routes and features.
- **Behavior Rules**: Multi-role automated test passes before distribution; zero regressions.
- **Kit Paths**: `tests/role-matrix/`, `tests/provider-fallback/`, `tests/import-export/`, `tests/guide/`, `tests/credits-payments/`
- **Adapter Fields**: `roles[]`
- **Env Vars**: None.
- **How to Test**: Run test suite (`npm test`); verify 100% tests pass.

### F20. Deployment Readiness
- **What**: Production-ready deployment for Vercel, Railway, or Docker containers.
- **Behavior Rules**: No localhost URLs; server routes shield all keys; builds cleanly with `npm run build`.
- **Kit Paths**: `server/index.ts`, `server/routes/`, `.env.example`, `vercel.json`
- **Adapter Fields**: `auth`, `app`
- **Env Vars**: All listed in `.env.example`.
- **How to Test**: Run production build; test deployed endpoint in Chrome.

---

## 3. Zip Layout and Extraction

Extracting `ai-assistant-kit.zip` produces exactly ONE root folder `ai-assistant-kit/`:

```
./ai-assistant-kit/
  README.md                     <- Master integration & architecture guide
  FEATURES.md                   <- Complete F01-F20 feature matrix
  INTEGRATION_CHECKLIST.md      <- Step-by-step checklist for new apps
  CHANGELOG.md                  <- Release notes & version history
  .env.example                  <- Commented environment variables template
  package-deps.json             <- Open-source dependencies and licences
  core/
    ui/                         <- Chat panel, context menu, composer, chips, avatar
    engine/                     <- Chat orchestrator, dataset memory, streaming
    providers/                  <- OpenRouter, Gemini, Groq router & circuit breaker
    tools/                      <- Tool registry, parameter schemas, confirmation flow
    security/                   <- Role scoping, session resolver, injection guards
    guide/                      <- Walkthrough engine, avatar controller, speech synth
    credits/                    <- Credit meter, monthly reset, atomic decrement
    payments/                   <- Razorpay test order creation, HMAC verification
    import-export/              <- XLSX/CSV parsers, Unicode PDF/Word exporters
    attachments/                <- File intake, preview thumbnails, OCR diagnostics
    history/                    <- Per-user chat history store and API
    usage/                      <- Metering and audit logging
    i18n/                       <- English default and Malayalam locale files
    theme/                      <- Design tokens and CSS variable injectors
  adapter/
    contract.ts                 <- Complete 12-key TypeScript contract
    app.config.ts               <- Fully worked reference app config (Khazna Ledger)
    app.config.TEMPLATE.ts      <- Empty starter template with comments for new apps
    entities/                   <- Reference entity definitions
    pages/                      <- Reference page configs & chips
    guide-flows/                <- Reference guide flows
    tools/                      <- Reference custom action tools
    export-definitions/         <- Reference export specifications
    import-templates/           <- Reference spreadsheet import templates
  server/
    index.ts                    <- Express router & runtime creator
    routes/                     <- Chat, history, credits, payments, upload endpoints
    middleware/                 <- Auth, role scoping, credit validation
  db/
    schema/                     <- SQL tables for conversations, credits, audit logs
    rules/                      <- PostgreSQL Row Level Security (RLS) policies
    migrations/                 <- Additive migration scripts
  assets/
    3d/                         <- Three.js avatar model & kinematics configuration
    icons/                      <- Web app favicon & apple touch icons
    fonts/                      <- Unicode Noto Sans Malayalam & Arabic fonts
  tests/
    role-matrix/                <- Multi-role cross-scope leakage tests
    provider-fallback/          <- OpenRouter -> Gemini -> Groq failover tests
    import-export/              <- Multi-format document generation tests
    guide/                      <- 3D avatar navigation & gaze tracking tests
    credits-payments/           <- Credit exhaustion & Razorpay HMAC tests
```

Place the extracted folder directly in your project root: `./ai-assistant-kit/`.

---

## 4. Install Steps

### 4.1 Install Dependencies
Inspect `ai-assistant-kit/package-deps.json` and install required packages:
```bash
npm install @google/genai openai express razorpay three xlsx papaparse jspdf jspdf-autotable docx pdfjs-dist zod pino @supabase/supabase-js lucide-react clsx tailwind-merge
```

### 4.2 Build Configuration Changes
In your `tsconfig.json`, add path mapping:
```json
{
  "compilerOptions": {
    "paths": {
      "@ai-assistant/kit/*": ["./ai-assistant-kit/*"]
    }
  }
}
```

In your `vite.config.ts` (if using Vite):
```ts
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@ai-assistant/kit': path.resolve(__dirname, './ai-assistant-kit')
    }
  }
});
```

### 4.3 Mount the Panel in Your Host App
In your root layout component (`App.tsx`):
```tsx
import { AssistantWidget, ContextMenuWrapper } from './ai-assistant-kit/core/ui/index.ts';
import { myAppAdapter } from './ai-assistant-kit/adapter/app.config.ts';

export function App() {
  return (
    <ContextMenuWrapper>
      {/* Your host app navigation and routes */}
      <main>...</main>
      
      {/* Floating 3D mascot launcher & docked chat panel */}
      <AssistantWidget adapter={myAppAdapter} />
    </ContextMenuWrapper>
  );
}
```

---

## 5. Adapter Guide

The Adapter Contract (`ai-assistant-kit/adapter/contract.ts`) is the **ONLY** file a new application must fill in.

### 5.1 Step-by-Step Way to Fill It
1. Copy `adapter/app.config.TEMPLATE.ts` to `adapter/app.config.ts`.
2. Define `app`: name, short description, theme tokens (primary, accent, background).
3. Define `auth`: session reader extracting user ID, role, and organization ID.
4. Define `roles`: list roles with permissions and levels.
5. Define `entities`: register your database entities with search, get, and query handlers.
6. Define `pages`: list routes, available actions, and 3 suggestion chips per page.
7. Define `guideFlows`: step-by-step interactive flows with `data-guide-id` selectors.
8. Define `tools`: custom action tools with parameter schemas and confirmation flags.
9. Define `credits` and `plans`: set free allowance (100 credits/mo) and Razorpay test prices.
10. Define `scopeGuard`: app topic description used to redirect off-topic questions.

### 5.2 Worked Example 1: Library Management App
```ts
export const libraryAdapter = defineAssistantAdapter({
  app: {
    id: 'city-library',
    name: 'City Library Catalog',
    shortDescription: 'Manage books, member checkouts, and shelf inventory.',
    logo: '/library-logo.svg',
    languages: ['en'],
    defaultLocale: 'en',
    theme: {
      mode: 'light',
      colors: { primary: '#1e3a8a', accent: '#3b82f6', background: '#f8fafc', text: '#0f172a' },
      radii: { sm: '4px', md: '8px', lg: '12px', full: '9999px' },
      fonts: { body: 'Inter, sans-serif' },
      launcher: { position: 'bottom-right', label: 'Ask Library Assistant' }
    }
  },
  roles: [
    { id: 'librarian', label: 'Librarian', level: 1, scopeDescription: 'All books, checkouts, and fines' },
    { id: 'member', label: 'Library Member', level: 2, scopeDescription: 'Own loans, holds, and catalog' }
  ],
  entities: [
    {
      name: 'book',
      label: 'Book',
      collection: 'books',
      idField: 'isbn',
      nameField: 'title',
      searchableFields: ['title', 'author', 'isbn', 'shelfLocation'],
      displayFields: [
        { key: 'title', label: 'Title' },
        { key: 'author', label: 'Author' },
        { key: 'shelfLocation', label: 'Shelf Location' },
        { key: 'status', label: 'Availability' }
      ],
      visibilityRules: { member: 'all', librarian: 'all' },
      search: async (ctx, text) => db.books.filter(b => b.title.includes(text) || b.author.includes(text)),
      get: async (ctx, id) => db.books.find(b => b.isbn === id) || null
    }
  ],
  scopeGuard: {
    appTopicDescription: 'City Library books, catalog search, loan renewals, and shelf locations.',
    offTopicRefusal: 'I can only assist with book searches, shelf locations, and library account inquiries.'
  }
});
```

### 5.3 Worked Example 2: Employee Leave-Log App
```ts
export const leaveLogAdapter = defineAssistantAdapter({
  app: {
    id: 'leave-log',
    name: 'Team Leave Tracker',
    shortDescription: 'Request time off, check leave balances, and review team schedules.',
    languages: ['en'],
    defaultLocale: 'en',
    theme: {
      mode: 'dark',
      colors: { primary: '#10b981', accent: '#059669', background: '#111827', text: '#f9fafb' },
      radii: { sm: '6px', md: '10px', lg: '16px', full: '9999px' },
      fonts: { body: 'Roboto, sans-serif' },
      launcher: { position: 'bottom-right', label: 'Leave Assistant' }
    }
  },
  roles: [
    { id: 'hr_admin', label: 'HR Admin', level: 1, scopeDescription: 'All employee leave records' },
    { id: 'employee', label: 'Employee', level: 2, scopeDescription: 'Own leave balance and requests' }
  ],
  entities: [
    {
      name: 'leave_record',
      label: 'Leave Request',
      collection: 'leave_requests',
      idField: 'requestId',
      nameField: 'leaveType',
      searchableFields: ['leaveType', 'status', 'dates'],
      displayFields: [
        { key: 'leaveType', label: 'Type' },
        { key: 'dates', label: 'Dates' },
        { key: 'status', label: 'Status' }
      ],
      visibilityRules: { employee: 'self', hr_admin: 'all' },
      scopePredicates: {
        employee: (ctx, rec) => rec.employeeId === ctx.userId,
        hr_admin: () => true
      }
    }
  ]
});
```

---

## 6. Server and Database

### 6.1 Server Endpoints
| Method | Path | Auth | Input | Output |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/assistant/chat` | Bearer Token / Session | `{ message, conversationId?, attachments?, appState? }` | SSE Stream (`status`, `token`, `tool_call`, `action_executed`, `done`) |
| `GET` | `/api/assistant/conversations` | Bearer Token | `None` | `Array<{ id, title, summary, updatedAt }>` |
| `POST` | `/api/assistant/conversations` | Bearer Token | `{ title? }` | `{ id, title, createdAt }` |
| `DELETE` | `/api/assistant/conversations/:id`| Bearer Token | `None` | `{ ok: true }` |
| `GET` | `/api/assistant/credits` | Bearer Token | `None` | `{ balance, plan, renewsAt, isOwner }` |
| `POST` | `/api/assistant/upgrade/order` | Admin Only | `{ planType: 'monthly' \| 'annual' }` | `{ orderId, amount, currency, keyId }` |
| `POST` | `/api/assistant/upgrade/verify` | Admin Only | `{ orderId, paymentId, signature, planType }` | `{ success: true, plan: 'premium', expiresAt }` |
| `POST` | `/api/assistant/upload` | Bearer Token | `multipart/form-data (file)` | `{ fileId, filename, mimeType, parsedText?, summary? }` |
| `GET` | `/api/assistant/guides` | Public / Bearer | `?route=/current/path` | `Array<GuideFlow>` |

### 6.2 Database Tables
- `assistant_conversations`: Chat sessions partitioned by `(user_id, app_id)`.
- `assistant_messages`: Messages partitioned by `(conversation_id, user_id)`.
- `assistant_user_profile`: User preferences (language `en`/`ml`, answer style).
- `assistant_chip_usage`: CTR and frequency tracking for prompt suggestion chips.
- `assistant_audit_logs`: Immutable logs of tool executions and administrative actions.
- `assistant_action_logs`: Two-stage confirmation tracking for pending write actions.
- `assistant_chunks`: Knowledge base chunks with `vector(1536)` HNSW cosine index.
- `org_credits`: Organization monthly balance, plan tier, and renewal date.
- `org_subscriptions`: Active Razorpay subscription state and payment history.

### 6.3 Security Rules (Row Level Security)
- Enforce `WHERE user_id = auth.uid()` on `assistant_conversations` and `assistant_messages`.
- Enforce `WHERE org_id = auth.jwt()->>'org_id'` on `org_credits`.
- Non-admin users are strictly blocked from writing to `assistant_action_logs` for privileged tools.

---

## 7. Environment Variables

| Variable Name | Purpose | Where to Get | Deployment Dashboard |
| :--- | :--- | :--- | :--- |
| `OPENROUTER_API_KEY` | Primary AI provider | https://openrouter.ai/keys | Server Environment |
| `GEMINI_API_KEY` | Secondary AI provider & Vision | https://aistudio.google.com/app/apikey | Server Environment |
| `GROQ_API_KEY` | Tertiary high-speed fallback | https://console.groq.com/keys | Server Environment |
| `SUPABASE_URL` | PostgreSQL & pgvector endpoint | Supabase Project Settings -> API | Server Environment |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged DB client for credits/audit | Supabase Project Settings -> API | Server Environment (Secret) |
| `SUPABASE_ANON_KEY` | Public anon key for client RLS | Supabase Project Settings -> API | Client & Server Environment |
| `RAZORPAY_KEY_ID` | Test Mode Key ID (`rzp_test_...`) | Razorpay Dashboard -> API Keys | Client & Server Environment |
| `RAZORPAY_KEY_SECRET` | Test Mode Secret for HMAC signature | Razorpay Dashboard -> API Keys | Server Environment (Secret) |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature verification | Razorpay Dashboard -> Webhooks | Server Environment (Secret) |
| `RAZORPAY_TEST_MODE` | Safety flag (`true`) | Set to `true` | Server Environment |
| `JWT_SECRET` | Session token cryptographic signing | Generate random 32+ char string | Server Environment (Secret) |

---

## 8. Security Model

### 8.1 Default Deny Principle
The kit enforces server-side **Default Deny**. Every data query passes through the adapter entity's `scopePredicates[role](ctx, record)` function. If no predicate is defined for the role, access is automatically refused.

### 8.2 Role x Entity Test Matrix Template
| Role | Own Records | Same Org / Other Unit | Other Org | Action Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Full Read | Full Read | Full Read | Read aggregate stats; no direct record edit |
| **Admin** | Full Read/Write | Full Read/Write | Denied (403) | All tools, import, export, manage credits |
| **Scoped Manager** | Full Read/Write | Denied (403) | Denied (403) | Scoped unit records only; no cross-unit write |
| **End User / Student** | Full Read (Self) | Denied (403) | Denied (403) | Personal records only; no administrative tools |

---

## 9. Credits, Premium, and Razorpay (Test Mode)

### 9.1 Credit Policy
- Free tier: 100 credits per calendar month.
- Credit owner: Organization Admin.
- On the free plan, **ONLY the Admin** may use the assistant. Non-admin members receive an `UPGRADE_REQUIRED` modal.
- Upgrading to Premium unlocks **unlimited usage** for all members in that organization.

### 9.2 Test Mode Flow
1. Admin opens `/upgrade` or clicks `Upgrade` in chat panel.
2. Client calls `POST /api/assistant/upgrade/order` with plan choice.
3. Server creates order via Razorpay SDK with test currency (INR) and returns order ID.
4. Client opens Razorpay Checkout modal (using `rzp_test_...` key).
5. On successful test payment, client sends `razorpay_signature` to `POST /api/assistant/upgrade/verify`.
6. Server computes HMAC SHA256 of `order_id + "|" + payment_id` using `RAZORPAY_KEY_SECRET`.
7. If signature matches, organization is marked `plan = 'premium'` with 30-day or 365-day expiry.

---

## 10. Guide Mode & 3D Avatar Kinematics

### 10.1 Adding `data-guide-id` Anchors
In your host application HTML/JSX:
```tsx
<button data-guide-id="import-students-btn" onClick={openImportModal}>
  Import Spreadsheet
</button>
```

### 10.2 Defining Guide Flows
In `adapter/app.config.ts`:
```ts
guideFlows: [
  {
    id: 'import-flow',
    title: 'Import Spreadsheet Guide',
    triggerPhrases: ['how to import', 'guide import'],
    roles: ['admin'],
    steps: [
      {
        id: 'step-1',
        route: '/admin/students',
        selector: '[data-guide-id="import-students-btn"]',
        instructionEn: 'Click here to open the spreadsheet import modal.',
        instructionMl: 'സ്പ്രെഡ്ഷീറ്റ് ഇമ്പോർട്ട് മോഡൽ തുറക്കാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക.',
        completionCondition: 'click'
      }
    ]
  }
]
```

### 10.3 3D Mascot Loading & Kinematics
- The 3D mascot is built procedurally with Three.js (`avatarModel.ts`) using 29 meshes and warm 3-point studio lighting (hemisphere, key light, amber rim).
- Pointer tracking smoothly interpolates head and eye rotation via `lerp`.
- **Privacy Mode**: When user focuses on an input with `type="password"`, the avatar automatically rotates away and closes its eyes.

---

## 11. Performance Notes & 3D Integrity Rule

- **Lazy Loading**: The widget bundle is code-split and loaded only when the user opens the launcher or presses the hotkey.
- **Off-Main-Thread Processing**: Large spreadsheets (XLSX/CSV) and PDF files are parsed asynchronously to avoid UI frame drops.
- **3D Integrity**: The 3D avatar's mesh geometry (15,834 triangles), materials, lighting parameters, and kinematics must NEVER be degraded or disabled.

---

## 12. Libraries Used

| Library Name | Purpose in Kit | Licence |
| :--- | :--- | :--- |
| `@google/genai` | Google Gemini AI provider SDK | Apache-2.0 |
| `openai` | OpenRouter and Groq universal provider client | Apache-2.0 |
| `express` | HTTP routing, SSE streaming, and webhook endpoints | MIT |
| `razorpay` | Payment order creation & HMAC signature verification | MIT |
| `three` | 3D assistant avatar rendering and kinematics | MIT |
| `xlsx` | SheetJS Excel spreadsheet parsing and generation | Apache-2.0 |
| `papaparse` | In-browser and server CSV parser | MIT |
| `jspdf` | Client and server PDF document generation | MIT |
| `jspdf-autotable` | Tabular auto-paging plugin for jsPDF | MIT |
| `docx` | Word document generation | MIT |
| `pdfjs-dist` | Mozilla PDF text extraction | Apache-2.0 |
| `zod` | Runtime schema validation for tools and configuration | MIT |
| `pino` | Fast, structured logging with secret redaction | MIT |
| `@supabase/supabase-js` | PostgreSQL and pgvector persistence | MIT |

---

## 13. Troubleshooting

### 1. Works locally but fails on the deployed link (Vercel)
- **Cause**: Missing server environment variables or client bundle attempting direct calls to AI providers.
- **Fix**: Verify all keys from `.env.example` are populated in your Vercel Project Settings -> Environment Variables. Ensure all requests route through `/api/assistant/*`.

### 2. Provider fallback not triggering
- **Cause**: Router throwing unhandled synchronous exceptions instead of catching timeout/429 status codes.
- **Fix**: Verify `core/providers/router.ts` catches HTTP 429/5xx status codes and advances down the sequential chain (`openrouter -> gemini -> groq`).

### 3. "No previous dataset" error on export
- **Cause**: Conversation state lost between message turns.
- **Fix**: Verify `core/engine/datasetState.ts` caches the latest tool execution result set in session storage keyed by `conversationId`.

### 4. Wrong "Who is X" answers (falling back to generic overview)
- **Cause**: Missing entity registry search handler or query tool returning empty array.
- **Fix**: Ensure your adapter implements `entities[].search` with fuzzy case-insensitive substring matching on name and ID fields.

### 5. Malayalam not rendering in PDF (corrupted glyphs or question marks)
- **Cause**: Standard jsPDF 14 standard fonts only support Latin-1 ASCII.
- **Fix**: The kit bundles `NotoSansMalayalam-Regular.ttf` in `assets/fonts/` and automatically registers it via `jsPDF.addFileToVFS` before rendering.

---

## 14. Extension Points (Future Roadmap)

The AI Assistant Kit is architected with clean module boundaries for future extensions:
1. **Universal App Integration SDK**: Drop-in web component wrapper for non-React frameworks (Vue, Svelte, Angular, Vanilla JS).
2. **Universal Tool Calling Engine**: Extended autonomous multi-step planning loops with rollback checkpoints.
3. **Smart Page Context Awareness**: Automatic screen reading and DOM state synchronization without manual user prompts.
4. **AI Evaluation and Audit**: Continuous benchmark scoring for response accuracy and latency.
5. **RAG Knowledge Base**: Automated documentation crawl and recursive embedding synchronization.
6. **Voice AI**: Low-latency bi-directional speech-to-speech interaction via WebRTC.
7. **AI Report and Dashboard Generator**: Dynamic chart and analytics generation from conversational queries.
