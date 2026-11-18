# Changelog — AI Assistant Kit

All notable changes to the AI Assistant Kit are documented in this file.

## [1.0.0] - 2026-11-17

### Added
- **Core Package Extraction**: Complete separation of app-independent engine and UI from application-specific logic into `ai-assistant-kit/`.
- **Zero Hardcoded Core Words**: Sanitized all core modules to reference generic entities via adapter contract rather than application-specific keywords ("sector", "student", "admission number", "ledger").
- **12-Key Adapter Contract**: Defined exhaustive TypeScript contract in `adapter/contract.ts` covering `app`, `auth`, `roles`, `entities`, `pages`, `guideFlows`, `tools`, `importTemplates`, `exportDefinitions`, `credits`, `plans`, `providers`, and `scopeGuard`.
- **Worked Reference Adapter**: Bundled complete reference application adapter configuration in `adapter/app.config.ts` matching Khazna Campus Ledger.
- **Empty Adapter Starter**: Added `adapter/app.config.TEMPLATE.ts` for clean drop-in adoption in new applications.
- **Sequential Multi-Provider Router**: Implemented strict fallback order (`OpenRouter -> Gemini -> Groq`) with 3-strike circuit breaker and streaming SSE token recovery.
- **Vision-Aware Router**: Added automatic detection of image/screenshot attachments routing to multimodal vision models.
- **Role Scoping Engine**: Implemented server-side default-deny `AccessScope` derivation from authenticated sessions, blocking prompt-injection and client-side role tampering.
- **3D Avatar & Guide Skill v2**: Procedural 3D robot mascot (Three.js 29-mesh character) with spotlight element targeting, gaze kinematics, eye-closure on password fields, and bilingual (English/Malayalam) speech synthesis.
- **Credit & Billing Engine**: Free tier (100 credits/month owned by Admin) with calendar month reset, atomic balance decrements, and Razorpay test-mode upgrade integration with server-side HMAC signature verification.
- **Universal Data Exporter**: Open-source export engine generating CSV (with UTF-8 BOM), Excel (.xlsx), Word (.docx), and PDF with embedded Unicode Noto Sans Malayalam font.
- **Conversation-Scoped Dataset Memory**: Retains the last result set in session memory to guarantee "export the last answer" works reliably without "no previous dataset" errors.
- **Multimodal Ingestion**: Open-source client and server parsers for XLSX/CSV, PDF text extraction, and screenshot OCR diagnostics.
- **Test Matrix Suite**: Unit and integration test suites covering role isolation, sequential provider failover, format exporters, guide kinematics, and billing idempotency.
