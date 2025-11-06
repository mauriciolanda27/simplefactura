import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from '@prisma/client';
import {
  predictCashFlow,
  predictPayments,
  analyzeSeasonalSpending,
  generateSpendingInsights,
  assessFinancialRisk
} from '../../../utils/predictiveAnalytics';
import { logAnalyticsAction, LOG_ACTIONS } from '../../../utils/logging';

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

    // Get all invoices and categories for the user
    const [invoices, categories, rubros] = await Promise.all([
      prisma.invoice.findMany({
        where: { userId: user.id },
        include: { 
          category: true,
          rubro: true
        },
        orderBy: { purchase_date: 'asc' }
      }),
      prisma.category.findMany({
        where: { userId: user.id }
      }),
      prisma.rubro.findMany({
        where: { userId: user.id }
      })
    ]);

    // MOCK DATA FOR DEMO - Always return data even if no invoices
    if (invoices.length === 0 || invoices.length < 10) {
      // Generate realistic mock data for demonstration
      const mockCashFlow = [];
      const today = new Date();
      for (let i = 1; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        mockCashFlow.push({
          date: date.toISOString().split('T')[0],
          predictedAmount: Math.round((500 + Math.random() * 1000 + i * 50) * 100) / 100,
          confidence: Math.round((0.7 + Math.random() * 0.25) * 100) / 100,
          trend: i < 10 ? 'increasing' : i > 20 ? 'decreasing' : 'stable'
        });
      }

      const mockPayments = [
        {
          vendor: 'COTEL',
          nextPaymentDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          predictedAmount: 350.00,
          confidence: 0.85,
          paymentPattern: 'regular'
        },
        {
          vendor: 'ENTEL',
          nextPaymentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          predictedAmount: 280.50,
          confidence: 0.78,
          paymentPattern: 'regular'
        },
        {
          vendor: 'Supermercado IC Norte',
          nextPaymentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          predictedAmount: 1250.00,
          confidence: 0.65,
          paymentPattern: 'irregular'
        }
      ];

      const mockSeasonal = [];
      for (let month = 1; month <= 12; month++) {
        const baseAmount = 3000;
        const variation = month === 12 ? 1.5 : month === 7 ? 0.7 : 1;
        mockSeasonal.push({
          month,
          averageSpending: Math.round(baseAmount * variation * 100) / 100,
          trend: variation > 1.2 ? 'peak' : variation < 0.8 ? 'low' : 'normal',
          recommendation: variation > 1.2 
            ? 'Considerar reducción de gastos en este mes' 
            : variation < 0.8 
            ? 'Oportunidad para inversiones o compras importantes'
            : 'Gastos en niveles normales'
        });
      }

      const mockCategories = categories.length > 0 ? categories : [
        { id: '1', name: 'Servicios', userId: user.id },
        { id: '2', name: 'Compras', userId: user.id },
        { id: '3', name: 'Operativos', userId: user.id }
      ];

      const mockInsights = mockCategories.slice(0, 4).map((cat, idx) => ({
        category: cat.name,
        currentMonth: Math.round((1000 + idx * 500 + Math.random() * 500) * 100) / 100,
        previousMonth: Math.round((900 + idx * 450 + Math.random() * 400) * 100) / 100,
        trend: idx % 2 === 0 ? 15.5 : -8.3,
        prediction: Math.round((1100 + idx * 520 + Math.random() * 550) * 100) / 100,
        recommendation: idx % 2 === 0 
          ? 'Gastos aumentando. Monitorear tendencia.'
          : 'Gastos reduciéndose. Posible optimización.'
      }));

      const mockRubros = rubros.length > 0 
        ? rubros.slice(0, 5).map((rubro, idx) => ({
            name: rubro.name,
            count: 5 + idx * 2,
            amount: Math.round((2000 + idx * 800) * 100) / 100,
            rubroId: rubro.id,
            percentage: Math.round((20 + idx * 10) * 10) / 10
          }))
        : [
            { name: 'Servicios Básicos', count: 8, amount: 2450.00, percentage: 25.5 },
            { name: 'Suministros', count: 12, amount: 3200.00, percentage: 33.3 },
            { name: 'Mantenimiento', count: 5, amount: 1800.00, percentage: 18.7 },
            { name: 'Marketing', count: 6, amount: 1350.00, percentage: 14.1 }
          ];

      return res.status(200).json({
        cashFlowPredictions: mockCashFlow,
        paymentPredictions: mockPayments,
        seasonalAnalysis: mockSeasonal,
        spendingInsights: mockInsights,
        rubroAnalysis: mockRubros,
        riskAssessment: {
          riskLevel: 'medium',
          riskFactors: ['Variabilidad moderada en gastos', 'Aumento reciente detectado'],
          recommendations: ['Implementar presupuesto mensual', 'Revisar gastos del último mes']
        },
        dataPoints: invoices.length || 25,
        lastUpdated: new Date().toISOString(),
        mockData: true // Flag to indicate this is demo data
      });
    }

    // Generate all statistical analysis
    const [
      cashFlowPredictions,
      paymentPredictions,
      seasonalAnalysis,
      spendingInsights,
      riskAssessment
    ] = await Promise.all([
      predictCashFlow(invoices, 30),
      predictPayments(invoices),
      analyzeSeasonalSpending(invoices),
      generateSpendingInsights(invoices, categories),
      assessFinancialRisk(invoices)
    ]);

    // Generate rubro analysis
    const rubroAnalysis = invoices.reduce((acc: Record<string, { count: number; amount: number; rubroId?: string }>, invoice) => {
      const rubroName = invoice.rubro?.name || 'Sin rubro';
      const rubroId = invoice.rubro?.id;
      if (!acc[rubroName]) {
        acc[rubroName] = { count: 0, amount: 0, rubroId };
      }
      acc[rubroName].count += 1;
      acc[rubroName].amount += parseFloat(String(invoice.total_amount || '0'));
      return acc;
    }, {});

    const rubroAnalysisArray = Object.entries(rubroAnalysis).map(([name, data]) => ({
      name,
      count: data.count,
      amount: data.amount,
      rubroId: data.rubroId,
      percentage: (data.amount / invoices.reduce((sum, inv) => sum + parseFloat(String(inv.total_amount || '0')), 0)) * 100
    })).sort((a, b) => b.amount - a.amount);

    // Log the action
    await logAnalyticsAction(
      user.id,
      LOG_ACTIONS.GENERATE_PREDICTIONS,
      {
        dataPoints: invoices.length,
        categoriesCount: categories.length,
        rubrosCount: rubros.length,
        predictionsGenerated: {
          cashFlow: cashFlowPredictions.length,
          payments: paymentPredictions.length,
          seasonal: seasonalAnalysis.length,
          insights: spendingInsights.length,
          rubros: rubroAnalysisArray.length
        }
      }
    );

    // Set cache headers for analytics data
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

    return res.status(200).json({
      cashFlowPredictions,
      paymentPredictions,
      seasonalAnalysis,
      spendingInsights,
      rubroAnalysis: rubroAnalysisArray,
      riskAssessment,
      dataPoints: invoices.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating statistical analysis:', error);
    return res.status(500).json({ error: "Error al generar análisis estadístico" });
  }
} 