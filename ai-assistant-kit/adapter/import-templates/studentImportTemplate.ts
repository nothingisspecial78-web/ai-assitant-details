import type { AdapterImportTemplateDef } from '../contract.ts';

export const studentImportTemplate: AdapterImportTemplateDef = {
  id: 'students-template',
  label: 'Student Spreadsheet Import Template',
  allowedRoles: ['admin'],
  columns: [
    { key: 'id', label: 'Admission Number', type: 'string', required: true },
    { key: 'name', label: 'Student Full Name', type: 'string', required: true },
    { key: 'className', label: 'Class / Grade', type: 'string', required: true },
    { key: 'phone', label: 'Contact Phone Number', type: 'string', required: false },
    { key: 'guardian', label: 'Guardian Name', type: 'string', required: false },
    { key: 'pendingFee', label: 'Initial Due Amount', type: 'currency', required: false },
  ],
};
