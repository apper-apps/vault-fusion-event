import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import SearchBar from '@/components/molecules/SearchBar';
import ApperIcon from '@/components/ApperIcon';
import { format } from 'date-fns';

const KYCTable = ({ data = [], onViewDetails, onApprove, onReject, onDownload }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and sort data
  const filteredData = data
    .filter(item => {
      const matchesSearch = 
        item.personalDetails?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.businessDetails?.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.personalDetails?.mobile?.includes(searchQuery) ||
        item.personalDetails?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'submittedAt' || sortField === 'reviewedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'approved': return 'approved';
      case 'rejected': return 'rejected';
      case 'pending': return 'pending';
      default: return 'not-submitted';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return 'CheckCircle';
      case 'rejected': return 'XCircle';
      case 'pending': return 'Clock';
      default: return 'FileX';
    }
  };

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header with filters */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <SearchBar
              placeholder="Search by name, company, mobile, or email..."
              onSearch={setSearchQuery}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <Button variant="secondary" icon="Download" size="sm">
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: 'personalDetails.fullName', label: 'Customer Name' },
                { key: 'personalDetails.mobile', label: 'Mobile' },
                { key: 'businessDetails.companyName', label: 'Company' },
                { key: 'submittedAt', label: 'Submitted' },
                { key: 'status', label: 'Status' },
                { key: 'actions', label: 'Actions' }
              ].map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${column.key !== 'actions' ? 'cursor-pointer hover:bg-gray-100' : ''}
                  `}
                  onClick={() => column.key !== 'actions' && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.key !== 'actions' && sortField === column.key && (
                      <ApperIcon 
                        name={sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                        className="h-4 w-4"
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((submission, index) => (
              <motion.tr
                key={submission.Id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-elevation-1">
                        <span className="text-sm font-medium text-white">
                          {submission.personalDetails?.fullName?.charAt(0) || 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {submission.personalDetails?.fullName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {submission.personalDetails?.email || 'N/A'}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {submission.personalDetails?.mobile || 'N/A'}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {submission.businessDetails?.companyName || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {submission.businessDetails?.businessType || 'N/A'}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {submission.submittedAt 
                    ? format(new Date(submission.submittedAt), 'MMM dd, yyyy')
                    : 'N/A'
                  }
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge 
                    variant={getStatusVariant(submission.status)} 
                    icon={getStatusIcon(submission.status)}
                  >
                    {submission.status?.toUpperCase() || 'UNKNOWN'}
                  </Badge>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Eye"
                    onClick={() => onViewDetails(submission.Id)}
                  >
                    View
                  </Button>
                  
                  {submission.status === 'pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="Check"
                        onClick={() => onApprove(submission.Id)}
                        className="text-success hover:text-success hover:bg-success/10"
                      >
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="X"
                        onClick={() => onReject(submission.Id)}
                        className="text-error hover:text-error hover:bg-error/10"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Download"
                    onClick={() => onDownload(submission.Id)}
                  >
                    Download
                  </Button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} results
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                icon="ChevronLeft"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                variant="ghost"
                size="sm"
                icon="ChevronRight"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default KYCTable;