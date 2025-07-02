import React from 'react';
import ApperIcon from '@/components/ApperIcon';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  icon,
  className = '' 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    error: 'bg-error/10 text-error border border-error/20',
    info: 'bg-info/10 text-info border border-info/20',
    pending: 'bg-amber-100 text-amber-800 border border-amber-200',
    approved: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    rejected: 'bg-red-100 text-red-800 border border-red-200',
    'not-submitted': 'bg-gray-100 text-gray-600 border border-gray-200'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2'
  };

  return (
    <span className={`
      ${baseClasses}
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}>
      {icon && <ApperIcon name={icon} size={size === 'sm' ? 12 : 14} />}
      {children}
    </span>
  );
};

export default Badge;