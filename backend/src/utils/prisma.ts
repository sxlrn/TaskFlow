import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient({
  log: ['error'],
} as any);

(prisma as any).$connect();

export default prisma;