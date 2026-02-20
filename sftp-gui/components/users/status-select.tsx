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
import type { UserStatus } from '@/types';
import { STATUS_LABELS } from '@/lib/constants';

interface StatusSelectProps {
  value: UserStatus;
  onChange: (status: UserStatus) => void;
  disabled?: boolean;
}

const statuses: UserStatus[] = ['PENDING', 'ACTIVE', 'DISABLED'];

export function StatusSelect({ value, onChange, disabled }: StatusSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-[130px] justify-between"
        >
          {STATUS_LABELS[value]}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[130px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No status found.</CommandEmpty>
            <CommandGroup>
              {statuses.map((status) => (
                <CommandItem
                  key={status}
                  value={status}
                  onSelect={() => {
                    onChange(status);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === status ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {STATUS_LABELS[status]}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
