'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useOrgStore, useAuthStore } from '@/stores';
import { RoleGuard } from './role-guard';
import type { Organization } from '@/types';

export function OrgSwitcher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { organizations, selectedOrg, selectOrg } = useOrgStore();
  const { user } = useAuthStore();

  const handleSelect = (org: Organization) => {
    selectOrg(org);
    setOpen(false);
    router.refresh();
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <RoleGuard roles={['ADMIN']}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select organization"
            className={cn('w-[200px] justify-between')}
          >
            <span className="truncate">
              {selectedOrg ? selectedOrg.name : 'All Organizations'}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search organization..." />
            <CommandList>
              <CommandEmpty>No organization found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    selectOrg(null);
                    setOpen(false);
                    router.refresh();
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedOrg === null ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  All Organizations
                </CommandItem>
                {organizations.map((org) => (
                  <CommandItem
                    key={org.id}
                    onSelect={() => handleSelect(org)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedOrg?.id === org.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {org.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </RoleGuard>
  );
}
