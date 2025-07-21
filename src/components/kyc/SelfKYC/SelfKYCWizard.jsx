import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import StepIndicator from '@/components/molecules/StepIndicator';
import Loading from '@/components/ui/Loading';
import ApperIcon from '@/components/ApperIcon';
import { validateSelfKYCForm, validateOTP } from '@/utils/validators';
import { kycService } from '@/services/api/kycService';
import AlternateMobileVerification from './AlternateMobileVerification';

const SelfKYCWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    primaryMobile: '',
    alternateMobile: '',
    contactName: '',
    relationship: '',
    otp: ''
  });
  const [errors, setErrors] = useState({});
  const [registrationId, setRegistrationId] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [debugOTP, setDebugOTP] = useState('');

  const steps = [
    {
      id: 'registration',
      title: 'App Registration',
      description: 'Register with alternate mobile'
    },
    {
      id: 'verification',
      title: 'Mobile Verification',
      description: 'Verify family/relative mobile'
    },
    {
      id: 'otp',
      title: 'OTP Verification',
      description: 'Verify OTP sent to mobile'
    }
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleRegistration = async () => {
    setLoading(true);
    try {
      const validation = validateSelfKYCForm(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        toast.error('Please fix the errors and try again');
        return;
      }

      const registration = await kycService.registerSelfKYC({
        primaryMobile: formData.primaryMobile,
        alternateMobile: formData.alternateMobile,
        contactName: formData.contactName,
        relationship: formData.relationship,
        userId: 'self-kyc-user-' + Date.now()
      });

      setRegistrationId(registration.Id);
      toast.success('Registration successful! Please verify alternate mobile number.');
      setCurrentStep(1);
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      const result = await kycService.sendOTP(formData.alternateMobile, 'verification');
      setOtpSent(true);
      setDebugOTP(result.debugOTP); // For development testing
      toast.success(`OTP sent to ${formData.alternateMobile}`);
      setCurrentStep(2);
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      if (!validateOTP(formData.otp)) {
        setErrors({ otp: 'Please enter a valid 6-digit OTP' });
        toast.error('Invalid OTP format');
        return;
      }

      await kycService.verifyOTP(formData.alternateMobile, formData.otp);
      await kycService.updateSelfKYCStatus(registrationId, 'verified', true);
      
      toast.success('Self-KYC completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      setErrors({ otp: error.message });
      toast.error(error.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderRegistrationStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <ApperIcon name="UserPlus" className="h-12 w-12 text-primary-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Self-KYC Registration</h2>
        <p className="text-gray-600">Register your application with alternate mobile number as per DoT guidelines</p>
      </div>

      <div className="space-y-4">
        <Input
          label="Primary Mobile Number"
          type="tel"
          icon="Phone"
          placeholder="Enter your primary mobile number"
          value={formData.primaryMobile}
          onChange={(e) => updateFormData('primaryMobile', e.target.value)}
          error={errors.primaryMobile}
          required
        />

        <Input
          label="Alternate Mobile Number (Family/Relative)"
          type="tel"
          icon="Phone"
          placeholder="Enter family/relative mobile number"
          value={formData.alternateMobile}
          onChange={(e) => updateFormData('alternateMobile', e.target.value)}
          error={errors.alternateMobile}
          required
        />

        <Input
          label="Contact Person Name"
          icon="User"
          placeholder="Enter contact person's full name"
          value={formData.contactName}
          onChange={(e) => updateFormData('contactName', e.target.value)}
          error={errors.contactName}
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Relationship <span className="text-error">*</span>
          </label>
          <select
            value={formData.relationship}
            onChange={(e) => updateFormData('relationship', e.target.value)}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
          {errors.relationship && (
            <p className="text-sm text-error flex items-center gap-1">
              <ApperIcon name="AlertCircle" className="h-4 w-4" />
              {errors.relationship}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          icon="ArrowLeft"
        >
          Cancel
        </Button>
        <Button
          onClick={handleRegistration}
          loading={loading}
          icon="ArrowRight"
          iconPosition="right"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );

  const renderVerificationStep = () => (
    <AlternateMobileVerification
      mobile={formData.alternateMobile}
      contactName={formData.contactName}
      relationship={formData.relationship}
      onSendOTP={handleSendOTP}
      onBack={handleBack}
      loading={loading}
    />
  );

  const renderOTPStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <ApperIcon name="MessageSquare" className="h-12 w-12 text-primary-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">OTP Verification</h2>
        <p className="text-gray-600 mb-2">
          Enter the OTP sent to <strong>{formData.alternateMobile}</strong>
        </p>
        {debugOTP && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Development Mode:</strong> OTP is {debugOTP}
            </p>
          </div>
        )}
      </div>

      <Input
        label="Enter OTP"
        type="text"
        icon="Lock"
        placeholder="Enter 6-digit OTP"
        value={formData.otp}
        onChange={(e) => updateFormData('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
        error={errors.otp}
        maxLength={6}
        required
      />

      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          icon="ArrowLeft"
        >
          Back
        </Button>
        <div className="space-x-3">
          <Button
            variant="ghost"
            onClick={handleSendOTP}
            loading={loading}
            icon="RotateCcw"
          >
            Resend OTP
          </Button>
          <Button
            onClick={handleVerifyOTP}
            loading={loading}
            icon="Check"
          >
            Verify & Complete
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderRegistrationStep();
      case 1:
        return renderVerificationStep();
      case 2:
        return renderOTPStep();
      default:
        return renderRegistrationStep();
    }
  };

  if (loading && currentStep === 0) {
    return <Loading message="Processing registration..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-elevation-3">
          <div className="p-8">
            {/* Progress Indicator */}
            <div className="mb-8">
              <StepIndicator
                steps={steps}
                currentStep={currentStep}
                className="mb-6"
              />
            </div>

            {/* Step Content */}
            {renderStepContent()}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SelfKYCWizard;