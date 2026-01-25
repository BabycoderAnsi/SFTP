import bcrypt from "bcryptjs";
import { findUser } from "../src/repositories/user.repo.ts";
import { signToken } from "./jwt.utils.ts";

export async function loginUser(
  username: string,
  password: string
): Promise<string> {
  const user = await findUser(username);

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return signToken({
    sub: user.username,
    role: user.role,
    id: user.id,
  });
}
