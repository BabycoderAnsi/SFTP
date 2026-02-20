'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FolderPlus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const folderSchema = z.object({
  name: z
    .string()
    .min(1, 'Folder name is required')
    .max(255, 'Folder name is too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, underscores and hyphens allowed'),
});

type FolderFormData = z.infer<typeof folderSchema>;

interface FolderCreateDialogProps {
  onCreate: (name: string) => Promise<{ success: boolean; error?: string }>;
  disabled?: boolean;
}

export function FolderCreateDialog({ onCreate, disabled }: FolderCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FolderFormData>({
    resolver: zodResolver(folderSchema),
  });

  const onSubmit = async (data: FolderFormData) => {
    setIsCreating(true);
    setError(null);

    const result = await onCreate(data.name);

    if (result.success) {
      setOpen(false);
      reset();
    } else {
      setError(result.error || 'Failed to create folder');
    }

    setIsCreating(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setError(null);
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <FolderPlus className="h-4 w-4 mr-2" />
          New Folder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for the new folder.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Folder Name</Label>
              <Input
                id="name"
                placeholder="my-folder"
                {...register('name')}
                disabled={isCreating}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
