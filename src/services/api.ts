import { getAccessToken } from './auth';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function fetchAPI<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

// ─── Deals API ─────────────────────────────────────

export interface DealResponse {
  deal: Record<string, unknown>;
}

export interface DealsListResponse {
  deals: Record<string, unknown>[];
}

export const dealsAPI = {
  list: () => fetchAPI<DealsListResponse>('/deals'),

  get: (id: string) => fetchAPI<DealResponse>(`/deals/${id}`),

  create: (fields: Record<string, unknown>) =>
    fetchAPI<DealResponse>('/deals', {
      method: 'POST',
      body: JSON.stringify({ fields }),
    }),

  update: (id: string, fields: Record<string, unknown>) =>
    fetchAPI<DealResponse>(`/deals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ fields }),
    }),

  delete: (id: string) =>
    fetchAPI<void>(`/deals/${id}`, { method: 'DELETE' }),
};

// ─── Approval API ──────────────────────────────────

export const approvalAPI = {
  submit: (id: string, message?: string) =>
    fetchAPI<DealResponse>(`/deals/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  listPending: () => fetchAPI<DealsListResponse>('/deals/pending'),

  approve: (id: string, decision: 'approved' | 'rejected', comments?: string) =>
    fetchAPI<DealResponse>(`/deals/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ decision, comments }),
    }),
};

// ─── AI API ────────────────────────────────────────

export interface AISuggestionsResponse {
  suggestions: Record<string, unknown>;
  message: string;
}

export const aiAPI = {
  extractFields: async (file: File): Promise<AISuggestionsResponse> => {
    const token = await getAccessToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/ai/extract`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `AI extraction failed: ${response.status}`);
    }

    return response.json();
  },
};
