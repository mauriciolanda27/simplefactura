import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../theme';

interface LineChartProps {
  data: Array<{ week?: string; month?: string; amount: number; count: number }>;
}

export default function LineChart({ data }: LineChartProps) {
  const formatData = (data: LineChartProps['data']) => {
    return data.map(item => ({
      period: item.week || item.month || '',
      amount: item.amount,
      count: item.count
    }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{`Período: ${label}`}</p>
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
      <RechartsLineChart data={formatData(data)}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="period" 
          stroke="#666"
          fontSize={12}
        />
        <YAxis 
          yAxisId="left"
          stroke="#8884d8"
          fontSize={12}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          stroke="#82ca9d"
          fontSize={12}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="amount"
          stroke="#8884d8"
          strokeWidth={3}
          dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#8884d8', strokeWidth: 2 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="count"
          stroke="#82ca9d"
          strokeWidth={2}
          dot={{ fill: '#82ca9d', strokeWidth: 2, r: 3 }}
          activeDot={{ r: 5, stroke: '#82ca9d', strokeWidth: 2 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
} 