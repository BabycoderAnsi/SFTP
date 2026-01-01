import { Router } from "express";

const router = Router();

//routes definitions would go here

router.get("/", (req, res) => {
    res.json(
        {
            "status": "ok",
            "server": "SFTP Gateway"
        }
    )
})

export default router;
