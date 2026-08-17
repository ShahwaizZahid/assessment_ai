import '../src/loadEnv.js';
import { PrismaClient } from '../src/generated/prisma/index.js';
import { logger } from '../src/utils/logger.js';

const prisma = new PrismaClient();

const users = [
  { email: 'admin@company.com', name: 'Admin User' },
  { email: 'employee@company.com', name: 'Employee User' },
];

async function main() {
  logger.info('Starting user seed');

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: { name: userData.name },
      create: userData,
    });
    logger.info('User seeded', { email: userData.email });
  }

  logger.info('User seed completed');
}

main()
  .catch((error) => {
    logger.error('User seed failed', { message: error.message, stack: error.stack });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
