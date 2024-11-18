import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useSales } from '../context/SalesContext';
import { useCompetitorSales } from '../context/CompetitorSalesContext';
import { useTeam } from '../context/TeamContext';
import { PRODUCT_CATEGORIES } from '../constants/products';

const COMPETITOR_BRANDS = {
  Smartphones: ['Samsung', 'Oppo', 'Xiaomi', 'Huawei'],
  Computers: ['Asus', 'HP', 'Acer', 'Lenovo', 'Microsoft', 'Google']
};

const APPLE_PRODUCTS = {
  Smartphones: PRODUCT_CATEGORIES['iPhone'],
  Computers: [...PRODUCT_CATEGORIES['Mac'], ...PRODUCT_CATEGORIES['iPad']]
};

const SalesInput = () => {
  const { addSale } = useSales();
  const { addCompetitorSale } = useCompetitorSales();
  const { members } = useTeam();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saleType, setSaleType] = useState<'apple' | 'competitor' | null>(null);
  
  // Get active team members
  const activeMembers = members.filter(member => member.status === 'active');
  
  // Apple sale form state
  const [appleSale, setAppleSale] = useState({
    date: new Date().toISOString().split('T')[0],
    product: '',
    category: '',
    quantity: 1,
    seller: '',
    totalPrice: 0
  });

  // Competitor sale form state
  const [competitorSale, setCompetitorSale] = useState({
    date: new Date().toISOString().split('T')[0],
    brand: '',
    category: 'Smartphones' as 'Smartphones' | 'Computers',
    units: 1
  });

  const handleAppleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addSale(appleSale);
      setIsModalOpen(false);
      setAppleSale({
        date: new Date().toISOString().split('T')[0],
        product: '',
        category: '',
        quantity: 1,
        seller: '',
        totalPrice: 0
      });
      setSaleType(null);
    } catch (error) {
      console.error('Error adding Apple sale:', error);
    }
  };

  const handleCompetitorSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCompetitorSale(competitorSale);
      setIsModalOpen(false);
      setCompetitorSale({
        date: new Date().toISOString().split('T')[0],
        brand: '',
        category: 'Smartphones',
        units: 1
      });
      setSaleType(null);
    } catch (error) {
      console.error('Error adding competitor sale:', error);
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add Sale
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            {!saleType ? (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Sale Type</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setSaleType('apple')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Apple Sale
                  </button>
                  <button
                    onClick={() => setSaleType('competitor')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Competitor Sale
                  </button>
                </div>
              </div>
            ) : saleType === 'apple' ? (
              <form onSubmit={handleAppleSaleSubmit} className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Apple Sale</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={appleSale.date}
                    onChange={(e) => setAppleSale({ ...appleSale, date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={appleSale.category}
                    onChange={(e) => setAppleSale({ 
                      ...appleSale, 
                      category: e.target.value,
                      product: '' // Reset product when category changes
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Smartphones">Smartphones</option>
                    <option value="Computers">Computers</option>
                  </select>
                </div>

                {appleSale.category && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product</label>
                    <select
                      value={appleSale.product}
                      onChange={(e) => setAppleSale({ ...appleSale, product: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select product</option>
                      {APPLE_PRODUCTS[appleSale.category as keyof typeof APPLE_PRODUCTS]?.map(product => (
                        <option key={product} value={product}>{product}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={appleSale.quantity}
                    onChange={(e) => setAppleSale({ ...appleSale, quantity: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Seller</label>
                  <select
                    value={appleSale.seller}
                    onChange={(e) => setAppleSale({ ...appleSale, seller: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select seller</option>
                    {activeMembers.map(member => (
                      <option key={member.id} value={member.name}>
                        {member.name} - {member.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={appleSale.totalPrice}
                    onChange={(e) => setAppleSale({ ...appleSale, totalPrice: parseFloat(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSaleType(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add Sale
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCompetitorSaleSubmit} className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Competitor Sale</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={competitorSale.date}
                    onChange={(e) => setCompetitorSale({ ...competitorSale, date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={competitorSale.category}
                    onChange={(e) => setCompetitorSale({ 
                      ...competitorSale, 
                      category: e.target.value as 'Smartphones' | 'Computers',
                      brand: '' // Reset brand when category changes
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="Smartphones">Smartphones</option>
                    <option value="Computers">Computers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Brand</label>
                  <select
                    value={competitorSale.brand}
                    onChange={(e) => setCompetitorSale({ ...competitorSale, brand: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select brand</option>
                    {COMPETITOR_BRANDS[competitorSale.category].map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Units Sold</label>
                  <input
                    type="number"
                    min="1"
                    value={competitorSale.units}
                    onChange={(e) => setCompetitorSale({ ...competitorSale, units: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSaleType(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add Sale
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesInput;