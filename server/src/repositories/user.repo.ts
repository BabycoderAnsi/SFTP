import prisma from "../db/prisma.ts";

export function findUser(username: string) {
  return prisma.user.findUnique({ where: { username } });
}
