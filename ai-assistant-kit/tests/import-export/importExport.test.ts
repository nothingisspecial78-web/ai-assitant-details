import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeExportFormat, buildExportSlug } from '../../../packages/server/src/tools/exportTools.ts';

test('Export Format Normalization: Handles valid, synonym, and case variants', () => {
  assert.equal(normalizeExportFormat('excel').format, 'xlsx');
  assert.equal(normalizeExportFormat('spreadsheet').format, 'xlsx');
  assert.equal(normalizeExportFormat('word').format, 'docx');
  assert.equal(normalizeExportFormat('PDF').format, 'pdf');
  assert.equal(normalizeExportFormat('csv').format, 'csv');
});

test('Export Slug Builder: Generates deterministic dated filenames', () => {
  const filename = buildExportSlug('Students Report', 'pdf');
  assert.ok(filename.startsWith('students-report-'));
  assert.ok(filename.endsWith('.pdf'));
});
