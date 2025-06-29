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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { startDate, endDate, format, vendor, nit, categoryId, minAmount, maxAmount, includeIVA = true, filename = '' } = req.body;
    const exportType = 'invoice';
    const filters = { startDate, endDate, vendor, nit, categoryId, minAmount, maxAmount, includeIVA };
    let status = 'completed';
    let error_message = null;
    let file_size = null;
    let retry_count = req.body.retry_count || 0;
    let exportId = null;
    let exportFilename = filename || `facturas_${startDate}_${endDate}.${format}`;
    let completed_at = null;
    const started_at = new Date();

    try {
      // Build query filters
      const where: any = {
        userId: user.id, // Solo facturas del usuario actual
      };
      
      if (startDate && endDate) {
        where.purchase_date = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }
      
      if (vendor) {
        where.vendor = {
          contains: vendor,
          mode: 'insensitive',
        };
      }
      
      if (nit) {
        where.nit = {
          contains: nit,
          mode: 'insensitive',
        };
      }
      
      if (categoryId) {
        where.categoryId = categoryId;
      }
      
      if (minAmount) {
        where.total_amount = { gte: parseFloat(minAmount) };
      }
      
      if (maxAmount) {
        if (where.total_amount && typeof where.total_amount === 'object' && 'gte' in where.total_amount) {
          (where.total_amount as any).lte = parseFloat(maxAmount);
        } else {
          where.total_amount = { lte: parseFloat(maxAmount) };
        }
      }

      // Fetch invoices
      const invoices = await prisma.invoice.findMany({
        where,
        include: {
          category: true, // Incluir datos de la categoría
          rubro: true,    // Incluir datos del rubro
        },
        orderBy: {
          purchase_date: 'desc',
        },
      });

      if (invoices.length === 0) {
        status = 'failed';
        error_message = 'No se encontraron facturas en el rango especificado';
        throw new Error(error_message);
      }

      // Calculate totals for Bolivia tax compliance
      const totalAmount = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
      const totalInvoices = invoices.length;
      
      // Bolivia-specific calculations (13% IVA) - only if includeIVA is true
      const totalWithoutIVA = includeIVA ? totalAmount / 1.13 : 0;
      const totalIVA = includeIVA ? totalAmount - totalWithoutIVA : 0;

      if (format === 'csv') {
        // Create CSV content
        const csvHeaders = includeIVA 
          ? [
              'Fecha',
              'Vendedor',
              'NIT',
              'NIT/CI/CEX',
              'Número Recibo',
              'Código Autorización',
              'Nombre',
              'Categoría',
              'Rubro',
              'Monto Total (Bs.)',
              'Monto sin IVA (Bs.)',
              'IVA (Bs.)'
            ]
          : [
              'Fecha',
              'Vendedor',
              'NIT',
              'NIT/CI/CEX',
              'Número Recibo',
              'Código Autorización',
              'Nombre',
              'Categoría',
              'Rubro',
              'Monto Total (Bs.)'
            ];

        const csvRows = invoices.map(inv => {
          if (includeIVA) {
            return [
              new Date(inv.purchase_date).toLocaleDateString('es-BO'),
              `"${inv.vendor.replace(/"/g, '""')}"`, // Escape quotes in vendor name
              inv.nit || '',
              inv.nit_ci_cex || '',
              inv.number_receipt || '',
              inv.authorization_code || '',
              `"${(inv.name || '').replace(/"/g, '""')}"`, // Escape quotes in name
              inv.category?.name || '',
              `"${(inv.rubro?.name || '').replace(/"/g, '""')}"`, // Escape quotes in rubro
              inv.total_amount.toFixed(2),
              (inv.total_amount / 1.13).toFixed(2),
              (inv.total_amount - inv.total_amount / 1.13).toFixed(2)
            ];
          } else {
            return [
              new Date(inv.purchase_date).toLocaleDateString('es-BO'),
              `"${inv.vendor.replace(/"/g, '""')}"`, // Escape quotes in vendor name
              inv.nit || '',
              inv.nit_ci_cex || '',
              inv.number_receipt || '',
              inv.authorization_code || '',
              `"${(inv.name || '').replace(/"/g, '""')}"`, // Escape quotes in name
              inv.category?.name || '',
              `"${(inv.rubro?.name || '').replace(/"/g, '""')}"`, // Escape quotes in rubro
              inv.total_amount.toFixed(2)
            ];
          }
        });

        // Add summary row
        if (includeIVA) {
          csvRows.push([
            'RESUMEN',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            totalAmount.toFixed(2),
            totalWithoutIVA.toFixed(2),
            totalIVA.toFixed(2)
          ]);
        } else {
          csvRows.push([
            'RESUMEN',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            totalAmount.toFixed(2)
          ]);
        }

        // Combine headers and rows
        const csvContent = [
          csvHeaders.join(','),
          ...csvRows.map(row => row.join(','))
        ].join('\n');

        // Add BOM for proper UTF-8 encoding in Excel
        const csvBuffer = Buffer.from('\uFEFF' + csvContent, 'utf8');
        
        file_size = Buffer.byteLength(csvBuffer);
        completed_at = new Date();
        
        // Log export history (success)
        exportId = (await prisma.exportHistory.create({
          data: {
            userId: user.id,
            export_type: exportType,
            format,
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
        await prisma.exportAnalytics.upsert({
          where: {
            userId_date_export_type_format: {
              userId: user.id,
              date: new Date(started_at.toISOString().slice(0, 10)),
              export_type: exportType,
              format,
            }
          },
          update: {
            count: { increment: 1 },
            total_size: { increment: file_size },
          },
          create: {
            userId: user.id,
            date: new Date(started_at.toISOString().slice(0, 10)),
            export_type: exportType,
            format,
            count: 1,
            total_size: file_size,
            avg_file_size: file_size,
            success_rate: 100,
          }
        });

        // Set headers for streaming download
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${exportFilename}`);
        res.setHeader('Content-Length', file_size.toString());
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Transfer-Encoding', 'chunked');
        
        // Send the CSV buffer
        res.send(csvBuffer);
        return;
      } else if (format === 'pdf') {
        // For PDF, return the data and let the frontend handle PDF generation
        const pdfData = {
          invoices,
          summary: {
            totalInvoices,
            totalAmount: totalAmount.toFixed(2),
            totalWithoutIVA: includeIVA ? totalWithoutIVA.toFixed(2) : '0.00',
            totalIVA: includeIVA ? totalIVA.toFixed(2) : '0.00',
            period: `${startDate} - ${endDate}`,
            exportDate: new Date().toLocaleDateString('es-BO'),
          },
          filters: {
            startDate,
            endDate,
            vendor,
            nit,
            categoryId,
            minAmount,
            maxAmount,
          }
        };

        completed_at = new Date();
        // Log export history (success, no file size)
        exportId = (await prisma.exportHistory.create({
          data: {
            userId: user.id,
            export_type: exportType,
            format,
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
        await prisma.exportAnalytics.upsert({
          where: {
            userId_date_export_type_format: {
              userId: user.id,
              date: new Date(started_at.toISOString().slice(0, 10)),
              export_type: exportType,
              format,
            }
          },
          update: {
            count: { increment: 1 },
          },
          create: {
            userId: user.id,
            date: new Date(started_at.toISOString().slice(0, 10)),
            export_type: exportType,
            format,
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
          format,
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
    console.error('Export error:', error);
    return res.status(500).json({ error: "Error al exportar facturas" });
  }
} 