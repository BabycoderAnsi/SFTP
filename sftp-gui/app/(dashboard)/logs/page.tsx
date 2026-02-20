'use client';

import { LogStream } from '@/components/logs';

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
        <p className="text-muted-foreground">
          Real-time log stream of all file operations and system events
        </p>
      </div>

      <LogStream maxEvents={200} />
    </div>
  );
}
