import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  PieController,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { StockData } from '../utils/excel';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  PieController,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface StockAnalysisProps {
  isAnalyzing: boolean;
  stockData: StockData[] | null;
}

const StockAnalysis: React.FC<StockAnalysisProps> = ({ isAnalyzing, stockData }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        <span className="ml-3 text-gray-600">Analyzing stock data...</span>
      </div>
    );
  }

  if (!stockData) return null;

  const categories = ['all', ...new Set(stockData.map(item => item.category))];
  
  const filteredData = selectedCategory === 'all' 
    ? stockData 
    : stockData.filter(item => item.category === selectedCategory);

  const summary = {
    criticalCount: filteredData.filter(item => item.status === 'critical').length,
    warningCount: filteredData.filter(item => item.status === 'warning').length,
    optimalCount: filteredData.filter(item => item.status === 'optimal').length,
    totalProducts: filteredData.length,
    totalStoreStock: filteredData.reduce((sum, item) => sum + item.storeStock, 0),
    totalWarehouseStock: filteredData.reduce((sum, item) => sum + item.warehouseStock, 0),
  };

  const categoryData = categories
    .filter(cat => cat !== 'all')
    .map(category => ({
      category,
      count: stockData.filter(item => item.category === category).length,
      critical: stockData.filter(item => item.category === category && item.status === 'critical').length,
      warning: stockData.filter(item => item.category === category && item.status === 'warning').length,
      optimal: stockData.filter(item => item.category === category && item.status === 'optimal').length,
    }));

  const pieChartData = {
    labels: ['Critical', 'Warning', 'Optimal'],
    datasets: [
      {
        data: [summary.criticalCount, summary.warningCount, summary.optimalCount],
        backgroundColor: [
          'rgba(239, 68, 68, 0.5)',
          'rgba(245, 158, 11, 0.5)',
          'rgba(34, 197, 94, 0.5)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const barChartData = {
    labels: filteredData.map(item => item.product),
    datasets: [
      {
        label: 'Store Stock',
        data: filteredData.map(item => item.storeStock),
        backgroundColor: filteredData.map(item => {
          switch (item.status) {
            case 'critical': return 'rgba(239, 68, 68, 0.5)';
            case 'warning': return 'rgba(245, 158, 11, 0.5)';
            default: return 'rgba(34, 197, 94, 0.5)';
          }
        }),
        borderColor: filteredData.map(item => {
          switch (item.status) {
            case 'critical': return 'rgba(239, 68, 68, 1)';
            case 'warning': return 'rgba(245, 158, 11, 1)';
            default: return 'rgba(34, 197, 94, 1)';
          }
        }),
        borderWidth: 1,
      },
      {
        label: 'Warehouse Stock',
        data: filteredData.map(item => item.warehouseStock),
        backgroundColor: 'rgba(147, 197, 253, 0.5)',
        borderColor: 'rgba(147, 197, 253, 1)',
        borderWidth: 1,
      },
    ],
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Status Distribution</h3>
          <div className="h-64">
            <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Summary</h3>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Total Products:</dt>
              <dd className="text-sm font-medium text-gray-900">{summary.totalProducts}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Total Store Stock:</dt>
              <dd className="text-sm font-medium text-gray-900">{summary.totalStoreStock}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Total Warehouse Stock:</dt>
              <dd className="text-sm font-medium text-gray-900">{summary.totalWarehouseStock}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Status Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm text-red-700">Critical</span>
              </div>
              <span className="text-lg font-medium text-red-700">{summary.criticalCount}</span>
            </div>
            <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-sm text-yellow-700">Warning</span>
              </div>
              <span className="text-lg font-medium text-yellow-700">{summary.warningCount}</span>
            </div>
            <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-green-700">Optimal</span>
              </div>
              <span className="text-lg font-medium text-green-700">{summary.optimalCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Level Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Levels by Product</h3>
        <div className="h-[400px]">
          <Bar
            data={barChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: 'Stock Quantity' }
                },
                x: {
                  ticks: { maxRotation: 45, minRotation: 45 }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Category Breakdown</h3>
        </div>
        <div className="border-t border-gray-200">
          {categoryData.map(({ category, count, critical, warning, optimal }) => (
            <div key={category} className="border-b border-gray-200">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">{category}</span>
                  <span className="ml-2 text-sm text-gray-500">({count} products)</span>
                </div>
                {expandedCategories[category] ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedCategories[category] && (
                <div className="px-4 py-3 bg-gray-50">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <span className="text-sm font-medium text-red-600">{critical}</span>
                      <p className="text-xs text-gray-500">Critical</p>
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-medium text-yellow-600">{warning}</span>
                      <p className="text-xs text-gray-500">Warning</p>
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-medium text-green-600">{optimal}</span>
                      <p className="text-xs text-gray-500">Optimal</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockAnalysis;