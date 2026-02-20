import { Router, Request, Response } from "express";
import { requireAuth } from '../../middlewares/requireAuth';
import { log } from '../logging/logging';
import prisma from '../db/prisma';

const router = Router();

router.get(
  "/stream",
  requireAuth(),
  async (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    
    res.flushHeaders();
    
    const sendEvent = (data: object) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };
    
    sendEvent({ 
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Connected to log stream',
      user: req.user?.sub,
    });
    
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 15000);
    
    req.on('close', () => {
      clearInterval(heartbeat);
    });
    
    try {
      const recentLogs = await prisma.auditLog.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
      });
      
      for (const auditLog of recentLogs.reverse()) {
        sendEvent({
          timestamp: auditLog.createdAt.toISOString(),
          level: 'audit',
          message: `${auditLog.action} ${auditLog.path || ''}`.trim(),
          requestId: auditLog.requestId,
          user: auditLog.user,
          role: auditLog.role,
          action: auditLog.action,
          path: auditLog.path,
          status: auditLog.status,
        });
      }
    } catch (error) {
      log("error", "log_stream_fetch_error", {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

export default router;
