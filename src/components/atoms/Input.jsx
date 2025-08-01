import React, { forwardRef } from "react";
import ApperIcon from "@/components/ApperIcon";

const Input = forwardRef(({ 
  label,
  error,
  helpText,
  icon,
  iconPosition = 'left',
  className = '',
  containerClassName = '',
  required = false,
  type = 'text',
  ...props 
}, ref) => {
  const baseClasses = 'block w-full rounded-lg border-gray-300 shadow-sm transition-all duration-200 ease-out focus:border-primary-500 focus:ring-primary-500 sm:text-sm';
  const errorClasses = error ? 'border-error focus:border-error focus:ring-error' : '';
  const iconClasses = icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : '';

  return (
    <div className={`form-field ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className={`absolute inset-y-0 ${iconPosition === 'left' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center pointer-events-none`}>
            <ApperIcon 
              name={icon} 
              className={`h-5 w-5 ${error ? 'text-error' : 'text-gray-400'}`} 
            />
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={`
            ${baseClasses}
            ${errorClasses}
            ${iconClasses}
            ${className}
          `}
{...props}
        />
      </div>
      
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-error flex items-center gap-1">
          <ApperIcon name="AlertCircle" className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;