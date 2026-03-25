'use client';

import { useState, useMemo } from 'react';
import {
  Sparkles,
  CalendarDays,
  CheckCircle2,
  Timer,
  Search,
  TrendingUp,
  ImageIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { StatCard } from '@/components/stat-card';
import { cn, formatDate } from '@/lib/utils';

interface Generation {
  id: string;
  userName: string;
  userAvatar: string;
  productName: string;
  productColor: string;
  status: 'completed' | 'processing' | 'failed';
  processingTime: number;
  createdAt: string;
}

const chartData = [
  { day: 'Mar 11', successful: 1520, failed: 78 },
  { day: 'Mar 12', successful: 1680, failed: 92 },
  { day: 'Mar 13', successful: 1590, failed: 65 },
  { day: 'Mar 14', successful: 1750, failed: 103 },
  { day: 'Mar 15', successful: 1820, failed: 88 },
  { day: 'Mar 16', successful: 1430, failed: 72 },
  { day: 'Mar 17', successful: 1380, failed: 58 },
  { day: 'Mar 18', successful: 1710, failed: 95 },
  { day: 'Mar 19', successful: 1890, failed: 110 },
  { day: 'Mar 20', successful: 1945, failed: 87 },
  { day: 'Mar 21', successful: 1860, failed: 79 },
  { day: 'Mar 22', successful: 1780, failed: 94 },
  { day: 'Mar 23', successful: 1920, failed: 82 },
  { day: 'Mar 24', successful: 1745, failed: 100 },
];

const topProducts = [
  { name: 'Classic Leather Bag', tryOnCount: 4521 },
  { name: 'Slim Fit Denim Jacket', tryOnCount: 3887 },
  { name: 'Aviator Sunglasses', tryOnCount: 3245 },
  { name: 'Running Sneakers Pro', tryOnCount: 2912 },
  { name: 'Silk Evening Dress', tryOnCount: 2678 },
];

const MOCK_GENERATIONS: Generation[] = [
  { id: 'g1', userName: 'Sarah Chen', userAvatar: 'SC', productName: 'Classic Leather Bag', productColor: 'bg-amber-100 text-amber-700', status: 'completed', processingTime: 2.8, createdAt: '2026-03-24T13:42:00Z' },
  { id: 'g2', userName: 'Marcus Johnson', userAvatar: 'MJ', productName: 'Slim Fit Denim Jacket', productColor: 'bg-blue-100 text-blue-700', status: 'completed', processingTime: 3.1, createdAt: '2026-03-24T13:38:00Z' },
  { id: 'g3', userName: 'Aisha Patel', userAvatar: 'AP', productName: 'Aviator Sunglasses', productColor: 'bg-indigo-100 text-indigo-700', status: 'processing', processingTime: 0, createdAt: '2026-03-24T13:35:00Z' },
  { id: 'g4', userName: 'Tommy Wilson', userAvatar: 'TW', productName: 'Running Sneakers Pro', productColor: 'bg-emerald-100 text-emerald-700', status: 'failed', processingTime: 1.2, createdAt: '2026-03-24T13:30:00Z' },
  { id: 'g5', userName: 'Elena Rodriguez', userAvatar: 'ER', productName: 'Silk Evening Dress', productColor: 'bg-rose-100 text-rose-700', status: 'completed', processingTime: 4.5, createdAt: '2026-03-24T13:22:00Z' },
  { id: 'g6', userName: 'David Kim', userAvatar: 'DK', productName: 'Classic Leather Bag', productColor: 'bg-amber-100 text-amber-700', status: 'completed', processingTime: 2.6, createdAt: '2026-03-24T13:15:00Z' },
  { id: 'g7', userName: 'Olivia Bennett', userAvatar: 'OB', productName: 'Linen Summer Outfit', productColor: 'bg-teal-100 text-teal-700', status: 'completed', processingTime: 3.4, createdAt: '2026-03-24T12:58:00Z' },
  { id: 'g8', userName: 'Jake Morrison', userAvatar: 'JM', productName: 'Retro Round Glasses', productColor: 'bg-violet-100 text-violet-700', status: 'failed', processingTime: 0.8, createdAt: '2026-03-24T12:45:00Z' },
  { id: 'g9', userName: 'Nina Kowalski', userAvatar: 'NK', productName: 'Canvas Tote Bag', productColor: 'bg-orange-100 text-orange-700', status: 'completed', processingTime: 3.0, createdAt: '2026-03-24T12:30:00Z' },
  { id: 'g10', userName: 'Ryan Foster', userAvatar: 'RF', productName: 'Minimalist Silver Watch', productColor: 'bg-gray-200 text-gray-700', status: 'completed', processingTime: 2.9, createdAt: '2026-03-24T12:12:00Z' },
  { id: 'g11', userName: 'Sarah Chen', userAvatar: 'SC', productName: 'Beaded Charm Bracelet', productColor: 'bg-pink-100 text-pink-700', status: 'processing', processingTime: 0, createdAt: '2026-03-24T11:55:00Z' },
  { id: 'g12', userName: 'Aisha Patel', userAvatar: 'AP', productName: 'Slim Fit Denim Jacket', productColor: 'bg-blue-100 text-blue-700', status: 'completed', processingTime: 3.7, createdAt: '2026-03-24T11:40:00Z' },
  { id: 'g13', userName: 'Elena Rodriguez', userAvatar: 'ER', productName: 'Running Sneakers Pro', productColor: 'bg-emerald-100 text-emerald-700', status: 'completed', processingTime: 2.4, createdAt: '2026-03-24T11:25:00Z' },
  { id: 'g14', userName: 'David Kim', userAvatar: 'DK', productName: 'Aviator Sunglasses', productColor: 'bg-indigo-100 text-indigo-700', status: 'failed', processingTime: 0.5, createdAt: '2026-03-24T11:10:00Z' },
  { id: 'g15', userName: 'Olivia Bennett', userAvatar: 'OB', productName: 'Silk Evening Dress', productColor: 'bg-rose-100 text-rose-700', status: 'completed', processingTime: 4.1, createdAt: '2026-03-24T10:50:00Z' },
  { id: 'g16', userName: 'Marcus Johnson', userAvatar: 'MJ', productName: 'Leather Crossbody Bag', productColor: 'bg-amber-100 text-amber-700', status: 'completed', processingTime: 2.2, createdAt: '2026-03-24T10:35:00Z' },
  { id: 'g17', userName: 'Tommy Wilson', userAvatar: 'TW', productName: 'Linen Summer Outfit', productColor: 'bg-teal-100 text-teal-700', status: 'processing', processingTime: 0, createdAt: '2026-03-24T10:20:00Z' },
  { id: 'g18', userName: 'Nina Kowalski', userAvatar: 'NK', productName: 'Classic Leather Bag', productColor: 'bg-amber-100 text-amber-700', status: 'completed', processingTime: 3.3, createdAt: '2026-03-24T10:05:00Z' },
];

const statusConfig = {
  completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-200' },
  processing: { label: 'Processing', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', ring: 'ring-amber-200' },
  failed: { label: 'Failed', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', ring: 'ring-red-200' },
};

type StatusFilter = 'all' | 'completed' | 'processing' | 'failed';

export default function GenerationsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const maxTryOn = topProducts[0].tryOnCount;

  const filtered = useMemo(() => {
    return MOCK_GENERATIONS.filter((g) => {
      const matchesSearch =
        !search ||
        g.userName.toLowerCase().includes(search.toLowerCase()) ||
        g.productName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'processing', label: 'Processing' },
    { value: 'failed', label: 'Failed' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Generations</h1>
        <p className="mt-1 text-sm text-gray-500">Monitor AI try-on generation activity and performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Generations"
          value="24,589"
          icon={Sparkles}
          trend={{ value: '18.2% this month', positive: true }}
          color="indigo"
        />
        <StatCard
          title="Today's Generations"
          value="1,845"
          icon={CalendarDays}
          trend={{ value: '22.1% vs yesterday', positive: true }}
          color="emerald"
        />
        <StatCard
          title="Success Rate"
          value="94.7%"
          icon={CheckCircle2}
          trend={{ value: '1.3% this month', positive: true }}
          color="amber"
        />
        <StatCard
          title="Avg. Processing Time"
          value="3.2s"
          icon={Timer}
          trend={{ value: '0.4s faster', positive: true }}
          color="rose"
        />
      </div>

      {/* Chart & Top Products */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Generation Activity</h2>
              <p className="text-sm text-gray-500">Last 14 days</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <TrendingUp className="h-3.5 w-3.5" />
              +18.2%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradSuccessful" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '0.875rem',
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '0.75rem', paddingBottom: '0.5rem' }}
              />
              <Area
                type="monotone"
                dataKey="successful"
                name="Successful"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#gradSuccessful)"
                activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="failed"
                name="Failed"
                stroke="#f43f5e"
                strokeWidth={2}
                fill="url(#gradFailed)"
                activeDot={{ r: 5, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Most Tried Products */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900">Most Tried Products</h2>
            <p className="text-sm text-gray-500">Top 5 by try-on count</p>
          </div>
          <div className="space-y-4 p-6">
            {topProducts.map((product, i) => (
              <div key={product.name}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                        i < 3 ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-600',
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{product.name}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-gray-700">
                    {product.tryOnCount.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      i === 0 ? 'bg-indigo-500' : i === 1 ? 'bg-indigo-400' : i === 2 ? 'bg-indigo-300' : 'bg-indigo-200',
                    )}
                    style={{ width: `${(product.tryOnCount / maxTryOn) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Generations */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Recent Generations</h2>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
              {filtered.length}
            </span>
          </div>
          <div className="relative min-w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user or product…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-3">
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
            {filtered.length} generation{filtered.length !== 1 && 's'} found
          </span>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">User</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">Product</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-600">Processing Time</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                      <ImageIcon className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                      No generations found
                    </td>
                  </tr>
                )}
                {filtered.map((gen) => {
                  const sc = statusConfig[gen.status];
                  return (
                    <tr key={gen.id} className="transition-colors hover:bg-gray-50/80">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                            {gen.userAvatar}
                          </div>
                          <span className="font-medium text-gray-900">{gen.userName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', gen.productColor)}>
                          {gen.productName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                            sc.bg,
                            sc.text,
                            sc.ring,
                          )}
                        >
                          <span className={cn('h-1.5 w-1.5 rounded-full', sc.dot)} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium tabular-nums text-gray-700">
                        {gen.status === 'processing' ? (
                          <span className="text-amber-600">In progress…</span>
                        ) : (
                          `${gen.processingTime.toFixed(1)}s`
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(gen.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
