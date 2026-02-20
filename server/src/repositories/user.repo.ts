import prisma from '../db/prisma';
import { Role, UserStatus } from '../generated/prisma';

export function findUser(username: string) {
  return prisma.user.findUnique({ where: { username } });
}

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function createUser(data: {
  username: string;
  email: string;
  password: string;
  role?: Role;
  status?: UserStatus;
}) {
  return prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      password: data.password,
      role: data.role || Role.READ_ONLY,
      status: data.status || UserStatus.PENDING,
    },
  });
}

export function listUsers(params: {
  status?: UserStatus;
  role?: Role;
  limit: number;
  offset: number;
}) {
  const where: { status?: UserStatus; role?: Role } = {};
  if (params.status) where.status = params.status;
  if (params.role) where.role = params.role;

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: params.limit,
    skip: params.offset,
  });
}

export function countUsers(params: { status?: UserStatus; role?: Role }) {
  const where: { status?: UserStatus; role?: Role } = {};
  if (params.status) where.status = params.status;
  if (params.role) where.role = params.role;

  return prisma.user.count({ where });
}

export function updateUserStatus(id: string, status: UserStatus) {
  return prisma.user.update({
    where: { id },
    data: { status },
    select: { id: true, username: true, status: true },
  });
}

export function updateUserRole(id: string, role: Role) {
  return prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, username: true, role: true },
  });
}
