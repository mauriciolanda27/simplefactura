import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDatabase() {
  try {
    console.log('🧹 Cleaning up entire database...');
    
    // Delete all data in the correct order (respecting foreign key constraints)
    console.log('🗑️  Deleting export analytics...');
    await prisma.exportAnalytics.deleteMany({});
    
    console.log('🗑️  Deleting export history...');
    await prisma.exportHistory.deleteMany({});
    
    console.log('🗑️  Deleting user logs...');
    await prisma.userLog.deleteMany({});
    
    console.log('🗑️  Deleting invoices...');
    await prisma.invoice.deleteMany({});
    
    console.log('🗑️  Deleting categories...');
    await prisma.category.deleteMany({});
    
    console.log('🗑️  Deleting rubros...');
    await prisma.rubro.deleteMany({});
    
    console.log('🗑️  Deleting users...');
    await prisma.user.deleteMany({});
    
    console.log('✅ Database cleanup completed!');
    console.log('🎉 All data has been removed from the database.');
  } catch (error) {
    console.error('❌ Error cleaning up database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDatabase(); 