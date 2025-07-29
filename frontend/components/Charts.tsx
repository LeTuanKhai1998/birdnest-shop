import { BarChart2, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

interface ChartProps {
  type: 'bar' | 'pie' | 'line';
  data: any[];
  width?: number;
  height?: number;
  dataKey?: string;
  nameKey?: string;
}

export default function Charts({ type, data, width = 400, height = 300 }: ChartProps) {
  const getIcon = () => {
    switch (type) {
      case 'bar':
        return <BarChart2 className="w-8 h-8 text-blue-500" />;
      case 'pie':
        return <PieChartIcon className="w-8 h-8 text-green-500" />;
      case 'line':
        return <TrendingUp className="w-8 h-8 text-red-500" />;
      default:
        return <BarChart2 className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div 
      className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"
      style={{ width, height }}
    >
      <div className="text-center">
        {getIcon()}
        <p className="mt-2 text-sm text-gray-600">
          {type.charAt(0).toUpperCase() + type.slice(1)} Chart
        </p>
        <p className="text-xs text-gray-400">
          {data.length} data points
        </p>
      </div>
    </div>
  );
} 