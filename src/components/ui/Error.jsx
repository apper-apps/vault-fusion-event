import React from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const Error = ({ 
  title = "Something went wrong", 
  message = "We encountered an error while loading this content. Please try again.",
  onRetry,
  showRetry = true,
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card className="text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto mb-6 p-4 bg-gradient-to-br from-red-100 to-rose-100 rounded-full w-fit"
        >
          <ApperIcon name="AlertTriangle" className="h-12 w-12 text-error" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">{message}</p>
          
          {showRetry && onRetry && (
            <div className="pt-4">
              <Button 
                variant="primary" 
                onClick={onRetry}
                icon="RefreshCw"
                size="lg"
              >
                Try Again
              </Button>
            </div>
          )}
        </motion.div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-xl">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-red-100 to-rose-200 rounded-full opacity-50"></div>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-red-50 to-rose-100 rounded-full opacity-60"></div>
        </div>
      </Card>
    </motion.div>
  );
};

export default Error;