import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../theme';

interface BarChartProps {
  data: Array<{ 
    category?: string; 
    vendor?: string; 
    rubro?: string; 
    amount: number; 
    count: number 
  }>;
}

export default function BarChart({ data }: BarChartProps) {
  const formatData = (data: BarChartProps['data']) => {
    return data.slice(0, 10).map(item => ({
      name: (item.category || item.vendor || item.rubro || '').length > 20 
        ? (item.category || item.vendor || item.rubro || '').substring(0, 20) + '...' 
        : (item.category || item.vendor || item.rubro || ''),
      amount: item.amount,
      count: item.count
    }));
  };

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; dataKey: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{`${label}`}</p>
          <p style={{ margin: '5px 0', color: '#8884d8' }}>
            {`Monto: ${formatCurrency(payload[0].value)}`}
          </p>
          <p style={{ margin: '5px 0', color: '#82ca9d' }}>
            {`Facturas: ${payload[1].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={formatData(data)}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          stroke="#666"
          fontSize={11}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          stroke="#8884d8"
          fontSize={12}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="amount" 
          fill="#8884d8" 
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="count" 
          fill="#82ca9d" 
          radius={[4, 4, 0, 0]}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
} 