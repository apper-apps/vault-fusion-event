import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { kycService } from "@/services/api/kycService";
import ApperIcon from "@/components/ApperIcon";
import AlternateMobileVerification from "@/components/kyc/SelfKYC/AlternateMobileVerification";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import { formatMobileNumber, validateOTP, validateSelfKYCForm } from "@/utils/validators";

const SelfKYC = React.memo(() => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [debugOTP, setDebugOTP] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
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

// Memoized validation function
  const validateForm = useCallback((data) => {
    const validation = validateSelfKYCForm(data);
    setValidationErrors(validation.errors);
    return validation;
  }, []);

  // Debounced validation for real-time feedback
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentStep === 0 && (formData.primaryMobile || formData.alternateMobile || formData.contactName || formData.relationship)) {
        validateForm(formData);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData, currentStep, validateForm]);

  // Auto-retry mechanism for OTP sending
  const handleSendOTP = useCallback(async (isRetry = false) => {
    try {
      const validation = validateForm(formData);
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
      setRetryCount(0);
      
      // Start resend timer
      setCanResend(false);
      setResendTimer(60);
      
      const maskedMobile = formData.alternateMobile.replace(/(\d{6})\d{4}/, '$1****');
      toast.success(`OTP sent to ${maskedMobile}`, {
        icon: '📱'
      });
      
    } catch (err) {
      console.error('OTP send error:', err);
      
      // Enhanced error handling with retry logic
      if (err.code === 'NETWORK_ERROR' && retryCount < 3) {
        setRetryCount(prev => prev + 1);
        toast.warn(`Network error. Retrying... (${retryCount + 1}/3)`);
        setTimeout(() => handleSendOTP(true), 2000);
        return;
      }
      
      const errorMessage = err.message || 'Failed to send OTP. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Reset retry count on non-network errors
      if (err.code !== 'NETWORK_ERROR') {
        setRetryCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, retryCount]);

  // Enhanced OTP verification with better error handling
  const handleVerifyOTP = useCallback(async () => {
    try {
      if (!validateOTP(formData.otp)) {
        toast.error('Please enter a valid 6-digit OTP');
        return;
      }

      setLoading(true);
      setError('');
      
      const response = await kycService.verifyOTP(formData.alternateMobile, formData.otp);
      
      setOtpVerified(true);
      setCurrentStep(2);
      toast.success('OTP verified successfully! 🎉', {
        duration: 4000
      });
      
    } catch (err) {
      console.error('OTP verification error:', err);
      
      let errorMessage = err.message || 'OTP verification failed';
      
      // Provide specific guidance based on error type
      if (err.code === 'INVALID_OTP' && err.remainingAttempts) {
        errorMessage = `${err.message} ${err.remainingAttempts === 1 ? 'This is your last attempt.' : ''}`;
      } else if (err.code === 'OTP_EXPIRED') {
        errorMessage = 'OTP has expired. Click "Resend OTP" to get a new one.';
        setCanResend(true);
        setResendTimer(0);
      } else if (err.code === 'MAX_ATTEMPTS_EXCEEDED') {
        errorMessage = 'Too many failed attempts. Please request a new OTP.';
        setOtpSent(false);
        setCurrentStep(0);
        setCanResend(true);
        setResendTimer(0);
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [formData.otp, formData.alternateMobile]);

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

// Resend timer effect
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Enhanced mobile number formatting
  const formatAndUpdateMobile = useCallback((field, value) => {
    const formatted = formatMobileNumber(value);
    updateFormData(field, formatted);
  }, []);

  const renderMobileSetup = useMemo(() => (
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
              <ul className="mt-2 text-xs text-blue-700 space-y-1">
                <li>• Ensure the alternate mobile is accessible for OTP verification</li>
                <li>• Contact person should be available to receive and share OTP</li>
                <li>• Process typically takes 2-3 minutes to complete</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Primary Mobile Number"
            value={formData.primaryMobile}
            onChange={(e) => formatAndUpdateMobile('primaryMobile', e.target.value)}
            required
            type="tel"
            icon="Phone"
            placeholder="Enter your primary mobile number"
            error={validationErrors.primaryMobile}
            maxLength={10}
            className="form-field"
          />
          
          <Input
            label="Alternate Mobile (Family/Relative)"
            value={formData.alternateMobile}
            onChange={(e) => formatAndUpdateMobile('alternateMobile', e.target.value)}
            required
            type="tel"
            icon="Phone"
            placeholder="Enter family/relative mobile"
            error={validationErrors.alternateMobile}
            maxLength={10}
            className="form-field"
            helpText="This number will receive the OTP for verification"
          />
          
          <Input
            label="Contact Person Name"
            value={formData.contactName}
            onChange={(e) => updateFormData('contactName', e.target.value)}
            required
            icon="User"
            placeholder="Enter contact person's full name"
            error={validationErrors.contactName}
            className="form-field"
          />
          
          <div className="space-y-2 form-field">
            <label className="block text-sm font-medium text-gray-700">
              Relationship <span className="text-error">*</span>
            </label>
            <select
              value={formData.relationship}
              onChange={(e) => updateFormData('relationship', e.target.value)}
              className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-all duration-200 ${
                validationErrors.relationship ? 'border-error focus:border-error focus:ring-error' : ''
              }`}
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
            {validationErrors.relationship && (
              <p className="text-sm text-error mt-1">{validationErrors.relationship}</p>
            )}
          </div>
        </div>

        {/* Form progress indicator */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Form Completion</span>
            <span>{Math.round(Object.values(formData).filter(v => v.trim()).length / 4 * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Object.values(formData).filter(v => v.trim()).length / 4 * 100}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  ), [formData, validationErrors, formatAndUpdateMobile]);

const renderOTPVerification = useMemo(() => (
    <Card>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <ApperIcon name="ShieldCheck" className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">OTP Verification</h2>
          <p className="text-gray-600">
            Enter the OTP sent to {formData.alternateMobile.replace(/(\d{6})\d{4}/, '$1****')}
          </p>
        </div>

        {debugOTP && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <ApperIcon name="AlertTriangle" className="h-5 w-5 text-yellow-600" />
              <div>
                <h4 className="text-sm font-medium text-yellow-900">Development Mode</h4>
                <p className="text-sm text-yellow-800">OTP: <strong>{debugOTP}</strong></p>
                <p className="text-xs text-yellow-700 mt-1">
                  This is visible only in development environment
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="max-w-sm mx-auto">
          <Input
            label="Enter OTP"
            value={formData.otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              updateFormData('otp', value);
            }}
            required
            type="tel"
            maxLength={6}
            icon="Key"
            placeholder="000000"
            className="text-center text-2xl tracking-wider font-mono"
            autoComplete="one-time-code"
            inputMode="numeric"
          />
          
          {/* OTP input progress */}
          <div className="flex justify-center mt-3 space-x-2">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className={`w-3 h-1 rounded-full transition-all duration-200 ${
                  index < formData.otp.length ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Timer and resend section */}
        <div className="text-center space-y-3">
          {!canResend && resendTimer > 0 && (
            <p className="text-sm text-gray-500">
              Resend OTP in <span className="font-mono font-medium text-primary-600">{resendTimer}s</span>
            </p>
          )}
          
          <div className="flex justify-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSendOTP()}
              disabled={loading || !canResend}
              icon={loading ? "Loader2" : "RefreshCw"}
            >
              {loading ? 'Sending...' : 'Resend OTP'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCurrentStep(0);
                setOtpSent(false);
                setError('');
                setFormData(prev => ({ ...prev, otp: '' }));
              }}
              icon="Edit"
            >
              Edit Mobile
            </Button>
          </div>
        </div>

        {/* Security notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ApperIcon name="Shield" className="h-5 w-5 text-gray-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Security Notice</h4>
              <p className="text-sm text-gray-600 mt-1">
                Never share your OTP with anyone. Our team will never ask for your OTP over phone or email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
), [formData.alternateMobile, formData.otp, debugOTP, canResend, resendTimer, loading, handleSendOTP]);

  // Completion step component
  const renderComplete = useMemo(() => (
    <Card>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <ApperIcon name="CheckCircle" className="h-16 w-16 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Self-KYC Completed!</h2>
          <p className="text-gray-600">
            Your Self-KYC submission has been successfully registered
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <ApperIcon name="CheckCircle" className="h-6 w-6 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-green-900 mb-2">Registration Successful</h4>
              <div className="space-y-2 text-sm text-green-800">
                <p><strong>Primary Mobile:</strong> {formData.primaryMobile}</p>
                <p><strong>Alternate Mobile:</strong> {formData.alternateMobile}</p>
                <p><strong>Contact Person:</strong> {formData.contactName}</p>
                <p><strong>Relationship:</strong> {formData.relationship}</p>
                <p><strong>Submitted At:</strong> {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ApperIcon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Next Steps</h4>
              <ul className="mt-2 text-sm text-blue-800 space-y-1">
                <li>• Your application will be reviewed within 24-48 hours</li>
                <li>• You will receive SMS updates on your primary mobile number</li>
                <li>• Check your dashboard for real-time status updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  ), [formData.primaryMobile, formData.alternateMobile, formData.contactName, formData.relationship]);

  // Step content renderer
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderMobileSetup;
      case 1:
        return renderOTPVerification;
      case 2:
        return renderComplete;
      default:
        return renderMobileSetup;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Self-KYC Verification
          </h1>
          <p className="text-gray-600 mt-2">
            Complete your KYC using alternate mobile verification
          </p>
          <div className="flex items-center space-x-4 mt-3">
            <Badge variant="info" size="sm" icon="Clock">
              ~3 minutes
            </Badge>
            <Badge variant="success" size="sm" icon="Shield">
              Secure Process
            </Badge>
          </div>
        </div>
        
        <Button 
          variant="secondary" 
          icon="ArrowLeft" 
          onClick={() => navigate('/dashboard')}
          className="w-full sm:w-auto"
        >
          Back to Dashboard
        </Button>
      </div>

      {/* Enhanced Step Indicator */}
      <div className="flex items-center justify-center px-4">
        <div className="flex items-center space-x-4 sm:space-x-8 max-w-2xl w-full">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`
                  step-indicator transition-all duration-300
                  ${index <= currentStep ? (index < currentStep ? 'completed' : 'active') : 'inactive'}
                `}>
                  {index < currentStep ? (
                    <ApperIcon name="Check" className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <p className={`text-sm font-medium transition-colors duration-200 ${
                    index <= currentStep ? 'text-primary-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-0.5 mx-4 transition-all duration-300
                  ${index < currentStep ? 'bg-primary-600' : 'bg-gray-300'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <ApperIcon name="AlertCircle" className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-900">Error</h4>
              <p className="text-sm text-red-800 mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-[400px]"
      >
        {renderStepContent()}
      </motion.div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Button
          variant="secondary"
          onClick={() => {
            if (currentStep > 0) {
              setCurrentStep(currentStep - 1);
              setError('');
            }
          }}
          disabled={currentStep === 0 || loading}
          icon="ChevronLeft"
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          Previous
        </Button>

        <div className="order-1 sm:order-2">
          {getActionButton()}
        </div>
      </div>
    </div>
);
});

export default SelfKYC;