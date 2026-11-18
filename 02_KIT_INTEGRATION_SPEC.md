# SPEC 2 of 2: AI ASSISTANT KIT - INTEGRATION SPECIFICATION

**Audience:** the AI coding agent working inside a NEW web app (Antigravity, AI Studio or similar).
**Goal:** integrate the AI Assistant Kit (already extracted at `./ai-assistant-kit/`) into this new app so that EVERY feature F01-F20 below works with this app's own data and roles.
**Companion file:** `01_KIT_PACKAGING_SPEC.md` (how the kit was built). You do not need it, but `./ai-assistant-kit/README.md` is mandatory reading.

---

## 0. HOW YOU MUST READ THIS FILE
1. Read this file word by word, from the first line to the last, BEFORE writing any code.
2. Then read `./ai-assistant-kit/README.md`, `FEATURES.md` and `INTEGRATION_CHECKLIST.md` completely. If the README contradicts this file, follow this file and report the difference.
3. Build a numbered REQUIREMENTS CHECKLIST from this file (every F-feature, every phase, every gate) and print it.
4. Implement EVERY item. Do not skip, merge or postpone anything. If something is impossible, say so explicitly in the final report with the reason and the closest alternative.
5. At the end, print the checklist again with DONE / NOT DONE and the proof (file path or test result) for each item.

## 1. NEW APP INFORMATION (the user fills this in; the agent fills any blank by scanning the code)
```
App name / purpose:
Roles and hierarchy (top to bottom):
Main entities / data (with the fields that matter):
Tech stack, database, hosting (e.g. Vercel):
Key pages and what users do on them:
Who owns the credits (the "credit owner" role):
Existing import/export features, if any:
Anything the assistant must NOT be able to do:
```
Ask the user questions ONLY if you are truly blocked. Otherwise state your assumptions in the final report.

## 2. NON-NEGOTIABLE RULES
- Do not break any existing feature of this app. No performance regression. Any existing 3D visuals, animations and alignment stay exactly as they are.
- Do not modify the kit's `core/` unless there is a bug. All app-specific behaviour goes in the adapter. If you must patch core, list the patch in the report so it can be fed back into the kit.
- Role scoping is enforced SERVER-SIDE, default deny (F02). Never trust the role in the user's message.
- No secrets in code or in the client bundle. Provide `.env.example` placeholders and tell the user exactly which environment variables to set and where.
- Use open-source libraries before writing new code (F16).
- Match this app's stack. Do not migrate frameworks.

## 3. PHASES (each ends with a QA pass - F19)
**Phase 1 - Understand the new app.** Scan routes, auth/session, roles, database schema, existing exports/imports, UI framework, theme, hosting. Print a short summary: roles and scope rules, entities, pages.
**Phase 2 - Install the kit.** Install the dependencies from the kit's `package-deps.json`. Add build/config changes the README requires. Do not move the kit's folder structure.
**Phase 3 - Fill the adapter.** Copy `adapter/app.config.TEMPLATE.*` and fill EVERY section: app and theme tokens, auth/session reader, roles and scope predicates, entities with `query/get/search`, pages with chips and guide anchors, guide flows, custom tools, import templates, export definitions, credits, plans, providers, scope-guard topic.
**Phase 4 - Server and database.** Add the kit's endpoints, middleware and DB collections/tables (history, credits, subscriptions, usage, audit) and security rules. Run migrations.
**Phase 5 - Mount the UI.** Add the right-click launcher and the side panel to the app shell without changing the existing layout or styles. Add `data-guide-id` anchors to the real UI elements needed by the guide flows.
**Phase 6 - Credits and payments.** Configure the credit owner, the free allowance (100 per month), premium rules, the upgrade page and Razorpay test mode.
**Phase 7 - Feature mapping.** Complete the mapping table in section 6 for every F-feature.
**Phase 8 - Full QA.** Role matrix, every feature, mobile, performance, deployment.
**Phase 9 - Report, commit and push.**

---


## 4. HOW TO READ THE CATALOGUE BELOW
Each feature below is a requirement for the NEW app. For every one, section 6 asks you to map it to this app's data and prove it with a test.

## FEATURE CATALOGUE (F01 - F20)

Every feature below is REQUIRED unless explicitly marked optional. Each has: what it does, detailed behaviour rules, and acceptance tests. "Reference app" means the college finance web app in which the assistant was first built (hierarchy: Platform Super Admin > Admin (organization owner) > Sector Managers > Students).

---

### F01. Chat side panel opened by right-click
**What:** The assistant lives in a chat side panel inside the web app. The user opens it from a right-click (context menu) option, e.g. "Ask AI Assistant".

**Behaviour rules**
- Minimal, Gemini-style layout: clean message list, one input bar, attachment button, send button, three suggestion chips (see F10).
- Colours, fonts, radius and spacing come from theme tokens in the adapter config, so the look can be restyled per app without touching core code.
- Desktop: docked side panel that overlays the page and never shifts or breaks the host app layout. Mobile: full-height bottom sheet or full-screen panel.
- Closing and reopening keeps the current conversation. The panel is lazy-loaded (see F15).
- Keyboard: Esc closes, Enter sends, Shift+Enter adds a new line.

**Acceptance tests:** right-click opens it on every page; works on mobile width; changing a theme token changes the look; no layout shift in the host app.

---

### F02. Role hierarchy with strict, server-side data scoping
**What:** The assistant only ever returns data the logged-in user is allowed to see.

**Reference hierarchy**
1. **Platform Super Admin** (separate login/page): sees all organizations, their data and usage. Credentials are stored hashed in the database, never in code.
2. **Admin** (organization owner): sees only their own organization. No organization switching.
3. **Sector Managers**: added manually by the Admin; each sees ONLY the data of their own sector. Example: the Office sector manager asks for Department sector data and gets nothing, and the other way round.
4. **Students**: log in with their admission number; see ONLY their own records (debit, credit, balance, full details), whichever sector those records belong to.

**Behaviour rules**
- DEFAULT DENY. Scope is enforced SERVER-SIDE inside the data/tool layer, not only in the prompt.
- Role and scope come from the authenticated session, never from the user's message. A user saying "I am the admin" changes nothing. Prompt-injection text inside files or data cannot widen scope.
- A refused request gets a polite refusal that does not leak whether the data exists.
- The model is generic: tenant > owner/admin > scoped manager > end user. The adapter defines the roles and the scope predicate for each entity.

**Acceptance tests:** a matrix of every role x every entity x "own scope / other scope / other organization". Every cross-scope cell must return nothing.

---

### F03. Private per-user chat history and personalization
**What:** Each user has their own chat history.

**Behaviour rules**
- The Admin's chat history is visible only to the Admin. Sector managers and students cannot see it, and the reverse holds for every role.
- By default the Platform Super Admin sees usage numbers only, not chat contents (flag this default in the README as a configurable assumption).
- History is stored per user id: list, open, new chat, rename, delete.
- The assistant greets and addresses the user by name and adapts examples to their role.

**Acceptance tests:** log in as two users of different roles and confirm neither can read or request the other's history, including by direct API call.

---

### F04. Universal data retrieval (A to Z)
**What:** The assistant can fetch any data in the app that the user's role may see.

**Behaviour rules**
- Examples (reference app): "details of the student with admission number 1234"; "list of students in the Office sector whose net worth is debit/negative"; class reports; ledger lookups; "open the ledger" navigates to that page.
- Show ONLY what was asked. If the user asks for the "net worth minus" list, return only students with a negative balance and only the relevant columns (e.g. the Due column), not a full dump.
- Tables are readable, sorted sensibly, capped with pagination or "show more"; large results offer export (F08).
- Several matches: ask which one. No match: say so clearly.
- Retrieval uses typed query tools (F06) against the real data, never guesses from memory.

**Acceptance tests:** each example above returns exactly the requested data for the right role, and the same question from a role without access returns a refusal.

---

### F05. Entity identification ("Who is X?")
**What:** Asking "who is <name>" (or a book, shelf, leave record, etc. in other apps) identifies the entity from LIVE app data.

**Behaviour rules**
- Search across ALL entity types the role may see (reference app: students, teachers/sector managers, principal, office, union). Fuzzy name match, ID match, partial match.
- Answer with identity, role/type and the relevant details allowed for the asker.
- It must NEVER fall back to a generic overview of the app or a demo-credentials list.
- Several matches: list them and ask which one is meant.
- Other apps: library app ("who is X", "which shelf is this book on"), leave-log app.

**Acceptance tests:** the name of a real student, a sector manager and an office user each resolve correctly; an unknown name returns "not found", not a generic overview.

---

### F06. App-scoped answers and agent actions (tool-calling engine)
**What:** The assistant answers only about the connected app, and it can also DO things (agent mode).

**Behaviour rules**
- Scope guard: questions unrelated to the app get a short, polite redirect.
- All capabilities are tools registered in the adapter. Each tool has a name, a description, a JSON-schema for parameters, a role permission rule and a handler.
- Read tools run directly. Write/bulk/destructive tools require a confirmation step that shows a preview of what will change.
- Every tool call is logged (F18). Tool errors are explained in plain language.
- Navigation tools open pages ("open the ledger"). Action tools import, export, create and update records where the role allows it.
- Works the same through every provider in F14 (tool-calling format differences are handled in the router).

**Acceptance tests:** a read tool, a navigation tool and a confirmed write tool each work; a write without confirmation never executes; a forbidden tool call is rejected server-side.

---

### F07. Import through the assistant
**What:** The user attaches an Excel/CSV file and says "import all the students in this file", and the assistant does it.

**Behaviour rules**
- Formats: .xlsx, .xls, .csv. Parse with an open-source library (SheetJS / PapaParse), in a web worker for big files.
- Detect headers, map columns to entity fields (match the app's import template when present), validate, and detect duplicates and errors.
- Show a preview summary (rows found, valid, invalid, duplicates, target sector/class) and ask for confirmation. After confirming, import and report the result with the error rows downloadable.
- Role permission applies (reference app: Admin imports students; sector managers cannot).

**Acceptance tests:** a clean file, a file with bad rows and a file with duplicates each behave correctly; an unauthorised role is refused.

---

### F08. Export through the assistant
**What:** The assistant itself produces the requested data as a file. It does NOT tell the user to press the app's own download buttons.

**Behaviour rules**
- Formats: CSV, Excel (.xlsx), PDF, Word (.docx). Use existing open-source libraries (SheetJS, jsPDF + autotable, docx).
- Export ONLY the data asked for (the filtered list, the chosen columns), within the user's role scope.
- Show an export card inside the chat reply with a button per format and the file name.
- "Export the last answer" must work: the last result set of the conversation is kept in conversation state. The error "no previous dataset" must not occur when the previous answer had data.
- If the data contains Malayalam or other non-Latin text, embed a Unicode font in PDF output so the text renders correctly.

**Acceptance tests:** ask for a filtered list, then say "export this as PDF" and "as Excel"; files open correctly and contain only the filtered rows.

---

### F09. Attachments and screenshot diagnosis
**What:** The user can attach files and screenshots to a message.

**Behaviour rules**
- Attach by button, drag-and-drop and paste. Before sending, show a preview in the input: image thumbnail, or a file chip with name, size and a remove button.
- Supported: images, PDF, Excel, CSV. The assistant reads and analyses them (images via a vision-capable model; PDF via text extraction with OCR fallback; Excel/CSV via parsing).
- Files related to the web app: explain what they contain. Student/sector Excel or CSV: offer to import it (F07) and do it on confirmation.
- Screenshots of a problem: diagnose it, give clear solutions, and fix it as an agent where a tool exists.
- Must not lag: heavy work off the main thread, file size limits with a friendly message, progress indicator.
- The provider router (F14) must pick a vision-capable model when an image is attached.

**Acceptance tests:** each file type previews and is analysed; a screenshot of an error gets a diagnosis; a 10 MB file does not freeze the UI.

---

### F10. Role- and page-aware suggestion chips
**What:** Exactly THREE suggestion chips are shown, tappable, and depend on the user's role and the page they are on.

**Behaviour rules**
1. Chip 1: personalised to the user's recent usage, their predicted next action, or where they seem stuck.
2. Chip 2: an action that is possible on the CURRENT page.
3. Chip 3: a general example that is valid across the whole site.
- Chips refresh when the route changes. Tapping a chip sends it as a message.
- Never suggest something the role cannot do. Computed cheaply from rules and a small usage log, without an extra model call on every navigation (cache any model-generated chips).

**Acceptance tests:** different roles on the same page see different chips; the same role on different pages sees different chips; always exactly three.

---

### F11. Guide mode with the 3D avatar
**What:** When a user asks how to do something ("guide me to log in", "how do I register", "how do I import students", "how do I view student details"), the chat closes and the avatar walks them through the REAL screens until the task is done.

**Behaviour rules**
- The avatar is the app's EXISTING 3D assistant model, not a 2D character. It moves around the screen and points at the real options.
- It highlights the target element (ring/spotlight) and speaks a short instruction for each step: click here, type this, press Enter, go to the next section.
- It waits for the user to complete each step (detect click/input/route change), then moves on. Steps can be repeated, skipped or stopped at any time; afterwards the chat returns.
- Voice narration uses speech synthesis with a mute toggle. English is the default language; Malayalam is an optional switch.
- The avatar closes its eyes while the user types in a password field.
- Flows are defined in the adapter as step lists (route, target selector / data-guide-id, instruction text, completion condition) and can also be generated from the page registry.
- Must not reduce the 3D quality, options, animations or alignment (see F15).

**Acceptance tests:** a new user can complete login, register, import students and view student details by following the avatar alone; eyes close on password fields; stop/resume works; works on mobile.

---

### F12. Credit system and plans
**What:** Credits belong to the Admin (organization owner).

**Behaviour rules**
- Free plan: 100 credits per month, refreshing monthly. On the free plan ONLY the Admin can use the assistant. Sector managers and students cannot use it unless the Admin has bought premium.
- Premium: unlimited use for everyone under that Admin.
- Credit cost per message is configurable (default 1; heavier actions such as vision, import and export may cost more).
- Enforced SERVER-SIDE with an atomic decrement. When credits run out the user sees a clear message and an upgrade button, and no model call is made.
- The panel shows remaining credits. Monthly reset is based on a stored reset date, not a client clock.

**Acceptance tests:** exhaust 100 credits and confirm blocking; confirm a manager/student on a free organization is blocked; after premium activation they can use it; reset works after the reset date.

---

### F13. Upgrade page and Razorpay (test mode)
**What:** An upgrade page lets the Admin buy premium.

**Behaviour rules**
- Page layout: a monthly bar and an annual bar, feature details below, and a Subscribe button on each.
- Razorpay TEST mode: create the order on the server, open Razorpay Checkout, VERIFY the payment signature on the server (HMAC), then activate premium (plan, start date, expiry) for the organization. Handle failure, cancel and expiry.
- Key ID and Key Secret are two clearly marked paste slots in `.env` (placeholders in the kit). The secret never reaches the client. No real money moves in test mode.
- Use the official Razorpay SDK and Checkout script. Do not hand-roll the signature code if a library function exists.

**Acceptance tests:** a test payment activates premium; a tampered signature does not; expiry returns the organization to free.

---

### F14. Multi-provider AI router
**What:** One router chooses the model provider.

**Behaviour rules**
- Order: OpenRouter FIRST, then Gemini, then Groq. Fall through to the next provider ONLY on failure (timeout, 429, 5xx, empty or invalid response).
- Per-provider timeouts and retry counts live in config. Stream tokens to the UI for perceived speed.
- Keys live only on the server. Model names are config values.
- Tool-calling and vision formats are normalised so every provider behaves the same for the rest of the system.
- Log which provider answered and why a fallback happened. The user sees a friendly error only when ALL providers fail.

**Acceptance tests:** simulate failure of provider 1, then 1 and 2, then all three; confirm the fallback order and the final error message.

---

### F15. Performance and 3D integrity
**What:** The assistant and the host app must feel fast.

**Behaviour rules**
- Lazy-load and code-split the assistant. It must not slow the first page load or navigation-bar switching.
- Virtualise long lists, debounce inputs, move heavy parsing off the main thread, avoid needless re-renders.
- The 3D rendering, its options, animations and alignment are core to the look and must NEVER be removed, paused or reduced. Existing animations may be re-implemented more efficiently, with the same visual result.
- Verify smooth scrolling and no lag when switching between sidebar and navigation items, on desktop and mobile.

**Acceptance tests:** compare before/after timings for first load, route change and scroll; the 3D visuals look identical.

---

### F16. Open-source-first rule
**What:** Always import free, existing open-source libraries instead of writing features from scratch.

**Behaviour rules**
- Libraries must be seamless drop-ins that need no tokens, API keys or external API connections (examples: SheetJS, PapaParse, jsPDF, docx, pdf.js, three.js).
- Write new code only where no suitable library exists. List every library used (name, purpose, licence) in the README.

---

### F17. Language
**What:** The assistant UI, replies and guide voice are in English by default, with Malayalam as an optional switch.

**Behaviour rules**
- The user may type in English or Malayalam; the reply follows the language the user writes in or has switched to.
- Dictated/voice-style Malayalam input should be understood.

---

### F18. Usage metering and audit log
**What:** Usage is tracked per organization and per user.

**Behaviour rules**
- Store messages, credits used, tool calls, provider used, errors and timestamps.
- The Platform Super Admin page shows usage per organization. The Admin sees usage for their own organization only.
- Audit log entries for write/import/export actions: who, what, when, result.

---

### F19. Quality assurance and delivery
**What:** A QA test agent runs in EVERY phase.

**Behaviour rules**
- Test every role (Platform Super Admin, Admin, Sector Manager, Student, or the equivalents in the target app) across all pages, navigation, sidebars, mobile responsiveness and scroll lag.
- Use many parallel agents (at least 5-6, up to 10-15), then produce a final report.
- Commit and push to the already-linked GitHub repository at the end.

---

### F20. Deployment readiness
**What:** The assistant must work on the deployed link (e.g. Vercel) in Chrome, not only on localhost.

**Behaviour rules**
- All provider/payment calls go through server routes. No localhost URLs, no keys in client bundles.
- Provide the complete list of environment variables with placeholders in `.env.example`, and state exactly where each must be set in the hosting dashboard.
- The production build must pass with no errors.

---

### EXTENSION POINTS (design for them, do NOT build now)
Universal App Integration SDK, Universal Tool Calling Engine (F06 is its base), Smart Page Context Awareness, AI Evaluation and Audit, RAG Knowledge Base, Conversation Memory, AI Workflow Automation, Voice AI, AI Report and Dashboard Generator. Keep module boundaries clean so these can be added later.

## 5. INTEGRATION ORDER REMINDER
Follow the phases in section 3 in order. Do not start Phase 7 (mapping) before Phases 1-6 are done, and do not report done before Phase 8 passes.

---

## 6. FEATURE MAPPING TABLE (the agent must fill this for the NEW app and keep it in the report)
For every feature, write how it maps to this app's own roles, entities and pages.
| ID | Feature | How it works in THIS app (roles, entities, pages) | Adapter fields used | Test result |
|----|---------|---------------------------------------------------|---------------------|-------------|
| F01 | Side panel + right-click | | app, theme | |
| F02 | Role scoping | | roles, entities scope predicates | |
| F03 | Private chat history | | auth | |
| F04 | Data retrieval | | entities | |
| F05 | Who is X | | entities (search) | |
| F06 | Tools and agent actions | | tools, scopeGuard | |
| F07 | Import | | importTemplates | |
| F08 | Export | | exportDefinitions | |
| F09 | Attachments | | importTemplates, pages | |
| F10 | Chips | | pages | |
| F11 | Guide + 3D avatar | | guideFlows, data-guide-id anchors | |
| F12 | Credits | | credits | |
| F13 | Upgrade + Razorpay | | plans | |
| F14 | Provider router | | providers | |
| F15 | Performance | | | |
| F16 | Open-source rule | | | |
| F17 | Language | | app | |
| F18 | Usage + audit | | | |
| F19 | QA | | | |
| F20 | Deployment | | | |

### Worked examples of mapping (for reference only)
- **College finance app (the reference app):** Platform Super Admin > Admin > Sector Managers > Students. Entities: students, sectors, ledger entries, unions, funding sources. "Net worth minus in the Office sector" = students of that sector with a negative balance.
- **Library app:** roles Admin, Librarian, Member. Entities: books, shelves, members, loans. "Who is X" finds a member or a book; "which shelf is this book on" is a read tool on books and shelves; a member sees only their own loans.
- **Leave-log app:** roles Admin, Manager, Employee. Entities: employees, leave requests, balances. An employee sees only their own leave; a manager sees their team; "export this month's leave" gives a PDF/Excel of the filtered rows.

## 7. ROLE x ENTITY TEST MATRIX (must be run and attached to the report)
For every role, for every entity, test three cells: own scope (must work), other scope in the same organization (must be refused), other organization (must be refused). Test through the chat AND by calling the API directly. Also test: prompt injection inside an attached file, and a user claiming to be a higher role in the message.

## 8. END-TO-END SCENARIOS (all must pass)
1. A new user asks "guide me to log in" and completes login by following the avatar (eyes close on the password field).
2. The credit owner uploads an Excel file and says "import everyone in this file"; sees the preview; confirms; the records appear.
3. A scoped manager asks for the debit/negative list of their own scope, then says "export this as PDF"; the file contains only that list.
4. The same manager asks for another scope's data and is refused.
5. A member/student logs in and sees only their own records with full detail.
6. "Who is <real name>" resolves from live data, never a generic overview.
7. A screenshot of an error is attached; the assistant diagnoses it.
8. Free credits run out; the upgrade page appears; a Razorpay test payment activates premium; sub-roles can now use the assistant.
9. Provider 1 is forced to fail; the answer still arrives via the next provider.
10. The deployed link works in Chrome, not only locally.

## 9. ENVIRONMENT VARIABLES AND DEPLOYMENT
- Produce the final list of environment variables with a one-line purpose, where to obtain each, and where to set it (local `.env` and the hosting dashboard, e.g. Vercel).
- The user will paste: OpenRouter key, Gemini key, Groq key, Razorpay Key ID and Key Secret (test mode). Mark each paste slot clearly. Never print real secrets in the report.
- After setting variables, a redeploy is required; state this.

## 10. QUALITY GATES (all must pass before you report done)
1. Every F01-F20 acceptance test passes in THIS app.
2. The role matrix shows no leakage.
3. Provider fallback order verified: OpenRouter, then Gemini, then Groq.
4. No secrets or localhost URLs in the client bundle; production build passes.
5. No regression in existing pages, 3D visuals or performance (before/after timings).
6. QA agents (5-6 minimum, up to 10-15 in parallel) ran in every phase for every role, covering all pages, navigation, sidebars, mobile responsiveness and scroll lag.

## 11. FINAL REPORT FORMAT
1. Summary of the new app (roles, entities, pages).
2. The completed feature mapping table (section 6).
3. The requirements checklist with DONE / NOT DONE and proof.
4. Role matrix and end-to-end scenario results.
5. Environment variables the user must set.
6. Any patches made to the kit's `core/` (so they can be fed back into the kit).
7. Deviations, assumptions and known limitations.
Then commit and push to the linked GitHub repository.

**END OF SPEC 2**
