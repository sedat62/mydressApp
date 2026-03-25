'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Users,
  ShieldBan,
  ShieldCheck,
  Eye,
  X,
  Crown,
  Sparkles,
  Calendar,
  ImageIcon,
  Clock,
  Loader2,
  Coins,
  Plus,
} from 'lucide-react';
import { cn, formatDate, formatNumber } from '@/lib/utils';

interface User {
  id: string;
  displayName: string;
  email: string;
  avatar: string;
  plan: 'free' | 'pro';
  totalGenerations: number;
  credits: number;
  banned: boolean;
  subscriptionExpiry: string | null;
  createdAt: string;
}

type PlanFilter = 'all' | 'free' | 'pro';
type StatusFilter = 'all' | 'active' | 'banned';

function PlanBadge({ plan }: { plan: 'free' | 'pro' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        plan === 'pro'
          ? 'bg-indigo-50 text-indigo-700 ring-indigo-200'
          : 'bg-gray-50 text-gray-600 ring-gray-200',
      )}
    >
      {plan === 'pro' && <Crown className="h-3 w-3" />}
      {plan === 'pro' ? 'Pro' : 'Free'}
    </span>
  );
}

function StatusBadge({ banned }: { banned: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        banned
          ? 'bg-red-50 text-red-700 ring-red-200'
          : 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', banned ? 'bg-red-500' : 'bg-emerald-500')} />
      {banned ? 'Banned' : 'Active'}
    </span>
  );
}

function AvatarCircle({ initials, size = 'md' }: { initials: string; size?: 'md' | 'lg' }) {
  const sizeClasses = size === 'lg' ? 'h-16 w-16 text-xl' : 'h-9 w-9 text-xs';
  return (
    <div className={cn('flex shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700', sizeClasses)}>
      {initials}
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditLoading, setCreditLoading] = useState(false);

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !search ||
        u.displayName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesPlan = planFilter === 'all' || u.plan === planFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !u.banned) ||
        (statusFilter === 'banned' && u.banned);
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [users, search, planFilter, statusFilter]);

  async function toggleBan(id: string) {
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action: 'toggleBan' }),
      });
      const result = await res.json();
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, banned: result.banned } : u)),
        );
        setSelectedUser((prev) => (prev?.id === id ? { ...prev, banned: result.banned } : prev));
      }
    } catch (err) {
      console.error('Ban toggle failed:', err);
    }
  }

  async function togglePremium(id: string) {
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action: 'togglePremium' }),
      });
      const result = await res.json();
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, plan: result.plan } : u)),
        );
        setSelectedUser((prev) => (prev?.id === id ? { ...prev, plan: result.plan } : prev));
      }
    } catch (err) {
      console.error('Premium toggle failed:', err);
    }
  }

  async function addCredits(id: string) {
    const amount = Number(creditAmount);
    if (!amount || amount <= 0) return;
    setCreditLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, action: 'addCredits', data: { amount } }),
      });
      const result = await res.json();
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, credits: result.credits } : u)),
        );
        setSelectedUser((prev) =>
          prev?.id === id ? { ...prev, credits: result.credits } : prev,
        );
        setCreditAmount('');
      }
    } catch (err) {
      console.error('Credit add failed:', err);
    } finally {
      setCreditLoading(false);
    }
  }

  const planOptions: { value: PlanFilter; label: string }[] = [
    { value: 'all', label: 'All Plans' },
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
  ];

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'banned', label: 'Banned' },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
            {users.length}
          </span>
        </div>
        <div className="relative min-w-[280px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {planOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPlanFilter(opt.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                planFilter === opt.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                statusFilter === opt.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-gray-500">
          {filtered.length} user{filtered.length !== 1 && 's'} found
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">User</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Plan</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600">Credits</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600">Generations</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Joined</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                    <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                    No users found
                  </td>
                </tr>
              )}
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="group cursor-pointer transition-colors hover:bg-gray-50/80"
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <AvatarCircle initials={user.avatar || user.displayName.slice(0, 2).toUpperCase()} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">{user.displayName}</p>
                        <p className="truncate text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><PlanBadge plan={user.plan} /></td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                      <Coins className="h-3 w-3" />
                      {formatNumber(user.credits)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium tabular-nums text-gray-700">
                    {formatNumber(user.totalGenerations)}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {user.createdAt ? formatDate(user.createdAt) : '—'}
                  </td>
                  <td className="px-6 py-4"><StatusBadge banned={user.banned} /></td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => toggleBan(user.id)}
                        className={cn(
                          'rounded-md p-1.5 transition-colors',
                          user.banned
                            ? 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700'
                            : 'text-gray-400 hover:bg-red-50 hover:text-red-600',
                        )}
                        title={user.banned ? 'Unban user' : 'Ban user'}
                      >
                        {user.banned ? <ShieldCheck className="h-4 w-4" /> : <ShieldBan className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex items-start gap-5">
                <AvatarCircle initials={selectedUser.avatar || selectedUser.displayName.slice(0, 2).toUpperCase()} size="lg" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900">{selectedUser.displayName}</h3>
                    <PlanBadge plan={selectedUser.plan} />
                    <StatusBadge banned={selectedUser.banned} />
                  </div>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  <p className="text-xs text-gray-400">ID: {selectedUser.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs font-medium">Generations</span>
                  </div>
                  <p className="mt-1.5 text-2xl font-bold tabular-nums text-gray-900">
                    {formatNumber(selectedUser.totalGenerations)}
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Coins className="h-4 w-4" />
                    <span className="text-xs font-medium">Credits</span>
                  </div>
                  <p className="mt-1.5 text-2xl font-bold tabular-nums text-amber-700">
                    {formatNumber(selectedUser.credits)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-medium">Created</span>
                  </div>
                  <p className="mt-1.5 text-lg font-bold text-gray-900">
                    {selectedUser.createdAt ? formatDate(selectedUser.createdAt) : '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-medium">Sub. Expires</span>
                  </div>
                  <p className="mt-1.5 text-lg font-bold text-gray-900">
                    {selectedUser.subscriptionExpiry ? formatDate(selectedUser.subscriptionExpiry) : '—'}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Coins className="h-4 w-4 text-amber-600" />
                  Kredi Ekle
                </h4>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    placeholder="Miktar"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    className="w-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm tabular-nums placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <button
                    onClick={() => addCredits(selectedUser.id)}
                    disabled={creditLoading || !creditAmount || Number(creditAmount) <= 0}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-700 active:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creditLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Kredi Ekle
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  onClick={() => togglePremium(selectedUser.id)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors',
                    selectedUser.plan === 'pro'
                      ? 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800',
                  )}
                >
                  <Crown className="h-4 w-4" />
                  {selectedUser.plan === 'pro' ? 'Remove Premium' : 'Give Premium'}
                </button>
                <button
                  onClick={() => toggleBan(selectedUser.id)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors',
                    selectedUser.banned
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800'
                      : 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
                  )}
                >
                  {selectedUser.banned ? (
                    <><ShieldCheck className="h-4 w-4" /> Unban User</>
                  ) : (
                    <><ShieldBan className="h-4 w-4" /> Ban User</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
