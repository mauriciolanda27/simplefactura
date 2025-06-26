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
    const { type, startDate, endDate, categoryId, vendorId } = req.query;

    // Construir filtros de fecha
    const dateFilter: Record<string, unknown> = {};
    if (startDate && endDate) {
      dateFilter.purchase_date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    // Construir filtros adicionales
    const additionalFilters: Record<string, unknown> = { userId };
    if (categoryId) {
      additionalFilters.categoryId = categoryId as string;
    }
    if (vendorId) {
      additionalFilters.vendor = vendorId as string;
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

    // Preparar respuesta según el tipo de reporte
    let reportData: Record<string, unknown> = {};

    switch (type) {
      case 'summary':
        reportData = {
          totalInvoices,
          totalAmount,
          averageAmount,
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

      case 'monthly':
        reportData = {
          monthlyStats: Object.entries(monthlyStats).map(([month, stats]) => ({
            month,
            count: stats.count,
            amount: stats.amount
          }))
        };
        break;

      case 'detailed':
        reportData = {
          invoices: invoices.map(invoice => ({
            id: invoice.id,
            authorization_code: invoice.authorization_code,
            name: invoice.name,
            nit: invoice.nit,
            number_receipt: invoice.number_receipt,
            purchase_date: invoice.purchase_date,
            total_amount: invoice.total_amount,
            vendor: invoice.vendor,
            category: invoice.category?.name,
            created_at: invoice.created_at
          }))
        };
        break;

      default:
        reportData = {
          totalInvoices,
          totalAmount,
          averageAmount
        };
    }

    return res.status(200).json(reportData);
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 