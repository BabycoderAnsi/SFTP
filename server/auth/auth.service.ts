import bcrypt from "bcryptjs";
import { findUser } from '../src/repositories/user.repo';
import { signAccessToken, signRefreshToken } from './jwt.utils';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export async function loginUser(
  username: string,
  password: string
): Promise<TokenPair> {
  const user = await findUser(username);

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const payload = {
    sub: user.username,
    role: user.role,
    id: user.id,
  };

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
  const { verifyRefreshToken } = await import('./jwt.utils');
  const payload = verifyRefreshToken(refreshToken);

  const newPayload = {
    sub: payload.sub,
    role: payload.role,
    id: payload.id,
  };

  return {
    accessToken: signAccessToken(newPayload),
  };
}
