'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  ScrollText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks';
import { RoleGuard } from './role-guard';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/',
    roles: ['READ_WRITE', 'ADMIN'] as Role[],
  },
  {
    icon: FolderOpen,
    label: 'Files',
    href: '/files',
    roles: ['READ_ONLY', 'READ_WRITE', 'ADMIN'] as Role[],
  },
  {
    icon: Users,
    label: 'Users',
    href: '/users',
    roles: ['ADMIN'] as Role[],
  },
  {
    icon: ScrollText,
    label: 'Logs',
    href: '/logs',
    roles: ['READ_ONLY', 'READ_WRITE', 'ADMIN'] as Role[],
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/settings',
    roles: ['ADMIN'] as Role[],
  },
];

type Role = 'READ_ONLY' | 'READ_WRITE' | 'ADMIN';

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary" />
            <span className="font-semibold">SFTP Gateway</span>
          </Link>
        )}
        {collapsed && <FolderOpen className="h-6 w-6 text-primary mx-auto" />}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn('h-8 w-8', collapsed && 'mx-auto mt-2')}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <RoleGuard key={item.href} roles={item.roles}>
            <Link href={item.href}>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  collapsed && 'justify-center px-2'
                )}
              >
                <item.icon className={cn('h-4 w-4', !collapsed && 'mr-2')} />
                {!collapsed && item.label}
              </Button>
            </Link>
          </RoleGuard>
        ))}
      </nav>

      <Separator />

      <div className="p-2">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-muted-foreground hover:text-destructive',
            collapsed && 'justify-center px-2'
          )}
          onClick={logout}
        >
          <LogOut className={cn('h-4 w-4', !collapsed && 'mr-2')} />
          {!collapsed && 'Logout'}
        </Button>
      </div>
    </aside>
  );
}
