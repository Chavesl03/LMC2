import React, { ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  const theme = useTheme();

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export default Card;