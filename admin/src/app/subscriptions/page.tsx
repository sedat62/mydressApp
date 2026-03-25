'use client';

import { useState, useMemo } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingDown,
  UserPlus,
  Search,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

interface Subscription {
  id: string;
  userName: string;
  userEmail: string;
  plan: string;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  revenue: number;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const revenueHistory = [
  { month: 'Oct 2025', revenue: 2410 },
  { month: 'Nov 2025', revenue: 2590 },
  { month: 'Dec 2025', revenue: 2735 },
  { month: 'Jan 2026', revenue: 2880 },
  { month: 'Feb 2026', revenue: 2960 },
  { month: 'Mar 2026', revenue: 3102.11 },
];

const subscriptions: Subscription[] = [
  { id: '1', userName: 'Sarah Johnson', userEmail: 'sarah.j@email.com', plan: 'Pro', startDate: '2026-03-18', endDate: '2026-04-18', status: 'active', revenue: 7.99 },
  { id: '2', userName: 'Michael Chen', userEmail: 'mchen@email.com', plan: 'Pro', startDate: '2026-03-15', endDate: '2026-04-15', status: 'active', revenue: 7.99 },
  { id: '3', userName: 'Emma Davis', userEmail: 'emma.d@email.com', plan: 'Pro', startDate: '2026-03-12', endDate: '2026-04-12', status: 'active', revenue: 7.99 },
  { id: '4', userName: 'Alex Rivera', userEmail: 'arivera@email.com', plan: 'Pro', startDate: '2026-03-10', endDate: '2026-04-10', status: 'active', revenue: 7.99 },
  { id: '5', userName: 'Olivia Park', userEmail: 'opark@email.com', plan: 'Pro', startDate: '2026-02-28', endDate: '2026-03-28', status: 'active', revenue: 7.99 },
  { id: '6', userName: 'James Wilson', userEmail: 'jwilson@email.com', plan: 'Pro', startDate: '2026-02-20', endDate: '2026-03-20', status: 'active', revenue: 7.99 },
  { id: '7', userName: 'Sophia Martinez', userEmail: 'smartinez@email.com', plan: 'Pro', startDate: '2026-01-05', endDate: '2026-02-05', status: 'cancelled', revenue: 7.99 },
  { id: '8', userName: 'Liam Nguyen', userEmail: 'lnguyen@email.com', plan: 'Pro', startDate: '2026-02-14', endDate: '2026-03-14', status: 'cancelled', revenue: 7.99 },
  { id: '9', userName: 'Isabella Kim', userEmail: 'ikim@email.com', plan: 'Pro', startDate: '2025-12-01', endDate: '2026-01-01', status: 'expired', revenue: 7.99 },
  { id: '10', userName: 'Noah Brown', userEmail: 'nbrown@email.com', plan: 'Pro', startDate: '2026-03-08', endDate: '2026-04-08', status: 'active', revenue: 7.99 },
  { id: '11', userName: 'Mia Taylor', userEmail: 'mtaylor@email.com', plan: 'Pro', startDate: '2025-11-10', endDate: '2025-12-10', status: 'expired', revenue: 7.99 },
  { id: '12', userName: 'Ethan Lopez', userEmail: 'elopez@email.com', plan: 'Pro', startDate: '2026-01-22', endDate: '2026-02-22', status: 'cancelled', revenue: 7.99 },
  { id: '13', userName: 'Ava Robinson', userEmail: 'arobinson@email.com', plan: 'Pro', startDate: '2026-03-20', endDate: '2026-04-20', status: 'active', revenue: 7.99 },
  { id: '14', userName: 'Lucas Wright', userEmail: 'lwright@email.com', plan: 'Pro', startDate: '2026-03-01', endDate: '2026-04-01', status: 'active', revenue: 7.99 },
];

const cancellationReasons = [
  { reason: 'Too expensive', pct: 35, color: 'bg-red-400' },
  { reason: 'Not using enough', pct: 28, color: 'bg-amber-400' },
  { reason: 'Found alternative', pct: 20, color: 'bg-blue-400' },
  { reason: 'Other', pct: 17, color: 'bg-gray-400' },
];

/* ------------------------------------------------------------------ */
/*  Stat cards config                                                  */
/* ------------------------------------------------------------------ */

const stats = [
  { title: 'Active Subscriptions', value: '389', icon: CreditCard, accent: 'bg-indigo-50 text-indigo-600' },
  { title: 'Monthly Revenue', value: '$3,102.11', icon: DollarSign, accent: 'bg-emerald-50 text-emerald-600' },
  { title: 'Churn Rate', value: '4.2%', icon: TrendingDown, accent: 'bg-rose-50 text-rose-600' },
  { title: 'New This Month', value: '67', icon: UserPlus, accent: 'bg-amber-50 text-amber-600' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const statusConfig: Record<SubscriptionStatus, { label: string; cls: string }> = {
  active: { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  cancelled: { label: 'Cancelled', cls: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  expired: { label: 'Expired', cls: 'bg-gray-100 text-gray-600 ring-gray-500/20' },
};

type SortField = 'startDate' | 'userName' | 'revenue';

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SubscriptionsPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | SubscriptionStatus>('all');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('startDate');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let list = [...subscriptions];

    if (statusFilter !== 'all') {
      list = list.filter((s) => s.status === statusFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.userName.toLowerCase().includes(q) ||
          s.userEmail.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'startDate') cmp = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      else if (sortField === 'userName') cmp = a.userName.localeCompare(b.userName);
      else if (sortField === 'revenue') cmp = a.revenue - b.revenue;
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [statusFilter, search, sortField, sortAsc]);

  function toggleSort(field: SortField) {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and track Pro plan subscriptions &mdash; $7.99/month
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', s.accent)}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{s.title}</p>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue chart + Cancellation reasons */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Revenue chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900">Subscription Revenue</h2>
            <p className="text-sm text-gray-500">Last 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueHistory}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '0.875rem',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Cancellation reasons */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900">Cancellation Reasons</h2>
            <p className="text-sm text-gray-500">Why users leave</p>
          </div>
          <div className="space-y-4">
            {cancellationReasons.map((r) => (
              <div key={r.reason}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-gray-700">{r.reason}</span>
                  <span className="font-semibold text-gray-900">{r.pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={cn('h-full rounded-full transition-all', r.color)}
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscriptions table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Table toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-6 py-4">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          <span className="text-sm text-gray-500">
            {filtered.length} subscription{filtered.length !== 1 && 's'}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="cursor-pointer px-6 py-3 text-left font-semibold text-gray-600 select-none"
                  onClick={() => toggleSort('userName')}
                >
                  <span className="inline-flex items-center gap-1">
                    User
                    <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                  </span>
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Plan</th>
                <th
                  className="cursor-pointer px-6 py-3 text-left font-semibold text-gray-600 select-none"
                  onClick={() => toggleSort('startDate')}
                >
                  <span className="inline-flex items-center gap-1">
                    Start Date
                    <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                  </span>
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">End Date</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Status</th>
                <th
                  className="cursor-pointer px-6 py-3 text-right font-semibold text-gray-600 select-none"
                  onClick={() => toggleSort('revenue')}
                >
                  <span className="inline-flex items-center justify-end gap-1">
                    Revenue
                    <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <CreditCard className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                    No subscriptions found
                  </td>
                </tr>
              )}
              {filtered.map((sub) => {
                const badge = statusConfig[sub.status];
                return (
                  <tr key={sub.id} className="transition-colors hover:bg-gray-50/80">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{sub.userName}</p>
                      <p className="text-xs text-gray-500">{sub.userEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                        {sub.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(sub.startDate)}</td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(sub.endDate)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                          badge.cls,
                        )}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium tabular-nums text-gray-900">
                      {formatCurrency(sub.revenue)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
