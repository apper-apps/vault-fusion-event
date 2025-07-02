import React from 'react';
import { motion } from 'framer-motion';

const Loading = ({ type = 'default', className = '' }) => {
  if (type === 'table') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Header skeleton */}
        <div className="bg-white rounded-xl p-6 shadow-elevation-1">
          <div className="flex items-center justify-between mb-4">
            <div className="skeleton h-6 w-48 rounded"></div>
            <div className="skeleton h-10 w-32 rounded-lg"></div>
          </div>
        </div>
        
        {/* Table skeleton */}
        <div className="bg-white rounded-xl shadow-elevation-1 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="skeleton h-10 w-80 rounded-lg"></div>
              <div className="flex space-x-3">
                <div className="skeleton h-10 w-24 rounded-lg"></div>
                <div className="skeleton h-10 w-24 rounded-lg"></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-0">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="px-6 py-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="skeleton h-10 w-10 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="skeleton h-4 w-32 rounded"></div>
                      <div className="skeleton h-3 w-24 rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="skeleton h-4 w-20 rounded"></div>
                    <div className="skeleton h-6 w-16 rounded-full"></div>
                    <div className="flex space-x-2">
                      <div className="skeleton h-8 w-12 rounded"></div>
                      <div className="skeleton h-8 w-12 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-elevation-1 space-y-4">
            <div className="flex items-center justify-between">
              <div className="skeleton h-8 w-8 rounded-lg"></div>
              <div className="skeleton h-6 w-16 rounded-full"></div>
            </div>
            <div className="space-y-3">
              <div className="skeleton h-6 w-3/4 rounded"></div>
              <div className="skeleton h-4 w-full rounded"></div>
              <div className="skeleton h-4 w-2/3 rounded"></div>
            </div>
            <div className="skeleton h-10 w-full rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className={`bg-white rounded-xl p-8 shadow-elevation-1 space-y-6 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="skeleton h-6 w-6 rounded"></div>
          <div className="skeleton h-6 w-48 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton h-5 w-24 rounded"></div>
              <div className="skeleton h-10 w-full rounded-lg"></div>
            </div>
          ))}
        </div>
        
        <div className="space-y-4">
          <div className="skeleton h-5 w-32 rounded"></div>
          <div className="skeleton h-32 w-full rounded-lg"></div>
        </div>
        
        <div className="flex justify-between">
          <div className="skeleton h-10 w-24 rounded-lg"></div>
          <div className="skeleton h-10 w-24 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Default spinner loading
  return (
    <div className={`flex items-center justify-center p-12 ${className}`}>
      <motion.div
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
        <motion.div
          className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-600 rounded-full border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        ></motion.div>
        
        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-gray-600">Loading...</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Loading;