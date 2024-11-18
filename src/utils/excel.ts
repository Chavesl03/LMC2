import { read, utils } from 'xlsx';

export interface StockData {
  product: string;
  category: string;
  storeStock: number;
  warehouseStock: number;
  totalStock: number;
  status: 'critical' | 'warning' | 'optimal';
}

const PRODUCT_CATEGORIES = {
  'iPhone': ['iPhone 15', 'iPhone 14', 'iPhone 13'],
  'iPad': ['iPad Pro', 'iPad Air', 'iPad mini'],
  'Mac': ['MacBook Pro', 'MacBook Air', 'iMac', 'Mac mini'],
  'Watch': ['Apple Watch Series', 'Apple Watch Ultra'],
  'Audio': ['AirPods Pro', 'AirPods', 'AirPods Max'],
  'Accessories': ['Cases', 'Chargers', 'Cables']
};

function determineCategory(product: string): string {
  for (const [category, keywords] of Object.entries(PRODUCT_CATEGORIES)) {
    if (keywords.some(keyword => product.toLowerCase().includes(keyword.toLowerCase()))) {
      return category;
    }
  }
  return 'Other';
}

export async function analyzeExcel(file: File): Promise<StockData[]> {
  try {
    const data = await file.arrayBuffer();
    const workbook = read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

    const dataRows = jsonData.slice(1);

    const stockData: StockData[] = dataRows
      .filter((row: any[]) => row.length >= 5)
      .map((row: any[]) => {
        const product = String(row[2] || '').trim();
        const storeStock = parseInt(String(row[3] || '0'));
        const warehouseStock = parseInt(String(row[4] || '0'));
        const totalStock = storeStock + warehouseStock;

        if (!product || isNaN(storeStock) || isNaN(warehouseStock)) {
          return null;
        }

        let status: 'critical' | 'warning' | 'optimal';
        if (storeStock <= 5) {
          status = 'critical';
        } else if (storeStock <= 15) {
          status = 'warning';
        } else {
          status = 'optimal';
        }

        return {
          product,
          category: determineCategory(product),
          storeStock,
          warehouseStock,
          totalStock,
          status
        };
      })
      .filter((item): item is StockData => item !== null);

    if (stockData.length === 0) {
      throw new Error(
        'No valid stock data found. Please ensure your Excel file has product names in column C, store stock in column D, and warehouse stock in column E.'
      );
    }

    return stockData;
  } catch (error) {
    console.error('Excel analysis error:', error);
    if (error instanceof Error) {
      throw new Error(`Excel analysis failed: ${error.message}`);
    }
    throw new Error(
      'Failed to analyze Excel file. Please ensure the file contains valid stock data in the correct format.'
    );
  }
}