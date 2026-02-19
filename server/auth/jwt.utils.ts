import jwt, { JwtPayload as JwtPayloadBase } from "jsonwebtoken";
import dotenv from "dotenv";
import { JwtPayload } from "../src/types/index.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRY = "1h";

export function signToken(
  payload: Omit<JwtPayload, "iat" | "exp" | "iss">
): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    issuer: "sftp-gateway",
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
