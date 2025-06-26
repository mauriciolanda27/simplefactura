import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from '@prisma/client';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

    if (format === 'csv') {
      return generateCSVReport(res, invoices, reportType as string, {
        dateFrom: dateFrom as string,
        dateTo: dateTo as string
      });
    } else {
      return generatePDFReport(res, invoices, reportType as string, {
        dateFrom: dateFrom as string,
        dateTo: dateTo as string
      });
    }

  } catch (error) {
    console.error('Error exporting report:', error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

function generateCSVReport(res: NextApiResponse, invoices: any[], reportType: string, filters: any) {
  const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(String(inv.total_amount || '0')), 0);
  const totalTax = totalAmount * 0.13;

  let csvContent = '';

  if (reportType === 'summary') {
    csvContent = `Reporte Resumen de Facturas\n`;
    csvContent += `Período: ${filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString() : 'Todo'} - ${filters.dateTo ? new Date(filters.dateTo).toLocaleDateString() : 'Hoy'}\n`;
    csvContent += `Generado: ${new Date().toLocaleString()}\n\n`;
    
    csvContent += `Métrica,Valor\n`;
    csvContent += `Total Facturas,${invoices.length}\n`;
    csvContent += `Monto Total,${totalAmount.toFixed(2)}\n`;
    csvContent += `IVA Total (13%),${totalTax.toFixed(2)}\n`;
    csvContent += `Promedio por Factura,${invoices.length > 0 ? (totalAmount / invoices.length).toFixed(2) : '0.00'}\n\n`;

    // Top categories
    const categoryMap = new Map<string, number>();
    invoices.forEach(inv => {
      const categoryName = inv.category?.name || 'Sin categoría';
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + parseFloat(String(inv.total_amount || '0')));
    });

    csvContent += `Top Categorías\n`;
    csvContent += `Categoría,Monto\n`;
    Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([category, amount]) => {
        csvContent += `${category},${amount.toFixed(2)}\n`;
      });

  } else if (reportType === 'detailed') {
    csvContent = `Reporte Detallado de Facturas\n`;
    csvContent += `Período: ${filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString() : 'Todo'} - ${filters.dateTo ? new Date(filters.dateTo).toLocaleDateString() : 'Hoy'}\n`;
    csvContent += `Generado: ${new Date().toLocaleString()}\n\n`;
    
    csvContent += `Número,Proveedor,Categoría,Rubro,Monto,Fecha,Descripción\n`;
    invoices.forEach(inv => {
      csvContent += `"${inv.invoice_number}","${inv.vendor || 'Sin proveedor'}","${inv.category?.name || 'Sin categoría'}","${inv.rubro || 'Sin rubro'}",${parseFloat(String(inv.total_amount || '0')).toFixed(2)},"${new Date(inv.purchase_date).toLocaleDateString()}","${inv.description || ''}"\n`;
    });
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=reporte_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
  res.status(200).send(csvContent);
}

function generatePDFReport(res: NextApiResponse, invoices: any[], reportType: string, filters: any) {
  const doc = new jsPDF();
  const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(String(inv.total_amount || '0')), 0);
  const totalTax = totalAmount * 0.13;

  // Header
  doc.setFontSize(20);
  doc.text('SimpleFactura - Reporte de Negocio', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Tipo: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, 20, 35);
  doc.text(`Período: ${filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString() : 'Todo'} - ${filters.dateTo ? new Date(filters.dateTo).toLocaleDateString() : 'Hoy'}`, 20, 45);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 20, 55);

  let yPosition = 75;

  if (reportType === 'summary') {
    // Summary section
    doc.setFontSize(16);
    doc.text('Resumen Ejecutivo', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    const summaryData = [
      ['Métrica', 'Valor'],
      ['Total Facturas', invoices.length.toString()],
      ['Monto Total', `$${totalAmount.toFixed(2)}`],
      ['IVA Total (13%)', `$${totalTax.toFixed(2)}`],
      ['Promedio por Factura', `$${invoices.length > 0 ? (totalAmount / invoices.length).toFixed(2) : '0.00'}`]
    ];

    (doc as any).autoTable({
      startY: yPosition,
      head: [summaryData[0]],
      body: summaryData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;

    // Top categories
    const categoryMap = new Map<string, number>();
    invoices.forEach(inv => {
      const categoryName = inv.category?.name || 'Sin categoría';
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + parseFloat(String(inv.total_amount || '0')));
    });

    doc.setFontSize(16);
    doc.text('Top Categorías', 20, yPosition);
    yPosition += 15;

    const categoryData = [['Categoría', 'Monto']];
    Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([category, amount]) => {
        categoryData.push([category, `$${amount.toFixed(2)}`]);
      });

    (doc as any).autoTable({
      startY: yPosition,
      head: [categoryData[0]],
      body: categoryData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] }
    });

  } else if (reportType === 'detailed') {
    // Detailed invoices table
    doc.setFontSize(16);
    doc.text('Detalle de Facturas', 20, yPosition);
    yPosition += 15;

    const tableData = invoices.map(inv => [
      inv.invoice_number,
      inv.vendor || 'Sin proveedor',
      inv.category?.name || 'Sin categoría',
      inv.rubro || 'Sin rubro',
      `$${parseFloat(String(inv.total_amount || '0')).toFixed(2)}`,
      new Date(inv.purchase_date).toLocaleDateString()
    ]);

    (doc as any).autoTable({
      startY: yPosition,
      head: [['Número', 'Proveedor', 'Categoría', 'Rubro', 'Monto', 'Fecha']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 }
      }
    });
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Página ${i} de ${pageCount}`, 20, doc.internal.pageSize.height - 10);
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=reporte_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
  res.status(200).send(Buffer.from(doc.output('arraybuffer')));
} 