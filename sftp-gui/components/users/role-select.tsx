'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
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
import type { Role } from '@/types';
import { ROLE_LABELS } from '@/lib/constants';

interface RoleSelectProps {
  value: Role;
  onChange: (role: Role) => void;
  disabled?: boolean;
}

const roles: Role[] = ['READ_ONLY', 'READ_WRITE', 'ADMIN'];

export function RoleSelect({ value, onChange, disabled }: RoleSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-[150px] justify-between"
        >
          {ROLE_LABELS[value]}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[150px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No role found.</CommandEmpty>
            <CommandGroup>
              {roles.map((role) => (
                <CommandItem
                  key={role}
                  value={role}
                  onSelect={() => {
                    onChange(role);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === role ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {ROLE_LABELS[role]}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
