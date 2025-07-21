import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import DigiLockerConnect from "@/components/kyc/DocumentVerification/DigiLockerConnect";
import DocumentAuthenticity from "@/components/kyc/DocumentVerification/DocumentAuthenticity";
import FaceMatching from "@/components/kyc/DocumentVerification/FaceMatching";
import TerritorialValidation from "@/components/kyc/DocumentVerification/TerritorialValidation";
import LivePhotoValidator from "@/components/kyc/DocumentVerification/LivePhotoValidator";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import uidaiService from "@/services/api/uidaiService";
import digiLockerService from "@/services/api/digiLockerService";

// DoT Compliant Components

const DocumentVerification = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifiedDocuments, setVerifiedDocuments] = useState([]);
  const [digiLockerConnected, setDigiLockerConnected] = useState(false);
  const [formData, setFormData] = useState({
    verificationType: 'digilocker', // 'digilocker' or 'uidai'
    aadhaarNumber: '',
    documentType: '',
    otp: '',
    // DoT Compliance Fields
    dotCompliance: {
      territorialValidation: null,
      faceMatching: null,
      livePhotoValidation: null,
      authenticityVerification: null
    },
    digiLockerData: null,
    uidaiData: null
  });

  const steps = [
    { id: 'method', title: 'Method', description: 'Choose verification method' },
    { id: 'connect', title: 'Connect', description: 'Connect to service' },
    { id: 'documents', title: 'Documents', description: 'Verify documents' },
    { id: 'authenticity', title: 'Authenticity', description: 'Document authenticity' },
    { id: 'face_matching', title: 'Face Match', description: 'Photograph matching' },
    { id: 'territorial', title: 'Territorial', description: 'Boundary validation' },
    { id: 'live_photo', title: 'Live Photo', description: 'Photo verification' },
    { id: 'complete', title: 'Complete', description: 'Verification summary' }
  ];

  const documentTypes = [
    { id: 'aadhaar', name: 'Aadhaar Card', icon: 'CreditCard' },
    { id: 'pan', name: 'PAN Card', icon: 'FileText' },
    { id: 'driving_license', name: 'Driving License', icon: 'Car' },
    { id: 'passport', name: 'Passport', icon: 'Plane' },
    { id: 'voter_id', name: 'Voter ID', icon: 'Vote' },
    { id: 'ration_card', name: 'Ration Card', icon: 'Home' }
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateDotCompliance = (field, value) => {
    setFormData(prev => ({
      ...prev,
      dotCompliance: {
        ...prev.dotCompliance,
        [field]: value
      }
    }));
  };

  const handleMethodSelection = () => {
    if (!formData.verificationType) {
      toast.error('Please select a verification method');
      return;
    }
    setCurrentStep(1);
  };

  const handleDigiLockerConnect = async () => {
    try {
      setLoading(true);
      setError('');
      
      const authUrl = await digiLockerService.getAuthorizationURL();
      
      // In a real app, this would redirect to DigiLocker
      // For demo, we'll simulate the connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDigiLockerConnected(true);
      setCurrentStep(2);
      toast.success('Connected to DigiLocker successfully!');
      
    } catch (err) {
      setError(err.message || 'Failed to connect to DigiLocker');
      toast.error(err.message || 'Failed to connect to DigiLocker');
    } finally {
      setLoading(false);
    }
  };

  const handleUIDAIConnect = async () => {
    try {
      if (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12) {
        toast.error('Please enter a valid 12-digit Aadhaar number');
        return;
      }

      setLoading(true);
      setError('');
      
      await uidaiService.initiateEKYC(formData.aadhaarNumber);
      
      setCurrentStep(2);
      toast.success('OTP sent to your registered mobile number');
      
    } catch (err) {
      setError(err.message || 'Failed to initiate UIDAI verification');
      toast.error(err.message || 'Failed to initiate UIDAI verification');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentVerification = async () => {
    try {
      setLoading(true);
      setError('');
      
      let verificationResults = [];
      
      if (formData.verificationType === 'digilocker') {
        verificationResults = await digiLockerService.verifyDocuments([formData.documentType]);
      } else {
        if (!formData.otp || formData.otp.length !== 6) {
          toast.error('Please enter a valid 6-digit OTP');
          return;
        }
        
const result = await uidaiService.verifyEKYCOTP(formData.aadhaarNumber, formData.otp);
        verificationResults = [result];
      }
      // Store UIDAI data for face matching if UIDAI verification
      if (formData.verificationType === 'uidai' && verificationResults[0]?.kycData) {
        setFormData(prev => ({ ...prev, uidaiData: verificationResults[0].kycData }));
      }
      
      setVerifiedDocuments(verificationResults);
      setCurrentStep(3);
      toast.success('Documents verified successfully!');
      
    } catch (err) {
      setError(err.message || 'Document verification failed');
      toast.error(err.message || 'Document verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteVerification = async () => {
    try {
      setLoading(true);
      
      const verificationData = {
        userId: 'user123',
        method: formData.verificationType,
        documents: verifiedDocuments,
        verifiedAt: new Date().toISOString(),
        status: 'verified'
      };
      
      if (formData.verificationType === 'digilocker') {
        await digiLockerService.saveVerificationData(verificationData);
      } else {
        await uidaiService.saveEKYCData(verificationData);
}
      
      toast.success('Document verification completed successfully!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (err) {
      toast.error(err.message || 'Failed to save verification data');
    } finally {
      setLoading(false);
    }
  };

  const renderMethodSelection = () => (
    <Card>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <ApperIcon name="FileCheck" className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Verification</h2>
          <p className="text-gray-600">Choose your preferred verification method</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`
              p-6 border-2 rounded-xl cursor-pointer transition-all duration-200
              ${formData.verificationType === 'digilocker' 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            onClick={() => updateFormData('verificationType', 'digilocker')}
          >
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <ApperIcon name="Cloud" className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">DigiLocker</h3>
              <p className="text-sm text-gray-600 mb-4">
                Access documents directly from your DigiLocker account
              </p>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center justify-center space-x-1">
                  <ApperIcon name="Check" className="h-3 w-3 text-green-500" />
                  <span>Instant verification</span>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <ApperIcon name="Check" className="h-3 w-3 text-green-500" />
                  <span>Government issued</span>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <ApperIcon name="Check" className="h-3 w-3 text-green-500" />
                  <span>Multiple documents</span>
                </div>
              </div>
            </div>
            {formData.verificationType === 'digilocker' && (
              <div className="mt-4 text-center">
                <Badge variant="primary" size="sm" icon="Check">Selected</Badge>
              </div>
            )}
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`
              p-6 border-2 rounded-xl cursor-pointer transition-all duration-200
              ${formData.verificationType === 'uidai' 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            onClick={() => updateFormData('verificationType', 'uidai')}
          >
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
                <ApperIcon name="Shield" className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">UIDAI Direct</h3>
              <p className="text-sm text-gray-600 mb-4">
                Verify directly with UIDAI using Aadhaar OTP
              </p>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center justify-center space-x-1">
                  <ApperIcon name="Check" className="h-3 w-3 text-green-500" />
                  <span>Direct UIDAI integration</span>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <ApperIcon name="Check" className="h-3 w-3 text-green-500" />
                  <span>Highest security</span>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <ApperIcon name="Check" className="h-3 w-3 text-green-500" />
                  <span>Real-time verification</span>
                </div>
              </div>
            </div>
            {formData.verificationType === 'uidai' && (
              <div className="mt-4 text-center">
                <Badge variant="primary" size="sm" icon="Check">Selected</Badge>
              </div>
            )}
          </motion.div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ApperIcon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Verification Benefits</h4>
              <ul className="mt-1 text-sm text-blue-800 space-y-1">
                <li>• Instant document authenticity verification</li>
                <li>• No need to upload document copies</li>
                <li>• Government-backed verification process</li>
                <li>• Secure and privacy-protected</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

const renderConnection = () => {
    if (formData.verificationType === 'digilocker') {
      return (
        <DigiLockerConnect
          isConnected={digiLockerConnected}
          onConnectionSuccess={(authData) => {
            setDigiLockerConnected(true);
            setFormData(prev => ({ ...prev, digiLockerData: authData }));
            setCurrentStep(2);
          }}
          onError={(error) => {
            setError(error);
            toast.error(error);
          }}
        />
      );
} else {
      return (
        <Card>
          <div className="space-y-6">
            <div className="text-center mb-8">
              <ApperIcon name="Shield" className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">UIDAI Verification</h2>
              <p className="text-gray-600">Enter your Aadhaar number for OTP-based verification</p>
            </div>

            <div className="max-w-md mx-auto">
              <Input
                label="Aadhaar Number"
                value={formData.aadhaarNumber}
                onChange={(e) => updateFormData('aadhaarNumber', e.target.value.replace(/\D/g, ''))}
                required
                type="tel"
                maxLength={12}
                icon="CreditCard"
                placeholder="Enter your Aadhaar number"
                className="text-center text-lg tracking-wider"
              />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <ApperIcon name="ShieldCheck" className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="text-sm font-medium text-green-900">UIDAI Direct Verification</h4>
                  <p className="text-sm text-green-800">
                    Your Aadhaar will be verified directly with UIDAI servers using OTP authentication.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      );
    }
  };

  const renderDocumentSelection = () => {
    if (formData.verificationType === 'digilocker') {
      return (
        <Card>
          <div className="space-y-6">
            <div className="text-center mb-8">
              <ApperIcon name="FileText" className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Document</h2>
              <p className="text-gray-600">Choose which document to verify from DigiLocker</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentTypes.map((doc) => (
                <motion.div
                  key={doc.id}
                  whileHover={{ scale: 1.02 }}
                  className={`
                    p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                    ${formData.documentType === doc.id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => updateFormData('documentType', doc.id)}
                >
                  <div className="text-center">
                    <ApperIcon name={doc.icon} className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                    {formData.documentType === doc.id && (
                      <Badge variant="primary" size="sm" className="mt-2" icon="Check">Selected</Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      );
    } else {
      return (
        <Card>
          <div className="space-y-6">
            <div className="text-center mb-8">
              <ApperIcon name="Key" className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter OTP</h2>
              <p className="text-gray-600">
                Enter the OTP sent to your registered mobile number
              </p>
            </div>

            <div className="max-w-sm mx-auto">
              <Input
                label="Enter OTP"
                value={formData.otp}
                onChange={(e) => updateFormData('otp', e.target.value.replace(/\D/g, ''))}
                required
                type="tel"
                maxLength={6}
                icon="Key"
                placeholder="000000"
                className="text-center text-2xl tracking-wider"
              />
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUIDAIConnect()}
                disabled={loading}
              >
                Resend OTP
              </Button>
            </div>
          </div>
        </Card>
      );
    }
  };

const renderComplete = () => (
    <Card>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <ApperIcon name="CheckCircle" className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">DoT Compliant Verification Complete</h2>
          <p className="text-gray-600">Your documents have been successfully verified with full DoT compliance</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Summary</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Verification Method:</span>
              <Badge variant="info" size="sm">
                {formData.verificationType === 'digilocker' ? 'DigiLocker' : 'UIDAI'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">DoT Compliance:</span>
              <Badge variant="success" size="sm" icon="Shield">Fully Compliant</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <Badge variant="success" size="sm" icon="CheckCircle">Verified</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Verified On:</span>
              <span className="text-sm text-gray-600">{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* DoT Compliance Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">DoT Compliance Checks:</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Badge variant={formData.dotCompliance.authenticityVerification ? 'success' : 'secondary'} size="sm" icon="Shield">
                  Document Authenticity
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={formData.dotCompliance.faceMatching ? 'success' : 'secondary'} size="sm" icon="Eye">
                  Face Matching
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={formData.dotCompliance.territorialValidation ? 'success' : 'secondary'} size="sm" icon="MapPin">
                  Territorial Validation
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={formData.dotCompliance.livePhotoValidation ? 'success' : 'secondary'} size="sm" icon="Camera">
                  Live Photo Validation
                </Badge>
              </div>
            </div>
          </div>

          {verifiedDocuments.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Verified Documents:</h4>
              <div className="space-y-2">
                {verifiedDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Badge variant="success" size="sm" icon="Check">{doc.type || doc.name}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ApperIcon name="Shield" className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-900">DoT Compliance Benefits</h4>
              <ul className="mt-1 text-sm text-green-800 space-y-1">
                <li>• Full territorial boundary compliance verified</li>
                <li>• UIDAI photograph matching completed</li>
                <li>• Live photograph clarity verification passed</li>
                <li>• Document authenticity confirmed by government sources</li>
                <li>• Face recognition matching successful</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
</Card>
  );
// DoT Compliance Step Renderers
  const renderDocumentAuthenticity = () => (
    <DocumentAuthenticity
      documents={verifiedDocuments}
      onVerificationComplete={(results) => {
        updateDotCompliance('authenticityVerification', results);
        setCurrentStep(4);
        toast.success('Document authenticity verification completed');
      }}
      onError={(error) => {
        setError(error);
        toast.error(error);
      }}
    />
  );

  const renderFaceMatching = () => (
    <FaceMatching
      uidaiData={formData.uidaiData}
      onMatchingComplete={(result) => {
        updateDotCompliance('faceMatching', result);
        setCurrentStep(5);
        toast.success('Face matching verification completed');
      }}
      onError={(error) => {
        setError(error);
        toast.error(error);
      }}
    />
  );

  const renderTerritorialValidation = () => (
    <TerritorialValidation
      documentData={formData.digiLockerData || formData.uidaiData}
      onValidationComplete={(result) => {
        updateDotCompliance('territorialValidation', result);
        setCurrentStep(6);
        toast.success('Territorial validation completed');
      }}
      onError={(error) => {
        setError(error);
        toast.error(error);
      }}
    />
  );

  const renderLivePhotoValidator = () => (
    <LivePhotoValidator
      onValidationComplete={(result) => {
        updateDotCompliance('livePhotoValidation', result);
        setCurrentStep(7);
        toast.success('Live photo validation completed');
      }}
      onError={(error) => {
        setError(error);
        toast.error(error);
      }}
    />
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderMethodSelection();
      case 1: return renderConnection();
      case 2: return renderDocumentSelection();
      case 3: return renderDocumentAuthenticity();
      case 4: return renderFaceMatching();
      case 5: return renderTerritorialValidation();
      case 6: return renderLivePhotoValidator();
      case 7: return renderComplete();
      default: return renderMethodSelection();
    }
  };

  const getActionButton = () => {
    switch (currentStep) {
      case 0:
        return (
          <Button
            onClick={handleMethodSelection}
            disabled={!formData.verificationType}
            icon="ArrowRight"
            size="lg"
          >
            Continue
          </Button>
        );
      case 1:
        if (formData.verificationType === 'digilocker' && !digiLockerConnected) {
          return null; // Button is in the card content
        } else if (formData.verificationType === 'uidai') {
          return (
            <Button
              onClick={handleUIDAIConnect}
              loading={loading}
              disabled={!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12}
              icon="Send"
              size="lg"
            >
              Send OTP
            </Button>
          );
        } else {
          return (
            <Button
              onClick={() => setCurrentStep(2)}
              icon="ArrowRight"
              size="lg"
            >
              Continue
            </Button>
          );
        }
case 2:
        return (
          <Button
            onClick={handleDocumentVerification}
            loading={loading}
            disabled={
              formData.verificationType === 'digilocker' 
                ? !formData.documentType 
                : (!formData.otp || formData.otp.length !== 6)
            }
            icon="Shield"
            size="lg"
          >
            Verify Document
          </Button>
        );
      case 3:
        return (
          <Button
            onClick={() => setCurrentStep(4)}
            disabled={!verifiedDocuments.length}
            icon="ArrowRight"
            size="lg"
          >
            Start DoT Compliance Checks
          </Button>
        );
      case 4:
        return (
          <Button
            onClick={() => setCurrentStep(5)}
            disabled={!formData.dotCompliance.authenticityVerification}
            icon="ArrowRight"
            size="lg"
          >
            Continue to Face Matching
          </Button>
        );
      case 5:
        return (
          <Button
            onClick={() => setCurrentStep(6)}
            disabled={!formData.dotCompliance.faceMatching}
            icon="ArrowRight"
            size="lg"
          >
            Continue to Territorial Validation
          </Button>
        );
      case 6:
        return (
          <Button
            onClick={() => setCurrentStep(7)}
            disabled={!formData.dotCompliance.territorialValidation}
            icon="ArrowRight"
            size="lg"
          >
            Continue to Live Photo Validation
          </Button>
        );
      case 7:
        return (
          <Button
            onClick={handleCompleteVerification}
            loading={loading}
            disabled={!formData.dotCompliance.livePhotoValidation}
            variant="success"
            icon="Save"
            size="lg"
          >
            Complete DoT Verification
          </Button>
        );
      default:
        return null;
    }
  };

  if (loading && currentStep === 0) {
    return <Loading type="cards" />;
  }

  if (error && currentStep === 0) {
    return <Error message={error} onRetry={() => setError('')} />;
  }

return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            DoT Compliant Document Verification
          </h1>
          <p className="text-gray-600 mt-2">
            Complete document verification with DoT compliance including territorial validation, face matching, and live photo verification
          </p>
        </div>
        
        <Button variant="secondary" icon="ArrowLeft" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`
                step-indicator 
                ${index <= currentStep ? 'active' : 'inactive'}
              `}>
                {index < currentStep ? (
                  <ApperIcon name="Check" className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="ml-3 text-left">
                <p className={`text-sm font-medium ${index <= currentStep ? 'text-primary-600' : 'text-gray-400'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 ml-6 ${index < currentStep ? 'bg-primary-600' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderStepContent()}
      </motion.div>

      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          icon="ChevronLeft"
        >
          Previous
        </Button>

        {getActionButton()}
      </div>
    </div>
  );
};

export default DocumentVerification;