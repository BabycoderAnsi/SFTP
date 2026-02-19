import prisma from "../db/prisma.js";

export function findUser(username: string) {
  return prisma.user.findUnique({ where: { username } });
}
