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

    if (invoices.length === 0) {
      return res.json({
        cashFlowPredictions: [],
        paymentPredictions: [],
        seasonalAnalysis: [],
        spendingInsights: [],
        rubroAnalysis: [],
        riskAssessment: {
          riskLevel: 'low',
          riskFactors: ['Sin datos suficientes para análisis estadístico'],
          recommendations: ['Agregar más facturas para obtener análisis estadístico']
        },
        message: 'Se requieren al menos 7 facturas para análisis estadístico'
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