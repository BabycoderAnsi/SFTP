import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    server: "SFTP Gateway",
  });
});

export default router;
