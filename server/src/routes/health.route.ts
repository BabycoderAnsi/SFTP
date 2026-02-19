import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';
import { log } from '../logging/logging';
import SftpClient from 'ssh2-sftp-client';

const router = Router();

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
}

interface HealthStatus {
  status: 'ok' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: string;
  requestId?: string;
  checks: {
    database: HealthCheck;
    sftp: HealthCheck;
  };
}

const VERSION = process.env.npm_package_version || '1.0.0';

router.get("/", async (req: Request, res: Response) => {
  const health: HealthStatus = {
    status: 'ok',
    version: VERSION,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    checks: {
      database: { status: 'unhealthy' },
      sftp: { status: 'unhealthy' },
    },
  };

  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = {
      status: 'healthy',
      latency: Date.now() - dbStart,
    };
  } catch (err) {
    health.checks.database = {
      status: 'unhealthy',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
    health.status = 'unhealthy';
    log("error", "health_check_db_failed", { requestId: req.requestId });
  }

  const sftpStart = Date.now();
  try {
    const sftp = new SftpClient();
    await sftp.connect({
      host: process.env.SFTP_HOST || 'localhost',
      port: parseInt(process.env.SFTP_PORT || '2222'),
      username: process.env.SFTP_USER || 'sftpuser',
      password: process.env.SFTP_PASSWORD || 'password',
    });
    await sftp.end();
    health.checks.sftp = {
      status: 'healthy',
      latency: Date.now() - sftpStart,
    };
  } catch (err) {
    health.checks.sftp = {
      status: 'unhealthy',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
    health.status = 'degraded';
    log("warn", "health_check_sftp_failed", { requestId: req.requestId });
  }

  const statusCode = health.status === 'unhealthy' ? 503 : 200;
  res.status(statusCode).json(health);
});

export default router;
