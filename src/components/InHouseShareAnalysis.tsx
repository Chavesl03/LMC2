import React, { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, isToday, isWithinInterval } from 'date-fns';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Smartphone, Laptop } from 'lucide-react';

ChartJS.register(
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

interface InHouseShareAnalysisProps {
  sales: any[];
  competitorSales: any[];
}

const InHouseShareAnalysis: React.FC<InHouseShareAnalysisProps> = ({ sales, competitorSales }) => {
  const analysis = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);

    const calculateShare = (appleSales: number, totalSales: number) => {
      return totalSales > 0 ? (appleSales / totalSales) * 100 : 0;
    };

    // Daily analysis
    const todayAppleSales = {
      smartphones: sales.filter(s => 
        isToday(new Date(s.date)) && 
        s.category === 'Smartphones'
      ).reduce((sum, sale) => sum + sale.quantity, 0),
      computers: sales.filter(s => 
        isToday(new Date(s.date)) && 
        s.category === 'Computers'
      ).reduce((sum, sale) => sum + sale.quantity, 0)
    };

    const todayCompetitorSales = competitorSales
      .filter(s => isToday(new Date(s.date)))
      .reduce((acc, sale) => ({
        ...acc,
        [sale.category.toLowerCase()]: (acc[sale.category.toLowerCase()] || 0) + sale.units
      }), { smartphones: 0, computers: 0 });

    // Weekly analysis
    const weeklyAppleSales = {
      smartphones: sales
        .filter(s => 
          isWithinInterval(new Date(s.date), { start: weekStart, end: weekEnd }) && 
          s.category === 'Smartphones'
        )
        .reduce((sum, sale) => sum + sale.quantity, 0),
      computers: sales
        .filter(s => 
          isWithinInterval(new Date(s.date), { start: weekStart, end: weekEnd }) && 
          s.category === 'Computers'
        )
        .reduce((sum, sale) => sum + sale.quantity, 0)
    };

    const weeklyCompetitorSales = competitorSales
      .filter(s => isWithinInterval(new Date(s.date), { start: weekStart, end: weekEnd }))
      .reduce((acc, sale) => ({
        ...acc,
        [sale.category.toLowerCase()]: (acc[sale.category.toLowerCase()] || 0) + sale.units
      }), { smartphones: 0, computers: 0 });

    // Calculate market shares for competitors
    const calculateCompetitorShares = (category: 'Smartphones' | 'Computers') => {
      const todayTotal = todayAppleSales[category.toLowerCase()] + 
        Object.values(todayCompetitorSales).reduce((sum, val) => sum + val, 0);

      const competitors = category === 'Smartphones' 
        ? ['Samsung', 'Oppo', 'Xiaomi', 'Huawei', 'Apple']
        : ['Asus', 'HP', 'Acer', 'Lenovo', 'Microsoft', 'Google', 'Apple'];

      return competitors.map(brand => {
        if (brand === 'Apple') {
          return todayAppleSales[category.toLowerCase()];
        }
        return competitorSales
          .filter(s => 
            isToday(new Date(s.date)) && 
            s.category === category && 
            s.brand === brand
          )
          .reduce((sum, sale) => sum + sale.units, 0);
      });
    };

    return {
      daily: {
        smartphones: {
          share: calculateShare(
            todayAppleSales.smartphones,
            todayAppleSales.smartphones + todayCompetitorSales.smartphones
          ),
          total: todayAppleSales.smartphones + todayCompetitorSales.smartphones,
          shares: calculateCompetitorShares('Smartphones')
        },
        computers: {
          share: calculateShare(
            todayAppleSales.computers,
            todayAppleSales.computers + todayCompetitorSales.computers
          ),
          total: todayAppleSales.computers + todayCompetitorSales.computers,
          shares: calculateCompetitorShares('Computers')
        }
      },
      weekly: {
        smartphones: {
          share: calculateShare(
            weeklyAppleSales.smartphones,
            weeklyAppleSales.smartphones + weeklyCompetitorSales.smartphones
          ),
          total: weeklyAppleSales.smartphones + weeklyCompetitorSales.smartphones
        },
        computers: {
          share: calculateShare(
            weeklyAppleSales.computers,
            weeklyAppleSales.computers + weeklyCompetitorSales.computers
          ),
          total: weeklyAppleSales.computers + weeklyCompetitorSales.computers
        }
      }
    };
  }, [sales, competitorSales]);

  const competitorData = useMemo(() => {
    const smartphones = {
      labels: ['Samsung', 'Oppo', 'Xiaomi', 'Huawei', 'Apple'],
      datasets: [{
        data: analysis.daily.smartphones.shares,
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',
          'rgba(16, 185, 129, 0.5)',
          'rgba(245, 158, 11, 0.5)',
          'rgba(239, 68, 68, 0.5)',
          'rgba(99, 102, 241, 0.5)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(99, 102, 241, 1)'
        ],
        borderWidth: 1
      }]
    };

    const computers = {
      labels: ['Asus', 'HP', 'Acer', 'Lenovo', 'Microsoft', 'Google', 'Apple'],
      datasets: [{
        data: analysis.daily.computers.shares,
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',
          'rgba(16, 185, 129, 0.5)',
          'rgba(245, 158, 11, 0.5)',
          'rgba(239, 68, 68, 0.5)',
          'rgba(99, 102, 241, 0.5)',
          'rgba(236, 72, 153, 0.5)',
          'rgba(124, 58, 237, 0.5)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(99, 102, 241, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(124, 58, 237, 1)'
        ],
        borderWidth: 1
      }]
    };

    return { smartphones, computers };
  }, [analysis]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Analysis */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Daily In-House Share</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Smartphone className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Smartphones</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900">
                  {analysis.daily.smartphones.share.toFixed(1)}%
                </span>
                {analysis.daily.smartphones.share >= 30 ? (
                  <TrendingUp className="h-5 w-5 text-green-500 ml-2" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500 ml-2" />
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Laptop className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Computers</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900">
                  {analysis.daily.computers.share.toFixed(1)}%
                </span>
                {analysis.daily.computers.share >= 25 ? (
                  <TrendingUp className="h-5 w-5 text-green-500 ml-2" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500 ml-2" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Analysis */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly In-House Share</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Smartphone className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Smartphones</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900">
                  {analysis.weekly.smartphones.share.toFixed(1)}%
                </span>
                {analysis.weekly.smartphones.share >= 30 ? (
                  <TrendingUp className="h-5 w-5 text-green-500 ml-2" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500 ml-2" />
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Laptop className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Computers</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900">
                  {analysis.weekly.computers.share.toFixed(1)}%
                </span>
                {analysis.weekly.computers.share >= 25 ? (
                  <TrendingUp className="h-5 w-5 text-green-500 ml-2" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500 ml-2" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Share Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Smartphone Market Share</h3>
          <div className="h-64">
            <Doughnut
              data={competitorData.smartphones}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Computer Market Share</h3>
          <div className="h-64">
            <Doughnut
              data={competitorData.computers}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InHouseShareAnalysis;