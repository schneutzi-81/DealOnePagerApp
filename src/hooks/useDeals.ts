import { useState, useCallback } from 'react';
import { dealsAPI, approvalAPI, aiAPI } from '../services/api';
import type { DealOnePagerFields } from '../types';

export type DealStatus = 'draft' | 'pending_level_1' | 'pending_level_2' | 'approved' | 'rejected';

export interface DealRecord {
  id: string;
  dealNumber: string | null;
  version: number;
  status: DealStatus;
  fields: DealOnePagerFields;
  createdBy: string;
  createdByName: string;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
  approvals: Array<{
    level: number;
    approverName: string;
    approverEmail: string;
    decision: 'approved' | 'rejected';
    comments?: string;
    decidedAt: string;
  }>;
  blobUrl: string | null;
}

export function useDeals() {
  const [deals, setDeals] = useState<DealRecord[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<DealRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDeals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await dealsAPI.list();
      setDeals(response.deals as unknown as DealRecord[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPendingApprovals = useCallback(async () => {
    try {
      const response = await approvalAPI.listPending();
      setPendingApprovals(response.deals as unknown as DealRecord[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load approvals');
    }
  }, []);

  const saveDeal = useCallback(async (fields: DealOnePagerFields, dealId?: string) => {
    setError(null);
    try {
      if (dealId) {
        const response = await dealsAPI.update(dealId, fields as unknown as Record<string, unknown>);
        return response.deal as unknown as DealRecord;
      } else {
        const response = await dealsAPI.create(fields as unknown as Record<string, unknown>);
        return response.deal as unknown as DealRecord;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save deal');
      return null;
    }
  }, []);

  const submitForApproval = useCallback(async (dealId: string) => {
    setError(null);
    try {
      const response = await approvalAPI.submit(dealId);
      return response.deal as unknown as DealRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
      return null;
    }
  }, []);

  const approveDeal = useCallback(async (dealId: string, decision: 'approved' | 'rejected', comments?: string) => {
    setError(null);
    try {
      const response = await approvalAPI.approve(dealId, decision, comments);
      return response.deal as unknown as DealRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process approval');
      return null;
    }
  }, []);

  const extractWithAI = useCallback(async (file: File) => {
    setError(null);
    try {
      const response = await aiAPI.extractFields(file);
      return response.suggestions as unknown as Partial<DealOnePagerFields>;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI extraction failed');
      return null;
    }
  }, []);

  return {
    deals,
    pendingApprovals,
    isLoading,
    error,
    loadDeals,
    loadPendingApprovals,
    saveDeal,
    submitForApproval,
    approveDeal,
    extractWithAI,
  };
}
