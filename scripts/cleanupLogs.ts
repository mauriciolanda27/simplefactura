import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupLogs() {
  try {
    console.log('🧹 Cleaning up all user logs...');
    
    // Delete all user logs
    const result = await prisma.userLog.deleteMany({});
    
    console.log(`✅ Deleted ${result.count} log entries`);
    console.log('🎉 Database cleanup completed!');
  } catch (error) {
    console.error('❌ Error cleaning up logs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupLogs(); 