import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SalesComparisonProps {
  sales: Array<{
    id: number;
    date: string;
    product: string;
    quantity: number;
    seller: string;
    accessory?: string;
  }>;
}

const SalesComparison: React.FC<SalesComparisonProps> = ({ sales }) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const todaySales = sales.filter(sale => sale.date.startsWith(formatDate(today))).length;
  const yesterdaySales = sales.filter(sale => sale.date.startsWith(formatDate(yesterday))).length;
  const lastWeekSameDaySales = sales.filter(sale => sale.date.startsWith(formatDate(lastWeek))).length;

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const dailyChange = calculateChange(todaySales, yesterdaySales);
  const weeklyChange = calculateChange(todaySales, lastWeekSameDaySales);

  const ComparisonCard = ({ title, current, previous, change }: { 
    title: string;
    current: number;
    previous: number;
    change: number;
  }) => (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{current}</p>
        <p className="ml-2 text-sm font-medium">vs {previous}</p>
        <div className={`ml-2 flex items-center text-sm font-medium ${
          change >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {change >= 0 ? (
            <TrendingUp className="h-4 w-4 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1" />
          )}
          {Math.abs(change).toFixed(1)}%
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <ComparisonCard
        title="Daily Comparison"
        current={todaySales}
        previous={yesterdaySales}
        change={dailyChange}
      />
      <ComparisonCard
        title="Weekly Comparison"
        current={todaySales}
        previous={lastWeekSameDaySales}
        change={weeklyChange}
      />
    </div>
  );
};

export default SalesComparison;