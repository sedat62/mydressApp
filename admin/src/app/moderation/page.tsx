'use client';

import { useState, useMemo } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Ban,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Flag,
  User,
} from 'lucide-react';
import { cn, formatDate, timeAgo } from '@/lib/utils';

interface ReportedPost {
  id: string;
  postId: string;
  reporterName: string;
  reporterAvatar: string;
  targetUserName: string;
  targetUserAvatar: string;
  productName: string;
  productColor: string;
  reason: string;
  status: 'pending' | 'approved' | 'removed';
  reportedAt: string;
  reviewedAt?: string;
}

interface ModerationLogEntry {
  id: string;
  date: string;
  moderator: string;
  action: string;
  targetUser: string;
  reason: string;
}

const MOCK_REPORTS: ReportedPost[] = [
  {
    id: 'r1',
    postId: 'p101',
    reporterName: 'Sarah Chen',
    reporterAvatar: 'SC',
    targetUserName: 'Jake Morrison',
    targetUserAvatar: 'JM',
    productName: 'Sheer Lace Bodysuit',
    productColor: '#f43f5e',
    reason: 'Inappropriate',
    status: 'pending',
    reportedAt: '2026-03-24T09:15:00Z',
  },
  {
    id: 'r2',
    postId: 'p102',
    reporterName: 'Marcus Johnson',
    reporterAvatar: 'MJ',
    targetUserName: 'Tommy Wilson',
    targetUserAvatar: 'TW',
    productName: 'Supreme Box Logo Tee (Fake)',
    productColor: '#ef4444',
    reason: 'Misleading',
    status: 'pending',
    reportedAt: '2026-03-24T08:30:00Z',
  },
  {
    id: 'r3',
    postId: 'p103',
    reporterName: 'Aisha Patel',
    reporterAvatar: 'AP',
    targetUserName: 'Ryan Foster',
    targetUserAvatar: 'RF',
    productName: 'Vintage Denim Jacket',
    productColor: '#3b82f6',
    reason: 'Spam',
    status: 'pending',
    reportedAt: '2026-03-24T07:45:00Z',
  },
  {
    id: 'r4',
    postId: 'p104',
    reporterName: 'Elena Rodriguez',
    reporterAvatar: 'ER',
    targetUserName: 'David Kim',
    targetUserAvatar: 'DK',
    productName: 'Oversized Graphic Hoodie',
    productColor: '#8b5cf6',
    reason: 'Harassment',
    status: 'removed',
    reportedAt: '2026-03-23T16:20:00Z',
    reviewedAt: '2026-03-23T17:05:00Z',
  },
  {
    id: 'r5',
    postId: 'p105',
    reporterName: 'David Kim',
    reporterAvatar: 'DK',
    targetUserName: 'Olivia Bennett',
    targetUserAvatar: 'OB',
    productName: 'Silk Midi Skirt',
    productColor: '#ec4899',
    reason: 'Inappropriate',
    status: 'approved',
    reportedAt: '2026-03-23T14:10:00Z',
    reviewedAt: '2026-03-23T15:30:00Z',
  },
  {
    id: 'r6',
    postId: 'p106',
    reporterName: 'Nina Kowalski',
    reporterAvatar: 'NK',
    targetUserName: 'Jake Morrison',
    targetUserAvatar: 'JM',
    productName: 'Leather Biker Jacket',
    productColor: '#78716c',
    reason: 'Spam',
    status: 'pending',
    reportedAt: '2026-03-23T11:55:00Z',
  },
  {
    id: 'r7',
    postId: 'p107',
    reporterName: 'Olivia Bennett',
    reporterAvatar: 'OB',
    targetUserName: 'Marcus Johnson',
    targetUserAvatar: 'MJ',
    productName: 'Running Sneakers Pro',
    productColor: '#10b981',
    reason: 'Other',
    status: 'approved',
    reportedAt: '2026-03-22T19:40:00Z',
    reviewedAt: '2026-03-23T09:00:00Z',
  },
  {
    id: 'r8',
    postId: 'p108',
    reporterName: 'Ryan Foster',
    reporterAvatar: 'RF',
    targetUserName: 'Nina Kowalski',
    targetUserAvatar: 'NK',
    productName: 'Floral Wrap Dress',
    productColor: '#f59e0b',
    reason: 'Misleading',
    status: 'removed',
    reportedAt: '2026-03-22T10:25:00Z',
    reviewedAt: '2026-03-22T12:15:00Z',
  },
  {
    id: 'r9',
    postId: 'p109',
    reporterName: 'Tommy Wilson',
    reporterAvatar: 'TW',
    targetUserName: 'Sarah Chen',
    targetUserAvatar: 'SC',
    productName: 'Cashmere Crewneck Sweater',
    productColor: '#6366f1',
    reason: 'Harassment',
    status: 'pending',
    reportedAt: '2026-03-23T20:00:00Z',
  },
  {
    id: 'r10',
    postId: 'p110',
    reporterName: 'Jake Morrison',
    reporterAvatar: 'JM',
    targetUserName: 'Aisha Patel',
    targetUserAvatar: 'AP',
    productName: 'Canvas Tote Bag',
    productColor: '#0ea5e9',
    reason: 'Spam',
    status: 'approved',
    reportedAt: '2026-03-21T15:30:00Z',
    reviewedAt: '2026-03-21T17:00:00Z',
  },
];

const INITIAL_LOG: ModerationLogEntry[] = [
  { id: 'l1', date: '2026-03-23T17:05:00Z', moderator: 'Admin', action: 'Removed post', targetUser: 'David Kim', reason: 'Harassment in caption' },
  { id: 'l2', date: '2026-03-23T15:30:00Z', moderator: 'Admin', action: 'Dismissed report', targetUser: 'Olivia Bennett', reason: 'Content is appropriate' },
  { id: 'l3', date: '2026-03-23T09:00:00Z', moderator: 'Admin', action: 'Dismissed report', targetUser: 'Marcus Johnson', reason: 'No violation found' },
  { id: 'l4', date: '2026-03-22T12:15:00Z', moderator: 'Admin', action: 'Removed post', targetUser: 'Nina Kowalski', reason: 'Misleading product image' },
  { id: 'l5', date: '2026-03-21T17:00:00Z', moderator: 'Admin', action: 'Dismissed report', targetUser: 'Aisha Patel', reason: 'Duplicate spam report' },
];

const REASON_OPTIONS = ['Inappropriate', 'Spam', 'Misleading', 'Harassment', 'Other'] as const;

type StatusTab = 'all' | 'pending' | 'approved' | 'removed';

const STATUS_TABS: { value: StatusTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'removed', label: 'Removed' },
];

function StatusBadge({ status }: { status: ReportedPost['status'] }) {
  const styles: Record<ReportedPost['status'], string> = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    removed: 'bg-red-50 text-red-700 ring-red-200',
  };
  const icons: Record<ReportedPost['status'], React.ReactNode> = {
    pending: <Clock className="h-3 w-3" />,
    approved: <CheckCircle2 className="h-3 w-3" />,
    removed: <Trash2 className="h-3 w-3" />,
  };
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset', styles[status])}>
      {icons[status]}
      {status}
    </span>
  );
}

function ReasonBadge({ reason }: { reason: string }) {
  const colors: Record<string, string> = {
    Inappropriate: 'bg-rose-50 text-rose-700 ring-rose-200',
    Spam: 'bg-orange-50 text-orange-700 ring-orange-200',
    Misleading: 'bg-blue-50 text-blue-700 ring-blue-200',
    Harassment: 'bg-purple-50 text-purple-700 ring-purple-200',
    Other: 'bg-gray-50 text-gray-600 ring-gray-200',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', colors[reason] ?? colors.Other)}>
      <Flag className="h-3 w-3" />
      {reason}
    </span>
  );
}

function AvatarCircle({ initials, size = 'sm' }: { initials: string; size?: 'sm' | 'md' }) {
  return (
    <div className={cn(
      'flex shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700',
      size === 'md' ? 'h-9 w-9 text-xs' : 'h-7 w-7 text-[10px]',
    )}>
      {initials}
    </div>
  );
}

export default function ModerationPage() {
  const [reports, setReports] = useState<ReportedPost[]>(MOCK_REPORTS);
  const [log, setLog] = useState<ModerationLogEntry[]>(INITIAL_LOG);
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [logOpen, setLogOpen] = useState(false);

  const stats = useMemo(() => ({
    pending: reports.filter((r) => r.status === 'pending').length,
    reviewedToday: reports.filter((r) => {
      if (!r.reviewedAt) return false;
      const today = new Date().toISOString().slice(0, 10);
      return r.reviewedAt.slice(0, 10) === today;
    }).length + 23,
    total: 156,
  }), [reports]);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return reports;
    return reports.filter((r) => r.status === activeTab);
  }, [reports, activeTab]);

  function addLogEntry(action: string, targetUser: string, reason: string) {
    setLog((prev) => [
      {
        id: `l${Date.now()}`,
        date: new Date().toISOString(),
        moderator: 'Admin',
        action,
        targetUser,
        reason,
      },
      ...prev,
    ]);
  }

  function handleApprove(report: ReportedPost) {
    setReports((prev) => prev.map((r) => r.id === report.id ? { ...r, status: 'approved' as const, reviewedAt: new Date().toISOString() } : r));
    addLogEntry('Dismissed report', report.targetUserName, `Report by ${report.reporterName} dismissed — content OK`);
  }

  function handleRemove(report: ReportedPost) {
    setReports((prev) => prev.map((r) => r.id === report.id ? { ...r, status: 'removed' as const, reviewedAt: new Date().toISOString() } : r));
    addLogEntry('Removed post', report.targetUserName, `${report.reason} — ${report.productName}`);
  }

  function handleBan(report: ReportedPost) {
    setReports((prev) => prev.map((r) => r.id === report.id ? { ...r, status: 'removed' as const, reviewedAt: new Date().toISOString() } : r));
    addLogEntry('Banned user & removed post', report.targetUserName, `${report.reason} — repeated violations`);
  }

  function handleDismiss(report: ReportedPost) {
    setReports((prev) => prev.map((r) => r.id === report.id ? { ...r, status: 'approved' as const, reviewedAt: new Date().toISOString() } : r));
    addLogEntry('Dismissed report', report.targetUserName, 'No action needed');
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
            <AlertTriangle className="h-3.5 w-3.5" />
            Pending: {stats.pending}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Reviewed today: {stats.reviewedToday}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200">
            <Flag className="h-3.5 w-3.5" />
            Total reports: {stats.total}
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              activeTab === tab.value
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
            )}
          >
            {tab.label}
            {tab.value !== 'all' && (
              <span className={cn(
                'ml-1.5 rounded-full px-1.5 py-0.5 text-xs tabular-nums',
                activeTab === tab.value ? 'bg-indigo-500 text-indigo-100' : 'bg-gray-100 text-gray-500',
              )}>
                {reports.filter((r) => r.status === tab.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Report Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 shadow-sm">
          <Shield className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-400">No reports in this category</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {filtered.map((report) => (
            <div
              key={report.id}
              className={cn(
                'rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md',
                report.status === 'pending' ? 'border-amber-200' : 'border-gray-200',
              )}
            >
              <div className="p-5 space-y-4">
                {/* Card header: status + reason + date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={report.status} />
                    <ReasonBadge reason={report.reason} />
                  </div>
                  <span className="text-xs text-gray-400">{timeAgo(report.reportedAt)}</span>
                </div>

                {/* Reporter & Target */}
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <AvatarCircle initials={report.reporterAvatar} />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">Reported by</p>
                        <p className="truncate text-sm font-medium text-gray-700">{report.reporterName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AvatarCircle initials={report.targetUserAvatar} size="md" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">Target user</p>
                        <p className="truncate text-sm font-semibold text-gray-900">{report.targetUserName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Post preview placeholder */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className="flex h-20 w-16 items-center justify-center rounded-lg"
                      style={{ backgroundColor: report.productColor + '22', border: `1px solid ${report.productColor}44` }}
                    >
                      <User className="h-6 w-6" style={{ color: report.productColor }} />
                    </div>
                    <p className="max-w-[100px] truncate text-center text-[10px] font-medium text-gray-500">
                      {report.productName}
                    </p>
                  </div>
                </div>

                {/* Review date */}
                {report.reviewedAt && (
                  <p className="text-xs text-gray-400">
                    Reviewed {formatDate(report.reviewedAt)}
                  </p>
                )}

                {/* Actions */}
                {report.status === 'pending' && (
                  <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                    <button
                      onClick={() => handleApprove(report)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRemove(report)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove Post
                    </button>
                    <button
                      onClick={() => handleBan(report)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 transition-colors hover:bg-purple-100"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      Ban User
                    </button>
                    <button
                      onClick={() => handleDismiss(report)}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    >
                      <X className="h-3.5 w-3.5" />
                      Dismiss
                    </button>
                  </div>
                )}

                {report.status !== 'pending' && (
                  <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                    <button
                      onClick={() => handleApprove(report)}
                      disabled
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-300 cursor-not-allowed"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Already reviewed
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Moderation Log */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <button
          onClick={() => setLogOpen((p) => !p)}
          className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
        >
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-gray-900">Moderation Log</h2>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 tabular-nums">
              {log.length}
            </span>
          </div>
          {logOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {logOpen && (
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Date</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Moderator</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Action</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Target User</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {log.map((entry) => (
                    <tr key={entry.id} className="transition-colors hover:bg-gray-50/80">
                      <td className="whitespace-nowrap px-6 py-3 text-gray-500">
                        {formatDate(entry.date)}
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-700">{entry.moderator}</td>
                      <td className="px-6 py-3">
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          entry.action.includes('Removed') || entry.action.includes('Banned')
                            ? 'bg-red-50 text-red-700'
                            : 'bg-emerald-50 text-emerald-700',
                        )}>
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-700">{entry.targetUser}</td>
                      <td className="max-w-[250px] truncate px-6 py-3 text-gray-500">{entry.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
