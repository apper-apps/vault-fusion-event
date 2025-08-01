import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { kycService } from "@/services/api/kycService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const ReviewDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentAnalysis, setDocumentAnalysis] = useState({});
  const [verificationChecklist, setVerificationChecklist] = useState({});
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);

  // Load submission data
  const loadSubmission = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await kycService.getById(parseInt(id));
      
      if (!data) {
        throw new Error('Submission not found');
      }
      
      // Store submission data in state
      setSubmission(data);
      
      // Load document analysis
      if (data.documents && data.documents.length > 0) {
        const analysisPromises = data.documents.map(doc => 
          kycService.analyzeDocument(doc.Id).catch(err => {
            console.warn(`Failed to analyze document ${doc.Id}:`, err);
            return null;
          })
        );
        
        const analysisResults = await Promise.all(analysisPromises);
        const analysisMap = {};
        
        data.documents.forEach((doc, index) => {
          if (analysisResults[index]) {
            analysisMap[doc.Id] = analysisResults[index];
          }
        });
        
        setDocumentAnalysis(analysisMap);
      }
    } catch (error) {
      console.error('Error loading submission:', error);
      setError(error.message || 'Failed to load submission');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
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
// Enhanced document viewer with quality analysis
  const handleDocumentClick = async (document, index) => {
    setSelectedDocument(document);
    setCurrentDocumentIndex(index);
    setShowDocumentViewer(true);
    
    // Simulate document analysis
    try {
      const analysis = await kycService.analyzeDocument(document.Id);
      setDocumentAnalysis(prev => ({
        ...prev,
        [document.Id]: analysis
      }));
    } catch (error) {
      console.error('Document analysis failed:', error);
    }
  };

  const handleCloseDocumentViewer = () => {
    setShowDocumentViewer(false);
    setSelectedDocument(null);
  };

const navigateDocument = (direction) => {
    if (!submission?.documents) return;
    
    const newIndex = direction === 'next' 
      ? (currentDocumentIndex + 1) % submission.documents.length
      : (currentDocumentIndex - 1 + submission.documents.length) % submission.documents.length;
    
    const newDocument = submission.documents[newIndex];
    setSelectedDocument(newDocument);
    setCurrentDocumentIndex(newIndex);
  };

  const updateVerificationChecklist = (documentId, item, checked) => {
    setVerificationChecklist(prev => ({
      ...prev,
      [documentId]: {
        ...prev[documentId],
        [item]: checked
      }
    }));
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
      </Card>

      {/* Enhanced Document Verification Section */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <ApperIcon name="FileCheck" className="h-6 w-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Document Verification</h3>
          </div>
          <Badge variant="info" size="sm">
{submission?.documents?.length || 0} Documents
          </Badge>
        </div>

        {submission?.documents && submission.documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {submission.documents.map((document, index) => {
              const analysis = documentAnalysis[document.Id];
              const checklist = verificationChecklist[document.Id] || {};
              
              return (
                <motion.div
                  key={document.Id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <Card 
                    className="cursor-pointer hover:shadow-elevation-3 transition-all duration-200 border-2 border-transparent hover:border-primary-200"
                    onClick={() => handleDocumentClick(document, index)}
                  >
                    <div className="aspect-[4/3] bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
                      {document.type?.includes('image') ? (
                        <img
                          src={document.url}
                          alt={document.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NS41IDczLjVWNjZIOTQuNVY3My41SDEwMlY4Mi41SDk0LjVWOTBIODUuNVY4Mi41SDc4Vjc4LjVIODUuNVY3My41WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ApperIcon name="FileText" className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Document type indicator */}
                      <div className="absolute top-2 right-2">
                        <Badge 
                          variant={document.type?.includes('pdf') ? 'error' : 'primary'} 
                          size="sm"
                        >
                          {document.type?.includes('pdf') ? 'PDF' : 'IMG'}
                        </Badge>
                      </div>

                      {/* Quality indicator */}
                      {analysis && (
                        <div className="absolute top-2 left-2">
                          <Badge 
                            variant={analysis.quality >= 90 ? 'success' : analysis.quality >= 70 ? 'warning' : 'error'}
                            size="sm"
                          >
                            {analysis.quality}%
                          </Badge>
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <ApperIcon name="ZoomIn" className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm truncate">{document.name}</h4>
                        <p className="text-xs text-gray-500">
                          {(document.size / 1024).toFixed(1)} KB • {document.type}
                        </p>
                      </div>

                      {/* Verification Checklist */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-700">Verification</span>
                          <span className="text-xs text-gray-500">
                            {Object.values(checklist).filter(Boolean).length}/3
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          {[
                            { key: 'readable', label: 'Clear & Readable' },
                            { key: 'authentic', label: 'Authentic' },
                            { key: 'complete', label: 'Complete Info' }
                          ].map((item) => (
                            <label key={item.key} className="flex items-center space-x-2 text-xs">
                              <input
                                type="checkbox"
                                checked={checklist[item.key] || false}
                                onChange={(e) => updateVerificationChecklist(document.Id, item.key, e.target.checked)}
                                onClick={(e) => e.stopPropagation()}
                                className="h-3 w-3 text-primary-600 rounded focus:ring-primary-500"
                              />
                              <span className="text-gray-600">{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Analysis Summary */}
                      {analysis && (
                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-700">AI Analysis</span>
                            <Badge 
                              variant={analysis.fraudScore < 30 ? 'success' : analysis.fraudScore < 70 ? 'warning' : 'error'}
                              size="sm"
                            >
                              {analysis.fraudScore < 30 ? 'Low Risk' : analysis.fraudScore < 70 ? 'Medium' : 'High Risk'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex justify-between">
                              <span>Quality:</span>
                              <span className="font-medium">{analysis.quality}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Text Confidence:</span>
                              <span className="font-medium">{analysis.textConfidence}%</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ApperIcon name="FileX" className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No documents uploaded</p>
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

      {/* Enhanced Document Viewer Modal */}
      {showDocumentViewer && selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full flex">
            {/* Document Display */}
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="relative bg-white rounded-lg shadow-elevation-3 max-w-full max-h-full overflow-auto">
                {selectedDocument.type?.includes('image') ? (
                  <img
                    src={selectedDocument.url}
                    alt={selectedDocument.name}
                    className="max-w-full max-h-full object-contain"
                    style={{ maxHeight: '80vh' }}
                  />
                ) : (
                  <div className="w-96 h-96 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <ApperIcon name="FileText" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">{selectedDocument.name}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        PDF documents require external viewer
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        className="mt-4"
                        onClick={() => window.open(selectedDocument.url, '_blank')}
                        icon="ExternalLink"
                      >
                        Open in New Tab
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar with Analysis */}
            <div className="w-96 bg-white p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Document Analysis</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseDocumentViewer}
                  icon="X"
                />
              </div>

              {/* Document Info */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">{selectedDocument.name}</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span>{(selectedDocument.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span>{selectedDocument.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span>{new Date(selectedDocument.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* AI Analysis Results */}
              {documentAnalysis[selectedDocument.Id] && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">AI Analysis</h4>
                  <div className="space-y-4">
                    {/* Quality Assessment */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Document Quality</span>
                        <Badge 
                          variant={documentAnalysis[selectedDocument.Id].quality >= 90 ? 'success' : 
                                  documentAnalysis[selectedDocument.Id].quality >= 70 ? 'warning' : 'error'}
                        >
                          {documentAnalysis[selectedDocument.Id].quality}%
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            documentAnalysis[selectedDocument.Id].quality >= 90 ? 'bg-success' :
                            documentAnalysis[selectedDocument.Id].quality >= 70 ? 'bg-warning' : 'bg-error'
                          }`}
                          style={{ width: `${documentAnalysis[selectedDocument.Id].quality}%` }}
                        />
                      </div>
                    </div>

                    {/* Fraud Detection */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Fraud Risk</span>
                        <Badge 
                          variant={documentAnalysis[selectedDocument.Id].fraudScore < 30 ? 'success' : 
                                  documentAnalysis[selectedDocument.Id].fraudScore < 70 ? 'warning' : 'error'}
                        >
                          {documentAnalysis[selectedDocument.Id].fraudScore < 30 ? 'Low' : 
                           documentAnalysis[selectedDocument.Id].fraudScore < 70 ? 'Medium' : 'High'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        Score: {documentAnalysis[selectedDocument.Id].fraudScore}/100
                      </div>
                    </div>

                    {/* OCR Results */}
                    {documentAnalysis[selectedDocument.Id].extractedText && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Extracted Text</h5>
                        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 max-h-32 overflow-y-auto">
                          {documentAnalysis[selectedDocument.Id].extractedText}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Confidence: {documentAnalysis[selectedDocument.Id].textConfidence}%
                        </div>
                      </div>
                    )}

                    {/* Key Fields */}
                    {documentAnalysis[selectedDocument.Id].keyFields && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Detected Fields</h5>
                        <div className="space-y-2">
                          {Object.entries(documentAnalysis[selectedDocument.Id].keyFields).map(([field, value]) => (
                            <div key={field} className="flex justify-between text-xs">
                              <span className="text-gray-600 capitalize">{field.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className="text-gray-900 font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Verification Checklist */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Verification Checklist</h4>
                <div className="space-y-3">
                  {[
                    { key: 'readable', label: 'Document is clear and readable', icon: 'Eye' },
                    { key: 'authentic', label: 'Document appears authentic', icon: 'Shield' },
                    { key: 'complete', label: 'All required information visible', icon: 'CheckCircle' },
                    { key: 'matching', label: 'Details match application data', icon: 'GitCompare' }
                  ].map((item) => (
                    <label key={item.key} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={verificationChecklist[selectedDocument.Id]?.[item.key] || false}
                        onChange={(e) => updateVerificationChecklist(selectedDocument.Id, item.key, e.target.checked)}
                        className="mt-1 h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <div className="flex items-start space-x-2">
                        <ApperIcon name={item.icon} className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(selectedDocument.url, '_blank')}
                  icon="Download"
                >
                  Download Document
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    // Simulate re-analysis
                    toast.info('Re-analyzing document...');
                    handleDocumentClick(selectedDocument, currentDocumentIndex);
                  }}
                  icon="RefreshCw"
                >
                  Re-analyze Document
                </Button>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigateDocument('prev')}
disabled={!submission?.documents || submission.documents.length <= 1}
                className="bg-white bg-opacity-80 hover:bg-opacity-100"
                icon="ChevronLeft"
              />
            </div>
            
            <div className="absolute top-1/2 right-96 transform -translate-y-1/2">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigateDocument('next')}
disabled={!submission?.documents || submission.documents.length <= 1}
                className="bg-white bg-opacity-80 hover:bg-opacity-100"
                icon="ChevronRight"
              />
            </div>

            {/* Close Button */}
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={handleCloseDocumentViewer}
                className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700"
                icon="X"
              />
            </div>

            {/* Document Counter */}
{submission?.documents && submission.documents.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-white bg-opacity-80 rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                  {currentDocumentIndex + 1} of {submission.documents.length}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewDetails;