import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import ApperIcon from '@/components/ApperIcon';
import { kycService } from '@/services/api/kycService';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

const Reports = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('this-month');
  const [reportType, setReportType] = useState('overview');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const submissions = await kycService.getAll();
      setData(submissions);
    } catch (err) {
      setError('Failed to load report data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getDateRangeData = () => {
    const now = new Date();
    let startDate, endDate;

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'this-week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      case 'this-month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'last-30-days':
        startDate = subDays(now, 30);
        endDate = now;
        break;
      default:
        return data;
    }

    return data.filter(submission => {
      const submissionDate = new Date(submission.submittedAt);
      return submissionDate >= startDate && submissionDate <= endDate;
    });
  };

  const generateStats = (filteredData) => {
    const stats = {
      total: filteredData.length,
      pending: filteredData.filter(s => s.status === 'pending').length,
      approved: filteredData.filter(s => s.status === 'approved').length,
      rejected: filteredData.filter(s => s.status === 'rejected').length,
      processingTime: 0,
      approvalRate: 0
    };

    const processedSubmissions = filteredData.filter(s => s.reviewedAt);
    if (processedSubmissions.length > 0) {
      const totalProcessingTime = processedSubmissions.reduce((acc, submission) => {
        const submitted = new Date(submission.submittedAt);
        const reviewed = new Date(submission.reviewedAt);
        return acc + (reviewed - submitted);
      }, 0);
      
      stats.processingTime = Math.round(totalProcessingTime / processedSubmissions.length / (1000 * 60 * 60 * 24)); // days
      stats.approvalRate = Math.round((stats.approved / (stats.approved + stats.rejected)) * 100) || 0;
    }

    return stats;
  };

  const generateBusinessTypeBreakdown = (filteredData) => {
    const breakdown = {};
    filteredData.forEach(submission => {
      const type = submission.businessDetails?.businessType || 'Unknown';
      breakdown[type] = (breakdown[type] || 0) + 1;
    });
    return breakdown;
  };

  const generateTelecomUsageReport = (filteredData) => {
    const usageStats = {};
    filteredData.forEach(submission => {
      const uses = submission.telecomUsage?.intendedUse || [];
      uses.forEach(use => {
        usageStats[use] = (usageStats[use] || 0) + 1;
      });
    });
    return usageStats;
  };

  const exportReport = () => {
    const filteredData = getDateRangeData();
    const stats = generateStats(filteredData);
    
    // Create CSV content
    let csvContent = "KYC Report\n\n";
    csvContent += `Report Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n`;
    csvContent += `Date Range: ${dateRange}\n\n`;
    
    csvContent += "Summary Statistics:\n";
    csvContent += `Total Submissions,${stats.total}\n`;
    csvContent += `Pending,${stats.pending}\n`;
    csvContent += `Approved,${stats.approved}\n`;
    csvContent += `Rejected,${stats.rejected}\n`;
    csvContent += `Approval Rate,${stats.approvalRate}%\n`;
    csvContent += `Avg Processing Time,${stats.processingTime} days\n\n`;
    
    csvContent += "Detailed Submissions:\n";
    csvContent += "Customer Name,Company,Status,Submitted Date,Reviewed Date\n";
    
    filteredData.forEach(submission => {
      csvContent += `"${submission.personalDetails?.fullName || 'N/A'}",`;
      csvContent += `"${submission.businessDetails?.companyName || 'N/A'}",`;
      csvContent += `${submission.status},`;
      csvContent += `${submission.submittedAt ? format(new Date(submission.submittedAt), 'yyyy-MM-dd') : 'N/A'},`;
      csvContent += `${submission.reviewedAt ? format(new Date(submission.reviewedAt), 'yyyy-MM-dd') : 'N/A'}\n`;
    });

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `kyc-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const filteredData = getDateRangeData();
  const stats = generateStats(filteredData);
  const businessBreakdown = generateBusinessTypeBreakdown(filteredData);
  const telecomUsage = generateTelecomUsageReport(filteredData);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            KYC Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights and statistics for KYC submissions
          </p>
        </div>
        
        <Button variant="primary" icon="Download" size="lg" onClick={exportReport}>
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="today">Today</option>
                <option value="this-week">This Week</option>
                <option value="this-month">This Month</option>
                <option value="last-30-days">Last 30 Days</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="overview">Overview</option>
                <option value="business-types">Business Types</option>
                <option value="telecom-usage">Telecom Usage</option>
              </select>
            </div>
          </div>
          
          <Badge variant="info" size="lg">
            {filteredData.length} Submissions
          </Badge>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="text-center">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl w-fit mx-auto mb-4">
              <ApperIcon name="Users" className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Submissions</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-500 mt-1">Selected period</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center">
            <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl w-fit mx-auto mb-4">
              <ApperIcon name="CheckCircle" className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Approval Rate</h3>
            <p className="text-3xl font-bold text-emerald-600">{stats.approvalRate}%</p>
            <p className="text-sm text-gray-500 mt-1">Success rate</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="text-center">
            <div className="p-4 bg-gradient-to-br from-amber-100 to-orange-200 rounded-xl w-fit mx-auto mb-4">
              <ApperIcon name="Clock" className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg Processing</h3>
            <p className="text-3xl font-bold text-amber-600">{stats.processingTime}</p>
            <p className="text-sm text-gray-500 mt-1">Days</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="text-center">
            <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl w-fit mx-auto mb-4">
              <ApperIcon name="AlertCircle" className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Review</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.pending}</p>
            <p className="text-sm text-gray-500 mt-1">Awaiting action</p>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Reports */}
      {reportType === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Distribution */}
          <Card>
            <div className="flex items-center space-x-3 mb-6">
              <ApperIcon name="PieChart" className="h-6 w-6 text-primary-600" />
              <h3 className="text-xl font-semibold text-gray-900">Status Distribution</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-success rounded-full"></div>
                  <span className="font-medium text-gray-900">Approved</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-success">{stats.approved}</span>
                  <p className="text-sm text-gray-500">{stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-warning rounded-full"></div>
                  <span className="font-medium text-gray-900">Pending</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-warning">{stats.pending}</span>
                  <p className="text-sm text-gray-500">{stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-error rounded-full"></div>
                  <span className="font-medium text-gray-900">Rejected</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-error">{stats.rejected}</span>
                  <p className="text-sm text-gray-500">{stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Submissions */}
          <Card>
            <div className="flex items-center space-x-3 mb-6">
              <ApperIcon name="Activity" className="h-6 w-6 text-primary-600" />
              <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
            </div>
            
            <div className="space-y-4">
              {filteredData.slice(0, 5).map((submission, index) => (
                <div key={submission.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <ApperIcon name="User" className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {submission.personalDetails?.fullName || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {submission.submittedAt && format(new Date(submission.submittedAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={submission.status === 'approved' ? 'approved' : submission.status === 'rejected' ? 'rejected' : 'pending'}
                    size="sm"
                  >
                    {submission.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {reportType === 'business-types' && (
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <ApperIcon name="Building" className="h-6 w-6 text-primary-600" />
            <h3 className="text-xl font-semibold text-gray-900">Business Type Breakdown</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(businessBreakdown).map(([type, count]) => (
              <div key={type} className="text-center p-6 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                </h4>
                <p className="text-3xl font-bold text-primary-600">{count}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}% of total
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {reportType === 'telecom-usage' && (
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <ApperIcon name="Phone" className="h-6 w-6 text-primary-600" />
            <h3 className="text-xl font-semibold text-gray-900">Telecom Usage Statistics</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(telecomUsage).map(([usage, count]) => (
              <div key={usage} className="text-center p-6 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{usage}</h4>
                <p className="text-3xl font-bold text-accent-600">{count}</p>
                <p className="text-sm text-gray-500 mt-1">Selections</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Reports;