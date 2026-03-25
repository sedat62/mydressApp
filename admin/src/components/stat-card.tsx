import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  color?: 'indigo' | 'emerald' | 'amber' | 'rose';
}

const colorMap = {
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', ring: 'ring-indigo-500/20' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-500/20' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-500/20' },
  rose: { bg: 'bg-rose-50', icon: 'text-rose-600', ring: 'ring-rose-500/20' },
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'indigo' }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          {trend && (
            <p className={cn('mt-2 text-sm font-medium', trend.positive ? 'text-emerald-600' : 'text-rose-600')}>
              {trend.positive ? '+' : ''}{trend.value}
            </p>
          )}
        </div>
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl ring-1', c.bg, c.ring)}>
          <Icon className={cn('h-6 w-6', c.icon)} />
        </div>
      </div>
    </div>
  );
}
