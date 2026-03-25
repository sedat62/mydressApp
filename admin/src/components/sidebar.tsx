'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Users,
  CreditCard,
  Shield,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/moderation', label: 'Moderation', icon: Shield },
  { href: '/generations', label: 'AI Generations', icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-gray-900">TryOn AI</h1>
          <p className="text-xs text-gray-500">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}>
              <Icon className={cn('h-5 w-5', isActive ? 'text-indigo-600' : 'text-gray-400')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
          <LogOut className="h-5 w-5 text-gray-400" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
