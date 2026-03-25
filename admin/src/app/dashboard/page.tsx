'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  CreditCard,
  DollarSign,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  Clock,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { StatCard } from '@/components/stat-card';
import { cn, formatNumber } from '@/lib/utils';

interface DashboardData {
  stats: {
    totalUsers: number;
    proUsers: number;
    totalGenerations: number;
    totalProducts: number;
    totalPosts: number;
    revenue: number;
  };
  popularProducts: {
    rank: number;
    name: string;
    category: string;
    tryOnCount: number;
    trending: boolean;
  }[];
}

const revenueData = [
  { month: 'Apr', revenue: 1820 },
  { month: 'May', revenue: 1950 },
  { month: 'Jun', revenue: 2100 },
  { month: 'Jul', revenue: 1890 },
  { month: 'Aug', revenue: 2240 },
  { month: 'Sep', revenue: 2380 },
  { month: 'Oct', revenue: 2510 },
  { month: 'Nov', revenue: 2650 },
  { month: 'Dec', revenue: 2890 },
  { month: 'Jan', revenue: 2780 },
  { month: 'Feb', revenue: 2690 },
  { month: 'Mar', revenue: 3102 },
];

const recentActivity = [
  { id: 1, text: 'Sarah Johnson tried on Classic Leather Bag', time: '2 minutes ago', type: 'tryon' as const },
  { id: 2, text: 'New Pro subscription by Michael Chen', time: '8 minutes ago', type: 'subscription' as const },
  { id: 3, text: 'Emma Davis generated 5 AI outfit combinations', time: '15 minutes ago', type: 'generation' as const },
  { id: 4, text: 'Alex Rivera upgraded to Business plan', time: '32 minutes ago', type: 'subscription' as const },
  { id: 5, text: 'Olivia Park tried on Slim Fit Denim Jacket', time: '45 minutes ago', type: 'tryon' as const },
];

const activityIconMap = {
  tryon: { icon: ShoppingBag, bg: 'bg-indigo-50', fg: 'text-indigo-600' },
  subscription: { icon: CreditCard, bg: 'bg-emerald-50', fg: 'text-emerald-600' },
  generation: { icon: Sparkles, bg: 'bg-amber-50', fg: 'text-amber-600' },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats;
  const popularProducts = data?.popularProducts ?? [];

  const userGrowthData = Array.from({ length: 16 }, (_, i) => ({
    day: `Mar ${i * 2 + 1}`,
    users: (stats?.totalUsers ?? 0) - (16 - i) * 2 + Math.floor(Math.random() * 3),
  }));

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your TryOn AI platform</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={formatNumber(stats?.totalUsers ?? 0)}
          icon={Users}
          trend={{ value: 'Real-time from Firestore', positive: true }}
          color="indigo"
        />
        <StatCard
          title="Pro Subscriptions"
          value={formatNumber(stats?.proUsers ?? 0)}
          icon={CreditCard}
          trend={{ value: `of ${stats?.totalUsers ?? 0} users`, positive: true }}
          color="emerald"
        />
        <StatCard
          title="Estimated Revenue"
          value={`$${(stats?.revenue ?? 0).toFixed(2)}`}
          icon={DollarSign}
          trend={{ value: '$7.99/mo per Pro user', positive: true }}
          color="amber"
        />
        <StatCard
          title="AI Generations"
          value={formatNumber(stats?.totalGenerations ?? 0)}
          icon={Sparkles}
          trend={{ value: `${stats?.totalProducts ?? 0} products available`, positive: true }}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">User Growth</h2>
              <p className="text-sm text-gray-500">Trend overview</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <TrendingUp className="h-3.5 w-3.5" />
              {stats?.totalUsers ?? 0} total
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip
                contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '0.875rem' }}
              />
              <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Revenue</h2>
              <p className="text-sm text-gray-500">Last 12 months</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <TrendingUp className="h-3.5 w-3.5" />
              +15.3%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '0.875rem' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Popular Products</h2>
              <p className="text-sm text-gray-500">Top products by try-on count (live from Firestore)</p>
            </div>
            <button className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
              View all
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">Rank</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3 text-right">Try-on Count</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {popularProducts.map((product) => (
                  <tr key={product.rank} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-3.5">
                      <span className={cn(
                        'inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                        product.rank <= 3 ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-600',
                      )}>
                        {product.rank}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-500">{product.category}</td>
                    <td className="px-6 py-3.5 text-right text-sm font-semibold text-gray-900">
                      {product.tryOnCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      {product.trending ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          <TrendingUp className="h-3 w-3" />
                          Trending
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          Stable
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
              <p className="text-sm text-gray-500">Latest platform events</p>
            </div>
          </div>
          <div className="divide-y divide-gray-50 p-2">
            {recentActivity.map((activity) => {
              const style = activityIconMap[activity.type];
              const Icon = style.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50/50">
                  <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', style.bg)}>
                    <Icon className={cn('h-4 w-4', style.fg)} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-700">{activity.text}</p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
