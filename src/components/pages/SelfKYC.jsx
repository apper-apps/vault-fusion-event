import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import AlternateMobileVerification from '@/components/kyc/SelfKYC/AlternateMobileVerification';
import ApperIcon from '@/components/ApperIcon';
import { kycService } from '@/services/api/kycService';
import { validateSelfKYCForm, validateOTP } from '@/utils/validators';

const SelfKYC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [debugOTP, setDebugOTP] = useState('');
  const [formData, setFormData] = useState({
    primaryMobile: '',
    alternateMobile: '',
    contactName: '',
    relationship: '',
    otp: ''
  });

  const steps = [
    { id: 'mobile-setup', title: 'Mobile Setup', description: 'Primary & alternate mobile' },
    { id: 'verification', title: 'Verification', description: 'OTP verification' },
    { id: 'complete', title: 'Complete', description: 'Self-KYC submission' }
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendOTP = async () => {
    try {
      const validation = validateSelfKYCForm(formData);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        toast.error(firstError);
        return;
      }

      setLoading(true);
      setError('');
      
      const response = await kycService.sendOTP(formData.alternateMobile, 'self-kyc');
      
      setOtpSent(true);
      setDebugOTP(response.debugOTP);
      setCurrentStep(1);
      toast.success(`OTP sent to ${formData.alternateMobile}`);
      
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (!validateOTP(formData.otp)) {
        toast.error('Please enter a valid 6-digit OTP');
        return;
      }

      setLoading(true);
      setError('');
      
      await kycService.verifyOTP(formData.alternateMobile, formData.otp);
      
      setOtpVerified(true);
      setCurrentStep(2);
      toast.success('OTP verified successfully!');
      
    } catch (err) {
      setError(err.message || 'OTP verification failed');
      toast.error(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSelfKYC = async () => {
    try {
      setLoading(true);
      setError('');
      
      const registrationData = {
        userId: 'user123', // Mock user ID
        primaryMobile: formData.primaryMobile,
        alternateMobile: formData.alternateMobile,
        contactName: formData.contactName,
        relationship: formData.relationship,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };
      
      const result = await kycService.registerSelfKYC(registrationData);
      
      toast.success('Self-KYC submitted successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Failed to submit Self-KYC');
      toast.error(err.message || 'Failed to submit Self-KYC');
    } finally {
      setLoading(false);
    }
  };

  const renderMobileSetup = () => (
    <Card>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <ApperIcon name="UserCheck" className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Self-KYC Registration</h2>
          <p className="text-gray-600">Complete your KYC using alternate mobile verification</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <ApperIcon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Self-KYC Process</h4>
              <p className="mt-1 text-sm text-blue-800">
                Self-KYC allows you to complete verification using an alternate mobile number of a family member or known contact.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Primary Mobile Number"
            value={formData.primaryMobile}
            onChange={(e) => updateFormData('primaryMobile', e.target.value)}
            required
            type="tel"
            icon="Phone"
            placeholder="Enter your primary mobile number"
          />
          
          <Input
            label="Alternate Mobile (Family/Relative)"
            value={formData.alternateMobile}
            onChange={(e) => updateFormData('alternateMobile', e.target.value)}
            required
            type="tel"
            icon="Phone"
            placeholder="Enter family/relative mobile"
          />
          
          <Input
            label="Contact Person Name"
            value={formData.contactName}
            onChange={(e) => updateFormData('contactName', e.target.value)}
            required
            icon="User"
            placeholder="Enter contact person's full name"
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Relationship <span className="text-error">*</span>
            </label>
            <select
              value={formData.relationship}
              onChange={(e) => updateFormData('relationship', e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              required
            >
              <option value="">Select relationship</option>
              <option value="father">Father</option>
              <option value="mother">Mother</option>
              <option value="spouse">Spouse</option>
              <option value="son">Son</option>
              <option value="daughter">Daughter</option>
              <option value="brother">Brother</option>
              <option value="sister">Sister</option>
              <option value="friend">Friend</option>
              <option value="colleague">Colleague</option>
              <option value="business_partner">Business Partner</option>
            </select>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderOTPVerification = () => (
    <Card>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <ApperIcon name="ShieldCheck" className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">OTP Verification</h2>
          <p className="text-gray-600">
            Enter the OTP sent to {formData.alternateMobile}
          </p>
        </div>

        {debugOTP && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <ApperIcon name="AlertTriangle" className="h-5 w-5 text-yellow-600" />
              <div>
                <h4 className="text-sm font-medium text-yellow-900">Development Mode</h4>
                <p className="text-sm text-yellow-800">OTP: <strong>{debugOTP}</strong></p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-sm mx-auto">
          <Input
            label="Enter OTP"
            value={formData.otp}
            onChange={(e) => updateFormData('otp', e.target.value)}
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
            onClick={() => handleSendOTP()}
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Self-KYC Ready</h2>
          <p className="text-gray-600">Review your details and submit your Self-KYC application</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-600">Primary Mobile:</span> {formData.primaryMobile}</div>
            <div><span className="text-gray-600">Alternate Mobile:</span> {formData.alternateMobile}</div>
            <div><span className="text-gray-600">Contact Name:</span> {formData.contactName}</div>
            <div><span className="text-gray-600">Relationship:</span> {formData.relationship}</div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <Badge variant="success" size="sm" icon="Check">OTP Verified</Badge>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ApperIcon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Next Steps</h4>
              <ul className="mt-1 text-sm text-blue-800 space-y-1">
                <li>• Your Self-KYC will be submitted for review</li>
                <li>• Verification typically takes 1-2 business days</li>
                <li>• You'll receive updates via email and SMS</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderMobileSetup();
      case 1:
        return renderOTPVerification();
      case 2:
        return renderComplete();
      default:
        return renderMobileSetup();
    }
  };

  const getActionButton = () => {
    switch (currentStep) {
      case 0:
        return (
          <Button
            onClick={handleSendOTP}
            loading={loading}
            icon="Send"
            size="lg"
          >
            Send OTP
          </Button>
        );
      case 1:
        return (
          <Button
            onClick={handleVerifyOTP}
            loading={loading}
            icon="Shield"
            size="lg"
          >
            Verify OTP
          </Button>
        );
      case 2:
        return (
          <Button
            onClick={handleSubmitSelfKYC}
            loading={loading}
            variant="success"
            icon="CheckCircle"
            size="lg"
          >
            Submit Self-KYC
          </Button>
        );
      default:
        return null;
    }
  };

  if (error && currentStep === 0) {
    return <Error message={error} onRetry={() => setError('')} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Self-KYC Verification
          </h1>
          <p className="text-gray-600 mt-2">
            Complete your KYC using alternate mobile verification
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

export default SelfKYC;