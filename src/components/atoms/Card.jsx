import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = true,
  padding = 'lg',
  shadow = 'elevation-1',
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-xl border border-gray-100 transition-all duration-200 ease-out';
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const shadows = {
    none: '',
    'elevation-1': 'shadow-elevation-1',
    'elevation-2': 'shadow-elevation-2',
    'elevation-3': 'shadow-elevation-3',
    premium: 'shadow-premium'
  };

  const hoverClasses = hover ? 'hover:scale-[1.01] hover:shadow-elevation-2 cursor-pointer' : '';

  return (
    <motion.div
      className={`
        ${baseClasses}
        ${paddings[padding]}
        ${shadows[shadow]}
        ${hoverClasses}
        ${className}
      `}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;