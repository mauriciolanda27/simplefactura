import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { PrismaClient } from '@prisma/client';
import { logReportAction, LOG_ACTIONS } from '../../utils/logging';

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

    // Obtener todas las facturas del usuario
    const invoices = await prisma.invoice.findMany({
      where: { userId: user.id },
      include: { 
        category: true,
        rubro: true
      },
      orderBy: { purchase_date: 'asc' }
    });

    if (invoices.length === 0) {
      return res.json({
        summary: {
          totalInvoices: 0,
          totalAmount: 0,
          averageAmount: 0,
          totalTax: 0
        },
        weeklyData: [],
        monthlyData: [],
        categoryData: [],
        vendorData: [],
        rubroData: [],
        trends: [],
        comparisons: [],
        topCategories: [],
        topRubros: []
      });
    }

    // Calcular resumen general
    const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(String(inv.total_amount || '0')), 0);
    const totalTax = totalAmount * 0.13; // 13% IVA Bolivia
    const averageAmount = totalAmount / invoices.length;

    // Datos por semana (últimas 8 semanas)
    const weeklyData = [];
    const now = new Date();
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
        count: weekInvoices.length,
        amount: weekAmount
      });
    }

    // Datos por mes (últimos 6 meses)
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
        count: monthInvoices.length,
        amount: monthAmount
      });
    }

    // Datos por categoría
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

    const categoryData = Array.from(categoryMap.entries()).map(([name, data]) => ({
      category: name,
      count: data.count,
      amount: data.amount
    }));

    // Datos por vendedor
    const vendorMap = new Map<string, { count: number; amount: number }>();
    invoices.forEach(inv => {
      const vendor = inv.vendor || 'Sin vendedor';
      if (!vendorMap.has(vendor)) {
        vendorMap.set(vendor, { count: 0, amount: 0 });
      }
      const current = vendorMap.get(vendor)!;
      current.count++;
      current.amount += parseFloat(String(inv.total_amount || '0'));
    });

    const vendorData = Array.from(vendorMap.entries()).map(([name, data]) => ({
      vendor: name,
      count: data.count,
      amount: data.amount
    }));

    // Datos por rubro
    const rubroMap = new Map<string, { count: number; amount: number; rubroId?: string }>();
    invoices.forEach(inv => {
      const rubroName = inv.rubro?.name || 'Sin rubro';
      const rubroId = inv.rubro?.id;
      if (!rubroMap.has(rubroName)) {
        rubroMap.set(rubroName, { count: 0, amount: 0, rubroId });
      }
      const current = rubroMap.get(rubroName)!;
      current.count++;
      current.amount += parseFloat(String(inv.total_amount || '0'));
    });

    const rubroData = Array.from(rubroMap.entries()).map(([name, data]) => ({
      rubro: name,
      count: data.count,
      amount: data.amount,
      rubroId: data.rubroId
    }));

    // Tendencias (comparación con período anterior)
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
    const amountGrowth = previousMonthAmount > 0 ? ((currentMonthAmount - previousMonthAmount) / previousMonthAmount) * 100 : 0;

    const currentMonthCount = currentMonthInvoices.length;
    const previousMonthCount = previousMonthInvoices.length;
    const countGrowth = previousMonthCount > 0 ? ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100 : 0;

    // Top categorías y rubros
    const topCategories = categoryData
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(cat => ({
        name: cat.category,
        count: cat.count,
        amount: cat.amount
      }));

    const topRubros = rubroData
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(rubro => ({
        name: rubro.rubro,
        count: rubro.count,
        amount: rubro.amount,
        rubroId: rubro.rubroId
      }));

    // Log the action
    await logReportAction(
      user.id,
      LOG_ACTIONS.GENERATE_REPORT,
      {
        totalInvoices: invoices.length,
        totalAmount,
        categoriesCount: categoryData.length,
        vendorsCount: vendorData.length,
        rubrosCount: rubroData.length
      }
    );

    return res.json({
      summary: {
        totalInvoices: invoices.length,
        totalAmount,
        averageAmount,
        totalTax
      },
      weeklyData,
      monthlyData,
      categoryData,
      vendorData,
      rubroData,
      trends: [
        { period: 'Este mes', growth: amountGrowth }
      ],
      comparisons: [
        {
          metric: 'Total Facturas',
          current: currentMonthCount,
          previous: previousMonthCount,
          change: countGrowth
        },
        {
          metric: 'Total Monto',
          current: currentMonthAmount,
          previous: previousMonthAmount,
          change: amountGrowth
        }
      ],
      topCategories,
      topRubros
    });

  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: "Error al generar estadísticas" });
  }
} 