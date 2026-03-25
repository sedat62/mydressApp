import type { Metadata } from 'next';
import { Sidebar } from '@/components/sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: 'TryOn AI - Admin Panel',
  description: 'Admin dashboard for TryOn AI application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Sidebar />
        <main className="ml-64 min-h-screen p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
