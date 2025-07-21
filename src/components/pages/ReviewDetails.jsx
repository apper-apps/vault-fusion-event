import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Input from '@/components/atoms/Input';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import ApperIcon from '@/components/ApperIcon';
import { kycService } from '@/services/api/kycService';

const ReviewDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await kycService.getById(parseInt(id));
      setSubmission(data);
    } catch (err) {
      setError('Failed to load submission details. Please try again.');
      console.error('Error loading submission:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadSubmission();
    }
  }, [id]);

  const handleApprove = async () => {
    try {
      const updatedSubmission = {
        ...submission,
        status: 'approved',
        reviewedBy: 'admin123',
        reviewedAt: new Date().toISOString(),
        reviewComment
      };

      await kycService.update(parseInt(id), updatedSubmission);
      toast.success('KYC submission approved successfully!');
      navigate('/admin');
    } catch (error) {
      console.error('Error approving submission:', error);
      toast.error('Failed to approve submission. Please try again.');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason.');
      return;
    }

    try {
      const updatedSubmission = {
        ...submission,
        status: 'rejected',
        reviewedBy: 'admin123',
        reviewedAt: new Date().toISOString(),
        rejectionReason
      };

      await kycService.update(parseInt(id), updatedSubmission);
      toast.error('KYC submission rejected.');
      navigate('/admin');
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast.error('Failed to reject submission. Please try again.');
    }
  };

  const downloadDocument = (document) => {
    toast.info(`Downloading ${document.name}`);
    // In real app, this would trigger actual file download
  };

  const downloadAllDocuments = () => {
    toast.info('Downloading all documents as ZIP file');
    // In real app, this would create and download a ZIP file
  };

  if (loading) return <Loading type="form" />;
  if (error) return <Error message={error} onRetry={loadSubmission} />;
  if (!submission) return <Error title="Submission not found" message="The requested KYC submission could not be found." />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" icon="ArrowLeft" onClick={() => navigate('/admin')}>
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {submission.personalDetails?.fullName || 'Unknown Customer'}
            </h1>
            <p className="text-gray-600">
              KYC Review • Submitted {submission.submittedAt && new Date(submission.submittedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge 
            variant={submission.status === 'approved' ? 'approved' : submission.status === 'rejected' ? 'rejected' : 'pending'}
            size="lg"
          >
            {submission.status.toUpperCase()}
          </Badge>
          <Button variant="secondary" icon="Download" onClick={downloadAllDocuments}>
            Download All
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      {submission.status === 'pending' && (
        <Card padding="md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Review this KYC submission and take appropriate action:</p>
            <div className="flex space-x-3">
              <Button 
                variant="success" 
                icon="Check" 
                onClick={() => setShowApprovalModal(true)}
              >
                Approve
              </Button>
              <Button 
                variant="danger" 
                icon="X" 
                onClick={() => setShowRejectionModal(true)}
              >
                Reject
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Personal Details */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <ApperIcon name="User" className="h-6 w-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-gray-900">Personal Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <p className="text-gray-900">{submission.personalDetails?.fullName || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <p className="text-gray-900">{submission.personalDetails?.mobile || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <p className="text-gray-900">{submission.personalDetails?.email || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
            <p className="text-gray-900">{submission.personalDetails?.pan || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <p className="text-gray-900">
              {submission.personalDetails?.dateOfBirth ? 
                new Date(submission.personalDetails.dateOfBirth).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
            <p className="text-gray-900">{submission.personalDetails?.aadhaar ? '****-****-' + submission.personalDetails.aadhaar.slice(-4) : 'N/A'}</p>
          </div>
        </div>

{/* Personal Documents */}
        {submission.personalDetails?.panDocument?.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-800 mb-3">Personal Documents</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {submission.personalDetails.panDocument.map((doc) => (
                <div key={doc.Id || Math.random()} className="document-preview border rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <ApperIcon name="FileText" className="h-8 w-8 text-gray-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.name || 'Untitled Document'}</p>
                      <p className="text-xs text-gray-500">PAN Card</p>
                    </div>
                    <Button variant="ghost" size="sm" icon="Download" onClick={() => downloadDocument(doc)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Business Details */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <ApperIcon name="Building" className="h-6 w-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-gray-900">Business Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <p className="text-gray-900">{submission.businessDetails?.companyName || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
            <p className="text-gray-900">{submission.businessDetails?.businessType || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
            <p className="text-gray-900">{submission.businessDetails?.gstin || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CIN</label>
            <p className="text-gray-900">{submission.businessDetails?.cin || 'N/A'}</p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Registered Address</label>
          <p className="text-gray-900">{submission.businessDetails?.address || 'N/A'}</p>
        </div>

{/* Business Documents */}
        {((submission.businessDetails?.gstDocument?.length > 0) || 
          (submission.businessDetails?.companyPanDocument?.length > 0) || 
          (submission.businessDetails?.addressProof?.length > 0)) && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-800 mb-3">Business Documents</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { docs: submission.businessDetails?.gstDocument || [], label: 'GST Certificate' },
                { docs: submission.businessDetails?.companyPanDocument || [], label: 'Company PAN' },
                { docs: submission.businessDetails?.addressProof || [], label: 'Address Proof' }
              ].map((docGroup, groupIndex) => (
                docGroup.docs.map((doc, docIndex) => (
                  <div key={doc.Id || `${groupIndex}-${docIndex}`} className="document-preview border rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <ApperIcon name="FileText" className="h-8 w-8 text-gray-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name || 'Untitled Document'}</p>
                        <p className="text-xs text-gray-500">{docGroup.label}</p>
                      </div>
                      <Button variant="ghost" size="sm" icon="Download" onClick={() => downloadDocument(doc)} />
                    </div>
                  </div>
                ))
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Telecom Usage */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <ApperIcon name="Phone" className="h-6 w-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-gray-900">Telecom Usage Declaration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Intended Use</label>
            <div className="space-y-2">
              {submission.telecomUsage?.intendedUse?.map((use, index) => (
                <Badge key={index} variant="primary" size="sm">{use}</Badge>
              )) || <span className="text-gray-500">N/A</span>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Traffic Type</label>
            <p className="text-gray-900">{submission.telecomUsage?.trafficType || 'N/A'}</p>
          </div>
        </div>

{/* Compliance Documents */}
        {submission.telecomUsage?.complianceForm?.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-800 mb-3">Compliance Documents</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {submission.telecomUsage.complianceForm.map((doc, index) => (
                <div key={doc.Id || `compliance-${index}`} className="document-preview border rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <ApperIcon name="FileText" className="h-8 w-8 text-gray-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.name || 'Untitled Document'}</p>
                      <p className="text-xs text-gray-500">Compliance Form</p>
                    </div>
                    <Button variant="ghost" size="sm" icon="Download" onClick={() => downloadDocument(doc)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
{/* Authorized Signatory */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <ApperIcon name="UserCheck" className="h-6 w-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-gray-900">Authorized Signatory</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <p className="text-gray-900">{submission.authorizedSignatory?.name || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
            <p className="text-gray-900">{submission.authorizedSignatory?.mobile || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{submission.authorizedSignatory?.email || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
            <p className="text-gray-900">{submission.authorizedSignatory?.designation || 'N/A'}</p>
          </div>
        </div>

        {/* Authorization Documents */}
        {submission.authorizedSignatory?.authorizationLetter?.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-800 mb-3">Authorization Documents</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {submission.authorizedSignatory.authorizationLetter.map((doc, index) => (
                <div key={doc.Id || `auth-${index}`} className="document-preview border rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <ApperIcon name="FileText" className="h-8 w-8 text-gray-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.name || 'Untitled Document'}</p>
                      <p className="text-xs text-gray-500">Authorization Letter</p>
                    </div>
                    <Button variant="ghost" size="sm" icon="Download" onClick={() => downloadDocument(doc)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selfie Verification */}
        {submission.selfieVerification?.selfie?.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-800 mb-3">Selfie Verification</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {submission.selfieVerification.selfie.map((doc, index) => (
                <div key={doc.Id || `selfie-${index}`} className="document-preview border rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <ApperIcon name="Camera" className="h-8 w-8 text-gray-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.name || 'Untitled Document'}</p>
                      <p className="text-xs text-gray-500">Verification Selfie</p>
                    </div>
                    <Button variant="ghost" size="sm" icon="Download" onClick={() => downloadDocument(doc)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
</Card>

      {/* Customer Declaration */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <ApperIcon name="ShieldCheck" className="h-6 w-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-gray-900">Customer Declaration & Consent</h3>
        </div>

        <div className="space-y-6">
          {/* Declaration Statements */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-800 mb-4">Declaration Statements</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <ApperIcon name="CheckCircle" className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  I hereby declare that the information provided by me is true, complete, and accurate to the best of my knowledge and belief.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <ApperIcon name="CheckCircle" className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  I understand that any false information or documentation provided may result in the rejection of my application and potential legal consequences.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <ApperIcon name="CheckCircle" className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  I consent to the verification of the information provided through appropriate agencies and databases.
                </p>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
              <div className="flex items-center space-x-2">
                <ApperIcon name="CheckSquare" className="h-5 w-5 text-success" />
                <span className="text-sm text-gray-900">Accepted and Agreed</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {submission.submittedAt && new Date(submission.submittedAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Privacy Policy</label>
              <div className="flex items-center space-x-2">
                <ApperIcon name="CheckSquare" className="h-5 w-5 text-success" />
                <span className="text-sm text-gray-900">Accepted and Agreed</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {submission.submittedAt && new Date(submission.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* AML Compliance */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center space-x-2">
              <ApperIcon name="Shield" className="h-5 w-5 text-blue-600" />
              <span>Anti-Money Laundering (AML) Compliance</span>
            </h4>
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <ApperIcon name="CheckCircle" className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  I acknowledge that this service is subject to Anti-Money Laundering regulations.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <ApperIcon name="CheckCircle" className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  I understand that my information may be shared with relevant authorities for compliance purposes.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <ApperIcon name="CheckCircle" className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  I confirm that the source of funds and business activities are legitimate.
                </p>
              </div>
            </div>
          </div>

          {/* Submission Confirmation */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-md font-medium text-gray-800">Submission Confirmation</h4>
                <p className="text-sm text-gray-600 mt-1">
                  This KYC application was submitted on {submission.submittedAt && new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="primary" size="sm">Digitally Signed</Badge>
                <p className="text-xs text-gray-500 mt-1">
                  Customer ID: {submission.personalDetails?.mobile || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Digital Consent */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <ApperIcon name="Fingerprint" className="h-6 w-6 text-green-600" />
              <div>
                <h4 className="text-sm font-medium text-green-800">Digital Consent Recorded</h4>
                <p className="text-xs text-green-600">
                  Customer consent was digitally captured and securely stored in compliance with data protection regulations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve KYC Submission</h3>
            <div className="space-y-4">
              <Input
                label="Review Comment (Optional)"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Add any notes about this approval..."
              />
              <div className="flex space-x-3">
                <Button 
                  variant="success" 
                  onClick={handleApprove} 
                  className="flex-1"
                >
                  Confirm Approval
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject KYC Submission</h3>
            <div className="space-y-4">
              <Input
                label="Rejection Reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please specify the reason for rejection..."
                required
              />
              <div className="flex space-x-3">
                <Button 
                  variant="danger" 
                  onClick={handleReject} 
                  className="flex-1"
                >
                  Confirm Rejection
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowRejectionModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ReviewDetails;