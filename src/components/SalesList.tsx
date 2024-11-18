import React from 'react';
import { format } from 'date-fns';
import { Trash2, Smartphone, Laptop } from 'lucide-react';
import { useSales } from '../context/SalesContext';
import { useCompetitorSales } from '../context/CompetitorSalesContext';

const CATEGORY_ICONS = {
  Smartphones: Smartphone,
  Computers: Laptop
};

const SalesList = () => {
  const { sales, deleteSale } = useSales();
  const { competitorSales, deleteCompetitorSale } = useCompetitorSales();

  const categories = ['Smartphones', 'Computers'];

  const handleDeleteAppleSale = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await deleteSale(id);
      } catch (error) {
        console.error('Error deleting sale:', error);
      }
    }
  };

  const handleDeleteCompetitorSale = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this competitor sale?')) {
      try {
        await deleteCompetitorSale(id);
      } catch (error) {
        console.error('Error deleting competitor sale:', error);
      }
    }
  };

  return (
    <div className="space-y-8">
      {categories.map(category => {
        const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
        return (
          <div key={category} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="relative">
              {/* Premium Category Header */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 opacity-95" />
              <div className="relative px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon className="h-6 w-6 text-blue-400" />
                  <h3 className="text-lg font-medium text-white tracking-wide">{category}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-300">
                    {sales.filter(s => s.category === category).length +
                      competitorSales.filter(s => s.category === category).length} total sales
                  </span>
                </div>
              </div>
            </div>
            
            {/* Apple Sales */}
            <div className="px-6 py-5">
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Apple Sales
                </span>
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                      <th className="px-6 py-3 bg-gray-50"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sales
                      .filter(sale => sale.category === category)
                      .map(sale => (
                        <tr key={sale.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(new Date(sale.date), 'dd/MM/yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.product}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.seller}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">€{sale.totalPrice.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeleteAppleSale(sale.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors duration-150"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Competitor Sales */}
            <div className="px-6 py-5 border-t border-gray-100">
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Competitor Sales
                </span>
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                      <th className="px-6 py-3 bg-gray-50"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {competitorSales
                      .filter(sale => sale.category === category)
                      .map(sale => (
                        <tr key={sale.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(new Date(sale.date), 'dd/MM/yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.brand}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.units}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeleteCompetitorSale(sale.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors duration-150"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SalesList;