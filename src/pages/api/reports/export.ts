import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from '@prisma/client';
import { logReportAction, LOG_ACTIONS } from '../../../utils/logging';

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
      format = 'pdf',
      filename = ''
    } = req.query;
    const getString = (v: string | string[] | undefined) => Array.isArray(v) ? v[0] : v || '';
    const dateFromStr = getString(dateFrom);
    const dateToStr = getString(dateTo);
    const categoryStr = getString(category);
    const vendorStr = getString(vendor);
    const rubroStr = getString(rubro);
    const reportTypeStr = getString(reportType);
    const formatStr = getString(format);
    const filenameStr = getString(filename);
    const minAmountNum = minAmount ? parseFloat(getString(minAmount)) : undefined;
    const maxAmountNum = maxAmount ? parseFloat(getString(maxAmount)) : undefined;
    const exportType = 'report';
    let status = 'completed';
    let error_message = null;
    let file_size = null;
    let retry_count = req.query.retry_count ? Number(getString(req.query.retry_count)) : 0;
    let exportId = null;
    let exportFilename = filenameStr || `reporte_${reportTypeStr}_${new Date().toISOString().split('T')[0]}.${formatStr}`;
    let completed_at = null;
    const started_at = new Date();

    try {
      // Build where clause
      const whereClause: any = { userId: user.id };

      if (dateFromStr || dateToStr) {
        whereClause.purchase_date = {};
        if (dateFromStr) whereClause.purchase_date.gte = new Date(dateFromStr);
        if (dateToStr) whereClause.purchase_date.lte = new Date(dateToStr);
      }

      if (categoryStr) whereClause.category = { name: { contains: categoryStr, mode: 'insensitive' } };
      if (vendorStr) whereClause.vendor = { contains: vendorStr, mode: 'insensitive' };
      if (rubroStr) whereClause.rubro = { contains: rubroStr, mode: 'insensitive' };
      
      // Build amount filter
      let amountFilter: any = {};
      if (minAmountNum) amountFilter.gte = minAmountNum;
      if (maxAmountNum) amountFilter.lte = maxAmountNum;
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
        status = 'failed';
        error_message = 'No se encontraron facturas en el rango especificado';
        throw new Error(error_message);
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

      if (formatStr === 'csv') {
        // Generate CSV content
        let csvContent = '';
        
        if (reportTypeStr === 'summary') {
          csvContent = `Reporte Resumen de Facturas\n`;
          csvContent += `Período: ${dateFromStr ? new Date(dateFromStr).toLocaleDateString() : 'Todo'} - ${dateToStr ? new Date(dateToStr).toLocaleDateString() : 'Hoy'}\n`;
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

        } else if (reportTypeStr === 'detailed') {
          csvContent = `Reporte Detallado de Facturas\n`;
          csvContent += `Período: ${dateFromStr ? new Date(dateFromStr).toLocaleDateString() : 'Todo'} - ${dateToStr ? new Date(dateToStr).toLocaleDateString() : 'Hoy'}\n`;
          csvContent += `Generado: ${new Date().toLocaleString()}\n\n`;
          
          csvContent += `Número,Proveedor,Categoría,Rubro,Monto,Fecha,Descripción\n`;
          invoices.forEach(inv => {
            csvContent += `"${inv.number_receipt || ''}","${(inv.vendor || 'Sin proveedor').replace(/"/g, '""')}","${(inv.category?.name || 'Sin categoría').replace(/"/g, '""')}","${(inv.rubro || 'Sin rubro').replace(/"/g, '""')}",${inv.total_amount.toFixed(2)},"${new Date(inv.purchase_date).toLocaleDateString()}","${(inv.name || '').replace(/"/g, '""')}"\n`;
          });
        }

        // Add BOM for proper UTF-8 encoding in Excel
        const csvBuffer = Buffer.from('\uFEFF' + csvContent, 'utf8');
        
        file_size = Buffer.byteLength(csvBuffer);
        completed_at = new Date();

        // Log the export action
        await logReportAction(
          user.id,
          formatStr === 'csv' ? LOG_ACTIONS.EXPORT_CSV : LOG_ACTIONS.EXPORT_PDF,
          {
            reportType: reportTypeStr,
            format: formatStr,
            filename: exportFilename,
            fileSize: file_size,
            filters,
            totalInvoices,
            totalAmount
          }
        );

        // Log export history (success)
        exportId = (await prisma.exportHistory.create({
          data: {
            userId: user.id,
            export_type: exportType,
            format: formatStr,
            filename: exportFilename,
            file_size,
            filters,
            status,
            retry_count,
            created_at: started_at,
            completed_at,
          }
        })).id;

        // Update analytics
        const analytics = await prisma.exportAnalytics.findUnique({
          where: {
            userId_date_export_type_format: {
              userId: user.id,
              date: new Date(started_at.toISOString().slice(0, 10)),
              export_type: exportType,
              format: formatStr,
            }
          }
        });
        let newCount = 1;
        let newTotal = file_size;
        let newAvg = file_size;
        let newSuccessRate = 100;

        if (analytics) {
          newCount = analytics.count + 1;
          newTotal = analytics.total_size + file_size;
          newAvg = newTotal / newCount;
          newSuccessRate = ((analytics.success_rate * analytics.count) + 100) / newCount;
        }

        await prisma.exportAnalytics.upsert({
          where: {
            userId_date_export_type_format: {
              userId: user.id,
              date: new Date(started_at.toISOString().slice(0, 10)),
              export_type: exportType,
              format: formatStr,
            }
          },
          update: {
            count: newCount,
            total_size: newTotal,
            avg_file_size: newAvg,
            success_rate: newSuccessRate,
          },
          create: {
            userId: user.id,
            date: new Date(started_at.toISOString().slice(0, 10)),
            export_type: exportType,
            format: formatStr,
            count: newCount,
            total_size: newTotal,
            avg_file_size: newAvg,
            success_rate: newSuccessRate,
          }
        });

        // Set response headers for CSV download
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${exportFilename}"`);
        res.setHeader('Content-Length', file_size.toString());
        res.setHeader('Cache-Control', 'no-cache');
        
        return res.send(csvBuffer);

      } else if (formatStr === 'pdf') {
        // For PDF, return the data for frontend processing
        const pdfData = {
          summary: {
            totalInvoices,
            totalAmount,
            averageAmount,
            totalTax,
            periodStart: dateFromStr,
            periodEnd: dateToStr
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
          invoices: reportTypeStr === 'detailed' ? invoices.slice(0, 50).map(inv => ({
            id: inv.id,
            invoice_number: inv.number_receipt,
            vendor: inv.vendor,
            category: inv.category?.name || 'Sin categoría',
            rubro: inv.rubro || 'Sin rubro',
            total_amount: inv.total_amount,
            purchase_date: inv.purchase_date.toISOString().split('T')[0],
            description: inv.name || ''
          })) : [],
          exportDate: new Date().toISOString()
        };

        // Log the export action
        await logReportAction(
          user.id,
          LOG_ACTIONS.EXPORT_PDF,
          {
            reportType: reportTypeStr,
            format: formatStr,
            filename: exportFilename,
            filters,
            totalInvoices,
            totalAmount
          },
          req.headers['user-agent']
        );

        return res.json(pdfData);
      }

    } catch (error) {
      status = 'failed';
      error_message = error instanceof Error ? error.message : 'Error desconocido';
      completed_at = new Date();
      
      // Log export history (failure)
      exportId = (await prisma.exportHistory.create({
        data: {
          userId: user.id,
          export_type: exportType,
          format: formatStr,
          filename: exportFilename,
          file_size,
          filters,
          status,
          error_message,
          retry_count,
          created_at: started_at,
          completed_at,
        }
      })).id;

      throw error;
    }

  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ 
      error: "Error al exportar reporte",
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 