'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks';
import { ROLE_LABELS, STATUS_LABELS } from '@/lib/constants';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          System configuration and account settings
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your current account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Username</span>
              <span className="col-span-2">{user?.username}</span>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Email</span>
              <span className="col-span-2">{user?.email}</span>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Role</span>
              <Badge variant="secondary">{user?.role && ROLE_LABELS[user.role]}</Badge>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Status</span>
              <Badge variant="secondary">{user?.status && STATUS_LABELS[user.status]}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SFTP Configuration</CardTitle>
            <CardDescription>Connection settings for SFTP server</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Host</span>
              <span className="col-span-2">localhost</span>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Port</span>
              <span className="col-span-2">2222</span>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Max File Size</span>
              <span className="col-span-2">10 MB</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Application and server details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">API Version</span>
              <span className="col-span-2">v1</span>
            </div>
            <Separator />
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">App Version</span>
              <span className="col-span-2">1.0.0</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
