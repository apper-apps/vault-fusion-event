import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import ApperIcon from '@/components/ApperIcon';
import { uidaiService } from '@/services/api/uidaiService';
import { validateAadhaar, validateOTP } from '@/utils/validators';

const EKYC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [kycData, setKycData] = useState(null);
  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    otp: '',
    consentGiven: false
  });

  const steps = [
    { id: 'consent', title: 'Consent', description: 'UIDAI consent' },
    { id: 'aadhaar', title: 'Aadhaar', description: 'Enter Aadhaar number' },
    { id: 'otp', title: 'OTP', description: 'Verify OTP' },
    { id: 'complete', title: 'Complete', description: 'e-KYC data' }
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConsentSubmit = () => {
    if (!formData.consentGiven) {
      toast.error('Please provide consent to proceed with e-KYC');
      return;
    }
    setCurrentStep(1);
  };

  const handleAadhaarSubmit = async () => {
    try {
      if (!validateAadhaar(formData.aadhaarNumber)) {
        toast.error('Please enter a valid 12-digit Aadhaar number');
        return;
      }

      setLoading(true);
      setError('');
      
      await uidaiService.initiateEKYC(formData.aadhaarNumber);
      
      setCurrentStep(2);
      toast.success('OTP sent to your registered mobile number');
      
    } catch (err) {
      setError(err.message || 'Failed to initiate e-KYC');
      toast.error(err.message || 'Failed to initiate e-KYC');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    try {
      if (!validateOTP(formData.otp)) {
        toast.error('Please enter a valid 6-digit OTP');
        return;
      }

      setLoading(true);
      setError('');
      
      const result = await uidaiService.verifyEKYCOTP(formData.aadhaarNumber, formData.otp);
      
      setKycData(result.kycData);
      setAadhaarVerified(true);
      setCurrentStep(3);
      toast.success('e-KYC completed successfully!');
      
    } catch (err) {
      setError(err.message || 'OTP verification failed');
      toast.error(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteEKYC = async () => {
    try {
      setLoading(true);
      
      await uidaiService.saveEKYCData({
        userId: 'user123',
        aadhaarNumber: formData.aadhaarNumber,
        kycData: kycData,
        verifiedAt: new Date().toISOString(),
        status: 'verified'
      });
      
      toast.success('e-KYC data saved successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      toast.error(err.message || 'Failed to save e-KYC data');
    } finally {
      setLoading(false);
    }
  };

  const renderConsent = () => (
    <Card>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <ApperIcon name="Shield" className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">UIDAI e-KYC Consent</h2>
          <p className="text-gray-600">Please read and provide consent for e-KYC verification</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <ApperIcon name="Info" className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-3">e-KYC Process</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Your Aadhaar number will be used to fetch KYC details from UIDAI</li>
                <li>• An OTP will be sent to your registered mobile number</li>
                <li>• Your demographic and biometric data will be verified</li>
                <li>• This data will be used for KYC compliance purposes only</li>
                <li>• Your data will be handled as per privacy regulations</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ApperIcon name="AlertTriangle" className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-900">Data Usage Consent</h4>
              <p className="text-sm text-yellow-800 mt-1">
                By proceeding, you consent to the collection and processing of your Aadhaar-linked demographic 
                information for KYC verification purposes as per UIDAI guidelines.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="consent"
            checked={formData.consentGiven}
            onChange={(e) => updateFormData('consentGiven', e.target.checked)}
            className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="consent" className="text-sm text-gray-700">
            I hereby give my consent for using my Aadhaar number for e-KYC verification. 
            I understand that my demographic information will be fetched from UIDAI and 
            used for KYC compliance purposes.
          </label>
        </div>
      </div>
    </Card>
  );

  const renderAadhaarInput = () => (
    <Card>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <ApperIcon name="CreditCard" className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Aadhaar Number</h2>
          <p className="text-gray-600">Provide your 12-digit Aadhaar number for verification</p>
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
            placeholder="0000 0000 0000"
            className="text-center text-lg tracking-wider"
          />
          <p className="text-xs text-gray-500 mt-2 text-center">
            Your Aadhaar number is secure and will be used only for verification
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <ApperIcon name="Lock" className="h-5 w-5 text-green-600" />
            <div>
              <h4 className="text-sm font-medium text-green-900">Security Assured</h4>
              <p className="text-sm text-green-800">
                Your Aadhaar number is encrypted and transmitted securely to UIDAI servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderOTPVerification = () => (
    <Card>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <ApperIcon name="Smartphone" className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">OTP Verification</h2>
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
          <p className="text-xs text-gray-500 mt-2 text-center">
            OTP is valid for 10 minutes
          </p>
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAadhaarSubmit()}
            disabled={loading}
          >
            Resend OTP
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderComplete = () => (
    <Card>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <ApperIcon name="CheckCircle" className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">e-KYC Completed</h2>
          <p className="text-gray-600">Your KYC details have been successfully verified</p>
        </div>

        {kycData && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ApperIcon name="UserCheck" className="h-5 w-5 mr-2" />
              Verified Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-600">Name:</span> {kycData.name}</div>
              <div><span className="text-gray-600">Date of Birth:</span> {kycData.dateOfBirth}</div>
              <div><span className="text-gray-600">Gender:</span> {kycData.gender}</div>
              <div><span className="text-gray-600">Mobile:</span> {kycData.mobile}</div>
              <div><span className="text-gray-600">Email:</span> {kycData.email || 'Not available'}</div>
              <div className="col-span-2">
                <span className="text-gray-600">Address:</span> {kycData.address}
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="success" size="sm" icon="ShieldCheck">UIDAI Verified</Badge>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ApperIcon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Next Steps</h4>
              <ul className="mt-1 text-sm text-blue-800 space-y-1">
                <li>• Your e-KYC data will be saved securely</li>
                <li>• You can now access all CallerDesk services</li>
                <li>• Your verification is complete and compliant</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderConsent();
      case 1: return renderAadhaarInput();
      case 2: return renderOTPVerification();
      case 3: return renderComplete();
      default: return renderConsent();
    }
  };

  const getActionButton = () => {
    switch (currentStep) {
      case 0:
        return (
          <Button
            onClick={handleConsentSubmit}
            disabled={!formData.consentGiven}
            icon="CheckCircle"
            size="lg"
          >
            Proceed with Consent
          </Button>
        );
      case 1:
        return (
          <Button
            onClick={handleAadhaarSubmit}
            loading={loading}
            disabled={!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12}
            icon="Send"
            size="lg"
          >
            Send OTP
          </Button>
        );
      case 2:
        return (
          <Button
            onClick={handleOTPVerification}
            loading={loading}
            disabled={!formData.otp || formData.otp.length !== 6}
            icon="Shield"
            size="lg"
          >
            Verify OTP
          </Button>
        );
      case 3:
        return (
          <Button
            onClick={handleCompleteEKYC}
            loading={loading}
            variant="success"
            icon="Save"
            size="lg"
          >
            Save & Complete
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
            UIDAI e-KYC
          </h1>
          <p className="text-gray-600 mt-2">
            Complete your KYC instantly using UIDAI Aadhaar verification
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

export default EKYC;