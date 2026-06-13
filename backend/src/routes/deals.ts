import { Router, Request, Response } from 'express';
import { storageService } from '../services/storage.js';
import { CreateDealRequest, UpdateDealRequest } from '../models/deal.js';

export const dealsRouter = Router();

// List all deals for current user
dealsRouter.get('/', async (req: Request, res: Response) => {
  const deals = await storageService.listDeals(req.user!.oid);
  res.json({ deals });
});

// Get single deal
dealsRouter.get('/:id', async (req: Request, res: Response) => {
  const deal = await storageService.getDealById(req.params.id as string);
  if (!deal) {
    res.status(404).json({ error: 'Deal not found' });
    return;
  }
  res.json({ deal });
});

// Create new deal
dealsRouter.post('/', async (req: Request, res: Response) => {
  const parsed = CreateDealRequest.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  const deal = await storageService.createDeal(parsed.data.fields, {
    oid: req.user!.oid,
    name: req.user!.name,
    email: req.user!.email,
  });

  res.status(201).json({ deal });
});

// Update deal fields (only if draft or rejected)
dealsRouter.patch('/:id', async (req: Request, res: Response) => {
  const deal = await storageService.getDeal(req.params.id as string, req.user!.oid);
  if (!deal) {
    res.status(404).json({ error: 'Deal not found' });
    return;
  }

  if (deal.status !== 'draft' && deal.status !== 'rejected') {
    res.status(409).json({ error: 'Cannot edit a deal that is pending or approved' });
    return;
  }

  const parsed = UpdateDealRequest.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    return;
  }

  deal.fields = { ...deal.fields, ...parsed.data.fields };
  await storageService.updateDeal(deal);
  res.json({ deal });
});

// Delete deal (only drafts)
dealsRouter.delete('/:id', async (req: Request, res: Response) => {
  const deal = await storageService.getDeal(req.params.id as string, req.user!.oid);
  if (!deal) {
    res.status(404).json({ error: 'Deal not found' });
    return;
  }

  if (deal.status !== 'draft') {
    res.status(409).json({ error: 'Only draft deals can be deleted' });
    return;
  }

  // Soft delete: just mark status (or we could hard delete from table)
  deal.status = 'rejected';
  await storageService.updateDeal(deal);
  res.status(204).send();
});
