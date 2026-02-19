import jwt, { JwtPayload as JwtPayloadBase } from "jsonwebtoken";
import dotenv from "dotenv";
import { JwtPayload } from '../src/types/index';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_ACCESS_EXPIRY = "15m";
const JWT_REFRESH_EXPIRY = "7d";

export interface TokenPayload extends JwtPayload {
  type?: 'access' | 'refresh';
}

export function signAccessToken(payload: Omit<JwtPayload, "iat" | "exp" | "iss">): string {
  return jwt.sign({ ...payload, type: 'access' }, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRY,
    issuer: "sftp-gateway",
  });
}

export function signRefreshToken(payload: Omit<JwtPayload, "iat" | "exp" | "iss">): string {
  return jwt.sign({ ...payload, type: 'refresh' }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
    issuer: "sftp-gateway",
  });
}

export function verifyToken(token: string): JwtPayload {
  const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
  return payload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
  if (payload.type !== "refresh") {
    throw new Error("INVALID_TOKEN_TYPE");
  }
  return payload;
}

export function getAccessTokenExpiry(): number {
  return 15 * 60; // 15 minutes in seconds
}
