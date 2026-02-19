import { Router, Request, Response, NextFunction } from "express";
import { auditMiddleware } from '../../middlewares/audit';
import {
  withSftpClient,
  uploadFile,
  createFolder,
} from '../services/sftp.services';
import { resolveSafePath } from '../utils/path.utils';
import { requireAuth } from '../../middlewares/requireAuth';
import { upload } from '../../middlewares/upload.middleware';

const router = Router();

interface ListQuery {
  path?: string;
}

interface DownloadQuery {
  path?: string;
  dst?: string;
}

interface MkdirBody {
  path?: string;
}

router.get(
  "/list",
  requireAuth(["READONLY", "ADMIN"]),
  auditMiddleware("LIST"),
  async (
    req: Request<object, unknown, unknown, ListQuery>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const safePath = resolveSafePath(req.query.path);

      const files = await withSftpClient((sftp) => {
        return sftp.list(safePath);
      });

      res.json({
        Message: "Files retrieved successfully",
        Files: files,
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
  async (
    req: Request<object, unknown, unknown, DownloadQuery>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const safePath = resolveSafePath(req.query.path);
      const dst = req.query.dst || "";
      const fileName = dst.concat(safePath.split("/").pop() || "");

      const result = await withSftpClient(async (sftp) => {
        return await sftp.fastGet(safePath, fileName);
      });

      res.json({ message: "File downloaded successfully", result });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/upload",
  requireAuth(["WRITEONLY", "ADMIN"]),
  auditMiddleware("UPLOAD"),
  upload.single("file"),
  async (
    req: Request<object, unknown, unknown, ListQuery>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const safePath = resolveSafePath(req.query.path);
      const remotePath = `${safePath}/${req.file.originalname}`;

      const result = await withSftpClient(async (sftp) => {
        return await uploadFile(sftp, remotePath, req.file!.buffer);
      });

      res.json({
        message: "File uploaded successfully",
        path: remotePath,
        result,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/mkdir",
  requireAuth(["WRITEONLY", "ADMIN"]),
  auditMiddleware("MKDIR"),
  async (
    req: Request<object, unknown, MkdirBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const safePath = resolveSafePath(req.body.path);

      const result = await withSftpClient(async (sftp) => {
        return await createFolder(sftp, safePath);
      });

      res.json({
        message: "Folder created successfully",
        path: safePath,
        result,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
