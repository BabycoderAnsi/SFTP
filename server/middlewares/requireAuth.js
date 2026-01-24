import { verifyToken } from '../auth/jwt.utils.js';

export function requireAuth(requiredRoles = []) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const token = authHeader.split(' ')[1];
      const payload = verifyToken(token);
      
      if (
        requiredRoles.length &&
        (!payload.role || !requiredRoles.includes(payload.role))
      ) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid Authorization Token' });
    }
  };
}
