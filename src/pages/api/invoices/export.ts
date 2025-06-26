import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient, Prisma } from '@prisma/client';

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
    const { startDate, endDate, format, vendor, nit, categoryId, minAmount, maxAmount, includeIVA = true } = req.body;
    
    // Build query filters
    const where: Prisma.InvoiceWhereInput = {
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
        (where.total_amount as Prisma.FloatFilter).lte = parseFloat(maxAmount);
      } else {
        where.total_amount = { lte: parseFloat(maxAmount) };
      }
    }

    // Fetch invoices
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        category: true, // Incluir datos de la categoría
      },
      orderBy: {
        purchase_date: 'desc',
      },
    });

    if (invoices.length === 0) {
      return res.status(404).json({ error: "No se encontraron facturas en el rango especificado" });
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
            `"${(inv.rubro || '').replace(/"/g, '""')}"`, // Escape quotes in rubro
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
            `"${(inv.rubro || '').replace(/"/g, '""')}"`, // Escape quotes in rubro
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
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=facturas_${startDate}_${endDate}.csv`);
      res.send(csvBuffer);

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

      res.status(200).json(pdfData);
    } else {
      res.status(400).json({ error: "Formato no soportado. Use 'csv' o 'pdf'" });
    }

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: "Error al exportar facturas" });
  }
} 