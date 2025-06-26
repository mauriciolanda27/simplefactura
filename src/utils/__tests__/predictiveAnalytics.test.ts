import { 
  predictCashFlow, 
  predictPayments, 
  analyzeSeasonalSpending, 
  assessFinancialRisk,
  generateSpendingInsights
} from '../predictiveAnalytics'

describe('Análisis Predictivo', () => {
  const facturasEjemplo = [
    {
      id: '1',
      name: 'Factura 1',
      authorization_code: 'AUTH-001',
      nit: '123456789',
      nit_ci_cex: '987654321',
      number_receipt: 'INV-001',
      purchase_date: new Date('2024-01-15'),
      total_amount: 1000,
      vendor: 'Proveedor A',
      rubro: 'Servicios',
      categoryId: '1',
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15'),
      userId: 'user1'
    },
    {
      id: '2',
      name: 'Factura 2',
      authorization_code: 'AUTH-002',
      nit: '123456789',
      nit_ci_cex: '987654321',
      number_receipt: 'INV-002',
      purchase_date: new Date('2024-01-20'),
      total_amount: 1500,
      vendor: 'Proveedor B',
      rubro: 'Productos',
      categoryId: '2',
      created_at: new Date('2024-01-20'),
      updated_at: new Date('2024-01-20'),
      userId: 'user1'
    },
    {
      id: '3',
      name: 'Factura 3',
      authorization_code: 'AUTH-003',
      nit: '123456789',
      nit_ci_cex: '987654321',
      number_receipt: 'INV-003',
      purchase_date: new Date('2024-02-01'),
      total_amount: 800,
      vendor: 'Proveedor A',
      rubro: 'Servicios',
      categoryId: '1',
      created_at: new Date('2024-02-01'),
      updated_at: new Date('2024-02-01'),
      userId: 'user1'
    }
  ]

  const mockCategories = [
    {
      id: '1',
      name: 'Services',
      description: 'Service category',
      color: '#1976d2',
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
      userId: 'user1'
    },
    {
      id: '2',
      name: 'Products',
      description: 'Product category',
      color: '#dc004e',
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
      userId: 'user1'
    },
    {
      id: '3',
      name: 'Equipment',
      description: 'Equipment category',
      color: '#388e3c',
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
      userId: 'user1'
    },
  ]

  describe('predictCashFlow', () => {
    it('should predict cash flow correctly', () => {
      const result = predictCashFlow(facturasEjemplo, 7)
      
      expect(Array.isArray(result)).toBe(true)
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('date')
        expect(result[0]).toHaveProperty('predictedAmount')
        expect(result[0]).toHaveProperty('confidence')
        expect(result[0]).toHaveProperty('trend')
        expect(typeof result[0].predictedAmount).toBe('number')
        expect(typeof result[0].confidence).toBe('number')
        expect(['increasing', 'decreasing', 'stable']).toContain(result[0].trend)
      }
    })

    it('should handle empty invoices array', () => {
      const result = predictCashFlow([], 7)
      expect(result).toEqual([])
    })

    it('should handle insufficient data', () => {
      const insufficientData = [facturasEjemplo[0]]
      const result = predictCashFlow(insufficientData, 7)
      expect(result).toEqual([])
    })
  })

  describe('predictPayments', () => {
    it('should predict payments correctly', () => {
      const result = predictPayments(facturasEjemplo)
      
      expect(Array.isArray(result)).toBe(true)
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('vendor')
        expect(result[0]).toHaveProperty('nextPaymentDate')
        expect(result[0]).toHaveProperty('predictedAmount')
        expect(result[0]).toHaveProperty('confidence')
        expect(result[0]).toHaveProperty('paymentPattern')
        expect(typeof result[0].vendor).toBe('string')
        expect(typeof result[0].predictedAmount).toBe('number')
        expect(typeof result[0].confidence).toBe('number')
        expect(['regular', 'irregular', 'seasonal']).toContain(result[0].paymentPattern)
      }
    })

    it('should handle empty invoices array', () => {
      const result = predictPayments([])
      expect(result).toEqual([])
    })

    it('should handle vendors with insufficient data', () => {
      const insufficientData = [facturasEjemplo[0], facturasEjemplo[1]]
      const result = predictPayments(insufficientData)
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('analyzeSeasonalSpending', () => {
    it('should analyze seasonal spending correctly', () => {
      const result = analyzeSeasonalSpending(facturasEjemplo)
      
      expect(Array.isArray(result)).toBe(true)
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('month')
        expect(result[0]).toHaveProperty('averageSpending')
        expect(result[0]).toHaveProperty('trend')
        expect(result[0]).toHaveProperty('recommendation')
        expect(typeof result[0].month).toBe('number')
        expect(typeof result[0].averageSpending).toBe('number')
        expect(['peak', 'low', 'normal']).toContain(result[0].trend)
        expect(typeof result[0].recommendation).toBe('string')
      }
    })

    it('should handle empty invoices array', () => {
      const result = analyzeSeasonalSpending([])
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('generateSpendingInsights', () => {
    it('should generate spending insights correctly', () => {
      const result = generateSpendingInsights(facturasEjemplo, mockCategories)
      
      expect(Array.isArray(result)).toBe(true)
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('category')
        expect(result[0]).toHaveProperty('currentMonth')
        expect(result[0]).toHaveProperty('previousMonth')
        expect(result[0]).toHaveProperty('trend')
        expect(result[0]).toHaveProperty('prediction')
        expect(result[0]).toHaveProperty('recommendation')
        expect(typeof result[0].category).toBe('string')
        expect(typeof result[0].currentMonth).toBe('number')
        expect(typeof result[0].previousMonth).toBe('number')
        expect(typeof result[0].trend).toBe('number')
        expect(typeof result[0].prediction).toBe('number')
        expect(typeof result[0].recommendation).toBe('string')
      }
    })

    it('should handle empty invoices array', () => {
      const result = generateSpendingInsights([], mockCategories)
      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle empty categories array', () => {
      const result = generateSpendingInsights(facturasEjemplo, [])
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('assessFinancialRisk', () => {
    it('debe evaluar el riesgo financiero correctamente', () => {
      const resultado = assessFinancialRisk(facturasEjemplo)
      
      expect(resultado).toHaveProperty('riskLevel')
      expect(resultado).toHaveProperty('riskFactors')
      expect(resultado).toHaveProperty('recommendations')
      expect(['low', 'medium', 'high']).toContain(resultado.riskLevel)
      expect(Array.isArray(resultado.riskFactors)).toBe(true)
      expect(Array.isArray(resultado.recommendations)).toBe(true)
    })

    it('debe manejar array vacío de facturas', () => {
      const resultado = assessFinancialRisk([])
      expect(resultado.riskLevel).toBe('low')
      expect(resultado.riskFactors).toContain('Sin datos suficientes para análisis estadístico')
      expect(resultado.recommendations).toContain('Agregar más facturas para análisis de riesgo')
    })

    it('debe identificar escenarios de alto riesgo', () => {
      const facturasAltoRiesgo = [
        {
          ...facturasEjemplo[0],
          total_amount: 10000,
          purchase_date: new Date('2024-01-01'),
        },
        {
          ...facturasEjemplo[1],
          total_amount: 15000,
          purchase_date: new Date('2024-01-01'),
        },
        {
          ...facturasEjemplo[2],
          total_amount: 20000,
          purchase_date: new Date('2024-01-01'),
        },
      ]
      
      const resultado = assessFinancialRisk(facturasAltoRiesgo)
      expect(['low', 'medium', 'high']).toContain(resultado.riskLevel)
      expect(Array.isArray(resultado.riskFactors)).toBe(true)
    })

    it('debe proporcionar recomendaciones apropiadas', () => {
      const resultado = assessFinancialRisk(facturasEjemplo)
      expect(resultado.recommendations.length).toBeGreaterThan(0)
      expect(typeof resultado.recommendations[0]).toBe('string')
    })
  })
}) 