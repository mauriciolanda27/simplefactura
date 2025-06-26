import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const userEmail = session.user.email;
  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) {
    return res.status(500).json({ error: "Usuario inválido" });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    // Parse query parameters
    const {
      dateFrom,
      dateTo,
      category,
      vendor,
      rubro,
      minAmount,
      maxAmount,
      reportType = 'summary',
      format = 'pdf'
    } = req.query;

    // Build where clause
    const whereClause: any = { userId: user.id };

    if (dateFrom || dateTo) {
      whereClause.purchase_date = {};
      if (dateFrom) whereClause.purchase_date.gte = new Date(dateFrom as string);
      if (dateTo) whereClause.purchase_date.lte = new Date(dateTo as string);
    }

    if (category) whereClause.category = { name: { contains: category as string, mode: 'insensitive' } };
    if (vendor) whereClause.vendor = { contains: vendor as string, mode: 'insensitive' };
    if (rubro) whereClause.rubro = { contains: rubro as string, mode: 'insensitive' };
    
    // Build amount filter
    let amountFilter: any = {};
    if (minAmount) amountFilter.gte = parseFloat(minAmount as string);
    if (maxAmount) amountFilter.lte = parseFloat(maxAmount as string);
    if (Object.keys(amountFilter).length > 0) {
      whereClause.total_amount = amountFilter;
    }

    // Get filtered invoices
    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { purchase_date: 'desc' }
    });

    if (invoices.length === 0) {
      return res.status(404).json({ error: "No se encontraron facturas en el rango especificado" });
    }

    // Calculate statistics
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const totalInvoices = invoices.length;
    const averageAmount = totalInvoices > 0 ? totalAmount / totalInvoices : 0;
    const totalTax = totalAmount * 0.13;

    // Group by category
    const categoryStats = invoices.reduce((acc: Record<string, { count: number; amount: number }>, invoice) => {
      const categoryName = invoice.category?.name || 'Sin categoría';
      if (!acc[categoryName]) {
        acc[categoryName] = { count: 0, amount: 0 };
      }
      acc[categoryName].count += 1;
      acc[categoryName].amount += invoice.total_amount;
      return acc;
    }, {});

    // Group by vendor
    const vendorStats = invoices.reduce((acc: Record<string, { count: number; amount: number }>, invoice) => {
      const vendorName = invoice.vendor || 'Sin proveedor';
      if (!acc[vendorName]) {
        acc[vendorName] = { count: 0, amount: 0 };
      }
      acc[vendorName].count += 1;
      acc[vendorName].amount += invoice.total_amount;
      return acc;
    }, {});

    if (format === 'csv') {
      // Generate CSV content
      let csvContent = '';
      
      if (reportType === 'summary') {
        csvContent = `Reporte Resumen de Facturas\n`;
        csvContent += `Período: ${dateFrom ? new Date(dateFrom as string).toLocaleDateString() : 'Todo'} - ${dateTo ? new Date(dateTo as string).toLocaleDateString() : 'Hoy'}\n`;
        csvContent += `Generado: ${new Date().toLocaleString()}\n\n`;
        
        csvContent += `Métrica,Valor\n`;
        csvContent += `Total Facturas,${totalInvoices}\n`;
        csvContent += `Monto Total,${totalAmount.toFixed(2)}\n`;
        csvContent += `IVA Total (13%),${totalTax.toFixed(2)}\n`;
        csvContent += `Promedio por Factura,${averageAmount.toFixed(2)}\n\n`;

        // Top categories
        csvContent += `Top Categorías\n`;
        csvContent += `Categoría,Monto,Cantidad\n`;
        Object.entries(categoryStats)
          .sort((a, b) => b[1].amount - a[1].amount)
          .slice(0, 5)
          .forEach(([category, stats]) => {
            csvContent += `${category},${stats.amount.toFixed(2)},${stats.count}\n`;
          });

        csvContent += `\nTop Proveedores\n`;
        csvContent += `Proveedor,Monto,Cantidad\n`;
        Object.entries(vendorStats)
          .sort((a, b) => b[1].amount - a[1].amount)
          .slice(0, 5)
          .forEach(([vendor, stats]) => {
            csvContent += `${vendor},${stats.amount.toFixed(2)},${stats.count}\n`;
          });

      } else if (reportType === 'detailed') {
        csvContent = `Reporte Detallado de Facturas\n`;
        csvContent += `Período: ${dateFrom ? new Date(dateFrom as string).toLocaleDateString() : 'Todo'} - ${dateTo ? new Date(dateTo as string).toLocaleDateString() : 'Hoy'}\n`;
        csvContent += `Generado: ${new Date().toLocaleString()}\n\n`;
        
        csvContent += `Número,Proveedor,Categoría,Rubro,Monto,Fecha,Descripción\n`;
        invoices.forEach(inv => {
          csvContent += `"${inv.number_receipt || ''}","${(inv.vendor || 'Sin proveedor').replace(/"/g, '""')}","${(inv.category?.name || 'Sin categoría').replace(/"/g, '""')}","${(inv.rubro || 'Sin rubro').replace(/"/g, '""')}",${inv.total_amount.toFixed(2)},"${new Date(inv.purchase_date).toLocaleDateString()}","${(inv.name || '').replace(/"/g, '""')}"\n`;
        });
      }

      // Add BOM for proper UTF-8 encoding in Excel
      const csvBuffer = Buffer.from('\uFEFF' + csvContent, 'utf8');
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=reporte_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvBuffer);

    } else if (format === 'pdf') {
      // For PDF, return the data and let the frontend handle PDF generation
      const pdfData = {
        invoices: invoices.map(inv => ({
          id: inv.id,
          number_receipt: inv.number_receipt,
          vendor: inv.vendor,
          category: inv.category?.name || 'Sin categoría',
          rubro: inv.rubro,
          total_amount: inv.total_amount,
          purchase_date: inv.purchase_date,
          name: inv.name
        })),
        summary: {
          totalInvoices,
          totalAmount: totalAmount.toFixed(2),
          averageAmount: averageAmount.toFixed(2),
          totalTax: totalTax.toFixed(2),
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
        filters: {
          dateFrom,
          dateTo,
          category,
          vendor,
          rubro,
          minAmount,
          maxAmount,
          reportType
        },
        exportDate: new Date().toLocaleDateString('es-BO')
      };

      res.status(200).json(pdfData);
    } else {
      res.status(400).json({ error: "Formato no soportado. Use 'csv' o 'pdf'" });
    }

  } catch (error) {
    console.error('Error exporting report:', error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
} 