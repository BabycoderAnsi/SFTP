'use client';

import type { UserStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants';

interface StatusBadgeProps {
  status: UserStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('font-normal', STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
