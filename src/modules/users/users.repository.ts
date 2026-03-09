import prisma from '../../lib/prisma.js';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(data: CreateUserData) {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
    },
  });
}
