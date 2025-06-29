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
    const filters = { dateFrom: dateFromStr, dateTo: dateToStr, category: categoryStr, vendor: vendorStr, rubro: rubroStr, minAmount: minAmountNum, maxAmount: maxAmountNum, reportType: reportTypeStr };
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
        if (analytics) {
          newCount = analytics.count + 1;
          newTotal = analytics.total_size + file_size;
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
            count: { increment: 1 },
            total_size: { increment: file_size },
            avg_file_size: newTotal / newCount,
          },
          create: {
            userId: user.id,
            date: new Date(started_at.toISOString().slice(0, 10)),
            export_type: exportType,
            format: formatStr,
            count: 1,
            total_size: file_size,
            avg_file_size: file_size,
            success_rate: 100,
          }
        });
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${exportFilename}`);
        res.send(csvBuffer);
        return;

      } else if (formatStr === 'pdf') {
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
            periodStart: dateFromStr || '',
            periodEnd: dateToStr || ''
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
            dateFrom: dateFromStr,
            dateTo: dateToStr,
            category: categoryStr,
            vendor: vendorStr,
            rubro: rubroStr,
            minAmount: minAmountNum,
            maxAmount: maxAmountNum,
            reportType: reportTypeStr
          },
          exportDate: new Date().toLocaleDateString('es-BO')
        };

        completed_at = new Date();
        // Log export history (success, no file size)
        exportId = (await prisma.exportHistory.create({
          data: {
            userId: user.id,
            export_type: exportType,
            format: formatStr,
            filename: exportFilename,
            file_size: null,
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
        let newTotal = 0;
        if (analytics) {
          newCount = analytics.count + 1;
          newTotal = analytics.total_size;
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
            count: { increment: 1 },
            avg_file_size: newTotal / newCount,
          },
          create: {
            userId: user.id,
            date: new Date(started_at.toISOString().slice(0, 10)),
            export_type: exportType,
            format: formatStr,
            count: 1,
            total_size: 0,
            avg_file_size: 0,
            success_rate: 100,
          }
        });
        res.status(200).json(pdfData);
        return;
      } else {
        status = 'failed';
        error_message = "Formato no soportado. Use 'csv' o 'pdf'";
        throw new Error(error_message);
      }
    } catch (error) {
      status = 'failed';
      error_message = error instanceof Error ? error.message : 'Error desconocido';
      await prisma.exportHistory.create({
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
          completed_at: new Date(),
        }
      });
      return res.status(400).json({ error: error_message });
    }
  } catch (error) {
    console.error('Error exporting report:', error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
} 