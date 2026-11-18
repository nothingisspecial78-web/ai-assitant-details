import { defineAssistantAdapter } from './contract.ts';
import { allReferenceEntities } from './entities/index.ts';
import { referencePages } from './pages/pageConfigs.ts';
import { referenceGuideFlows } from './guide-flows/index.ts';
import { referenceCustomTools } from './tools/customTools.ts';
import { referenceExportDefinitions } from './export-definitions/exportDefs.ts';
import { studentImportTemplate } from './import-templates/studentImportTemplate.ts';

/**
 * MASTER REFERENCE APPLICATION ADAPTER: Khazna Campus Ledger
 * Fully worked example implementing all 12 keys of the AssistantKitAdapter contract.
 */
export const khaznaAdapter = defineAssistantAdapter({
  // 1. App identity & visual theme tokens
  app: {
    id: 'khazna-ledger',
    name: 'Khazna Campus Ledger',
    shortDescription: 'Multi-tenant campus fee tracking, sector ledgers, and student accounts.',
    logo: '/favicon.svg',
    languages: ['en', 'ml'],
    defaultLocale: 'en',
    tone: 'helpful, accurate, and concise',
    theme: {
      mode: 'light',
      colors: {
        primary: '#0ea5e9',
        primaryText: '#ffffff',
        accent: '#f97316',
        surface: '#ffffff',
        background: '#f8fafc',
        text: '#0f172a',
        textMuted: '#64748b',
        border: '#e2e8f0',
      },
      radii: { sm: '4px', md: '8px', lg: '12px', full: '9999px' },
      fonts: {
        body: 'system-ui, -apple-system, sans-serif',
        heading: 'inherit',
        mono: 'ui-monospace, monospace',
      },
      launcher: {
        position: 'bottom-right',
        label: 'Ask AI Assistant',
      },
    },
    personalizationExamples: {
      displayNamePlaceholder: 'e.g. Principal Razak, Safwan K.',
      instructionsPlaceholder: 'e.g. prioritize overdue balances, format in INR',
    },
  },

  // 2. Authentication & verified session extractor
  auth: {
    mode: 'custom',
    headerName: 'authorization',
    orgField: 'organizationId',
    roleField: 'role',
    userIdField: 'id',
    extractSession: (reqOrState) => {
      if (!reqOrState) return null;
      const user = (reqOrState.user as Record<string, unknown>) || {};
      const appState = (reqOrState.appState as Record<string, unknown>) || {};
      return {
        userId: String(user.id || appState.userId || 'anonymous'),
        role: String(user.role || appState.role || 'student').toLowerCase(),
        organizationId: String(user.organizationId || appState.activeOrgId || 'demo'),
        sectorId: (user.sectorId || appState.managerSector) as string | undefined,
        assignedSectors: (user.assignedSectors || (appState.managerSector ? [appState.managerSector] : [])) as string[],
        email: user.email as string | undefined,
        displayName: (user.displayName || user.name) as string | undefined,
      };
    },
  },

  // 3. Role hierarchy (Level 0 highest)
  roles: [
    {
      id: 'super_admin',
      label: 'Platform Super Admin',
      level: 0,
      scopeDescription: 'Sees platform-wide metrics, cross-tenant college summaries, and audit numbers.',
    },
    {
      id: 'admin',
      label: 'Institution Administrator',
      level: 1,
      scopeDescription: 'Full access to all sectors, classes, staff, and students within own institution.',
    },
    {
      id: 'manager',
      label: 'Sector Manager',
      level: 2,
      scopeDescription: 'Access restricted strictly to assigned sector ledgers, batches, and students.',
    },
    {
      id: 'student',
      label: 'Enrolled Student',
      level: 3,
      scopeDescription: 'Access restricted strictly to own admission number, fees, receipts, and balances.',
    },
  ],

  // 4. Entities registry with scope predicates and live handlers
  entities: allReferenceEntities,

  // 5. Pages, possible actions, and 3 suggestion chips per page
  pages: referencePages,

  // 6. Interactive step-by-step 3D avatar guide flows
  guideFlows: referenceGuideFlows,

  // 7. Custom action tools
  tools: referenceCustomTools,

  // 8a. Spreadsheet import templates
  importTemplates: [studentImportTemplate],

  // 8b. Export file definitions
  exportDefinitions: referenceExportDefinitions,

  // 9. Credits rules (100 free credits/month, Admin owned)
  credits: {
    freeMonthlyAllowance: 100,
    ownerRole: 'admin',
    resetCycle: 'monthly',
    allowNonAdminOnFree: false,
    costs: {
      chat: 1,
      toolCall: 2,
      attachment: 3,
      export: 2,
      import: 5,
    },
  },

  // 10. Upgrade plans
  plans: {
    currency: 'INR',
    monthlyPrice: 1999,
    annualPrice: 19990,
    freeFeatures: [
      '100 AI credits per month',
      'Administrator access only',
      'Standard chat assistance',
    ],
    premiumFeatures: [
      'Unlimited AI credits for all staff and students',
      'Sector Manager ledger assistance',
      'Student portal self-service fee queries',
      'Automated spreadsheet imports & exports',
      'Interactive 3D avatar walkthrough guides',
    ],
  },

  // 11. Multi-provider configuration
  providers: {
    order: ['openrouter', 'gemini', 'groq'],
    models: {
      openrouter: {
        fast: 'google/gemini-2.5-flash',
        strong: 'google/gemini-2.5-pro',
        vision: 'google/gemini-2.5-flash',
      },
      gemini: {
        fast: 'gemini-2.5-flash',
        strong: 'gemini-2.5-pro',
        vision: 'gemini-2.5-flash',
      },
      groq: {
        fast: 'llama-3.3-70b-versatile',
        strong: 'llama-3.3-70b-versatile',
      },
    },
    timeoutMs: 15000,
    retriesPerProvider: 2,
  },

  // 12. Scope guard description and polite refusal
  scopeGuard: {
    appTopicDescription:
      'Khazna Campus Ledger fees, sector cashbooks, student records, fee receipts, and portal walkthroughs.',
    allowedPublicTopics: ['login help', 'institution registration', 'student fee overview'],
    offTopicRefusal:
      'I can only assist with questions regarding Khazna Campus Ledger, campus fee records, and portal navigation. How may I help you with the campus system?',
  },
});
