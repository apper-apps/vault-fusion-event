import React from 'react';
import ApperIcon from '@/components/ApperIcon';

const StepIndicator = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isClickable = index <= currentStep;

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div 
              className={`
                flex items-center cursor-pointer group
                ${isClickable ? 'hover:scale-105' : 'cursor-not-allowed opacity-50'}
              `}
              onClick={() => isClickable && onStepClick && onStepClick(index)}
            >
              <div className={`
                step-indicator
                ${isActive ? 'active' : isCompleted ? 'completed' : 'inactive'}
                group-hover:scale-110 transition-transform
              `}>
                {isCompleted ? (
                  <ApperIcon name="Check" className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              <div className="ml-3 hidden sm:block">
                <p className={`
                  text-sm font-medium
                  ${isActive ? 'text-primary-600' : isCompleted ? 'text-success' : 'text-gray-500'}
                `}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400">{step.description}</p>
              </div>
            </div>

            {index < steps.length - 1 && (
              <div className={`
                flex-1 h-0.5 mx-4 transition-colors duration-300
                ${index < currentStep ? 'bg-success' : 'bg-gray-200'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;