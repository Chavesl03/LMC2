import React from 'react';
import SalesInput from './SalesInput';
import SalesList from './SalesList';
import SalesComparison from './SalesComparison';
import InHouseShareAnalysis from './InHouseShareAnalysis';
import ResetDashboard from './ResetDashboard';
import { useSales } from '../context/SalesContext';
import { useCompetitorSales } from '../context/CompetitorSalesContext';

const Sales = () => {
  const { sales, isLoading: isLoadingSales } = useSales();
  const { competitorSales, isLoading: isLoadingCompetitor } = useCompetitorSales();

  if (isLoadingSales || isLoadingCompetitor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        <span className="ml-2 text-gray-600">Loading sales data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Sales Management</h1>
        <div className="flex space-x-3">
          <ResetDashboard />
          <SalesInput />
        </div>
      </div>

      <InHouseShareAnalysis sales={sales} competitorSales={competitorSales} />
      <SalesComparison sales={sales} />
      <SalesList />
    </div>
  );
};

export default Sales;