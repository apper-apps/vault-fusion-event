import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const Sidebar = ({ userRole = 'customer', onClose }) => {
const customerNavItems = [
    { path: '/dashboard', icon: 'LayoutDashboard', label: 'Dashboard' },
    { path: '/kyc-submit', icon: 'FileCheck', label: 'Submit KYC' },
    { path: '/self-kyc', icon: 'UserCheck', label: 'Self KYC' },
    { path: '/documents', icon: 'FolderOpen', label: 'My Documents' }
  ];

  const adminNavItems = [
    { path: '/admin', icon: 'LayoutDashboard', label: 'Admin Dashboard' },
    { path: '/admin/documents', icon: 'FolderOpen', label: 'Document Manager' },
    { path: '/admin/reports', icon: 'BarChart3', label: 'Reports' },
    { path: '/admin/settings', icon: 'Settings', label: 'Settings' }
  ];

  const navItems = userRole === 'admin' ? adminNavItems : customerNavItems;

  return (
    <div className="flex flex-col w-70 bg-white border-r border-gray-200 h-full shadow-elevation-1">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl shadow-elevation-1">
            <ApperIcon name="Shield" className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              KYC Vault
            </h1>
            <p className="text-xs text-gray-500">
              {userRole === 'admin' ? 'Admin Portal' : 'Customer Portal'}
            </p>
          </div>
        </div>
        
        {onClose && (
          <Button variant="ghost" size="sm" icon="X" onClick={onClose} className="lg:hidden" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-elevation-1'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
              onClick={onClose}
            >
              {({ isActive }) => (
                <>
                  <ApperIcon 
                    name={item.icon} 
                    className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} 
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="px-4 py-6 border-t border-gray-200">
        <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <ApperIcon name="User" className="h-5 w-5 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userRole === 'admin' ? 'Admin User' : 'Business User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {userRole === 'admin' ? 'admin@callerdesk.com' : 'user@company.com'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;