import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import { useInventory } from '../context/InventoryContext';

const OrderInput = () => {
  const { addOrder } = useOrder();
  const { products } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [orderData, setOrderData] = useState({
    supplier: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDelivery: '',
    status: 'Pending' as const,
    products: [],
    total: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addOrder({
        ...orderData,
        products: selectedProducts,
        total: selectedProducts.reduce((sum, p) => sum + (p.quantity * p.price), 0)
      });
      setIsModalOpen(false);
      setSelectedProducts([]);
      setOrderData({
        supplier: '',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDelivery: '',
        status: 'Pending',
        products: [],
        total: 0
      });
    } catch (error) {
      console.error('Error adding order:', error);
    }
  };

  const addProduct = () => {
    setSelectedProducts([...selectedProducts, { name: '', quantity: 1, price: 0 }]);
  };

  const removeProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: string, value: any) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setSelectedProducts(updatedProducts);
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
      >
        <Plus className="h-5 w-5 mr-2" />
        New Order
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">New Arvato Order</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedProducts([]);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier</label>
                  <input
                    type="text"
                    value={orderData.supplier}
                    onChange={(e) => setOrderData({ ...orderData, supplier: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={orderData.status}
                    onChange={(e) => setOrderData({ ...orderData, status: e.target.value as any })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Date</label>
                  <input
                    type="date"
                    value={orderData.orderDate}
                    onChange={(e) => setOrderData({ ...orderData, orderDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expected Delivery</label>
                  <input
                    type="date"
                    value={orderData.expectedDelivery}
                    onChange={(e) => setOrderData({ ...orderData, expectedDelivery: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-medium text-gray-900">Products</h4>
                  <button
                    type="button"
                    onClick={addProduct}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Product
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedProducts.map((product, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <select
                          value={product.name}
                          onChange={(e) => updateProduct(index, 'name', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select product</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          min="1"
                          value={product.quantity}
                          onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Qty"
                          required
                        />
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={product.price}
                          onChange={(e) => updateProduct(index, 'price', parseFloat(e.target.value))}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Price"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedProducts([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderInput;