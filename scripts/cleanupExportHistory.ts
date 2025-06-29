import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupExportHistory() {
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  // Delete completed exports older than 1 year
  const deletedOld = await prisma.exportHistory.deleteMany({
    where: {
      status: 'completed',
      created_at: { lt: oneYearAgo },
    },
  });

  // Delete failed/cancelled exports older than 30 days
  const deletedFailed = await prisma.exportHistory.deleteMany({
    where: {
      status: { in: ['failed', 'cancelled'] },
      created_at: { lt: thirtyDaysAgo },
    },
  });

  console.log(`Deleted ${deletedOld.count} completed exports older than 1 year.`);
  console.log(`Deleted ${deletedFailed.count} failed/cancelled exports older than 30 days.`);
}

cleanupExportHistory()
  .catch((e) => {
    console.error('Cleanup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 