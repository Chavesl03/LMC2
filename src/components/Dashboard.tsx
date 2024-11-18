import React, { useMemo } from 'react';
import { Users, Package, ShoppingCart, Truck, TrendingUp, TrendingDown } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useSales } from '../context/SalesContext';
import { useTeam } from '../context/TeamContext';
import { format, subDays, isToday, isYesterday } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const { products, isLoading: isLoadingInventory } = useInventory();
  const { sales, isLoading: isLoadingSales } = useSales();
  const { members } = useTeam();

  const stats = useMemo(() => {
    const today = new Date();
    const todaySales = sales.filter(sale => isToday(new Date(sale.date)));
    const yesterdaySales = sales.filter(sale => isYesterday(new Date(sale.date)));
    
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    
    // Only calculate revenue change if there were sales
    const revenueChange = yesterdayRevenue === 0 && todayRevenue === 0
      ? 0 // No sales on both days
      : yesterdayRevenue === 0 && todayRevenue > 0
      ? 100 // No sales yesterday but sales today
      : yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : 0;

    const criticalStock = products.filter(p => p.status === 'critical').length;
    const totalStock = products.reduce((sum, p) => sum + p.storeStock, 0);
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.storeStock), 0);

    const activeMembers = members.filter(m => m.status === 'active').length;
    const champions = members.filter(m => m.isChampion).length;

    return [
      { 
        name: 'Today\'s Sales', 
        value: todaySales.length > 0 ? `€${todayRevenue.toFixed(2)}` : 'No sales', 
        icon: ShoppingCart, 
        change: todaySales.length > 0 ? `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%` : '-', 
        changeType: todaySales.length === 0 ? 'neutral' : revenueChange >= 0 ? 'increase' : 'decrease' 
      },
      { 
        name: 'Total Products', 
        value: products.length.toString(), 
        icon: Package, 
        change: `${criticalStock} critical`, 
        changeType: criticalStock > 0 ? 'decrease' : 'increase' 
      },
      { 
        name: 'Total Stock', 
        value: totalStock.toString(), 
        icon: Truck, 
        change: `€${totalValue.toFixed(2)}`, 
        changeType: 'neutral' 
      },
      { 
        name: 'Team Members', 
        value: activeMembers.toString(), 
        icon: Users, 
        change: `${champions} champions`, 
        changeType: 'increase' 
      }
    ];
  }, [products, sales, members]);

  const salesAnalytics = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      const daySales = sales.filter(sale => isToday(new Date(sale.date), date));
      return {
        date: format(date, 'MMM dd'),
        revenue: daySales.reduce((sum, sale) => sum + sale.totalPrice, 0),
        units: daySales.reduce((sum, sale) => sum + sale.quantity, 0)
      };
    }).reverse();

    return last7Days;
  }, [sales]);

  const topPerformers = useMemo(() => {
    // Only show top performers if there are any sales
    if (sales.length === 0) {
      return [];
    }

    const sellers = [...new Set(sales.map(sale => sale.seller))];
    return sellers
      .map(seller => {
        const sellerSales = sales.filter(sale => sale.seller === seller);
        return {
          name: seller,
          sales: sellerSales.length,
          revenue: sellerSales.reduce((sum, sale) => sum + sale.totalPrice, 0),
          units: sellerSales.reduce((sum, sale) => sum + sale.quantity, 0)
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);
  }, [sales]);

  if (isLoadingInventory || isLoadingSales) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {item.value}
                      </div>
                      {item.change !== '-' && (
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${
                            item.changeType === 'increase'
                              ? 'text-green-600'
                              : item.changeType === 'decrease'
                              ? 'text-red-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {item.changeType === 'increase' ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : item.changeType === 'decrease' ? (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          ) : null}
                          {item.change}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sales Analytics Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Analytics</h3>
        <div className="h-[400px]">
          {salesAnalytics.some(day => day.revenue > 0 || day.units > 0) ? (
            <Bar
              data={{
                labels: salesAnalytics.map(day => day.date),
                datasets: [
                  {
                    label: 'Revenue (€)',
                    data: salesAnalytics.map(day => day.revenue),
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                  },
                  {
                    label: 'Units Sold',
                    data: salesAnalytics.map(day => day.units),
                    backgroundColor: 'rgba(147, 197, 253, 0.5)',
                    borderColor: 'rgba(147, 197, 253, 1)',
                    borderWidth: 1
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Amount' }
                  }
                }
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No sales data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performers</h3>
        {topPerformers.length > 0 ? (
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={performer.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">{performer.name}</div>
                  <div className="text-sm text-gray-500">
                    {performer.sales} sales • {performer.units} units
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    €{performer.revenue.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    #{index + 1} Top Performer
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No sales data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;