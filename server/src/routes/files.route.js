import { Router } from 'express';
import { withSftpClient } from '../services/sftp.services.js';
import { resolveSafePath } from '../utils/path.utils.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { upload } from '../../middlewares/upload.middleware.js';
import { uploadFile, createFolder } from '../services/sftp.services.js';
const router = Router();

router.get('/list', requireAuth(['READONLY', 'ADMIN']), async (req, res, next) => {
  try {
    const safePath = resolveSafePath(req.query.path);
    console.log('Safe Path:', safePath);

    const files = await withSftpClient(async (sftp) => {
      return await sftp.list(safePath)
    });

    res.json({
      "Message": "Files retrieved successfully",
      "Files": files
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Download file (streaming)
 */
router.get('/download', requireAuth(['READONLY', 'ADMIN']), async (req, res, next) => {
  try {
    const safePath = resolveSafePath(req.query.path);
    const dst = req.query.dst;
    const fileName = dst.concat(safePath.split('/').pop());
    console.log('Downloading file to:', fileName);

    const result = await withSftpClient(async (sftp) => {
      return await sftp.fastGet(safePath, fileName);
    });

    res.json({ message: 'File downloaded successfully', result });
  } catch (err) {
    next(err);
  }
});

router.post('/upload', requireAuth(['WRITEONLY', 'ADMIN']), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" })
    }

    const safePath = resolveSafePath(req.query.path);
    const remotePath = `${safePath}/${req.file.originalname}`;

    const result = await withSftpClient(async (sftp) => {
      return await uploadFile(sftp, remotePath, req.file.buffer);
    })

    res.json({ message: "File uploaded successfully", path: remotePath, result })
  } catch (err) {
    next(err);
  }
})

router.post('/mkdir', requireAuth(['WRITEONLY', 'ADMIN']), async (req, res, next) => {
  try {
    const safePath = resolveSafePath(req.body.path);

    const result = await withSftpClient(async (sftp) => {
      return await createFolder(sftp, safePath);
    })

    res.json({ message: "Folder created successfully", path: safePath, result })
  } catch (err) {
    next(err);
  }
})

export default router;
