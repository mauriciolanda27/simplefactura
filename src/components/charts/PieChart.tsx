import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatCurrency } from '../../theme';

interface PieChartProps {
  data: Array<{ category?: string; vendor?: string; rubro?: string; amount: number; count: number }>;
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000',
  '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'
];

export default function PieChart({ data }: PieChartProps) {
  const formatData = (data: PieChartProps['data']) => {
    return data.slice(0, 8).map(item => ({
      name: (item.category || item.vendor || item.rubro || '').length > 15 
        ? (item.category || item.vendor || item.rubro || '').substring(0, 15) + '...' 
        : (item.category || item.vendor || item.rubro || ''),
      value: item.amount,
      count: item.count
    }));
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: data.color }}>
            {data.name}
          </p>
          <p style={{ margin: '5px 0' }}>
            {`Monto: ${formatCurrency(data.value)}`}
          </p>
          <p style={{ margin: '5px 0' }}>
            {`Facturas: ${data.payload.count}`}
          </p>
          <p style={{ margin: '5px 0' }}>
            {`Porcentaje: ${((data.payload.percent || 0) * 100).toFixed(1)}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={formatData(data)}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {formatData(data).map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value, entry: any) => (
            <span style={{ color: entry.color, fontSize: '12px' }}>
              {value}
            </span>
          )}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
} 