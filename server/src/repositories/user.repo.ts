import prisma from '../db/prisma';

export function findUser(username: string) {
  return prisma.user.findUnique({ where: { username } });
}
