import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "No autenticado" });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const userEmail = session.user?.email;
    if (!userEmail) {
      return res.status(400).json({ error: "Email de usuario no disponible" });
    }
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      return res.status(500).json({ error: "Usuario inválido" });
    }

    // Parse query parameters
    const {
      dateFrom,
      dateTo,
      category,
      vendor,
      rubro,
      minAmount,
      maxAmount,
      reportType = 'summary'
    } = req.query;

    // Build where clause
    const whereClause: any = { userId: user.id };

    if (dateFrom || dateTo) {
      whereClause.purchase_date = {};
      if (dateFrom) whereClause.purchase_date.gte = new Date(dateFrom as string);
      if (dateTo) whereClause.purchase_date.lte = new Date(dateTo as string);
    }

    if (category) whereClause.category = { name: category as string };
    if (vendor) whereClause.vendor = vendor as string;
    if (rubro) whereClause.rubro = rubro as string;
    if (minAmount) whereClause.total_amount = { gte: parseFloat(minAmount as string) };
    if (maxAmount) {
      if (whereClause.total_amount) {
        whereClause.total_amount.lte = parseFloat(maxAmount as string);
      } else {
        whereClause.total_amount = { lte: parseFloat(maxAmount as string) };
      }
    }

    // Get filtered invoices
    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { purchase_date: 'asc' }
    });

    console.log('Reports API Debug:', {
      userId: user.id,
      whereClause,
      invoicesFound: invoices.length,
      firstInvoice: invoices[0] ? {
        id: invoices[0].id,
        purchase_date: invoices[0].purchase_date,
        total_amount: invoices[0].total_amount,
        vendor: invoices[0].vendor,
        category: invoices[0].category?.name
      } : null
    });

    if (invoices.length === 0) {
      return res.json({
        summary: {
          totalInvoices: 0,
          totalAmount: 0,
          averageAmount: 0,
          totalTax: 0,
          periodStart: dateFrom || '',
          periodEnd: dateTo || ''
        },
        trends: { daily: [], weekly: [], monthly: [] },
        breakdown: { byCategory: [], byVendor: [], byRubro: [] },
        topPerformers: { categories: [], vendors: [] },
        analysis: {
          growthRate: 0,
          peakDay: '',
          peakAmount: 0,
          averageDailySpending: 0,
          mostExpensiveInvoice: 0,
          cheapestInvoice: 0
        },
        invoices: []
      });
    }

    // Calculate summary
    const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(String(inv.total_amount || '0')), 0);
    const totalTax = totalAmount * 0.13; // 13% IVA Bolivia
    const averageAmount = totalAmount / invoices.length;

    // Generate trends data
    const trends = generateTrendsData(invoices);

    // Generate breakdown data
    const breakdown = generateBreakdownData(invoices, totalAmount);

    // Generate top performers
    const topPerformers = generateTopPerformers(breakdown);

    // Generate analysis
    const analysis = generateAnalysis(invoices, totalAmount);

    // Prepare invoices for detailed report
    const invoicesData = invoices.map(inv => ({
      id: inv.id,
      invoice_number: inv.invoice_number,
      vendor: inv.vendor || 'Sin proveedor',
      category: inv.category?.name || 'Sin categoría',
      rubro: inv.rubro || 'Sin rubro',
      total_amount: parseFloat(String(inv.total_amount || '0')),
      purchase_date: inv.purchase_date.toISOString(),
      description: inv.description || ''
    }));

    return res.json({
      summary: {
        totalInvoices: invoices.length,
        totalAmount,
        averageAmount,
        totalTax,
        periodStart: dateFrom || '',
        periodEnd: dateTo || ''
      },
      trends,
      breakdown,
      topPerformers,
      analysis,
      invoices: invoicesData
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

function generateTrendsData(invoices: any[]) {
  const now = new Date();
  
  // Daily trends (last 30 days)
  const dailyData = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

    const dayInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.purchase_date);
      return invDate >= dayStart && invDate <= dayEnd;
    });

    const dayAmount = dayInvoices.reduce((sum, inv) => sum + parseFloat(String(inv.total_amount || '0')), 0);
    
    dailyData.push({
      date: date.toLocaleDateString('es-BO', { month: 'short', day: 'numeric' }),
      amount: dayAmount,
      count: dayInvoices.length
    });
  }

  // Weekly trends (last 8 weeks)
  const weeklyData = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.purchase_date);
      return invDate >= weekStart && invDate <= weekEnd;
    });

    const weekAmount = weekInvoices.reduce((sum, inv) => sum + parseFloat(String(inv.total_amount || '0')), 0);
    
    weeklyData.push({
      week: `Semana ${8-i}`,
      amount: weekAmount,
      count: weekInvoices.length
    });
  }

  // Monthly trends (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const monthInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.purchase_date);
      return invDate >= monthStart && invDate <= monthEnd;
    });

    const monthAmount = monthInvoices.reduce((sum, inv) => sum + parseFloat(String(inv.total_amount || '0')), 0);
    
    monthlyData.push({
      month: monthStart.toLocaleDateString('es-BO', { month: 'short', year: 'numeric' }),
      amount: monthAmount,
      count: monthInvoices.length
    });
  }

  return { daily: dailyData, weekly: weeklyData, monthly: monthlyData };
}

function generateBreakdownData(invoices: any[], totalAmount: number) {
  // By category
  const categoryMap = new Map<string, { count: number; amount: number }>();
  invoices.forEach(inv => {
    const categoryName = inv.category?.name || 'Sin categoría';
    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, { count: 0, amount: 0 });
    }
    const current = categoryMap.get(categoryName)!;
    current.count++;
    current.amount += parseFloat(String(inv.total_amount || '0'));
  });

  const byCategory = Array.from(categoryMap.entries()).map(([name, data]) => ({
    category: name,
    count: data.count,
    amount: data.amount,
    percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
  }));

  // By vendor
  const vendorMap = new Map<string, { count: number; amount: number }>();
  invoices.forEach(inv => {
    const vendor = inv.vendor || 'Sin proveedor';
    if (!vendorMap.has(vendor)) {
      vendorMap.set(vendor, { count: 0, amount: 0 });
    }
    const current = vendorMap.get(vendor)!;
    current.count++;
    current.amount += parseFloat(String(inv.total_amount || '0'));
  });

  const byVendor = Array.from(vendorMap.entries()).map(([name, data]) => ({
    vendor: name,
    count: data.count,
    amount: data.amount,
    percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
  }));

  // By rubro
  const rubroMap = new Map<string, { count: number; amount: number }>();
  invoices.forEach(inv => {
    const rubro = inv.rubro || 'Sin rubro';
    if (!rubroMap.has(rubro)) {
      rubroMap.set(rubro, { count: 0, amount: 0 });
    }
    const current = rubroMap.get(rubro)!;
    current.count++;
    current.amount += parseFloat(String(inv.total_amount || '0'));
  });

  const byRubro = Array.from(rubroMap.entries()).map(([name, data]) => ({
    rubro: name,
    count: data.count,
    amount: data.amount,
    percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
  }));

  return { byCategory, byVendor, byRubro };
}

function generateTopPerformers(breakdown: any) {
  const topCategories = breakdown.byCategory
    .sort((a: any, b: any) => b.amount - a.amount)
    .slice(0, 5)
    .map((cat: any) => ({
      name: cat.category,
      amount: cat.amount,
      count: cat.count
    }));

  const topVendors = breakdown.byVendor
    .sort((a: any, b: any) => b.amount - a.amount)
    .slice(0, 5)
    .map((vendor: any) => ({
      name: vendor.vendor,
      amount: vendor.amount,
      count: vendor.count
    }));

  return { categories: topCategories, vendors: topVendors };
}

function generateAnalysis(invoices: any[], totalAmount: number) {
  const now = new Date();
  
  // Calculate growth rate (current month vs previous month)
  const currentMonthInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.purchase_date);
    return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
  });

  const previousMonthInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.purchase_date);
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return invDate.getMonth() === prevMonth && invDate.getFullYear() === prevYear;
  });

  const currentMonthAmount = currentMonthInvoices.reduce((sum, inv) => sum + parseFloat(String(inv.total_amount || '0')), 0);
  const previousMonthAmount = previousMonthInvoices.reduce((sum, inv) => sum + parseFloat(String(inv.total_amount || '0')), 0);
  const growthRate = previousMonthAmount > 0 ? ((currentMonthAmount - previousMonthAmount) / previousMonthAmount) * 100 : 0;

  // Find peak day
  const dailyAmounts = new Map<string, number>();
  invoices.forEach(inv => {
    const date = new Date(inv.purchase_date).toLocaleDateString();
    const current = dailyAmounts.get(date) || 0;
    dailyAmounts.set(date, current + parseFloat(String(inv.total_amount || '0')));
  });

  let peakDay = '';
  let peakAmount = 0;
  dailyAmounts.forEach((amount, date) => {
    if (amount > peakAmount) {
      peakAmount = amount;
      peakDay = date;
    }
  });

  // Calculate average daily spending
  const totalDays = Math.max(1, Math.ceil((now.getTime() - new Date(invoices[0].purchase_date).getTime()) / (1000 * 60 * 60 * 24)));
  const averageDailySpending = totalAmount / totalDays;

  // Find most expensive and cheapest invoices
  const amounts = invoices.map(inv => parseFloat(String(inv.total_amount || '0')));
  const mostExpensiveInvoice = Math.max(...amounts);
  const cheapestInvoice = Math.min(...amounts);

  return {
    growthRate,
    peakDay,
    peakAmount,
    averageDailySpending,
    mostExpensiveInvoice,
    cheapestInvoice
  };
} 