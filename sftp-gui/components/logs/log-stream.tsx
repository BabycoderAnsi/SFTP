'use client';

import { useEffect, useRef } from 'react';
import { useSSE } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollText, Pause, Play, Trash2, Wifi, WifiOff } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import type { LogStreamEvent } from '@/types';

interface LogStreamProps {
  maxEvents?: number;
}

export function LogStream({ maxEvents = 100 }: LogStreamProps) {
  const { events, isConnected, error, connect, disconnect, clearEvents } = useSSE({
    maxEvents,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events]);

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warn':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'audit':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ScrollText className="h-4 w-4" />
          Live Log Stream
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? 'default' : 'secondary'} className="gap-1">
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3" />
                Connected
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Disconnected
              </>
            )}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={isConnected ? disconnect : connect}
          >
            {isConnected ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Resume
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearEvents}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={scrollRef}
          className="h-[500px] overflow-auto rounded border bg-muted/30 p-4 font-mono text-sm"
        >
          {error && (
            <div className="text-destructive mb-4">{error}</div>
          )}
          {events.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              Waiting for events...
            </div>
          ) : (
            events.map((event, index) => (
              <div
                key={`${event.timestamp}-${index}`}
                className="flex items-start gap-3 py-2 border-b last:border-0"
              >
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(event.timestamp)}
                </span>
                <Badge
                  variant="outline"
                  className={cn('text-xs', getLevelColor(event.level))}
                >
                  {event.level}
                </Badge>
                <span className="flex-1 break-all">{event.message}</span>
                {event.user && (
                  <Badge variant="secondary" className="text-xs">
                    {event.user}
                  </Badge>
                )}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </CardContent>
    </Card>
  );
}
