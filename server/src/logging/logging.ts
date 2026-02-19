import { LogMeta } from '../types/index';

export type LogLevel = "debug" | "info" | "warn" | "error" | "audit";

const LOG_LEVEL = process.env.LOG_LEVEL || "info";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  audit: 4,
};

export function log(level: LogLevel, message: string, meta: LogMeta = {}): void {
  if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[LOG_LEVEL as LogLevel]) {
    return;
  }

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  const output = level === "error" ? console.error : console.log;
  output(JSON.stringify(entry));
}
