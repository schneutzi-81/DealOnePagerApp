import { useEffect, useState } from 'react';
import { useDeals, type DealRecord, type DealStatus } from '../hooks/useDeals';

interface ApprovalDashboardProps {
  onEditDeal: (deal: DealRecord) => void;
}

const STATUS_LABELS: Record<DealStatus, string> = {
  draft: 'Draft',
  pending_level_1: 'Pending Manager',
  pending_level_2: 'Pending Director',
  approved: 'Approved',
  rejected: 'Rejected',
};

const STATUS_COLORS: Record<DealStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending_level_1: 'bg-amber-100 text-amber-800',
  pending_level_2: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export function ApprovalDashboard({ onEditDeal }: ApprovalDashboardProps) {
  const { deals, pendingApprovals, isLoading, error, loadDeals, loadPendingApprovals, approveDeal } = useDeals();
  const [activeSection, setActiveSection] = useState<'my-deals' | 'pending' | 'history'>('my-deals');
  const [approvalComments, setApprovalComments] = useState('');

  useEffect(() => {
    loadDeals();
    loadPendingApprovals();
  }, [loadDeals, loadPendingApprovals]);

  const myDrafts = deals.filter(d => d.status === 'draft' || d.status === 'rejected');
  const myPending = deals.filter(d => d.status === 'pending_level_1' || d.status === 'pending_level_2');
  const myApproved = deals.filter(d => d.status === 'approved');

  const handleApproval = async (dealId: string, decision: 'approved' | 'rejected') => {
    await approveDeal(dealId, decision, approvalComments || undefined);
    setApprovalComments('');
    loadPendingApprovals();
    loadDeals();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--coral)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border-l-4 border-[var(--coral)] bg-white px-4 py-3 text-sm text-[var(--near-black)]">
          ⚠ {error}
        </div>
      )}

      {/* Section tabs */}
      <div className="flex gap-2">
        {([
          { key: 'my-deals', label: 'My Deals', count: myDrafts.length + myPending.length },
          { key: 'pending', label: 'Pending Approvals', count: pendingApprovals.length },
          { key: 'history', label: 'Approved', count: myApproved.length },
        ] as const).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeSection === key
                ? 'bg-[var(--near-black)] text-white'
                : 'bg-[var(--light-silver)] text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
            {count > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--coral)] text-xs text-white">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* My Deals */}
      {activeSection === 'my-deals' && (
        <div className="space-y-3">
          {myDrafts.length === 0 && myPending.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              No deals yet. Create one from the Edit tab.
            </p>
          ) : (
            [...myDrafts, ...myPending].map(deal => (
              <DealCard key={deal.id} deal={deal} onEdit={() => onEditDeal(deal)} />
            ))
          )}
        </div>
      )}

      {/* Pending Approvals */}
      {activeSection === 'pending' && (
        <div className="space-y-3">
          {pendingApprovals.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              No deals pending your approval.
            </p>
          ) : (
            pendingApprovals.map(deal => (
              <div key={deal.id} className="rounded-xl border border-[var(--soft-gray)] bg-white p-4">
                <DealCard deal={deal} />
                <div className="mt-4 space-y-3 border-t border-[var(--soft-gray)] pt-4">
                  <textarea
                    placeholder="Comments (optional)"
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                    className="w-full rounded-lg border border-[var(--soft-gray)] px-3 py-2 text-sm"
                    rows={2}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproval(deal.id, 'approved')}
                      className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleApproval(deal.id, 'rejected')}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Approved History */}
      {activeSection === 'history' && (
        <div className="space-y-3">
          {myApproved.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              No approved deals yet.
            </p>
          ) : (
            myApproved.map(deal => (
              <DealCard key={deal.id} deal={deal} showApprovalChain />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function DealCard({ deal, onEdit, showApprovalChain }: { deal: DealRecord; onEdit?: () => void; showApprovalChain?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[var(--soft-gray)] bg-white p-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <h3 className="truncate text-sm font-semibold text-[var(--near-black)]">
            {deal.fields.dealName || deal.fields.customerName || 'Untitled Deal'}
          </h3>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[deal.status]}`}>
            {STATUS_LABELS[deal.status]}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-4 text-xs text-gray-400">
          {deal.dealNumber && <span className="font-mono">{deal.dealNumber}</span>}
          <span>{new Date(deal.updatedAt).toLocaleDateString()}</span>
          {deal.fields.company && <span>{deal.fields.company}</span>}
        </div>
        {showApprovalChain && deal.approvals.length > 0 && (
          <div className="mt-2 space-y-1">
            {deal.approvals.map((a, i) => (
              <div key={i} className="text-xs text-gray-500">
                Level {a.level}: {a.approverName} — {a.decision} ({new Date(a.decidedAt).toLocaleDateString()})
                {a.comments && <span className="italic"> "{a.comments}"</span>}
              </div>
            ))}
          </div>
        )}
      </div>
      {onEdit && (
        <button
          onClick={onEdit}
          className="ml-4 rounded-lg border border-[var(--soft-gray)] px-3 py-1.5 text-xs font-medium text-[var(--near-black)] hover:bg-[var(--light-silver)]"
        >
          Edit
        </button>
      )}
    </div>
  );
}
