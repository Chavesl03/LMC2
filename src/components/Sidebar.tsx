import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  component: React.ComponentType;
}

interface SidebarProps {
  menuItems: MenuItem[];
  activeMenuItem: string;
  setActiveMenuItem: (item: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  menuItems,
  activeMenuItem,
  setActiveMenuItem,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const { user } = useAuth();
  const handleMenuClick = (label: string) => {
    setActiveMenuItem(label);
    setIsMobileMenuOpen(false);
  };

  // Filter out Settings menu item for non-admin users
  const filteredMenuItems = menuItems.filter(item => 
    item.label !== 'Settings' || user?.role === 'Admin'
  );

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl border-r border-white/20 
                 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
                 lg:translate-x-0 transition-transform duration-300 ease-in-out pt-12`}
    >
      <nav className="mt-5 px-2 space-y-0.5">
        {filteredMenuItems.map(({ icon: Icon, label }) => (
          <button
            key={label}
            onClick={() => handleMenuClick(label)}
            className={`w-full group flex items-center px-4 py-2 text-sm font-medium rounded-xl
                       transition-colors duration-200 ${
                         activeMenuItem === label
                           ? 'bg-apple-blue text-white'
                           : 'text-apple-gray-500 hover:bg-apple-gray-100'
                       }`}
          >
            <Icon
              className={`mr-3 h-5 w-5 ${
                activeMenuItem === label
                  ? 'text-white'
                  : 'text-apple-gray-500 group-hover:text-apple-gray-900'
              }`}
            />
            {label}
          </button>
        ))}
      </nav>

      {/* App Title and Credit - Below Settings with more spacing */}
      <div className="absolute bottom-12 px-4 w-full">
        <div className="flex flex-col">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">ASC TOOL</span>
          <span className="text-[8px] text-apple-gray-500 -mt-1">By L.Chaves</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;