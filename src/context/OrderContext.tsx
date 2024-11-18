import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

export interface OrderProduct {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  supplier: string;
  products: OrderProduct[];
  orderDate: string;
  expectedDelivery: string;
  status: 'Pending' | 'In Transit' | 'Delivered' | 'Cancelled';
  total: number;
  createdAt: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'orderNumber'>) => Promise<void>;
  updateOrder: (order: Order) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}

interface OrderProviderProps {
  children: ReactNode;
}

export function OrderProvider({ children }: OrderProviderProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('orderDate', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      setOrders(updatedOrders);
      setIsLoading(false);
    }, (err) => {
      console.error('Error listening to orders:', err);
      setError('Failed to load orders');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generateOrderNumber = () => {
    const year = new Date().getFullYear();
    const count = orders.length + 1;
    return `ORD-${year}-${count.toString().padStart(3, '0')}`;
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'orderNumber'>) => {
    try {
      const orderNumber = generateOrderNumber();
      await addDoc(collection(db, 'orders'), {
        ...orderData,
        orderNumber,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      setError('Failed to add order');
      console.error('Error adding order:', err);
      throw err;
    }
  };

  const updateOrder = async (updatedOrder: Order) => {
    try {
      const orderRef = doc(db, 'orders', updatedOrder.id);
      await updateDoc(orderRef, {
        ...updatedOrder,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      setError('Failed to update order');
      console.error('Error updating order:', err);
      throw err;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (err) {
      setError('Failed to delete order');
      console.error('Error deleting order:', err);
      throw err;
    }
  };

  const value = {
    orders,
    addOrder,
    updateOrder,
    deleteOrder,
    isLoading,
    error
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}