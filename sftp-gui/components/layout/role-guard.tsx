'use client';

import { useAuth } from '@/hooks';
import type { Role } from '@/types';

interface RoleGuardProps {
  roles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const { hasRole } = useAuth();
  
  if (!hasRole(roles)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
