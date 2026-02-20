import bcrypt from "bcryptjs";
import { findUser, createUser, findUserByEmail } from '../src/repositories/user.repo';
import { signAccessToken, signRefreshToken } from './jwt.utils';
import { UserStatus } from '../src/generated/prisma';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResult {
  username: string;
  message: string;
}

export async function loginUser(
  username: string,
  password: string
): Promise<TokenPair> {
  const user = await findUser(username);

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (user.status === UserStatus.PENDING) {
    throw new Error("ACCOUNT_PENDING");
  }

  if (user.status === UserStatus.DISABLED) {
    throw new Error("ACCOUNT_DISABLED");
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

export async function registerUser(
  username: string,
  email: string,
  password: string
): Promise<RegisterResult> {
  const existingUser = await findUser(username);
  if (existingUser) {
    throw new Error("USERNAME_EXISTS");
  }

  const existingEmail = await findUserByEmail(email);
  if (existingEmail) {
    throw new Error("EMAIL_EXISTS");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await createUser({
    username,
    email,
    password: hashedPassword,
  });

  return {
    username,
    message: "Account created. Awaiting admin approval.",
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
