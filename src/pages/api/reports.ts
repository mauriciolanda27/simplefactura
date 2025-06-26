import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    return res.status(401).json({ error: 'Usuario no encontrado' });
  }

  switch (req.method) {
    case 'GET':
      return getReports(req, res, user.id);
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
}

async function getReports(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { 
      dateFrom, 
      dateTo, 
      category, 
      vendor, 
      rubro, 
      minAmount, 
      maxAmount, 
      reportType 
    } = req.query;

    // Construir filtros de fecha
    const dateFilter: Record<string, unknown> = {};
    if (dateFrom && dateTo) {
      dateFilter.purchase_date = {
        gte: new Date(dateFrom as string),
        lte: new Date(dateTo as string)
      };
    }

    // Construir filtros adicionales
    const additionalFilters: Record<string, unknown> = { userId };
    if (category) {
      additionalFilters.category = { name: { contains: category as string, mode: 'insensitive' } };
    }
    if (vendor) {
      additionalFilters.vendor = { contains: vendor as string, mode: 'insensitive' };
    }
    if (rubro) {
      additionalFilters.rubro = { contains: rubro as string, mode: 'insensitive' };
    }
    
    // Construir filtro de monto
    let amountFilter: Record<string, unknown> = {};
    if (minAmount) {
      amountFilter.gte = parseFloat(minAmount as string);
    }
    if (maxAmount) {
      amountFilter.lte = parseFloat(maxAmount as string);
    }
    if (Object.keys(amountFilter).length > 0) {
      additionalFilters.total_amount = amountFilter;
    }

    // Obtener facturas con filtros
    const invoices = await prisma.invoice.findMany({
      where: {
        ...additionalFilters,
        ...dateFilter
      },
      include: {
        category: true
      },
      orderBy: { purchase_date: 'desc' }
    });

    // Calcular estadísticas
    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);
    const totalInvoices = invoices.length;
    const averageAmount = totalInvoices > 0 ? totalAmount / totalInvoices : 0;
    const totalTax = totalAmount * 0.13; // 13% IVA

    // Agrupar por categoría
    const categoryStats = invoices.reduce((acc: Record<string, { count: number; amount: number }>, invoice) => {
      const categoryName = invoice.category?.name || 'Sin categoría';
      if (!acc[categoryName]) {
        acc[categoryName] = { count: 0, amount: 0 };
      }
      acc[categoryName].count += 1;
      acc[categoryName].amount += invoice.total_amount;
      return acc;
    }, {});

    // Agrupar por proveedor
    const vendorStats = invoices.reduce((acc: Record<string, { count: number; amount: number }>, invoice) => {
      const vendorName = invoice.vendor || 'Sin proveedor';
      if (!acc[vendorName]) {
        acc[vendorName] = { count: 0, amount: 0 };
      }
      acc[vendorName].count += 1;
      acc[vendorName].amount += invoice.total_amount;
      return acc;
    }, {});

    // Agrupar por mes
    const monthlyStats = invoices.reduce((acc: Record<string, { count: number; amount: number }>, invoice) => {
      const month = invoice.purchase_date.toISOString().substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { count: 0, amount: 0 };
      }
      acc[month].count += 1;
      acc[month].amount += invoice.total_amount;
      return acc;
    }, {});

    // Calcular análisis adicional
    const amounts = invoices.map(inv => inv.total_amount);
    const mostExpensiveInvoice = amounts.length > 0 ? Math.max(...amounts) : 0;
    const cheapestInvoice = amounts.length > 0 ? Math.min(...amounts) : 0;
    
    // Calcular día pico (día con mayor gasto)
    const dailyStats = invoices.reduce((acc: Record<string, number>, invoice) => {
      const day = invoice.purchase_date.toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + invoice.total_amount;
      return acc;
    }, {});
    
    const peakDay = Object.entries(dailyStats).reduce((max, [day, amount]) => 
      amount > max.amount ? { day, amount } : max, 
      { day: '', amount: 0 }
    );

    // Preparar respuesta según el tipo de reporte
    let reportData: Record<string, unknown> = {};

    switch (reportType) {
      case 'summary':
        reportData = {
          summary: {
            totalInvoices,
            totalAmount,
            averageAmount,
            totalTax,
            periodStart: dateFrom || '',
            periodEnd: dateTo || ''
          },
          topPerformers: {
            categories: Object.entries(categoryStats)
              .map(([name, stats]) => ({ name, amount: stats.amount, count: stats.count }))
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5),
            vendors: Object.entries(vendorStats)
              .map(([name, stats]) => ({ name, amount: stats.amount, count: stats.count }))
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5)
          },
          analysis: {
            growthRate: 0, // TODO: Implementar cálculo de crecimiento
            peakDay: peakDay.day,
            peakAmount: peakDay.amount,
            averageDailySpending: Object.values(dailyStats).reduce((sum, amount) => sum + amount, 0) / Math.max(Object.keys(dailyStats).length, 1),
            mostExpensiveInvoice,
            cheapestInvoice
          },
          invoices: invoices.slice(0, 10).map(invoice => ({
            id: invoice.id,
            invoice_number: invoice.number_receipt,
            vendor: invoice.vendor,
            category: invoice.category?.name || 'Sin categoría',
            rubro: invoice.rubro,
            total_amount: invoice.total_amount,
            purchase_date: invoice.purchase_date.toISOString().split('T')[0],
            description: invoice.name || ''
          }))
        };
        break;

      case 'detailed':
        reportData = {
          invoices: invoices.map(invoice => ({
            id: invoice.id,
            invoice_number: invoice.number_receipt,
            vendor: invoice.vendor,
            category: invoice.category?.name || 'Sin categoría',
            rubro: invoice.rubro,
            total_amount: invoice.total_amount,
            purchase_date: invoice.purchase_date.toISOString().split('T')[0],
            description: invoice.name || ''
          }))
        };
        break;

      case 'trends':
        reportData = {
          monthlyStats: Object.entries(monthlyStats).map(([month, stats]) => ({
            month,
            count: stats.count,
            amount: stats.amount
          }))
        };
        break;

      case 'breakdown':
        reportData = {
          categoryStats: Object.entries(categoryStats).map(([name, stats]) => ({
            name,
            count: stats.count,
            amount: stats.amount
          })),
          vendorStats: Object.entries(vendorStats).map(([name, stats]) => ({
            name,
            count: stats.count,
            amount: stats.amount
          }))
        };
        break;

      default:
        reportData = {
          summary: {
            totalInvoices,
            totalAmount,
            averageAmount,
            totalTax,
            periodStart: dateFrom || '',
            periodEnd: dateTo || ''
          }
        };
    }

    return res.status(200).json(reportData);
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 