import React, { useState, useMemo } from 'react';
import { Package, Plus, Search, Filter, Barcode, ChevronDown, Edit2, Trash2, Smartphone, Laptop, Watch, Headphones, Gift } from 'lucide-react';
import { format } from 'date-fns';
import BarcodeScanner from './BarcodeScanner';
import AddProductModal from './AddProductModal';
import { useInventory } from '../context/InventoryContext';

const CATEGORY_ICONS = {
  'iPhone': Smartphone,
  'iPad': Laptop,
  'Mac': Laptop,
  'Watch': Watch,
  'Audio': Headphones,
  'Accessories': Gift
};

const Inventory = () => {
  const { products, addProduct, updateProduct, deleteProduct, getProductByEan, isLoading } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingStock, setEditingStock] = useState<{ id: string; value: string; type: 'store' | 'warehouse' } | null>(null);
  const [editingWeeklyUnits, setEditingWeeklyUnits] = useState<{ id: string; value: string } | null>(null);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    stock: 'all'
  });

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.ean.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filters.category === 'all' || product.category === filters.category;
      const matchesStatus = filters.status === 'all' || product.status === filters.status;
      
      let matchesStock = true;
      if (filters.stock === 'low') {
        matchesStock = product.storeStock <= product.minStock;
      } else if (filters.stock === 'high') {
        matchesStock = product.storeStock >= product.maxStock;
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    });
  }, [products, searchTerm, filters]);

  const groupedProducts = useMemo(() => {
    return filteredProducts.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, typeof products>);
  }, [filteredProducts]);

  const handleStockKeyPress = (e: React.KeyboardEvent, product: any, type: 'store' | 'warehouse') => {
    if (e.key === 'Enter') {
      const value = (e.target as HTMLInputElement).value;
      handleStockEdit(product, value, type);
    }
  };

  const handleStockEdit = async (product: any, value: string, type: 'store' | 'warehouse') => {
    const newStock = parseInt(value);
    if (!isNaN(newStock) && newStock >= 0) {
      await updateProduct({
        ...product,
        [type === 'store' ? 'storeStock' : 'warehouseStock']: newStock
      });
    }
    setEditingStock(null);
  };

  const renderStockCell = (product: any, type: 'store' | 'warehouse') => {
    const isEditing = editingStock?.id === product.id && editingStock?.type === type;
    const stockValue = type === 'store' ? product.storeStock : product.warehouseStock;

    return isEditing ? (
      <input
        type="number"
        min="0"
        className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        value={editingStock.value}
        onChange={(e) => setEditingStock({ ...editingStock, value: e.target.value })}
        onKeyDown={(e) => handleStockKeyPress(e, product, type)}
        onBlur={(e) => handleStockEdit(product, e.target.value, type)}
        autoFocus
      />
    ) : (
      <button
        onClick={() => setEditingStock({ id: product.id, value: stockValue.toString(), type })}
        className="font-medium text-gray-600 hover:underline"
      >
        {stockValue}
      </button>
    );
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  const handleBarcodeDetected = async (code: string) => {
    const product = await getProductByEan(code);
    if (product) {
      setEditingProduct(product);
      setIsModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
    setIsScannerOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        <span className="ml-2 text-gray-600">Loading inventory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Barcode className="h-5 w-5 mr-2" />
            Scan Barcode
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 min-w-0">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search products..."
            />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-5 w-5 mr-2 text-gray-400" />
              Filter
              <ChevronDown className="ml-2 h-5 w-5 text-gray-400" />
            </button>

            {isFilterOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1 p-2">
                  <div className="px-3 py-2">
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="all">All Categories</option>
                      {Object.keys(CATEGORY_ICONS).map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="px-3 py-2">
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="critical">Critical</option>
                      <option value="warning">Warning</option>
                      <option value="optimal">Optimal</option>
                    </select>
                  </div>
                  <div className="px-3 py-2">
                    <label className="block text-sm font-medium text-gray-700">Stock Level</label>
                    <select
                      value={filters.stock}
                      onChange={(e) => setFilters({ ...filters, stock: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="all">All Levels</option>
                      <option value="low">Low Stock</option>
                      <option value="high">High Stock</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedProducts).map(([category, categoryProducts]) => {
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
                      {categoryProducts.length} products
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Details</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store Stock</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse Stock</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 bg-gray-50"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categoryProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-xs text-gray-400">
                                SKU: {product.sku} | EAN: {product.ean}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {renderStockCell(product, 'store')}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {renderStockCell(product, 'warehouse')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            €{product.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              product.status === 'optimal'
                                ? 'bg-green-100 text-green-800'
                                : product.status === 'warning'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                                title="Edit product"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                                title="Delete product"
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
          );
        })}
      </div>

      {isScannerOpen && (
        <BarcodeScanner
          onClose={() => setIsScannerOpen(false)}
          onDetected={handleBarcodeDetected}
        />
      )}

      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={addProduct}
        editingProduct={editingProduct}
      />
    </div>
  );
};

export default Inventory;