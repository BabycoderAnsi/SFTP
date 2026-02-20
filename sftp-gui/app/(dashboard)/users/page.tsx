'use client';

import { UserList } from '@/components/users';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <p className="text-muted-foreground">
          Manage user accounts, roles, and permissions
        </p>
      </div>

      <UserList />
    </div>
  );
}
