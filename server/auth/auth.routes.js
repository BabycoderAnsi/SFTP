import { Router } from 'express';
import { signToken } from './jwt.utils.js';
import bcrypt from 'bcryptjs';

const router = Router();

const USERS = [
    {
        id: 1,
        username: 'admin',
        passwordHash: bcrypt.hashSync('admin123', 10),
        role: 'ADMIN'
    },
    {
        id: 2,
        username: 'readonly',
        passwordHash: bcrypt.hashSync('readonly123', 10),
        role: 'READONLY'
    },
    {
        id: 3,
        username: 'writeonly',
        passwordHash: bcrypt.hashSync('writeonly123', 10),
        role: 'WRITEONLY'
    }
]

router.post('/login', async (req, res)=>{
    const { username, password } = req.body;

    const user = USERS.find(u=> u.username === username);
    if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = signToken({id: user.id, sub: username, role: user.role});

    res.json({ token });
})

export default router;
