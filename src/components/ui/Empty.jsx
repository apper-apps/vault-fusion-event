import React from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const Empty = ({ 
  title = "No data found", 
  message = "There's nothing to display at the moment.",
  icon = "Inbox",
  actionText,
  onAction,
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card className="text-center py-16 relative overflow-hidden">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
          className="mx-auto mb-6 p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-fit"
        >
          <ApperIcon name={icon} className="h-16 w-16 text-gray-400" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 relative z-10"
        >
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">{message}</p>
          
          {actionText && onAction && (
            <div className="pt-6">
              <Button 
                variant="primary" 
                onClick={onAction}
                icon="Plus"
                size="lg"
              >
                {actionText}
              </Button>
            </div>
          )}
        </motion.div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-8 right-8 w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full opacity-30"></div>
          <div className="absolute bottom-8 left-8 w-24 h-24 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full opacity-40"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full opacity-50"></div>
        </div>
      </Card>
    </motion.div>
  );
};

export default Empty;