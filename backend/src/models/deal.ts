import { z } from 'zod';

// Approval status flows: draft → pending_level_1 → pending_level_2 → approved | rejected
export const DealStatus = z.enum([
  'draft',
  'pending_level_1',
  'pending_level_2',
  'approved',
  'rejected',
]);
export type DealStatus = z.infer<typeof DealStatus>;

export const ApprovalDecision = z.enum(['approved', 'rejected']);
export type ApprovalDecision = z.infer<typeof ApprovalDecision>;

export const ApprovalRecord = z.object({
  level: z.number().min(1).max(2),
  approverOid: z.string(),
  approverName: z.string(),
  approverEmail: z.string(),
  decision: ApprovalDecision,
  comments: z.string().optional(),
  decidedAt: z.string().datetime(),
});
export type ApprovalRecord = z.infer<typeof ApprovalRecord>;

// Table row for a deal in a pipe-delimited field (risks, stakeholders, commercials)
export const TableRow = z.object({
  cells: z.array(z.string()),
});
export type TableRow = z.infer<typeof TableRow>;

export const DealFields = z.object({
  dealName: z.string().default(''),
  customerName: z.string().default(''),
  opportunityId: z.string().default(''),
  company: z.string().default(''),
  industry: z.string().default(''),
  tcv: z.string().default(''),
  cm1: z.string().default(''),
  timeline: z.string().default(''),
  executiveSummary: z.string().default(''),
  scopeOfWork: z.string().default(''),
  solution: z.string().default(''),
  pricingOverview: z.string().default(''),
  risks: z.array(TableRow).default([]),
  stakeholdersCustomer: z.array(TableRow).default([]),
  stakeholdersInternal: z.array(TableRow).default([]),
  commercials: z.array(TableRow).default([]),
  nextSteps: z.string().default(''),
  notes: z.string().default(''),
});
export type DealFields = z.infer<typeof DealFields>;

export const Deal = z.object({
  id: z.string().uuid(),
  dealNumber: z.string().nullable(), // DOP-2026-0001 (assigned on first approval)
  version: z.number().int().positive(),
  status: DealStatus,
  fields: DealFields,
  createdBy: z.string(),
  createdByName: z.string(),
  createdByEmail: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  approvals: z.array(ApprovalRecord).default([]),
  blobUrl: z.string().nullable(), // URL to approved PDF in Blob Storage
});
export type Deal = z.infer<typeof Deal>;

// API request schemas
export const CreateDealRequest = z.object({
  fields: DealFields,
});

export const UpdateDealRequest = z.object({
  fields: DealFields.partial(),
});

export const SubmitForApprovalRequest = z.object({
  // Optional message to approver
  message: z.string().optional(),
});

export const ApprovalActionRequest = z.object({
  decision: ApprovalDecision,
  comments: z.string().optional(),
});
