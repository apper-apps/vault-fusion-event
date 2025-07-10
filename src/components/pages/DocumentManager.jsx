import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import SearchBar from '@/components/molecules/SearchBar';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import { kycService } from '@/services/api/kycService';

const DocumentManager = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('uploadedAt');

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      
const submissions = await kycService.getAll();
      
      // Extract all documents from submissions across all sections
      const allDocuments = [];
      submissions.forEach(submission => {
        const baseInfo = {
          submissionId: submission.Id,
          customerName: submission.personalDetails?.fullName,
          companyName: submission.businessDetails?.companyName,
          status: submission.status
        };

        // Extract personal documents
        if (submission.personalDetails?.panDocument?.length > 0) {
          submission.personalDetails.panDocument.forEach(doc => {
            allDocuments.push({
              ...doc,
              ...baseInfo,
              category: 'Personal',
              section: 'personalDetails'
            });
          });
        }

        // Extract business documents
        if (submission.businessDetails?.gstDocument?.length > 0) {
          submission.businessDetails.gstDocument.forEach(doc => {
            allDocuments.push({
              ...doc,
              ...baseInfo,
              category: 'Business',
              section: 'businessDetails'
            });
          });
        }

        if (submission.businessDetails?.companyPanDocument?.length > 0) {
          submission.businessDetails.companyPanDocument.forEach(doc => {
            allDocuments.push({
              ...doc,
              ...baseInfo,
              category: 'Business',
              section: 'businessDetails'
            });
          });
        }

        if (submission.businessDetails?.addressProof?.length > 0) {
          submission.businessDetails.addressProof.forEach(doc => {
            allDocuments.push({
              ...doc,
              ...baseInfo,
              category: 'Business',
              section: 'businessDetails'
            });
          });
        }

        // Extract telecom documents
        if (submission.telecomUsage?.complianceForm?.length > 0) {
          submission.telecomUsage.complianceForm.forEach(doc => {
            allDocuments.push({
              ...doc,
              ...baseInfo,
              category: 'Telecom',
              section: 'telecomUsage'
            });
          });
        }

        // Extract signatory documents
        if (submission.authorizedSignatory?.authorizationLetter?.length > 0) {
          submission.authorizedSignatory.authorizationLetter.forEach(doc => {
            allDocuments.push({
              ...doc,
              ...baseInfo,
              category: 'Signatory',
              section: 'authorizedSignatory'
            });
          });
        }

        // Extract selfie verification
        if (submission.selfieVerification?.selfie?.length > 0) {
          submission.selfieVerification.selfie.forEach(doc => {
            allDocuments.push({
              ...doc,
              ...baseInfo,
              category: 'Verification',
              section: 'selfieVerification'
            });
          });
        }
      });
      
      setDocuments(allDocuments);
    } catch (err) {
      setError('Failed to load documents. Please try again.');
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const filteredAndSortedDocuments = documents
    .filter(doc => {
      const matchesSearch = 
        doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || doc.type === filterType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'uploadedAt') {
        return new Date(b.uploadedAt) - new Date(a.uploadedAt);
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'customer') {
        return (a.customerName || '').localeCompare(b.customerName || '');
      }
      return 0;
    });

  const handleDownload = (document) => {
    toast.info(`Downloading ${document.name}`);
    // In real app, this would trigger actual file download
  };

  const handlePreview = (document) => {
    window.open(document.url, '_blank');
  };

  const handleDelete = (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(prev => prev.filter(doc => doc.Id !== documentId));
      toast.success('Document deleted successfully');
    }
  };

  const getDocumentIcon = (document) => {
    if (document.type?.includes('pdf') || document.name?.toLowerCase().includes('pdf')) return 'FileText';
    if (document.type?.includes('image') || /\.(jpg|jpeg|png|gif)$/i.test(document.name)) return 'Image';
    return 'File';
  };

const getDocumentTypeLabel = (document) => {
    // Use category if available, otherwise infer from name
    if (document.category) {
      return document.category === 'Personal' ? 'Personal Document' :
             document.category === 'Business' ? 'Business Document' :
             document.category === 'Telecom' ? 'Telecom Document' :
             document.category === 'Signatory' ? 'Signatory Document' :
             document.category === 'Verification' ? 'Identity Verification' :
             document.category;
    }
    
    const name = document.name?.toLowerCase() || '';
    if (name.includes('pan')) return 'PAN Card';
    if (name.includes('gst')) return 'GST Certificate';
    if (name.includes('address')) return 'Address Proof';
    if (name.includes('auth')) return 'Authorization Letter';
    if (name.includes('compliance')) return 'Compliance Form';
    if (name.includes('selfie')) return 'Selfie';
    return 'Document';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadDocuments} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Document Manager
          </h1>
          <p className="text-gray-600 mt-2">
            View and manage all uploaded KYC documents
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant="info" size="lg">
            {documents.length} Documents
          </Badge>
          <Button variant="primary" icon="Download" size="lg">
            Download All
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card padding="md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <SearchBar
              placeholder="Search documents, customers, or companies..."
              onSearch={setSearchQuery}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="all">All Types</option>
              <option value="application/pdf">PDF Files</option>
              <option value="image">Images</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="uploadedAt">Latest First</option>
              <option value="name">Name A-Z</option>
              <option value="customer">Customer A-Z</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Documents Grid */}
      {filteredAndSortedDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedDocuments.map((document, index) => (
            <motion.div
              key={document.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover className="h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                    <ApperIcon name={getDocumentIcon(document)} className="h-8 w-8 text-blue-600" />
                  </div>
                  <Badge variant="primary" size="sm">
                    {getDocumentTypeLabel(document)}
                  </Badge>
                </div>

                <div className="space-y-3 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {document.name || 'Untitled Document'}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="User" className="h-4 w-4" />
                      <span className="truncate">{document.customerName || 'Unknown Customer'}</span>
                    </div>
                    
                    {document.companyName && (
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="Building" className="h-4 w-4" />
                        <span className="truncate">{document.companyName}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="Calendar" className="h-4 w-4" />
                      <span>
                        {document.uploadedAt 
                          ? new Date(document.uploadedAt).toLocaleDateString()
                          : 'Unknown date'
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="HardDrive" className="h-4 w-4" />
                      <span>{formatFileSize(document.size)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={document.status === 'approved' ? 'approved' : document.status === 'rejected' ? 'rejected' : 'pending'}
                      size="sm"
                    >
                      {document.status?.toUpperCase() || 'PENDING'}
                    </Badge>
                    
                    {document.verified && (
                      <Badge variant="success" size="sm" icon="Shield">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Eye"
                    onClick={() => handlePreview(document)}
                    className="flex-1"
                  >
                    Preview
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Download"
                    onClick={() => handleDownload(document)}
                    className="flex-1"
                  >
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Trash2"
                    onClick={() => handleDelete(document.Id)}
                    className="text-error hover:text-error hover:bg-error/10"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Empty
          title="No Documents Found"
          message="No documents match your current search and filter criteria."
          icon="FolderOpen"
          actionText="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setFilterType('all');
          }}
        />
      )}
    </div>
  );
};

export default DocumentManager;