type PrismaClientLike = {
  [key: string]: any;
};

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientLike };

export async function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const mod = await import('@prisma/client');
  const client = new (mod as any).PrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client;
  }
  return client as PrismaClientLike;
}
