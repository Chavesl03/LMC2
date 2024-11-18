import React, { useState, useMemo } from 'react';
import { BarChart, LineChart, PieChart, Download, RefreshCw } from 'lucide-react';
import { useSales } from '../context/SalesContext';
import { useCompetitorSales } from '../context/CompetitorSalesContext';
import { format, subDays, isToday, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const { sales, resetAllSales } = useSales();
  const { competitorSales, resetAllCompetitorSales } = useCompetitorSales();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('7');

  const handleReset = async () => {
    try {
      await Promise.all([
        resetAllSales(),
        resetAllCompetitorSales()
      ]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error resetting analytics:', error);
    }
  };

  const analytics = useMemo(() => {
    const today = new Date();
    const daysToAnalyze = parseInt(timeRange);
    const startDate = subDays(today, daysToAnalyze - 1);

    // Daily sales data
    const dailyData = Array.from({ length: daysToAnalyze }, (_, i) => {
      const date = subDays(today, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const daySales = sales.filter(sale => 
        isWithinInterval(new Date(sale.date), { start: dayStart, end: dayEnd })
      );

      const dayCompetitorSales = competitorSales.filter(sale =>
        isWithinInterval(new Date(sale.date), { start: dayStart, end: dayEnd })
      );

      return {
        date: format(date, 'MMM dd'),
        revenue: daySales.reduce((sum, sale) => sum + sale.totalPrice, 0),
        units: daySales.reduce((sum, sale) => sum + sale.quantity, 0),
        competitorUnits: dayCompetitorSales.reduce((sum, sale) => sum + sale.units, 0)
      };
    }).reverse();

    // Category distribution
    const categoryData = {
      Smartphones: sales.filter(s => s.category === 'Smartphones').length,
      Computers: sales.filter(s => s.category === 'Computers').length
    };

    // Calculate KPIs
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const totalOrders = sales.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const todaySales = sales.filter(sale => isToday(new Date(sale.date)));
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const yesterdaySales = sales.filter(sale => 
      isWithinInterval(new Date(sale.date), {
        start: startOfDay(subDays(today, 1)),
        end: endOfDay(subDays(today, 1))
      })
    );
    const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const revenueChange = yesterdayRevenue === 0 ? 0 : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

    return {
      dailyData,
      categoryData,
      kpis: {
        totalRevenue,
        averageOrderValue,
        totalOrders,
        revenueChange
      }
    };
  }, [sales, competitorSales, timeRange]);

  const chartData = {
    revenue: {
      labels: analytics.dailyData.map(d => d.date),
      datasets: [
        {
          label: 'Revenue',
          data: analytics.dailyData.map(d => d.revenue),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.4
        }
      ]
    },
    units: {
      labels: analytics.dailyData.map(d => d.date),
      datasets: [
        {
          label: 'Apple Units',
          data: analytics.dailyData.map(d => d.units),
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        },
        {
          label: 'Competitor Units',
          data: analytics.dailyData.map(d => d.competitorUnits),
          backgroundColor: 'rgba(239, 68, 68, 0.5)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 1
        }
      ]
    },
    categories: {
      labels: Object.keys(analytics.categoryData),
      datasets: [{
        data: Object.values(analytics.categoryData),
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',
          'rgba(16, 185, 129, 0.5)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)'
        ],
        borderWidth: 1
      }]
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-gray-300 text-gray-600 hover:text-red-600 hover:border-red-300 transition-colors duration-200"
            title="Reset analytics data"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reset
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            <Download className="h-5 w-5 mr-2" />
            Export Reports
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">
              €{analytics.kpis.totalRevenue.toFixed(2)}
            </p>
            <p className={`ml-2 text-sm font-medium ${
              analytics.kpis.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics.kpis.revenueChange >= 0 ? '+' : ''}{analytics.kpis.revenueChange.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Average Order Value</h3>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            €{analytics.kpis.averageOrderValue.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {analytics.kpis.totalOrders}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Time Range</h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends</h3>
          <div className="h-64">
            <Line
              data={chartData.revenue}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `€${value}`
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Units Sold Comparison</h3>
          <div className="h-64">
            <Bar
              data={chartData.units}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    stacked: false
                  },
                  x: {
                    stacked: false
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Category Distribution</h3>
          <div className="h-64">
            <Pie
              data={chartData.categories}
              options={{
                responsive: true,
                maintainAspectRatio: false
              }}
            />
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reset Analytics</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to reset all analytics data? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;