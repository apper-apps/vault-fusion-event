import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import KYCTable from '@/components/organisms/KYCTable';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import { kycService } from '@/services/api/kycService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await kycService.getAll();
      setSubmissions(data);
      
      // Calculate stats
      const newStats = data.reduce((acc, submission) => {
        acc.total++;
        acc[submission.status] = (acc[submission.status] || 0) + 1;
        return acc;
      }, { total: 0, pending: 0, approved: 0, rejected: 0 });
      
      setStats(newStats);
    } catch (err) {
      setError('Failed to load KYC submissions. Please try again.');
      console.error('Error loading submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleViewDetails = (submissionId) => {
    navigate(`/admin/review/${submissionId}`);
  };

  const handleApprove = async (submissionId) => {
    try {
      const submission = submissions.find(s => s.Id === submissionId);
      if (!submission) return;

      const updatedSubmission = {
        ...submission,
        status: 'approved',
        reviewedBy: 'admin123',
        reviewedAt: new Date().toISOString()
      };

      await kycService.update(submissionId, updatedSubmission);
      
      setSubmissions(prev => 
        prev.map(s => s.Id === submissionId ? updatedSubmission : s)
      );
      
      toast.success('KYC submission approved successfully!');
      loadSubmissions(); // Refresh stats
    } catch (error) {
      console.error('Error approving submission:', error);
      toast.error('Failed to approve submission. Please try again.');
    }
  };

  const handleReject = async (submissionId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const submission = submissions.find(s => s.Id === submissionId);
      if (!submission) return;

      const updatedSubmission = {
        ...submission,
        status: 'rejected',
        reviewedBy: 'admin123',
        reviewedAt: new Date().toISOString(),
        rejectionReason: reason
      };

      await kycService.update(submissionId, updatedSubmission);
      
      setSubmissions(prev => 
        prev.map(s => s.Id === submissionId ? updatedSubmission : s)
      );
      
      toast.error('KYC submission rejected.');
      loadSubmissions(); // Refresh stats
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast.error('Failed to reject submission. Please try again.');
    }
  };

  const handleDownload = (submissionId) => {
    toast.info('Document download initiated for submission ' + submissionId);
    // In real app, this would trigger actual file download
  };

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={loadSubmissions} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and review KYC submissions from business customers
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="secondary" icon="Download" size="lg">
            Export Report
          </Button>
          <Button variant="primary" icon="Settings" size="lg">
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
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
            <p className="text-sm text-gray-500 mt-1">All time</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center">
            <div className="p-4 bg-gradient-to-br from-amber-100 to-orange-200 rounded-xl w-fit mx-auto mb-4">
              <ApperIcon name="Clock" className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Review</h3>
            <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-sm text-gray-500 mt-1">Awaiting action</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="text-center">
            <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl w-fit mx-auto mb-4">
              <ApperIcon name="CheckCircle" className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Approved</h3>
            <p className="text-3xl font-bold text-emerald-600">{stats.approved}</p>
            <p className="text-sm text-gray-500 mt-1">Verified customers</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="text-center">
            <div className="p-4 bg-gradient-to-br from-red-100 to-rose-200 rounded-xl w-fit mx-auto mb-4">
              <ApperIcon name="XCircle" className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Rejected</h3>
            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-sm text-gray-500 mt-1">Need resubmission</p>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <ApperIcon name="Activity" className="h-6 w-6 text-primary-600" />
            <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <Badge variant="info" size="md">{submissions.filter(s => s.status === 'pending').length} Pending</Badge>
        </div>

        <div className="space-y-4">
          {submissions.slice(0, 3).map((submission, index) => (
            <motion.div
              key={submission.Id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <ApperIcon name="User" className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {submission.personalDetails?.fullName || 'Unknown User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {submission.businessDetails?.companyName || 'No company'} • 
                    {submission.submittedAt && new Date(submission.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge 
                  variant={submission.status === 'approved' ? 'approved' : submission.status === 'rejected' ? 'rejected' : 'pending'}
                  size="sm"
                >
                  {submission.status.toUpperCase()}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="Eye"
                  onClick={() => handleViewDetails(submission.Id)}
                >
                  View
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* KYC Submissions Table */}
      {submissions.length > 0 ? (
        <KYCTable
          data={submissions}
          onViewDetails={handleViewDetails}
          onApprove={handleApprove}
          onReject={handleReject}
          onDownload={handleDownload}
        />
      ) : (
        <Empty
          title="No KYC Submissions"
          message="No customer submissions have been received yet."
          icon="Users"
          actionText="Refresh Data"
          onAction={loadSubmissions}
        />
      )}
    </div>
  );
};

export default AdminDashboard;