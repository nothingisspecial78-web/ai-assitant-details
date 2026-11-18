import test from 'node:test';
import assert from 'node:assert/strict';
import { studentEntity, sectorEntity } from '../../adapter/entities/index.ts';

test('Role Scoping: Student cannot access other student records', () => {
  const student1 = { id: 'S0125', organizationId: 'org-1', sectorId: 'dept-fiqh' };
  const student2 = { id: 'S0126', organizationId: 'org-1', sectorId: 'dept-fiqh' };

  const ctxStudent1 = { userId: 'S0125', role: 'student', organizationId: 'org-1' };

  const canReadOwn = studentEntity.scopePredicates?.STUDENT(ctxStudent1, student1);
  const canReadOther = studentEntity.scopePredicates?.STUDENT(ctxStudent1, student2);

  assert.equal(canReadOwn, true, 'Student must be able to read own record');
  assert.equal(canReadOther, false, 'Student must be blocked from reading other student record');
});

test('Role Scoping: Sector Manager restricted to assigned sector', () => {
  const fiqhSector = { slug: 'dept-fiqh', organizationId: 'org-1' };
  const hadithSector = { slug: 'dept-hadith', organizationId: 'org-1' };

  const ctxFiqhManager = {
    userId: 'mgr-1',
    role: 'manager',
    organizationId: 'org-1',
    assignedSectors: ['dept-fiqh'],
  };

  const canReadAssigned = sectorEntity.scopePredicates?.SECTOR_MANAGER(ctxFiqhManager, fiqhSector);
  const canReadUnassigned = sectorEntity.scopePredicates?.SECTOR_MANAGER(ctxFiqhManager, hadithSector);

  assert.equal(canReadAssigned, true, 'Manager must be able to read assigned sector');
  assert.equal(canReadUnassigned, false, 'Manager must be blocked from reading unassigned sector');
});

test('Role Scoping: Admin sees all records within own organization, blocked from other organizations', () => {
  const ownStudent = { id: 'S0125', organizationId: 'org-1', sectorId: 'dept-fiqh' };
  const otherOrgStudent = { id: 'S9999', organizationId: 'org-2', sectorId: 'dept-fiqh' };

  const ctxAdmin = { userId: 'admin-1', role: 'admin', organizationId: 'org-1' };

  const canReadOwn = studentEntity.scopePredicates?.ADMIN(ctxAdmin, ownStudent);
  const canReadOtherOrg = studentEntity.scopePredicates?.ADMIN(ctxAdmin, otherOrgStudent);

  assert.equal(canReadOwn, true, 'Admin must see own organization student');
  assert.equal(canReadOtherOrg, false, 'Admin must NOT see another organization student');
});
