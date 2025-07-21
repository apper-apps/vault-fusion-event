import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import StatusCard from '@/components/molecules/StatusCard';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import ApperIcon from '@/components/ApperIcon';
import { kycService } from '@/services/api/kycService';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [kycData, setKycData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadKYCData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock current user ID - in real app this would come from auth context
      const currentUserId = 'user123';
      const submissions = await kycService.getAll();
      const userSubmission = submissions.find(sub => sub.userId === currentUserId);
      
      setKycData(userSubmission);
    } catch (err) {
      setError('Failed to load KYC data. Please try again.');
      console.error('Error loading KYC data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKYCData();
  }, []);

  const handleStartKYC = () => {
    navigate('/kyc-submit');
  };

  const handleViewStatus = () => {
    if (kycData) {
      toast.info('KYC status details loaded');
    }
  };

  const getStatusInfo = () => {
    if (!kycData) {
      return {
        status: 'not-submitted',
        lastUpdated: null,
        nextSteps: [
          'Complete personal details form',
          'Upload required documents',
          'Submit for verification'
        ]
      };
    }

    const nextSteps = {
      pending: [
        'Your documents are being reviewed',
        'You will receive updates via email',
        'Review typically takes 2-3 business days'
      ],
      approved: [
        'You can now access all CallerDesk services',
        'Check your email for activation details',
        'Contact support for any assistance'
      ],
      rejected: [
        'Review the rejection reasons',
        'Update required documents',
        'Resubmit your application'
      ]
    };

    return {
      status: kycData.status,
      lastUpdated: kycData.submittedAt,
      nextSteps: nextSteps[kycData.status] || []
    };
  };

  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadKYCData} />;

  const statusInfo = getStatusInfo();

return (
    <div className="space-y-8 pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="pointer-events-auto">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Welcome to KYC Portal
          </h1>
          <p className="text-gray-600 mt-2">
            Complete your verification to start using CallerDesk services
          </p>
        </div>
        
        <Button variant="secondary" icon="HelpCircle" size="lg" className="pointer-events-auto min-h-[44px] min-w-[44px]">
          Help & Support
        </Button>
      </div>

{/* KYC Status Card */}
      <div className="pointer-events-auto">
        <StatusCard
          status={statusInfo.status}
          onAction={statusInfo.status === 'not-submitted' ? handleStartKYC : handleViewStatus}
          lastUpdated={statusInfo.lastUpdated}
          nextSteps={statusInfo.nextSteps}
        />
      </div>
{/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="pointer-events-auto"
        >
          <Card className="text-center pointer-events-auto cursor-default hover:shadow-elevation-2 transition-shadow">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl w-fit mx-auto mb-4">
              <ApperIcon name="FileCheck" className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Documents</h3>
            <p className="text-2xl font-bold text-blue-600">
              {kycData?.documents?.length || 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">Files uploaded</p>
          </Card>
        </motion.div>
<motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pointer-events-auto"
        >
          <Card className="text-center pointer-events-auto cursor-default hover:shadow-elevation-2 transition-shadow">
            <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl w-fit mx-auto mb-4">
              <ApperIcon name="Clock" className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Time</h3>
            <p className="text-2xl font-bold text-emerald-600">2-3</p>
            <p className="text-sm text-gray-500 mt-1">Business days</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pointer-events-auto"
        >
          <Card className="text-center pointer-events-auto cursor-default hover:shadow-elevation-2 transition-shadow">
            <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl w-fit mx-auto mb-4">
              <ApperIcon name="Shield" className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Security</h3>
            <p className="text-2xl font-bold text-purple-600">100%</p>
            <p className="text-sm text-gray-500 mt-1">Secure & encrypted</p>
          </Card>
        </motion.div>
      </div>

{/* Requirements Overview */}
      <Card className="pointer-events-auto">
        <div className="flex items-center space-x-3 mb-6 pointer-events-auto">
          <ApperIcon name="ListChecks" className="h-6 w-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-gray-900">Required Documents</h3>
        </div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 pointer-events-auto">
          <div className="space-y-4 pointer-events-auto">
            <h4 className="font-medium text-gray-800">Personal Documents</h4>
            <div className="space-y-3">
              {[
                { name: 'PAN Card', required: true, uploaded: kycData?.personalDetails?.panDocument?.length > 0 },
                { name: 'Aadhaar Card', required: true, uploaded: false },
                { name: 'Recent Selfie', required: false, uploaded: kycData?.selfieVerification?.selfie?.length > 0 }
              ].map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg pointer-events-auto cursor-default hover:bg-gray-100 transition-colors min-h-[48px]">
                  <div className="flex items-center space-x-3">
                    <ApperIcon 
                      name={doc.uploaded ? 'CheckCircle' : 'Circle'} 
                      className={`h-5 w-5 ${doc.uploaded ? 'text-success' : 'text-gray-400'}`} 
                    />
                    <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                    {doc.required && <Badge variant="error" size="sm">Required</Badge>}
                  </div>
                  {doc.uploaded && <Badge variant="success" size="sm" icon="Check">Uploaded</Badge>}
                </div>
              ))}
            </div>
          </div>

<div className="space-y-4 pointer-events-auto">
            <h4 className="font-medium text-gray-800">Business Documents</h4>
            <div className="space-y-3">
              {[
                { name: 'GST Certificate', required: true, uploaded: kycData?.businessDetails?.gstDocument?.length > 0 },
                { name: 'Company PAN', required: true, uploaded: kycData?.businessDetails?.companyPanDocument?.length > 0 },
                { name: 'Address Proof', required: true, uploaded: kycData?.businessDetails?.addressProof?.length > 0 },
                { name: 'Authorization Letter', required: true, uploaded: kycData?.authorizedSignatory?.authorizationLetter?.length > 0 }
              ].map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg pointer-events-auto cursor-default hover:bg-gray-100 transition-colors min-h-[48px]">
                  <div className="flex items-center space-x-3">
                    <ApperIcon 
                      name={doc.uploaded ? 'CheckCircle' : 'Circle'} 
                      className={`h-5 w-5 ${doc.uploaded ? 'text-success' : 'text-gray-400'}`} 
                    />
                    <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                    {doc.required && <Badge variant="error" size="sm">Required</Badge>}
                  </div>
                  {doc.uploaded && <Badge variant="success" size="sm" icon="Check">Uploaded</Badge>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
{kycData && (
        <Card className="pointer-events-auto">
          <div className="flex items-center space-x-3 mb-6 pointer-events-auto">
            <ApperIcon name="Activity" className="h-6 w-6 text-primary-600" />
            <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
          </div>

          <div className="space-y-4 pointer-events-auto">
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg pointer-events-auto cursor-default hover:bg-blue-100 transition-colors min-h-[56px]">
              <div className="p-2 bg-blue-100 rounded-full">
                <ApperIcon name="Upload" className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">KYC Documents Submitted</p>
                <p className="text-xs text-gray-500">
                  {kycData.submittedAt && new Date(kycData.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="pending" size="sm">Pending Review</Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CustomerDashboard;