import type { AdapterPageDef } from '../contract.ts';

export const referencePages: AdapterPageDef[] = [
  {
    route: '/app',
    pageName: 'Student Portal Dashboard',
    description: 'Student overview showing pending dues, recent receipts, and statement.',
    guideAnchorIds: ['dues-card', 'pay-fee-btn', 'download-receipt-btn'],
    chips: [
      { id: 'c-app-1', text: 'Show my pending fee breakdown', textMl: 'എന്റെ ഫീസ് വിവരങ്ങൾ കാണിക്കുക' },
      { id: 'c-app-2', text: 'Download my latest receipt', textMl: 'എന്റെ ഏറ്റവും പുതിയ രസീത് ഡൗൺലോഡ് ചെയ്യുക' },
      { id: 'c-app-3', text: 'How do I submit fees online?', textMl: 'ഫീസ് ഓൺലൈനായി എങ്ങനെ അടയ്ക്കാം?' },
    ],
  },
  {
    route: '/m/$sectorSlug/ledger',
    pageName: 'Sector Manager Ledger',
    description: 'Sector cashbook, debit/credit transactions, and batch fee collection.',
    guideAnchorIds: ['new-entry-btn', 'ledger-table', 'export-ledger-btn'],
    chips: [
      { id: 'c-led-1', text: 'Summary of collections this week', textMl: 'ഈ ആഴ്ചയിലെ ശേഖരണ വിവരങ്ങൾ' },
      { id: 'c-led-2', text: 'Which students have negative balance?', textMl: 'നെഗറ്റീവ് ബാലൻസുള്ള വിദ്യാർത്ഥികൾ' },
      { id: 'c-led-3', text: 'Record new fee payment', textMl: 'പുതിയ ഫീസ് രേഖപ്പെടുത്തുക' },
    ],
  },
  {
    route: '/admin/students',
    pageName: 'Administrator Student Directory',
    description: 'Institution-wide student roster, fee status, and sector assignments.',
    guideAnchorIds: ['add-student-btn', 'import-students-btn', 'student-search-input'],
    chips: [
      { id: 'c-adm-1', text: 'Total overdue fees across institution', textMl: 'സ്ഥാപനത്തിലെ ആകെ കുടിശ്ശിക' },
      { id: 'c-adm-2', text: 'Export all students as Excel', textMl: 'എല്ലാ വിദ്യാർത്ഥികളെയും എക്സൽ ആയി എക്സ്പോർട്ട് ചെയ്യുക' },
      { id: 'c-adm-3', text: 'Guide me to import students', textMl: 'വിദ്യാർത്ഥികളെ ഇമ്പോർട്ട് ചെയ്യാൻ സഹായിക്കുക' },
    ],
  },
];
