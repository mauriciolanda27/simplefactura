import { Chart, ChartConfiguration, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import html2canvas from 'html2canvas';

// Register Chart.js components
Chart.register(...registerables);

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export interface ChartOptions {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  title?: string;
  width?: number;
  height?: number;
  colors?: string[];
}

const defaultColors = [
  '#4285F4', '#34A853', '#FBBC05', '#EA4335', '#FF6B6B',
  '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'
];

export async function generateChartImage(
  data: ChartData, 
  options: ChartOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary canvas element
      const canvas = document.createElement('canvas');
      canvas.width = options.width || 600;
      canvas.height = options.height || 400;
      canvas.style.display = 'block';
      
      // Create chart configuration
      const config: ChartConfiguration = {
        type: options.type,
        data: {
          labels: data.labels,
          datasets: data.datasets.map((dataset, index) => ({
            ...dataset,
            backgroundColor: dataset.backgroundColor || 
              (options.type === 'pie' || options.type === 'doughnut' 
                ? defaultColors.slice(0, data.labels.length)
                : defaultColors[index % defaultColors.length]),
            borderColor: dataset.borderColor || 
              (options.type === 'pie' || options.type === 'doughnut' 
                ? defaultColors.slice(0, data.labels.length)
                : defaultColors[index % defaultColors.length]),
            borderWidth: dataset.borderWidth || 1,
          }))
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: !!options.title,
              text: options.title || '',
              font: {
                size: 16,
                weight: 'bold'
              },
              color: '#333'
            },
            legend: {
              display: true,
              position: 'bottom' as const,
              labels: {
                font: {
                  size: 12
                },
                color: '#333'
              }
            }
          },
          scales: options.type !== 'pie' && options.type !== 'doughnut' ? {
            x: {
              ticks: {
                font: {
                  size: 10
                },
                color: '#666'
              },
              grid: {
                color: '#f0f0f0'
              }
            },
            y: {
              ticks: {
                font: {
                  size: 10
                },
                color: '#666',
                callback: function(value) {
                  return '$' + value.toLocaleString();
                }
              },
              grid: {
                color: '#f0f0f0'
              }
            }
          } : undefined
        }
      };

      // Create the chart
      const chart = new Chart(canvas, config);
      
      // Wait for chart to render
      setTimeout(() => {
        try {
          // Convert canvas to data URL
          const dataUrl = canvas.toDataURL('image/png', 1.0);
          chart.destroy();
          resolve(dataUrl);
        } catch (error) {
          chart.destroy();
          reject(error);
        }
      }, 100);

    } catch (error) {
      reject(error);
    }
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2
  }).format(value);
}

export function prepareChartDataForPDF(data: any, chartType: string) {
  switch (chartType) {
    case 'categories':
      return {
        labels: data.map((item: any) => item.name),
        datasets: [{
          label: 'Monto por Categoría',
          data: data.map((item: any) => item.amount),
        }]
      };
    
    case 'vendors':
      return {
        labels: data.map((item: any) => item.name),
        datasets: [{
          label: 'Monto por Proveedor',
          data: data.map((item: any) => item.amount),
        }]
      };
    
    case 'monthly':
      return {
        labels: data.map((item: any) => item.month),
        datasets: [
          {
            label: 'Monto Mensual',
            data: data.map((item: any) => item.amount),
            borderColor: '#4285F4',
            backgroundColor: 'rgba(66, 133, 244, 0.1)',
            borderWidth: 2,
          },
          {
            label: 'Cantidad de Facturas',
            data: data.map((item: any) => item.count),
            borderColor: '#34A853',
            backgroundColor: 'rgba(52, 168, 83, 0.1)',
            borderWidth: 2,
          }
        ]
      };
    
    default:
      return {
        labels: [],
        datasets: []
      };
  }
} 