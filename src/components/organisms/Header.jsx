import React from 'react';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';

const Header = ({ onMenuClick, userRole }) => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              icon="Menu"
              onClick={onMenuClick}
              className="lg:hidden"
            />
            
            <div className="hidden sm:block">
              <h2 className="text-lg font-semibold text-gray-900">
                {userRole === 'admin' ? 'KYC Management Portal' : 'KYC Submission Portal'}
              </h2>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" icon="Bell" />
              <Badge 
                variant="error" 
                size="sm" 
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center p-0 text-xs"
              >
                3
              </Badge>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {userRole === 'admin' ? 'Admin Panel' : 'My Account'}
                </p>
                <p className="text-xs text-gray-500">
                  {userRole === 'admin' ? 'System Administrator' : 'Business Customer'}
                </p>
              </div>
              
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-elevation-1">
                <ApperIcon name="User" className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;