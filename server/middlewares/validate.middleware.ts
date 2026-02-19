import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { log } from '../src/logging/logging';

type ZodErrorWithIssues = {
  issues: Array<{
    code: string;
    message: string;
    path: (string | number)[];
    expected?: string;
    received?: string;
  }>;
};

function isZodError(err: unknown): err is ZodErrorWithIssues {
  return typeof err === 'object' && err !== null && 'issues' in err;
}

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      log("warn", "validation_error", {
        requestId: req.requestId,
        errors: result.error.issues,
        path: req.path,
        method: req.method,
        source: "body",
      });
      res.status(400).json({
        status: "error",
        requestId: req.requestId,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: result.error.issues,
        },
      });
      return;
    }
    
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    
    if (!result.success) {
      log("warn", "validation_error", {
        requestId: req.requestId,
        errors: result.error.issues,
        path: req.path,
        method: req.method,
        source: "query",
      });
      res.status(400).json({
        status: "error",
        requestId: req.requestId,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: result.error.issues,
        },
      });
      return;
    }
    
    req.query = result.data as typeof req.query;
    next();
  };
}
