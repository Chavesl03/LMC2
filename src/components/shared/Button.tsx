import React, { ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button'
}) => {
  const theme = useTheme();

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200';
  
  const variantStyles = {
    primary: 'text-white bg-blue-600 hover:bg-blue-700',
    secondary: 'text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300',
    danger: 'text-white bg-red-600 hover:bg-red-700'
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;