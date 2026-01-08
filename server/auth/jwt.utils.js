import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = "1h";

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    issuer: 'sftp-gateway',
  });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
