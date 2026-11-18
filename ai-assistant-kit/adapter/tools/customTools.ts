import type { AdapterToolDef } from '../contract.ts';

export const referenceCustomTools: AdapterToolDef[] = [
  {
    name: 'summarize_finance',
    description: 'Calculates total collections, pending dues, and net balances for the active scope.',
    roles: ['admin', 'manager'],
    risk: 'read',
    needsConfirmation: false,
    parameters: {
      sectorId: { type: 'string', description: 'Optional sector identifier filter' },
    },
    handler: async (args, ctx) => {
      return {
        ok: true,
        summary: `Financial summary calculated for ${args.sectorId || ctx.organizationId || 'organization'}.`,
        data: { totalBilled: 1250000, totalCollected: 980000, pendingDues: 270000 },
      };
    },
  },
  {
    name: 'create_entry',
    description: 'Records a new ledger transaction. Destructive/write tool that requires interactive confirmation preview.',
    roles: ['admin', 'manager'],
    risk: 'write',
    needsConfirmation: true,
    parameters: {
      type: { type: 'string', description: 'Transaction type (credit or debit)', required: true },
      amount: { type: 'number', description: 'Monetary amount', required: true },
      studentId: { type: 'string', description: 'Student admission number' },
      notes: { type: 'string', description: 'Transaction notes' },
    },
    handler: async (args, ctx) => {
      return {
        ok: true,
        summary: `Successfully recorded ${args.type} entry of ₹${args.amount} for student ${args.studentId || 'general'}.`,
        data: { receiptNumber: `REC-${Date.now().toString().slice(-4)}`, amount: args.amount },
      };
    },
  },
];
