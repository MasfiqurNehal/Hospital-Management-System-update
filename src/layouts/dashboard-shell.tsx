'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  useEffect(() => {
    const saved = window.localStorage.getItem('hms-sidebar-collapsed');
    if (saved) setCollapsed(saved === 'true');
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem('hms-sidebar-collapsed', String(next));
      return next;
    });
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
        <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-[min(18rem,calc(100vw-2rem))] animate-fade-up">
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className={cn('flex min-w-0 flex-1 flex-col')}>
        <Topbar onMobileMenuOpen={() => setMobileOpen(true)} />
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
