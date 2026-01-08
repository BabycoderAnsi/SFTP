import { Router } from 'express';
import { withSftpClient } from '../services/sftp.services.js';
import { resolveSafePath } from '../utils/path.utils.js';
import { requireAuth } from '../../middlewares/requireAuth.js';

const router = Router();

router.get('/list', requireAuth(['READONLY', 'ADMIN']), async (req, res, next) => {
  try {
    const safePath = resolveSafePath(req.query.path);
    console.log('Safe Path:', safePath);

    const files = await withSftpClient((sftp) =>
      sftp.list(safePath)
    );

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
router.get('/download', requireAuth(['READONLY', 'WRITEONLY']), async (req, res, next) => {
  try {
    const safePath = resolveSafePath(req.query.path);
    const dst = req.query.dst;
    const fileName = dst.concat(safePath.split('/').pop());
    console.log('Downloading file to:', fileName);

    await withSftpClient(async (sftp) => {
      await sftp.fastGet(safePath, fileName);
    });

    res.json({ message: 'File downloaded successfully' });
  } catch (err) {
    next(err);
  }
});

router.get('/create-folder', requireAuth(['ADMIN']), async (req, res, next) => {
    try {
        const safePath = resolveSafePath(req.query.path);

        await withSftpClient(async (sftp) => {
            await sftp.mkdir(safePath);
        });

        res.json({ message: 'Folder created successfully' });
    } catch (err) {
        next(err);
    }   
});

router.get('/create-file', requireAuth(['ADMIN']), async (req, res, next) => {
    try {
        const safePath = resolveSafePath(req.query.path);

        await withSftpClient(async (sftp)=>{
            await sftp.touch(safePath)
        });

        res.json({message: 'File created successfully'})
    } catch (err) {
        next(err);
    }
})

router.get('/delete', requireAuth(['ADMIN']), async (req, res, next) => {
    try {
        const safePath = resolveSafePath(req.query.path);

        await withSftpClient(async (sftp)=>{
            await sftp.delete(safePath)
        });

        res.json({message: 'File deleted successfully'})
    } catch (err) {
        next(err);
    }
});

export default router;
