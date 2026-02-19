import { Request, Response, NextFunction } from 'express';

export function requestTimeout(ms: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          status: 'error',
          requestId: req.requestId,
          error: {
            message: 'Request timeout',
            code: 'REQUEST_TIMEOUT',
          },
        });
      }
    }, ms);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));
    
    next();
  };
}
