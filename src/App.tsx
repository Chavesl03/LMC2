import React, { useState } from 'react';
import { Users, Package, ClipboardList, ShoppingCart, Truck, BarChart3, Settings as SettingsIcon, Menu, X, LogOut } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TeamManagement from './components/TeamManagement';
import Inventory from './components/Inventory';
import Tasks from './components/Tasks';
import Sales from './components/Sales';
import ArvatoOrders from './components/Orders';
import Reports from './components/Reports';
import SettingsPanel from './components/Settings';
import { InventoryProvider } from './context/InventoryContext';
import { SalesProvider } from './context/SalesContext';
import { TeamProvider } from './context/TeamContext';
import { TaskProvider } from './context/TaskContext';
import { CompetitorSalesProvider } from './context/CompetitorSalesContext';
import { OrderProvider } from './context/OrderContext';

const menuItems = [
  { icon: BarChart3, label: 'Dashboard', component: Dashboard },
  { icon: Users, label: 'Team Management', component: TeamManagement },
  { icon: Package, label: 'Inventory', component: Inventory },
  { icon: ClipboardList, label: 'Tasks', component: Tasks },
  { icon: ShoppingCart, label: 'Sales', component: Sales },
  { icon: Truck, label: 'Arvato Orders', component: ArvatoOrders },
  { icon: BarChart3, label: 'Reports', component: Reports },
  { icon: SettingsIcon, label: 'Settings', component: SettingsPanel },
];

function AppContent() {
  const { user, logout } = useAuth();
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    return <Login />;
  }

  const ActiveComponent = menuItems.find(item => item.label === activeMenuItem)?.component || Dashboard;

  return (
    <div className="min-h-screen bg-apple-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 fixed w-full z-10">
        <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center">
          <button
            className="lg:hidden p-2 rounded-md text-apple-gray-500 hover:text-apple-gray-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          {/* Spacer to push content to the right */}
          <div className="flex-grow"></div>
          
          {/* User info and logout button */}
          <div className="flex items-center justify-end space-x-4 min-w-[200px]">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">{user.role} - {user.store}</div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-md text-gray-400 hover:text-red-600 transition-colors duration-200 ml-2"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="pt-12 flex">
        {/* Sidebar */}
        <Sidebar
          menuItems={menuItems}
          activeMenuItem={activeMenuItem}
          setActiveMenuItem={setActiveMenuItem}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:ml-64">
          <div className="max-w-[980px] mx-auto">
            <ActiveComponent />
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InventoryProvider>
          <SalesProvider>
            <TeamProvider>
              <TaskProvider>
                <CompetitorSalesProvider>
                  <OrderProvider>
                    <AppContent />
                  </OrderProvider>
                </CompetitorSalesProvider>
              </TaskProvider>
            </TeamProvider>
          </SalesProvider>
        </InventoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;