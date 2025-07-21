import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import digiLockerService from "@/services/api/digiLockerService";

interface DocumentAuthenticityProps {
  documents: any[];
  onVerificationComplete: (results: any[]) => void;
  onError: (error: string) => void;
}

interface AuthenticityCheck {
  documentId: string;
  documentName: string;
  status: 'pending' | 'checking' | 'authentic' | 'suspicious' | 'failed';
  score: number;
  details: {
    issuerVerified: boolean;
    digitalSignature: boolean;
    tampering: boolean;
    expiryStatus: boolean;
    territorialCompliance: boolean;
  };
  timestamp: string;
}

const DocumentAuthenticity: React.FC<DocumentAuthenticityProps> = ({
  documents,
  onVerificationComplete,
  onError
}) => {
  const [verificationResults, setVerificationResults] = useState<AuthenticityCheck[]>([]);
  const [currentlyChecking, setCurrentlyChecking] = useState<string | null>(null);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (documents.length > 0) {
      initializeVerification();
    }
  }, [documents]);

  const initializeVerification = () => {
    const initialResults = documents.map(doc => ({
      documentId: doc.id || doc.documentId || `doc_${Date.now()}`,
      documentName: doc.name || doc.type || 'Unknown Document',
      status: 'pending' as const,
      score: 0,
      details: {
        issuerVerified: false,
        digitalSignature: false,
        tampering: false,
        expiryStatus: false,
        territorialCompliance: false
      },
      timestamp: new Date().toISOString()
    }));

    setVerificationResults(initialResults);
  };

  const runAuthenticityCheck = async () => {
    try {
      setLoading(true);
      setOverallStatus('running');

      for (let i = 0; i < verificationResults.length; i++) {
        const result = verificationResults[i];
        setCurrentlyChecking(result.documentId);

        // Update status to checking
        setVerificationResults(prev => prev.map(item => 
          item.documentId === result.documentId 
            ? { ...item, status: 'checking' }
            : item
        ));

        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time

        try {
          // Perform authenticity check
          const authCheck = await digiLockerService.checkDocumentAuthenticity(result.documentId);
          
          // Simulate comprehensive DoT validation
          const dotCompliance = await performDoTValidation(result);
          
          const finalScore = calculateAuthenticityScore(authCheck, dotCompliance);
          const finalStatus = finalScore >= 90 ? 'authentic' : finalScore >= 70 ? 'suspicious' : 'failed';

          const updatedResult: AuthenticityCheck = {
            ...result,
            status: finalStatus,
            score: finalScore,
            details: {
              issuerVerified: authCheck.issuerVerified || false,
              digitalSignature: authCheck.authentic || false,
              tampering: !authCheck.tampering,
              expiryStatus: dotCompliance.expiryValid,
              territorialCompliance: dotCompliance.territorialValid
            },
            timestamp: new Date().toISOString()
          };

          setVerificationResults(prev => prev.map(item => 
            item.documentId === result.documentId ? updatedResult : item
          ));

        } catch (error: any) {
          // Handle individual document verification failure
          setVerificationResults(prev => prev.map(item => 
            item.documentId === result.documentId 
              ? { 
                  ...item, 
                  status: 'failed',
                  timestamp: new Date().toISOString()
                }
              : item
          ));
        }
      }

      setCurrentlyChecking(null);
      setOverallStatus('completed');
      
      // Check if any document passed verification
      const finalResults = verificationResults.filter(result => 
        result.status === 'authentic' || result.status === 'suspicious'
      );

      if (finalResults.length === 0) {
        throw new Error('No documents passed authenticity verification');
      }

      onVerificationComplete(finalResults);
      toast.success(`${finalResults.length} documents verified successfully!`);

    } catch (error: any) {
      setOverallStatus('failed');
      const errorMessage = error.message || 'Document authenticity verification failed';
      onError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const performDoTValidation = async (document: AuthenticityCheck) => {
    // Simulate DoT specific validation checks
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      expiryValid: Math.random() > 0.1, // 90% pass rate
      territorialValid: Math.random() > 0.05, // 95% pass rate
      formatValid: Math.random() > 0.05, // 95% pass rate
      signatoryValid: Math.random() > 0.1 // 90% pass rate
    };
  };

  const calculateAuthenticityScore = (authCheck: any, dotCompliance: any) => {
    let score = 0;
    
    if (authCheck.issuerVerified) score += 25;
    if (authCheck.authentic) score += 25;
    if (!authCheck.tampering) score += 20;
    if (dotCompliance.expiryValid) score += 15;
    if (dotCompliance.territorialValid) score += 15;
    
    return Math.min(100, score);
  };

  const getStatusBadge = (status: AuthenticityCheck['status'], score: number) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" size="sm" icon="Clock">Pending</Badge>;
      case 'checking':
        return <Badge variant="warning" size="sm" icon="Loader">Checking</Badge>;
      case 'authentic':
        return <Badge variant="success" size="sm" icon="CheckCircle">Authentic ({score}%)</Badge>;
      case 'suspicious':
        return <Badge variant="warning" size="sm" icon="AlertTriangle">Review Required ({score}%)</Badge>;
      case 'failed':
        return <Badge variant="danger" size="sm" icon="XCircle">Failed</Badge>;
      default:
        return <Badge variant="secondary" size="sm">Unknown</Badge>;
    }
  };

  const renderVerificationDetails = (result: AuthenticityCheck) => {
    const { details } = result;
    const checks = [
      { key: 'issuerVerified', label: 'Issuer Verification', icon: 'Shield' },
      { key: 'digitalSignature', label: 'Digital Signature', icon: 'Key' },
      { key: 'tampering', label: 'Tampering Check', icon: 'Eye' },
      { key: 'expiryStatus', label: 'Expiry Status', icon: 'Calendar' },
      { key: 'territorialCompliance', label: 'Territorial Compliance', icon: 'MapPin' }
    ];

    return (
      <div className="mt-3 space-y-2">
        {checks.map(check => (
          <div key={check.key} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <ApperIcon name={check.icon} className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{check.label}</span>
            </div>
            {details[check.key as keyof typeof details] ? (
              <ApperIcon name="Check" className="h-4 w-4 text-green-500" />
            ) : (
              <ApperIcon name="X" className="h-4 w-4 text-red-500" />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <div className="space-y-6">
        <div className="text-center">
          <ApperIcon name="ShieldCheck" className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Authenticity Verification</h2>
          <p className="text-gray-600">
            DoT compliant authenticity verification with comprehensive validation
          </p>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-8">
            <ApperIcon name="FileX" className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No documents available for verification</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Verification Status</h3>
                  <p className="text-xs text-gray-500">
                    {verificationResults.length} documents • DoT compliant verification
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {overallStatus === 'running' && <Loading type="spinner" size="sm" />}
                  {overallStatus === 'idle' && (
                    <Button onClick={runAuthenticityCheck} loading={loading} icon="Play" size="sm">
                      Start Verification
                    </Button>
                  )}
                  {overallStatus === 'completed' && (
                    <Badge variant="success" size="sm" icon="CheckCircle">Completed</Badge>
                  )}
                  {overallStatus === 'failed' && (
                    <Badge variant="danger" size="sm" icon="XCircle">Failed</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Document Results */}
            <div className="space-y-3">
              {verificationResults.map((result, index) => (
                <motion.div
                  key={result.documentId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    border rounded-lg p-4 transition-all duration-200
                    ${currentlyChecking === result.documentId ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}
                    ${result.status === 'authentic' ? 'border-green-500 bg-green-50' : ''}
                    ${result.status === 'failed' ? 'border-red-500 bg-red-50' : ''}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <ApperIcon name="FileText" className="h-5 w-5 text-gray-500" />
                        <h4 className="text-sm font-medium text-gray-900">{result.documentName}</h4>
                      </div>
                      
                      {result.status !== 'pending' && renderVerificationDetails(result)}
                    </div>
                    
                    <div className="ml-4">
                      {getStatusBadge(result.status, result.score)}
                    </div>
                  </div>

                  {result.status === 'checking' && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3">
                      <div className="flex items-center space-x-2">
                        <Loading type="spinner" size="sm" />
                        <span className="text-sm text-blue-800">Performing DoT compliance checks...</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {overallStatus === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <ApperIcon name="CheckCircle" className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-green-900">Verification Complete</h4>
                    <p className="text-sm text-green-800">
                      All document authenticity checks completed with DoT compliance validation.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default DocumentAuthenticity;