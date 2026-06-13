import { Router, Request, Response } from 'express';
import { storageService } from '../services/storage.js';
import { SubmitForApprovalRequest, ApprovalActionRequest } from '../models/deal.js';
import type { ApprovalRecord } from '../models/deal.js';

export const approvalRouter = Router();

// Submit a deal for approval (owner only)
approvalRouter.post('/:id/submit', async (req: Request, res: Response) => {
  const deal = await storageService.getDeal(req.params.id, req.user!.oid);
  if (!deal) {
    res.status(404).json({ error: 'Deal not found' });
    return;
  }

  if (deal.status !== 'draft' && deal.status !== 'rejected') {
    res.status(409).json({ error: 'Deal must be in draft or rejected state to submit' });
    return;
  }

  const parsed = SubmitForApprovalRequest.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const updated = await storageService.submitForApproval(deal);
  res.json({ deal: updated, message: 'Deal submitted for Level 1 approval' });
});

// List deals pending approval (for approvers)
approvalRouter.get('/pending', async (req: Request, res: Response) => {
  // In production, filter by who can approve at which level (role-based)
  const deals = await storageService.listPendingApprovals();
  res.json({ deals });
});

// Approve or reject a deal (approver action)
approvalRouter.post('/:id/approve', async (req: Request, res: Response) => {
  const deal = await storageService.getDealById(req.params.id);
  if (!deal) {
    res.status(404).json({ error: 'Deal not found' });
    return;
  }

  if (deal.status !== 'pending_level_1' && deal.status !== 'pending_level_2') {
    res.status(409).json({ error: 'Deal is not pending approval' });
    return;
  }

  // Prevent self-approval
  if (deal.createdBy === req.user!.oid) {
    res.status(403).json({ error: 'Cannot approve your own deal' });
    return;
  }

  const parsed = ApprovalActionRequest.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const level = deal.status === 'pending_level_1' ? 1 : 2;

  const approval: ApprovalRecord = {
    level,
    approverOid: req.user!.oid,
    approverName: req.user!.name,
    approverEmail: req.user!.email,
    decision: parsed.data.decision,
    comments: parsed.data.comments,
    decidedAt: new Date().toISOString(),
  };

  const updated = await storageService.recordApproval(deal, approval);

  const message = parsed.data.decision === 'approved'
    ? (level === 2 ? `Deal fully approved as ${updated.dealNumber}` : 'Level 1 approved, pending Level 2')
    : 'Deal rejected';

  res.json({ deal: updated, message });
});
