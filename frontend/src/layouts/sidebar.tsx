'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, X } from 'lucide-react';
import { BrandMark } from '@/components/shared/brand-mark';
import { useAuthStore } from '@/lib/auth-store';
import { navigationByRole, roleLabels } from '@/lib/navigation';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void; // mobile: close after navigating
}

export function Sidebar({ collapsed, onToggle, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user, tenant } = useAuthStore();
  if (!user) return null;

  const groups = navigationByRole[user.role] ?? [];

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border bg-card transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          'flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-4',
          collapsed && 'justify-center px-2',
        )}
      >
        <Link
          href="/"
          onClick={onNavigate}
          aria-label="Go to home page"
          className={cn(
            'flex min-w-0 flex-1 items-center gap-2.5 rounded-lg transition-colors hover:bg-secondary/70',
            collapsed ? 'justify-center px-1 py-1' : 'px-1 py-2',
          )}
        >
          <BrandMark compact={collapsed} />
          {!collapsed && tenant?.branding.display_name && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                {tenant.branding.display_name}
              </div>
              <div className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {roleLabels[user.role]}
              </div>
            </div>
          )}
        </Link>
        {!collapsed && onNavigate && (
          <button
            onClick={onNavigate}
            type="button"
            aria-label="Close navigation"
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav groups */}
      {/* Testing */}

      <nav className="flex-1 space-y-5 overflow-y-auto scrollbar-slim px-3 py-4">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.label && !collapsed && (
              <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </div>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all',
                        active
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                        collapsed && 'justify-center',
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon
                        className={cn(
                          'h-[18px] w-[18px] shrink-0',
                          item.highlight && !active && 'text-destructive',
                        )}
                        strokeWidth={active ? 2.5 : 2}
                      />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge !== undefined && (
                            <span
                              className={cn(
                                'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
                                active
                                  ? 'bg-white/20 text-white'
                                  : item.highlight
                                    ? 'bg-destructive text-destructive-foreground'
                                    : 'bg-secondary text-secondary-foreground',
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {collapsed && item.badge !== undefined && (
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User card + collapse toggle */}
      <div className="border-t border-border p-3">
        {!collapsed && (
          <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-secondary/50 p-2">
            <Avatar src={user.profile_photo_url} name={user.full_name} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold">{user.full_name}</div>
              <div className="truncate text-[10px] text-muted-foreground">{user.email}</div>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground',
            collapsed && 'justify-center',
          )}
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
          />
          {!collapsed && <span className="lg:inline">{onNavigate ? 'Close menu' : 'Collapse'}</span>}
        </button>
      </div>
    </aside>
  );
}
