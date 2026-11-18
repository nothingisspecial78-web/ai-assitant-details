import type { AdapterExportDef } from '../contract.ts';

export const referenceExportDefinitions: AdapterExportDef[] = [
  {
    id: 'students-export',
    entity: 'student',
    title: 'Student Roster and Fee Statement',
    filenamePrefix: 'students_report',
    formats: ['csv', 'xlsx', 'pdf', 'docx'],
    allowedRoles: ['admin', 'manager'],
    supportsUnicodePdf: true,
    columns: [
      { key: 'id', label: 'Admission No', format: 'text' },
      { key: 'name', label: 'Student Name', format: 'text' },
      { key: 'className', label: 'Class', format: 'text' },
      { key: 'phone', label: 'Phone', format: 'text' },
      { key: 'pendingFee', label: 'Pending Fee (₹)', format: 'currency' },
      { key: 'balance', label: 'Balance (₹)', format: 'currency' },
    ],
  },
];
