import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../constants/products';
import { PRODUCT_IMAGES } from '../constants/productImages';

const SKU_MAP: { [key: string]: string } = {
  'iPhone 16 Pro Max': 'IP16PM',
  'iPhone 16 Pro': 'IP16P',
  'iPhone 16 Plus': 'IP16PL',
  'iPhone 16': 'IP16',
  'iPhone 15 Pro Max': 'IP15PM',
  'iPhone 15 Pro': 'IP15P',
  'iPhone 15 Plus': 'IP15PL',
  'iPhone 15': 'IP15',
  'iPhone 14 Plus': 'IP14PL',
  'iPhone 14': 'IP14',
  'iPhone 13': 'IP13',
  'iPad Pro 13" M4': 'IPDP13M4',
  'iPad Pro 11" M4': 'IPDP11M4',
  'iPad Air 13" M2': 'IPDA13M2',
  'iPad Air 11" M2': 'IPDA11M2',
  'iPad mini A17 Pro': 'IPDMA17',
  'MacBook Pro 16" M4': 'MBP16M4',
  'MacBook Pro 14" M4': 'MBP14M4',
  'MacBook Air 15" M3 16GB': 'MBA15M3',
  'MacBook Air 13" M3 16GB': 'MBA13M3',
  'MacBook Air 13" M2 16GB': 'MBA13M2',
  'iMac 24" M4': 'IMC24M4',
  'Mac mini M4': 'MMM4',
  'Mac Studio': 'MS',
  'Mac Pro': 'MP',
  'Apple Watch Ultra 2': 'AWU2',
  'Apple Watch Series 9': 'AWS9',
  'Apple Watch SE': 'AWSE'
};

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: any) => void;
  editingProduct?: any;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSubmit, editingProduct }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    sku: '',
    ean: '',
    storeStock: '',
    warehouseStock: '',
    minStock: '5',
    maxStock: '30',
    price: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        category: editingProduct.category || '',
        sku: editingProduct.sku || '',
        ean: editingProduct.ean || '',
        storeStock: editingProduct.storeStock?.toString() || '',
        warehouseStock: editingProduct.warehouseStock?.toString() || '',
        minStock: editingProduct.minStock?.toString() || '5',
        maxStock: editingProduct.maxStock?.toString() || '30',
        price: editingProduct.price?.toString() || '',
        imageUrl: editingProduct.imageUrl || ''
      });
      setSelectedCategory(editingProduct.category || '');
    }
  }, [editingProduct]);

  const handleProductSelect = (productName: string) => {
    const sku = SKU_MAP[productName] || '';
    const imageUrl = PRODUCT_IMAGES[productName as keyof typeof PRODUCT_IMAGES] || '';
    
    setFormData({
      ...formData,
      name: productName,
      category: selectedCategory,
      sku: sku,
      imageUrl: imageUrl
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...formData,
      storeStock: parseInt(formData.storeStock),
      warehouseStock: parseInt(formData.warehouseStock),
      minStock: parseInt(formData.minStock),
      maxStock: parseInt(formData.maxStock),
      price: parseFloat(formData.price),
      id: editingProduct?.id
    };
    onSubmit(productData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {editingProduct ? 'Edit Product' : 'Add Product'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setFormData({ ...formData, category: e.target.value });
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select a category</option>
              {Object.keys(PRODUCT_CATEGORIES).map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Product</label>
            <select
              value={formData.name}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select a product</option>
              {selectedCategory && PRODUCT_CATEGORIES[selectedCategory as keyof typeof PRODUCT_CATEGORIES].map((product) => (
                <option key={product} value={product}>{product}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">SKU</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">EAN</label>
            <input
              type="text"
              value={formData.ean}
              onChange={(e) => setFormData({ ...formData, ean: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Store Stock</label>
              <input
                type="number"
                min="0"
                value={formData.storeStock}
                onChange={(e) => setFormData({ ...formData, storeStock: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Warehouse Stock</label>
              <input
                type="number"
                min="0"
                value={formData.warehouseStock}
                onChange={(e) => setFormData({ ...formData, warehouseStock: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Stock</label>
              <input
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Stock</label>
              <input
                type="number"
                min="0"
                value={formData.maxStock}
                onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price (€)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;