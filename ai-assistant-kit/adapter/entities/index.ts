import type { AdapterEntityDef } from '../contract.ts';

export const studentEntity: AdapterEntityDef = {
  name: 'student',
  label: 'Student',
  pluralLabel: 'students',
  collection: 'students',
  idField: 'id',
  nameField: 'name',
  nameLabel: 'Full Name',
  defaultExportColumns: ['id', 'name', 'className', 'phone', 'pendingFee', 'balance'],
  sensitiveFields: ['password', 'passwordHash', 'token', 'secret', 'internalId'],
  orgField: 'organizationId',
  sectorField: 'sectorId',
  ownerIdField: 'id',
  searchableFields: ['name', 'id', 'phone', 'email', 'className', 'guardian', 'sectorId'],
  fields: [
    { key: 'id', label: 'Admission No', type: 'string', required: true, searchable: true },
    { key: 'name', label: 'Full Name', type: 'string', required: true, searchable: true },
    { key: 'className', label: 'Class', type: 'string', searchable: true },
    { key: 'phone', label: 'Phone', type: 'string', searchable: true },
    { key: 'email', label: 'Email', type: 'string', searchable: true },
    { key: 'pendingFee', label: 'Pending Fee', type: 'currency' },
    { key: 'balance', label: 'Net Balance', type: 'currency' },
    { key: 'guardian', label: 'Guardian', type: 'string', detail: true },
    { key: 'paidTotal', label: 'Total Paid', type: 'currency', detail: true },
    { key: 'debitTotal', label: 'Total Billed', type: 'currency', detail: true },
    { key: 'joined', label: 'Joined', type: 'date', detail: true },
  ],
  displayFields: [
    { key: 'className', label: 'Class' },
    { key: 'id', label: 'Admission No' },
    { key: 'phone', label: 'Phone' },
    { key: 'pendingFee', label: 'Pending Fee', format: 'currency' },
    { key: 'balance', label: 'Net Balance', format: 'currency' },
  ],
  detailFields: [
    { key: 'guardian', label: 'Guardian' },
    { key: 'email', label: 'Email' },
    { key: 'sectorId', label: 'Sector' },
    { key: 'paidTotal', label: 'Total Paid', format: 'currency' },
    { key: 'debitTotal', label: 'Total Billed', format: 'currency' },
    { key: 'joined', label: 'Joined', format: 'date' },
  ],
  visibilityRules: {
    PUBLIC: 'none',
    SUPER_ADMIN: 'all',
    ADMIN: 'org',
    SECTOR_MANAGER: 'sector',
    STUDENT: 'self',
  },
  scopePredicates: {
    SUPER_ADMIN: () => true,
    ADMIN: (ctx, rec) => !rec.organizationId || rec.organizationId === ctx.organizationId,
    SECTOR_MANAGER: (ctx, rec) =>
      (!rec.organizationId || rec.organizationId === ctx.organizationId) &&
      (!ctx.assignedSectors || ctx.assignedSectors.includes(String(rec.sectorId))),
    STUDENT: (ctx, rec) => String(rec.id) === String(ctx.userId),
  },
};

export const sectorEntity: AdapterEntityDef = {
  name: 'sector',
  label: 'Sector',
  pluralLabel: 'sectors',
  collection: 'sectors',
  idField: 'slug',
  nameField: 'name',
  searchableFields: ['name', 'slug', 'headName', 'phone'],
  fields: [
    { key: 'slug', label: 'Slug', type: 'string', required: true, searchable: true },
    { key: 'name', label: 'Sector Name', type: 'string', required: true, searchable: true },
    { key: 'headName', label: 'Head of Sector', type: 'string', searchable: true },
    { key: 'phone', label: 'Contact Phone', type: 'string', searchable: true },
    { key: 'totalBalance', label: 'Net Collection', type: 'currency' },
  ],
  displayFields: [
    { key: 'slug', label: 'Slug' },
    { key: 'name', label: 'Sector Name' },
    { key: 'headName', label: 'Head' },
    { key: 'totalBalance', label: 'Balance', format: 'currency' },
  ],
  visibilityRules: {
    PUBLIC: 'none',
    SUPER_ADMIN: 'all',
    ADMIN: 'org',
    SECTOR_MANAGER: 'sector',
    STUDENT: 'none',
  },
  scopePredicates: {
    SUPER_ADMIN: () => true,
    ADMIN: (ctx, rec) => !rec.organizationId || rec.organizationId === ctx.organizationId,
    SECTOR_MANAGER: (ctx, rec) =>
      (!rec.organizationId || rec.organizationId === ctx.organizationId) &&
      (!ctx.assignedSectors || ctx.assignedSectors.includes(String(rec.slug))),
    STUDENT: () => false,
  },
};

export const allReferenceEntities: AdapterEntityDef[] = [studentEntity, sectorEntity];
