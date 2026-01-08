import { verifyToken } from '../auth/jwt.utils.js';

export function requireAuth(requiredRoles = []) {
  return (req, res, next) => {
    try {
      console.log('🔍 [AUTH] Incoming request to protected route');

      const authHeader = req.headers.authorization;
      console.log('🔑 [AUTH] Authorization header:', authHeader);

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('⚠️ [AUTH] Missing or invalid Authorization header format');
        return res.status(401).json({ error: 'Missing token' });
      }

      const token = authHeader.split(' ')[1];
      console.log('📄 [AUTH] Extracted token (first 30 chars):', token.substring(0, 30) + '...');

      // Optional: Log token structure (do NOT log full token in production!)
      if (token.split('.').length === 3) {
        try {
          const payloadPart = token.split('.')[1];
          const decodedPayload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString());
          console.log('📦 [AUTH] Decoded JWT payload (safe preview):', JSON.stringify(decodedPayload, null, 2));
        } catch (e) {
          console.warn('⚠️ [AUTH] Could not decode JWT payload for logging');
        }
      }

      console.log('🛡️ [AUTH] Attempting to verify token...');
      const payload = verifyToken(token);
      console.log('✅ [AUTH] Token verified successfully. Payload:', payload);

      if (
        requiredRoles.length &&
        (!payload.role || !requiredRoles.includes(payload.role))
      ) {
        console.warn(
          '🚫 [AUTH] Role mismatch. Required roles:',
          requiredRoles,
          '| User role:',
          payload.role
        );
        return res.status(403).json({ error: 'Forbidden' });
      }

      req.user = payload;
      console.log('🟢 [AUTH] Authentication successful. Proceeding to next middleware.');
      next();
    } catch (err) {
      console.error('💥 [AUTH] ERROR during authentication:', err.message || err);
      console.error('🧨 [AUTH] Full error object:', err); // This shows the real cause

      // Optional: Check common JWT errors
      if (err.name === 'JsonWebTokenError') {
        console.error('❗ [AUTH] JWT Error Type:', err.message);
      } else if (err.name === 'TokenExpiredError') {
        console.error('⏰ [AUTH] Token has expired!');
      }

      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
