'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FolderOpen, 
  Users, 
  HardDrive, 
  Upload, 
  Download,
  Activity,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth, useFiles } from '@/hooks';
import { formatBytes } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user, hasRole } = useAuth();
  const { files, fetchFiles } = useFiles();

  useEffect(() => {
    fetchFiles('/');
  }, [fetchFiles]);

  const stats = [
    {
      title: 'Total Files',
      value: files.filter(f => f.type === 'file').length,
      icon: FolderOpen,
      description: 'Files in storage',
    },
    {
      title: 'Storage Used',
      value: formatBytes(files.reduce((acc, f) => acc + (f.type === 'file' ? f.size : 0), 0)),
      icon: HardDrive,
      description: 'Total disk usage',
    },
  ];

  const adminStats = [
    {
      title: 'Active Users',
      value: '-',
      icon: Users,
      description: 'Users with access',
    },
  ];

  const canUpload = hasRole(['READ_WRITE', 'ADMIN']);
  const canManageUsers = hasRole(['ADMIN']);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.username}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
        
        {canManageUsers && adminStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {canUpload && (
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => router.push('/files')}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </Button>
            )}
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => router.push('/files')}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
            {canManageUsers && (
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => router.push('/users')}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent file operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Activity feed coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
