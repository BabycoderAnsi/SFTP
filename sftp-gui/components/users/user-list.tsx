'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserPlus, RefreshCw, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from './status-badge';
import { RoleSelect } from './role-select';
import { StatusSelect } from './status-select';
import { adminApi } from '@/lib/api-client';
import { formatDate, getErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';
import type { User, UserStatus, Role, ListUsersQuery } from '@/types';

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState<ListUsersQuery>({
    limit: 50,
    offset: 0,
  });
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.users(query);
      const data = response.data.data;
      if (data) {
        setUsers(data.users);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusChange = async (userId: string, status: UserStatus) => {
    setUpdatingUserId(userId);
    try {
      await adminApi.updateStatus(userId, status);
      toast.success(`User status updated to ${status}`);
      await fetchUsers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleRoleChange = async (userId: string, role: Role) => {
    setUpdatingUserId(userId);
    try {
      await adminApi.updateRole(userId, role);
      toast.success(`User role updated to ${role}`);
      await fetchUsers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{total} users</Badge>
        </div>
        <Button variant="outline" size="icon" onClick={fetchUsers} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <RoleSelect
                      value={user.role}
                      onChange={(role) => handleRoleChange(user.id, role)}
                      disabled={updatingUserId === user.id}
                    />
                  </TableCell>
                  <TableCell>
                    <StatusSelect
                      value={user.status}
                      onChange={(status) => handleStatusChange(user.id, status)}
                      disabled={updatingUserId === user.id}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
