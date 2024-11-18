import React, { ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface CategoryHeaderProps {
  icon: ReactNode;
  title: string;
  count?: number;
  countLabel?: string;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ 
  icon, 
  title, 
  count, 
  countLabel = 'items'
}) => {
  const theme = useTheme();

  return (
    <div className="relative">
      <div className={`absolute inset-0 ${theme.gradients.header} opacity-95`} />
      <div className="relative px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-blue-400">
            {icon}
          </div>
          <h3 className="text-lg font-medium text-white tracking-wide">{title}</h3>
        </div>
        {count !== undefined && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">
              {count} {countLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryHeader;