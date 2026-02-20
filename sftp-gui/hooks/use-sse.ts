import { useEffect, useRef, useState, useCallback } from 'react';
import { SSE_URL } from '@/lib/constants';
import type { LogStreamEvent } from '@/types';

interface UseSSEOptions {
  url?: string;
  enabled?: boolean;
  maxEvents?: number;
}

export function useSSE(options: UseSSEOptions = {}) {
  const { 
    url = SSE_URL, 
    enabled = true, 
    maxEvents = 100 
  } = options;
  
  const [events, setEvents] = useState<LogStreamEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('sftp_accessToken') 
      : null;

    if (!token) {
      setError('No authentication token');
      return;
    }

    const eventSource = new EventSource(`${url}?token=${token}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as LogStreamEvent;
        setEvents((prev) => [data, ...prev].slice(0, maxEvents));
      } catch {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setError('Connection lost. Reconnecting...');
      
      setTimeout(() => {
        if (enabled) {
          connect();
        }
      }, 5000);
    };
  }, [url, maxEvents, enabled]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    events,
    isConnected,
    error,
    connect,
    disconnect,
    clearEvents,
  };
}
