import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { log } from '../src/logging/logging';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

export function handleUploadError(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof multer.MulterError) {
    log("warn", "upload_error", {
      requestId: req.requestId,
      error: err.message,
      code: err.code,
    });

    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      });
      return;
    }

    res.status(400).json({ error: err.message });
    return;
  }

  if (err) {
    log("error", "upload_unexpected_error", {
      requestId: req.requestId,
      error: err.message,
    });
    res.status(500).json({ error: "File upload failed" });
    return;
  }

  next();
}
