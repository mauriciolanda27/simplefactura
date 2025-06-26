import React from 'react'
import { render, screen } from '../../utils/test-utils'
import MetricCard from '../MetricCard'

describe('Componente MetricCard', () => {
  const propsBasicos = {
    title: 'Total Facturas',
    value: 1234,
    icon: '📊',
    color: 'primary' as const,
  }

  it('debe renderizar correctamente con todas las props', () => {
    render(<MetricCard {...propsBasicos} />)
    
    expect(screen.getByText('Total Facturas')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()
    expect(screen.getByText('📊')).toBeInTheDocument()
  })

  it('debe mostrar tendencia positiva', () => {
    const props = { ...propsBasicos, trend: 'up' as const, trendValue: 12.5 }
    render(<MetricCard {...props} />)
    
    expect(screen.getByText('+12.5%')).toBeInTheDocument()
  })

  it('debe mostrar tendencia negativa', () => {
    const props = { ...propsBasicos, trend: 'down' as const, trendValue: -5.2 }
    render(<MetricCard {...props} />)
    
    expect(screen.getByText('-5.2%')).toBeInTheDocument()
  })

  it('debe renderizar sin tendencia', () => {
    render(<MetricCard {...propsBasicos} />)
    
    expect(screen.getByText('Total Facturas')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()
    expect(screen.queryByText('+12.5%')).not.toBeInTheDocument()
  })

  it('debe manejar números grandes correctamente', () => {
    const props = { ...propsBasicos, value: 1234567 }
    render(<MetricCard {...props} />)
    
    expect(screen.getByText('1,234,567')).toBeInTheDocument()
  })

  it('debe manejar valor cero', () => {
    const props = { ...propsBasicos, value: 0 }
    render(<MetricCard {...props} />)
    
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('renders with custom icon', () => {
    const props = { ...propsBasicos, icon: '💰' }
    render(<MetricCard {...props} />)
    
    expect(screen.getByText('💰')).toBeInTheDocument()
  })

  it('renders with prefix and suffix', () => {
    const props = { ...propsBasicos, prefix: '$', suffix: ' USD' }
    render(<MetricCard {...props} />)
    
    expect(screen.getByText('$1,234 USD')).toBeInTheDocument()
  })

  it('renders with different colors', () => {
    const props = { ...propsBasicos, color: 'success' as const }
    render(<MetricCard {...props} />)
    
    expect(screen.getByText('Total Facturas')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()
  })

  it('renders with loading state', () => {
    const props = { ...propsBasicos, loading: true }
    render(<MetricCard {...props} />)
    
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('renders with trend label', () => {
    const props = { ...propsBasicos, trend: 'up' as const, trendValue: 12.5, trendLabel: 'vs last month' }
    render(<MetricCard {...props} />)
    
    expect(screen.getByText('+12.5% vs last month')).toBeInTheDocument()
  })
}) 