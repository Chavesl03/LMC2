import React, { useState } from 'react';
import { Truck, Search, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useOrder } from '../context/OrderContext';
import OrderInput from './OrderInput';

const Orders = () => {
  const { orders, deleteOrder, isLoading } = useOrder();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(id);
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        <span className="ml-2 text-gray-600">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Arvato Orders</h1>
        <OrderInput />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 opacity-95" />
          <div className="relative px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Truck className="h-6 w-6 text-blue-400" />
              <h3 className="text-lg font-medium text-white tracking-wide">Order Management</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-300">
                {orders.length} orders
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex-1 min-w-0">
              <div className="relative rounded-md shadow-sm max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search orders..."
                />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Details</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 bg-gray-50"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                            <div className="text-sm text-gray-500">{order.supplier}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {order.products.map((product, index) => (
                            <div key={index} className="text-gray-900">
                              {product.quantity}x {product.name}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Ordered: {format(new Date(order.orderDate), 'dd/MM/yyyy')}
                        </div>
                        <div className="text-sm text-gray-500">
                          Expected: {format(new Date(order.expectedDelivery), 'dd/MM/yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'In Transit'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'Delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <Truck className="h-4 w-4 mr-1" />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        €{order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                            title="Delete order"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;