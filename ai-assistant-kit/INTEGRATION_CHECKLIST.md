# AI Assistant Kit — Integration Checklist

This step-by-step tick-box checklist guides an AI coding agent or human software engineer through integrating the **AI Assistant Kit** into any new or existing web application.

Follow these steps in strict chronological order.

---

### Step 1: Extract & Position Kit
- [ ] Extract `ai-assistant-kit.zip` into the root of your target host project (resulting in `./ai-assistant-kit/`).
- [ ] Verify the internal directory structure contains `core/`, `adapter/`, `server/`, `db/`, `assets/`, and `tests/`.
- [ ] Ensure `.env` is NOT committed to version control.

---

### Step 2: Install Package Dependencies
- [ ] Open `ai-assistant-kit/package-deps.json`.
- [ ] Install missing open-source packages in your project root:
  - Runtime AI & server: `@google/genai`, `openai`, `express`, `zod`, `pino`
  - Payments: `razorpay`
  - 3D avatar & graphics: `three`
  - Ingestion & export: `xlsx`, `papaparse`, `jspdf`, `jspdf-autotable`, `docx`, `pdfjs-dist`
  - Database: `@supabase/supabase-js`
- [ ] Run `npm install` or `bun install` to ensure lockfiles are updated and zero compile errors exist.

---

### Step 3: Database & Security Schema Setup
- [ ] Open your PostgreSQL / Supabase project SQL Editor.
- [ ] Execute `ai-assistant-kit/db/schema/tables.sql` to initialize:
  - `assistant_conversations` & `assistant_messages`
  - `assistant_user_profile` & `assistant_chip_usage`
  - `assistant_audit_logs` & `assistant_action_logs`
  - `assistant_chunks` (pgvector 1536 cosine index)
- [ ] Execute `ai-assistant-kit/db/rules/security_policies.sql` to activate Row Level Security (RLS) policies.
- [ ] Execute `ai-assistant-kit/db/migrations/001_billing_credits.sql` to provision organization credits and subscriptions tables.

---

### Step 4: Environment Variables Configuration
- [ ] Copy `ai-assistant-kit/.env.example` to `.env` in your project root.
- [ ] Configure AI Provider Keys:
  - [ ] `OPENROUTER_API_KEY` (Primary)
  - [ ] `GEMINI_API_KEY` (Secondary / Multimodal Vision)
  - [ ] `GROQ_API_KEY` (Tertiary / High-Speed Fallback)
- [ ] Configure Database Connection:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `SUPABASE_ANON_KEY`
- [ ] Configure Razorpay Test Mode:
  - [ ] `RAZORPAY_KEY_ID` (starts with `rzp_test_`)
  - [ ] `RAZORPAY_KEY_SECRET`
  - [ ] `RAZORPAY_WEBHOOK_SECRET`
  - [ ] `RAZORPAY_TEST_MODE=true`
- [ ] Configure Security & Server:
  - [ ] `JWT_SECRET` (at least 32 characters)
  - [ ] `ALLOWED_ORIGINS` (comma-separated origins)

---

### Step 5: Fill the Adapter Contract
- [ ] Copy `ai-assistant-kit/adapter/app.config.TEMPLATE.ts` to `ai-assistant-kit/adapter/app.config.ts`.
- [ ] **Key 1 (app)**: Specify `name`, `shortDescription`, `logo`, language defaults, and theme tokens (colors, radii, fonts).
- [ ] **Key 2 (auth)**: Implement `extractSession(req)` to resolve verified user ID, role, and organization ID from cookies/JWT.
- [ ] **Key 3 (roles)**: Define your application's role hierarchy with levels and scope boundaries.
- [ ] **Key 4 (entities)**: Register your app's entities with fields, searchable columns, per-role scope predicates, and live `query`/`get`/`search` functions.
- [ ] **Key 5 (pages)**: Define page routes, page names, allowed actions, per-role prompt suggestion chips, and guide anchor IDs.
- [ ] **Key 6 (guideFlows)**: Define step-by-step walkthrough flows (`route`, `selector` / `data-guide-id`, English/Malayalam instructions, and completion condition).
- [ ] **Key 7 (tools)**: Register custom action tools (`name`, schema, role permissions, confirmation requirement, and handler).
- [ ] **Key 8 (importTemplates & exportDefinitions)**: Configure spreadsheet import templates and report export columns.
- [ ] **Key 9 (credits)**: Define free monthly allowance (100 credits/mo), credit owner role, and action costs.
- [ ] **Key 10 (plans)**: Set monthly and annual upgrade pricing and feature bullet lists.
- [ ] **Key 11 (providers)**: Verify fallback order (`openrouter -> gemini -> groq`) and timeout settings.
- [ ] **Key 12 (scopeGuard)**: Define app topic description and polite refusal message for off-topic queries.

---

### Step 6: Mount Server Routes & Middleware
- [ ] In your Express/Node HTTP server entry point:
  ```ts
  import { createAssistantServerRouter } from './ai-assistant-kit/server/index.ts';
  import { myAppAdapter } from './ai-assistant-kit/adapter/app.config.ts';

  app.use('/api/assistant', createAssistantServerRouter({ adapter: myAppAdapter }));
  ```
- [ ] Mount the raw body webhook handler for Razorpay:
  ```ts
  import { createPaymentWebhookHandler } from './ai-assistant-kit/core/payments/index.ts';
  app.post('/api/assistant/payments/webhook', express.raw({ type: 'application/json' }), createPaymentWebhookHandler());
  ```

---

### Step 7: Mount UI Widget & Context Menu
- [ ] In your root React layout / shell (`App.tsx` or `RootLayout.tsx`):
  ```tsx
  import { AssistantWidget, ContextMenuWrapper } from './ai-assistant-kit/core/ui/index.ts';
  import { myAppAdapter } from './ai-assistant-kit/adapter/app.config.ts';

  export function RootLayout({ children }) {
    return (
      <ContextMenuWrapper>
        {children}
        <AssistantWidget adapter={myAppAdapter} />
      </ContextMenuWrapper>
    );
  }
  ```
- [ ] Decorate key interactive buttons and form inputs with `data-guide-id="anchor-name"` matching your guide flow definitions.

---

### Step 8: Quality Assurance & Verification
- [ ] **Right-Click Launcher**: Right-click anywhere in host app; confirm assistant opens with context badge.
- [ ] **Esc / Keyboard Navigation**: Press Esc to close panel; Enter to send message; Shift+Enter for newline.
- [ ] **Data Scoping**: Log in as Role A; attempt to query Role B records; verify server-side polite refusal.
- [ ] **Who is X**: Ask "who is <name>"; verify real entity identification without generic overview fallback.
- [ ] **Export**: Query data, then ask "export this as PDF" and "as Excel"; confirm generated files contain only asked rows and render Malayalam properly.
- [ ] **Import**: Upload an XLSX/CSV file; verify two-stage preview modal, confirmation gating, and duplicate detection.
- [ ] **Guide Mode**: Trigger guide flow; verify 3D avatar walks across real screens, highlights elements, and closes eyes on password fields.
- [ ] **Credits & Upgrade**: Verify free 100 credits decrement atomically; verify upgrade flow in Razorpay test mode.
- [ ] **Provider Fallback**: Temporarily disconnect OpenRouter key; verify seamless fallback to Gemini and Groq.
