import { Invoice, Category } from '@prisma/client';

// Types for advanced statistical analysis
export interface CashFlowPrediction {
  date: string;
  predictedAmount: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface PaymentPrediction {
  vendor: string;
  nextPaymentDate: string;
  predictedAmount: number;
  confidence: number;
  paymentPattern: 'regular' | 'irregular' | 'seasonal';
}

export interface SeasonalAnalysis {
  month: number;
  averageSpending: number;
  trend: 'peak' | 'low' | 'normal';
  recommendation: string;
}

export interface SpendingInsight {
  category: string;
  currentMonth: number;
  previousMonth: number;
  trend: number;
  prediction: number;
  recommendation: string;
}

// Utility functions for data processing using statistical methods
function groupInvoicesByDate(invoices: Invoice[]): Map<string, number> {
  const grouped = new Map<string, number>();
  
  invoices.forEach(invoice => {
    const date = new Date(invoice.purchase_date).toISOString().split('T')[0];
    const amount = parseFloat(String(invoice.total_amount));
    
    if (grouped.has(date)) {
      grouped.set(date, grouped.get(date)! + amount);
    } else {
      grouped.set(date, amount);
    }
  });
  
  return grouped;
}

function calculateMovingAverage(data: number[], window: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const values = data.slice(start, i + 1);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    result.push(average);
  }
  
  return result;
}

function detectSeasonality(data: number[]): { seasonality: number; strength: number } {
  // Statistical seasonality detection using autocorrelation
  const n = data.length;
  if (n < 12) return { seasonality: 1, strength: 0 };
  
  let maxCorrelation = 0;
  let bestLag = 1;
  
  for (let lag = 1; lag <= Math.min(12, n / 2); lag++) {
    let correlation = 0;
    let count = 0;
    
    for (let i = lag; i < n; i++) {
      correlation += data[i] * data[i - lag];
      count++;
    }
    
    if (count > 0) {
      correlation /= count;
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestLag = lag;
      }
    }
  }
  
  return { seasonality: bestLag, strength: maxCorrelation };
}

// Cash Flow Forecasting using statistical methods
export function predictCashFlow(invoices: Invoice[], daysAhead: number = 30): CashFlowPrediction[] {
  const groupedInvoices = groupInvoicesByDate(invoices);
  const dates = Array.from(groupedInvoices.keys()).sort();
  const amounts = dates.map(date => groupedInvoices.get(date) || 0);
  
  if (amounts.length < 7) {
    // Not enough data for statistical analysis
    return [];
  }
  
  // Calculate moving averages for trend analysis
  const shortMA = calculateMovingAverage(amounts, 7);
  
  // Detect trend using statistical methods
  const recentTrend = shortMA.slice(-7).reduce((sum, val, i) => {
    if (i > 0) return sum + (val - shortMA[shortMA.length - 8 + i]);
    return sum;
  }, 0) / 6;
  
  // Detect seasonality using autocorrelation
  const { seasonality, strength } = detectSeasonality(amounts);
  
  // Generate predictions using statistical forecasting
  const predictions: CashFlowPrediction[] = [];
  const lastAmount = amounts[amounts.length - 1];
  const lastDate = new Date(dates[dates.length - 1]);
  
  for (let i = 1; i <= daysAhead; i++) {
    const predictionDate = new Date(lastDate);
    predictionDate.setDate(lastDate.getDate() + i);
    
    // Base prediction using linear trend
    let predictedAmount = lastAmount + (recentTrend * i);
    
    // Apply seasonality if detected
    if (strength > 0.3) {
      const seasonalIndex = (i % seasonality);
      const seasonalFactor = amounts.slice(-seasonality)[seasonalIndex] || 1;
      predictedAmount *= (seasonalFactor / lastAmount);
    }
    
    // Ensure prediction is reasonable
    predictedAmount = Math.max(0, predictedAmount);
    
    // Calculate confidence based on statistical variance
    const variance = amounts.slice(-30).reduce((sum, val) => sum + Math.pow(val - lastAmount, 2), 0) / Math.min(30, amounts.length);
    const confidence = Math.max(0.1, Math.min(0.95, 1 - (variance / Math.pow(lastAmount, 2))));
    
    // Determine trend
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentTrend > lastAmount * 0.1) trend = 'increasing';
    else if (recentTrend < -lastAmount * 0.1) trend = 'decreasing';
    
    predictions.push({
      date: predictionDate.toISOString().split('T')[0],
      predictedAmount: Math.round(predictedAmount * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      trend
    });
  }
  
  return predictions;
}

// Payment Pattern Analysis using statistical methods
export function predictPayments(invoices: Invoice[]): PaymentPrediction[] {
  const vendorGroups = new Map<string, Invoice[]>();
  
  // Group invoices by vendor for statistical analysis
  invoices.forEach(invoice => {
    const vendor = invoice.vendor;
    if (!vendorGroups.has(vendor)) {
      vendorGroups.set(vendor, []);
    }
    vendorGroups.get(vendor)!.push(invoice);
  });
  
  const predictions: PaymentPrediction[] = [];
  
  vendorGroups.forEach((vendorInvoices, vendor) => {
    if (vendorInvoices.length < 3) return; // Need at least 3 invoices for statistical analysis
    
    // Sort by date for time series analysis
    vendorInvoices.sort((a, b) => new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime());
    
    // Calculate payment intervals using statistical methods
    const intervals: number[] = [];
    for (let i = 1; i < vendorInvoices.length; i++) {
      const interval = new Date(vendorInvoices[i].purchase_date).getTime() - 
                      new Date(vendorInvoices[i-1].purchase_date).getTime();
      intervals.push(interval / (1000 * 60 * 60 * 24)); // Convert to days
    }
    
    // Calculate average interval and amount using statistical means
    const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const avgAmount = vendorInvoices.reduce((sum, inv) => sum + parseFloat(String(inv.total_amount)), 0) / vendorInvoices.length;
    
    // Predict next payment date using statistical forecasting
    const lastPaymentDate = new Date(vendorInvoices[vendorInvoices.length - 1].purchase_date);
    const nextPaymentDate = new Date(lastPaymentDate);
    nextPaymentDate.setDate(lastPaymentDate.getDate() + avgInterval);
    
    // Calculate confidence based on statistical consistency
    const intervalVariance = intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;
    const confidence = Math.max(0.1, Math.min(0.95, 1 - (intervalVariance / Math.pow(avgInterval, 2))));
    
    // Determine payment pattern using statistical analysis
    let paymentPattern: 'regular' | 'irregular' | 'seasonal' = 'regular';
    if (intervalVariance > avgInterval * 0.5) paymentPattern = 'irregular';
    else if (intervals.length >= 12) {
      // Check for seasonality in payment patterns using autocorrelation
      const { strength } = detectSeasonality(intervals);
      if (strength > 0.4) paymentPattern = 'seasonal';
    }
    
    predictions.push({
      vendor,
      nextPaymentDate: nextPaymentDate.toISOString().split('T')[0],
      predictedAmount: Math.round(avgAmount * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      paymentPattern
    });
  });
  
  return predictions.sort((a, b) => b.confidence - a.confidence);
}

// Seasonal Spending Analysis using statistical methods
export function analyzeSeasonalSpending(invoices: Invoice[]): SeasonalAnalysis[] {
  const monthlyData = new Map<number, number[]>();
  
  // Group invoices by month for statistical analysis
  invoices.forEach(invoice => {
    const month = new Date(invoice.purchase_date).getMonth();
    const amount = parseFloat(String(invoice.total_amount));
    
    if (!monthlyData.has(month)) {
      monthlyData.set(month, []);
    }
    monthlyData.get(month)!.push(amount);
  });
  
  // Calculate average spending per month using statistical means
  const monthlyAverages: SeasonalAnalysis[] = [];
  const allAmounts = invoices.map(inv => parseFloat(String(inv.total_amount)));
  const overallAverage = allAmounts.reduce((sum, val) => sum + val, 0) / allAmounts.length;
  
  for (let month = 0; month < 12; month++) {
    const monthAmounts = monthlyData.get(month) || [];
    const averageSpending = monthAmounts.length > 0 
      ? monthAmounts.reduce((sum, val) => sum + val, 0) / monthAmounts.length 
      : overallAverage;
    
    // Determine trend using statistical thresholds
    let trend: 'peak' | 'low' | 'normal' = 'normal';
    if (averageSpending > overallAverage * 1.2) trend = 'peak';
    else if (averageSpending < overallAverage * 0.8) trend = 'low';
    
    // Generate recommendations based on statistical analysis
    let recommendation = '';
    if (trend === 'peak') {
      recommendation = 'Considerar reducción de gastos en este mes';
    } else if (trend === 'low') {
      recommendation = 'Oportunidad para inversiones o compras importantes';
    } else {
      recommendation = 'Gastos en niveles normales';
    }
    
    monthlyAverages.push({
      month: month + 1,
      averageSpending: Math.round(averageSpending * 100) / 100,
      trend,
      recommendation
    });
  }
  
  return monthlyAverages;
}

// Spending Insights and Recommendations using statistical analysis
export function generateSpendingInsights(
  invoices: Invoice[], 
  categories: Category[]
): SpendingInsight[] {
  const insights: SpendingInsight[] = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  
  categories.forEach(category => {
    const categoryInvoices = invoices.filter(inv => inv.categoryId === category.id);
    
    if (categoryInvoices.length === 0) return;
    
    // Calculate spending by month using statistical aggregation
    const currentMonthSpending = categoryInvoices
      .filter(inv => new Date(inv.purchase_date).getMonth() === currentMonth)
      .reduce((sum, inv) => sum + parseFloat(String(inv.total_amount)), 0);
    
    const previousMonthSpending = categoryInvoices
      .filter(inv => new Date(inv.purchase_date).getMonth() === previousMonth)
      .reduce((sum, inv) => sum + parseFloat(String(inv.total_amount)), 0);
    
    // Calculate trend using percentage change
    const trend = previousMonthSpending > 0 
      ? ((currentMonthSpending - previousMonthSpending) / previousMonthSpending) * 100 
      : 0;
    
    // Predict next month using linear projection
    const prediction = currentMonthSpending + (currentMonthSpending * (trend / 100));
    
    // Generate recommendation based on statistical thresholds
    let recommendation = '';
    if (trend > 20) {
      recommendation = 'Gastos aumentando significativamente. Revisar presupuesto.';
    } else if (trend > 10) {
      recommendation = 'Gastos en aumento moderado. Monitorear tendencia.';
    } else if (trend < -20) {
      recommendation = 'Gastos reduciéndose significativamente. Evaluar impacto.';
    } else if (trend < -10) {
      recommendation = 'Gastos en reducción. Posible optimización.';
    } else {
      recommendation = 'Gastos estables. Mantener control actual.';
    }
    
    insights.push({
      category: category.name,
      currentMonth: Math.round(currentMonthSpending * 100) / 100,
      previousMonth: Math.round(previousMonthSpending * 100) / 100,
      trend: Math.round(trend * 100) / 100,
      prediction: Math.round(prediction * 100) / 100,
      recommendation
    });
  });
  
  return insights.sort((a, b) => Math.abs(b.trend) - Math.abs(a.trend));
}

// Risk Assessment using statistical analysis
export function assessFinancialRisk(invoices: Invoice[]): {
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  recommendations: string[];
} {
  const riskFactors: string[] = [];
  const recommendations: string[] = [];
  
  if (invoices.length === 0) {
    return {
      riskLevel: 'low',
      riskFactors: ['Sin datos suficientes para análisis estadístico'],
      recommendations: ['Agregar más facturas para análisis de riesgo']
    };
  }
  
  const amounts = invoices.map(inv => parseFloat(String(inv.total_amount)));
  const totalSpending = amounts.reduce((sum, val) => sum + val, 0);
  const avgSpending = totalSpending / amounts.length;
  
  // Check for high variance in spending using statistical measures
  const variance = amounts.reduce((sum, val) => sum + Math.pow(val - avgSpending, 2), 0) / amounts.length;
  const coefficientOfVariation = Math.sqrt(variance) / avgSpending;
  
  if (coefficientOfVariation > 1.5) {
    riskFactors.push('Alta variabilidad en gastos');
    recommendations.push('Implementar presupuesto mensual más estricto');
  }
  
  // Check for recent spending spikes using statistical analysis
  const recentInvoices = invoices
    .filter(inv => {
      const invoiceDate = new Date(inv.purchase_date);
      const daysAgo = (Date.now() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    })
    .map(inv => parseFloat(String(inv.total_amount)));
  
  if (recentInvoices.length > 0) {
    const recentAvg = recentInvoices.reduce((sum, val) => sum + val, 0) / recentInvoices.length;
    if (recentAvg > avgSpending * 1.5) {
      riskFactors.push('Aumento reciente en gastos');
      recommendations.push('Revisar gastos del último mes');
    }
  }
  
  // Check for vendor concentration using statistical measures
  const vendorCounts = new Map<string, number>();
  invoices.forEach(inv => {
    const vendor = inv.vendor;
    vendorCounts.set(vendor, (vendorCounts.get(vendor) || 0) + 1);
  });
  
  const topVendor = Array.from(vendorCounts.entries())
    .sort((a, b) => b[1] - a[1])[0];
  
  if (topVendor && topVendor[1] > invoices.length * 0.3) {
    riskFactors.push('Alta concentración en un solo proveedor');
    recommendations.push('Considerar diversificación de proveedores');
  }
  
  // Determine overall risk level using statistical thresholds
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (riskFactors.length >= 3) riskLevel = 'high';
  else if (riskFactors.length >= 1) riskLevel = 'medium';
  
  return { riskLevel, riskFactors, recommendations };
} 