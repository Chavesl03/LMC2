import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useSales } from '../context/SalesContext';
import { useCompetitorSales } from '../context/CompetitorSalesContext';

const ResetDashboard = () => {
  const { resetAllSales } = useSales();
  const { resetAllCompetitorSales } = useCompetitorSales();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReset = async () => {
    try {
      await Promise.all([
        resetAllSales(),
        resetAllCompetitorSales()
      ]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error resetting dashboard:', error);
      alert('Failed to reset dashboard. Please try again.');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-gray-300 text-gray-600 hover:text-red-600 hover:border-red-300 transition-colors duration-200"
        title="Reset all sales data"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Reset
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reset Dashboard</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to reset the dashboard? This will delete all sales data and cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResetDashboard;