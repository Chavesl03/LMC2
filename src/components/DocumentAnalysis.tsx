import React from 'react';
import { FileText, Image as ImageIcon, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StockItem {
  product: string;
  currentStock: number;
  warehouseStock: number;
  totalStock: number;
  minStock: number;
  maxStock: number;
  status: 'critical' | 'warning' | 'optimal';
}

interface AnalysisResult {
  type: 'success' | 'error';
  message: string;
  content?: string;
  metadata?: {
    pageCount?: number;
    fileType: string;
    fileName: string;
    fileSize: string;
  };
  stockAnalysis?: {
    items: StockItem[];
    summary: {
      criticalCount: number;
      warningCount: number;
      optimalCount: number;
    };
  };
}

interface DocumentAnalysisProps {
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | null;
}

const DocumentAnalysis: React.FC<DocumentAnalysisProps> = ({
  isAnalyzing,
  analysisResult
}) => {
  const getStockLevelColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'optimal':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStockIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'optimal':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const chartData = analysisResult?.stockAnalysis?.items ? {
    labels: analysisResult.stockAnalysis.items.map(item => item.product),
    datasets: [
      {
        label: 'Store Stock',
        data: analysisResult.stockAnalysis.items.map(item => item.currentStock),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        order: 2,
      },
      {
        label: 'Warehouse Stock',
        data: analysisResult.stockAnalysis.items.map(item => item.warehouseStock),
        backgroundColor: 'rgba(147, 197, 253, 0.5)',
        borderColor: 'rgba(147, 197, 253, 1)',
        borderWidth: 1,
        order: 3,
      },
      {
        label: 'Minimum Stock',
        data: analysisResult.stockAnalysis.items.map(item => item.minStock),
        type: 'line' as const,
        borderColor: 'rgba(239, 68, 68, 0.5)',
        borderDash: [5, 5],
        fill: false,
        pointStyle: 'circle',
        pointRadius: 4,
        pointHoverRadius: 6,
        order: 1,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Stock Levels Analysis',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        stacked: false,
        grid: {
          drawBorder: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        <span className="ml-3 text-gray-600">Analyzing document...</span>
      </div>
    );
  }

  if (!analysisResult) return null;

  return (
    <div className="space-y-6">
      {/* File Information */}
      <div className="flex items-start space-x-3">
        {analysisResult.metadata?.fileType.includes('pdf') ? (
          <FileText className="h-8 w-8 text-red-500" />
        ) : (
          <ImageIcon className="h-8 w-8 text-blue-500" />
        )}
        <div>
          <h3 className="font-medium text-gray-900">{analysisResult.metadata?.fileName}</h3>
          <p className="text-sm text-gray-500">
            {analysisResult.metadata?.fileType} • {analysisResult.metadata?.fileSize}
            {analysisResult.metadata?.pageCount && ` • ${analysisResult.metadata.pageCount} pages`}
          </p>
        </div>
      </div>

      {/* Analysis Status */}
      <div className={`rounded-lg p-4 ${
        analysisResult.type === 'success' ? 'bg-green-50' : 'bg-red-50'
      }`}>
        <p className={`text-sm ${
          analysisResult.type === 'success' ? 'text-green-700' : 'text-red-700'
        }`}>
          {analysisResult.message}
        </p>
      </div>

      {/* Stock Analysis Summary */}
      {analysisResult.stockAnalysis && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <h4 className="text-sm font-medium text-red-800">Critical Stock</h4>
                </div>
                <span className="text-2xl font-bold text-red-600">
                  {analysisResult.stockAnalysis.summary.criticalCount}
                </span>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                  <h4 className="text-sm font-medium text-yellow-800">Warning Stock</h4>
                </div>
                <span className="text-2xl font-bold text-yellow-600">
                  {analysisResult.stockAnalysis.summary.warningCount}
                </span>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <h4 className="text-sm font-medium text-green-800">Optimal Stock</h4>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {analysisResult.stockAnalysis.summary.optimalCount}
                </span>
              </div>
            </div>
          </div>

          {/* Stock Level Chart */}
          {chartData && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="h-[400px]">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Detailed Stock List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900">Detailed Stock Analysis</h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {analysisResult.stockAnalysis.items.map((item, index) => (
                  <li key={index} className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStockIcon(item.status)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.product}</p>
                          <p className="text-sm text-gray-500">
                            Store: {item.currentStock} | Warehouse: {item.warehouseStock} | Total: {item.totalStock}
                          </p>
                          <p className="text-sm text-gray-500">
                            Min: {item.minStock} | Max: {item.maxStock}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockLevelColor(item.status)}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentAnalysis;