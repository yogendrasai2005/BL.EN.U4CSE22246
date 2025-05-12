  import type { ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { StockPrice } from '../types';
import { useTheme } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface StockChartProps {
  prices: StockPrice[];
  average: number;
}

const StockChart: React.FC<StockChartProps> = ({ prices, average }) => {
  const theme = useTheme();

  const data = {
    labels: prices.map((p) => new Date(p.lastUpdatedAt).toLocaleTimeString()),
    datasets: [
      {
        label: 'Stock Price',
        data: prices.map((p) => p.price),
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light,
        fill: false,
      },
      {
        label: 'Average Price',
        data: prices.map(() => average),
        borderColor: theme.palette.secondary.main,
        borderDash: [5, 5],
        fill: false,
      },
    ],
  };


  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const price = context.parsed.y.toFixed(2);
            const time = data.labels[context.dataIndex];
            return `Price: ${price} at ${time}`;
          },
        },
      },
    },
    scales: {
      x: { title: { display: true, text: 'Time' } },
      y: { title: { display: true, text: 'Price' } },
    },
  };

  return <Line data={data} options={options} />;
};

export default StockChart;