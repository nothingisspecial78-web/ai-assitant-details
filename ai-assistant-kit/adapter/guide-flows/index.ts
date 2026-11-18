import type { AdapterGuideFlowDef } from '../contract.ts';

export const referenceGuideFlows: AdapterGuideFlowDef[] = [
  {
    id: 'login-flow',
    title: 'Portal Sign-in Guide',
    triggerPhrases: ['guide me to log in', 'how do i sign in', 'login help', 'ലോഗിൻ ചെയ്യാൻ സഹായിക്കുക'],
    roles: ['public', 'student', 'manager', 'admin'],
    steps: [
      {
        id: 'login-step-role',
        route: '/login',
        selector: '[data-guide-id="role-select"]',
        instructionEn: 'Select your portal role (Student, Manager, or Admin).',
        instructionMl: 'നിങ്ങളുടെ റോൾ തിരഞ്ഞെടുക്കുക (വിദ്യാർത്ഥി, മാനേജർ, അല്ലെങ്കിൽ അഡ്മിൻ).',
        completionCondition: 'click',
      },
      {
        id: 'login-step-email',
        route: '/login',
        selector: '[data-guide-id="email-input"]',
        instructionEn: 'Enter your registered email address or admission number.',
        instructionMl: 'നിങ്ങളുടെ ഇമെയിൽ അല്ലെങ്കിൽ അഡ്മിഷൻ നമ്പർ നൽകുക.',
        completionCondition: 'input',
      },
      {
        id: 'login-step-password',
        route: '/login',
        selector: '[data-guide-id="password-input"]',
        instructionEn: 'Enter your password. I will close my eyes for privacy.',
        instructionMl: 'നിങ്ങളുടെ പാസ്‌വേഡ് നൽകുക. സ്വകാര്യതയ്ക്കായി ഞാൻ കണ്ണുകൾ അടയ്ക്കാം.',
        completionCondition: 'input',
        sensitive: true,
      },
      {
        id: 'login-step-submit',
        route: '/login',
        selector: '[data-guide-id="submit-btn"]',
        instructionEn: 'Click Sign In to access your dashboard.',
        instructionMl: 'ഡാഷ്‌ബോർഡിലേക്ക് പ്രവേശിക്കാൻ സൈൻ ഇൻ ക്ലിക്ക് ചെയ്യുക.',
        completionCondition: 'submit',
      },
    ],
  },
  {
    id: 'student-import-flow',
    title: 'Spreadsheet Student Import Guide',
    triggerPhrases: ['how to import students', 'guide import', 'സ്പ്രെഡ്ഷീറ്റ് ഇമ്പോർട്ട്'],
    roles: ['admin'],
    steps: [
      {
        id: 'import-step-open',
        route: '/admin/students',
        selector: '[data-guide-id="import-students-btn"]',
        instructionEn: 'Click here to open the spreadsheet import tool.',
        instructionMl: 'സ്പ്രെഡ്ഷീറ്റ് ഇമ്പോർട്ട് ടൂൾ തുറക്കാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക.',
        completionCondition: 'click',
      },
      {
        id: 'import-step-drop',
        route: '/admin/students/import',
        selector: '[data-guide-id="spreadsheet-dropzone"]',
        instructionEn: 'Drag and drop your Excel (.xlsx) or CSV file here.',
        instructionMl: 'നിങ്ങളുടെ എക്സൽ അല്ലെങ്കിൽ സിഎസ്വി ഫയൽ ഇവിടെ ഡ്രോപ്പ് ചെയ്യുക.',
        completionCondition: 'input',
      },
    ],
  },
];
