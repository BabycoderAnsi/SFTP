import { Router, Request, Response, NextFunction } from "express";
import { auditMiddleware } from '../../middlewares/audit';
import {
  withSftpClient,
  uploadFileStream,
  createFolder,
} from '../services/sftp.services';
import { resolveSafePath } from '../utils/path.utils';
import { requireAuth } from '../../middlewares/requireAuth';
import { upload, handleUploadError } from '../../middlewares/upload.middleware';
import { validateQuery, validateBody } from '../../middlewares/validate.middleware';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.utils';
import { sanitizeFilename } from '../utils/sanitize.utils';
import { listQuerySchema, downloadQuerySchema, uploadQuerySchema, mkdirBodySchema } from '../schemas';
import { unlinkSync } from 'fs';
import path from 'path';

const router = Router();

router.get(
  "/list",
  requireAuth(["READONLY", "ADMIN"]),
  auditMiddleware("LIST"),
  validateQuery(listQuerySchema),
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const queryPath = String(req.query.path || '/');
      const limit = Number(req.query.limit) || 100;
      const offset = Number(req.query.offset) || 0;
      const safePath = resolveSafePath(queryPath);

      const allFiles = await withSftpClient((sftp) => {
        return sftp.list(safePath);
      });

      const total = allFiles.length;
      const files = allFiles.slice(offset, offset + limit);

      paginatedResponse(res, { files, path: safePath }, req.requestId, {
        total,
        limit,
        offset,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/download",
  requireAuth(["READONLY", "ADMIN"]),
  auditMiddleware("DOWNLOAD"),
  validateQuery(downloadQuerySchema),
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const queryPath = String(req.query.path || '');
      const safePath = resolveSafePath(queryPath);
      const filename = path.basename(safePath);

      await withSftpClient(async (sftp) => {
        const stats = await sftp.stat(safePath);

        if (stats.isDirectory) {
          errorResponse(res, "Cannot download a directory", req.requestId, 400, "IS_DIRECTORY");
          return;
        }

        const contentLength = typeof stats.size === 'number' ? stats.size : undefined;

        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
        res.setHeader('X-Request-Id', req.requestId || '');
        if (contentLength !== undefined) {
          res.setHeader('Content-Length', contentLength);
        }

        const stream = sftp.createReadStream(safePath);
        stream.pipe(res);

        return new Promise<void>((resolve, reject) => {
          stream.on('end', () => resolve());
          stream.on('error', (err: Error) => reject(err));
        });
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/upload",
  requireAuth(["WRITEONLY", "ADMIN"]),
  upload.single("file"),
  handleUploadError,
  validateQuery(uploadQuerySchema),
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const tempFilePath = req.file?.path;

    try {
      if (!req.file) {
        errorResponse(res, "No file uploaded", req.requestId, 400, "NO_FILE");
        return;
      }

      const { path: queryPath } = req.query as { path: string };
      const safePath = resolveSafePath(queryPath);
      const sanitizedFilename = sanitizeFilename(req.file.originalname);
      const remotePath = `${safePath}/${sanitizedFilename}`;

      await withSftpClient(async (sftp) => {
        await uploadFileStream(sftp, remotePath, req.file!.path);
      });

      if (tempFilePath) {
        try {
          unlinkSync(tempFilePath);
        } catch {
          // Ignore cleanup errors
        }
      }

      successResponse(res, {
        message: "File uploaded successfully",
        path: remotePath,
        filename: sanitizedFilename,
        size: req.file.size,
      }, req.requestId, 201);
    } catch (err) {
      if (tempFilePath) {
        try {
          unlinkSync(tempFilePath);
        } catch {
          // Ignore cleanup errors
        }
      }
      next(err);
    }
  }
);

router.post(
  "/mkdir",
  requireAuth(["WRITEONLY", "ADMIN"]),
  auditMiddleware("MKDIR"),
  validateBody(mkdirBodySchema),
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { path: bodyPath } = req.body;
      const safePath = resolveSafePath(bodyPath);

      await withSftpClient(async (sftp) => {
        return await createFolder(sftp, safePath);
      });

      successResponse(res, {
        message: "Folder created successfully",
        path: safePath,
      }, req.requestId, 201);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
