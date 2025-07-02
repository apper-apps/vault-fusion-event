import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 focus:ring-primary-500 shadow-elevation-1 hover:shadow-elevation-2',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500 shadow-elevation-1 hover:shadow-elevation-2',
    success: 'bg-gradient-to-r from-success to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 focus:ring-success shadow-elevation-1 hover:shadow-elevation-2',
    danger: 'bg-gradient-to-r from-error to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-error shadow-elevation-1 hover:shadow-elevation-2',
    warning: 'bg-gradient-to-r from-warning to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 focus:ring-warning shadow-elevation-1 hover:shadow-elevation-2',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-primary-500',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus:ring-primary-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
    xl: 'px-8 py-4 text-lg gap-3'
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
        ${className}
      `}
      onClick={onClick}
      disabled={isDisabled}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {loading && (
        <ApperIcon name="Loader2" className="animate-spin" size={size === 'sm' ? 14 : 16} />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <ApperIcon name={icon} size={size === 'sm' ? 14 : 16} />
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <ApperIcon name={icon} size={size === 'sm' ? 14 : 16} />
      )}
    </motion.button>
  );
};

export default Button;