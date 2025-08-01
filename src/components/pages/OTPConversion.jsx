import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import conversionService from "@/services/api/conversionService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import { validateMobile, validateOTP } from "@/utils/validators";

const OTPConversion = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerData, setCustomerData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [formData, setFormData] = useState({
    mobileNumber: '',
    otp: '',
    selectedPlan: '',
    currentPlan: ''
  });

  const steps = [
    { id: 'mobile', title: 'Mobile', description: 'Enter mobile number' },
    { id: 'verify', title: 'Verify', description: 'OTP verification' },
    { id: 'plan', title: 'Select Plan', description: 'Choose postpaid plan' },
    { id: 'confirm', title: 'Confirm', description: 'Conversion summary' }
  ];

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const availablePlans = await conversionService.getPostpaidPlans();
      setPlans(availablePlans);
    } catch (err) {
      console.error('Error loading plans:', err);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMobileSubmit = async () => {
    try {
      if (!validateMobile(formData.mobileNumber)) {
        toast.error('Please enter a valid mobile number');
        return;
      }

      setLoading(true);
      setError('');
      
      const result = await conversionService.checkEligibility(formData.mobileNumber);
      
      if (!result.eligible) {
        toast.error(result.reason || 'Number not eligible for conversion');
        return;
      }
      
      setCustomerData(result.customerData);
      updateFormData('currentPlan', result.customerData.currentPlan);
      
      await conversionService.sendConversionOTP(formData.mobileNumber);
      setCurrentStep(1);
      toast.success('OTP sent to your registered mobile number');
      
    } catch (err) {
      const errorMessage = err.message || 'Unable to check conversion eligibility. Please verify your mobile number and try again.';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 5000,
        icon: err.code === 'NETWORK_ERROR' ? '📡' : '⚠️'
      });
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
      
      await conversionService.verifyConversionOTP(formData.mobileNumber, formData.otp);
      
      setCurrentStep(2);
      toast.success('Mobile number verified successfully');
      
    } catch (err) {
let errorMessage = 'OTP verification failed';
      let toastIcon = '⚠️';
      
      if (err.code === 'INVALID_OTP') {
        errorMessage = err.message || 'Invalid OTP. Please check the 6-digit code and try again.';
        toastIcon = '🔢';
      } else if (err.code === 'OTP_EXPIRED') {
        errorMessage = 'OTP has expired. Please request a new verification code.';
        toastIcon = '⏰';
      } else if (err.code === 'MAX_ATTEMPTS_EXCEEDED') {
        errorMessage = 'Too many incorrect attempts. Please request a new OTP.';
        toastIcon = '🚫';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: err.code === 'MAX_ATTEMPTS_EXCEEDED' ? 8000 : 5000,
        icon: toastIcon
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelection = () => {
    if (!formData.selectedPlan) {
      toast.error('Please select a postpaid plan');
      return;
    }
    setCurrentStep(3);
  };

  const handleConversionComplete = async () => {
    try {
      setLoading(true);
      
      const conversionData = {
        mobileNumber: formData.mobileNumber,
        fromPlan: formData.currentPlan,
        toPlan: formData.selectedPlan,
        customerData: customerData,
        requestedAt: new Date().toISOString()
      };
      
      const result = await conversionService.processConversion(conversionData);
      
      toast.success('Conversion request submitted successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
} catch (err) {
      const errorMessage = err.message || 'Conversion processing failed. Please try again or contact support.';
      toast.error(errorMessage, {
        duration: 6000,
        icon: '⚠️'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderMobileInput = () => (
    <Card>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <ApperIcon name="Smartphone" className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Prepaid to Postpaid Conversion</h2>
          <p className="text-gray-600">Enter your mobile number to check eligibility</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ApperIcon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Conversion Benefits</h4>
              <ul className="mt-1 text-sm text-blue-800 space-y-1">
                <li>• No recharge hassles - monthly billing</li>
                <li>• Higher data limits and better rates</li>
                <li>• Premium customer support</li>
                <li>• International roaming options</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <Input
            label="Mobile Number"
            value={formData.mobileNumber}
            onChange={(e) => updateFormData('mobileNumber', e.target.value.replace(/\D/g, ''))}
            required
            type="tel"
            maxLength={10}
            icon="Phone"
            placeholder="Enter your mobile number"
            className="text-center text-lg"
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <ApperIcon name="AlertCircle" className="h-5 w-5 text-yellow-600" />
            <div>
              <h4 className="text-sm font-medium text-yellow-900">Eligibility Criteria</h4>
              <p className="text-sm text-yellow-800">
                Your number must be active for at least 90 days and have no outstanding dues.
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
          <ApperIcon name="ShieldCheck" className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Mobile Number</h2>
          <p className="text-gray-600">
            Enter the OTP sent to {formData.mobileNumber}
          </p>
        </div>

        {customerData && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Current Plan Details</h3>
            <div className="text-sm text-gray-700">
              <div><span className="font-medium">Name:</span> {customerData.name}</div>
              <div><span className="font-medium">Current Plan:</span> {customerData.currentPlan}</div>
              <div><span className="font-medium">Status:</span> 
                <Badge variant="success" size="sm" className="ml-2">Active</Badge>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-sm mx-auto">
<Input
            label="Enter 6-digit OTP"
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
            onClick={() => conversionService.sendConversionOTP(formData.mobileNumber)}
            disabled={loading}
          >
            Resend OTP
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderPlanSelection = () => (
    <Card>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <ApperIcon name="CreditCard" className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Postpaid Plan</h2>
          <p className="text-gray-600">Choose your new postpaid plan</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.Id}
              whileHover={{ scale: 1.02 }}
              className={`
                p-6 border-2 rounded-xl cursor-pointer transition-all duration-200
                ${formData.selectedPlan === plan.Id 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => updateFormData('selectedPlan', plan.Id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <Badge variant="primary" size="sm">₹{plan.price}/month</Badge>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Wifi" className="h-4 w-4" />
                  <span>{plan.data} Data</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Phone" className="h-4 w-4" />
                  <span>{plan.calls} Calls</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ApperIcon name="MessageSquare" className="h-4 w-4" />
                  <span>{plan.sms} SMS</span>
                </div>
              </div>

              {plan.features.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Additional Benefits:</p>
                  <div className="flex flex-wrap gap-1">
                    {plan.features.map((feature, index) => (
                      <Badge key={index} variant="info" size="sm">{feature}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {formData.selectedPlan === plan.Id && (
                <div className="mt-4 flex items-center justify-center">
                  <Badge variant="success" size="sm" icon="Check">Selected</Badge>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );

  const renderConfirmation = () => {
    const selectedPlan = plans.find(p => p.Id === formData.selectedPlan);
    
    return (
      <Card>
        <div className="space-y-6">
          <div className="text-center mb-8">
            <ApperIcon name="CheckCircle" className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Conversion</h2>
            <p className="text-gray-600">Review your conversion details</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Summary</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Mobile Number</p>
                  <p className="text-sm text-gray-600">{formData.mobileNumber}</p>
                </div>
                <Badge variant="success" size="sm" icon="Check">Verified</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="text-sm font-medium text-red-900 mb-2">Current Plan</h4>
                  <p className="text-sm text-red-800">{formData.currentPlan}</p>
                  <Badge variant="error" size="sm" className="mt-2">Prepaid</Badge>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-medium text-green-900 mb-2">New Plan</h4>
                  <p className="text-sm text-green-800">{selectedPlan?.name}</p>
                  <Badge variant="success" size="sm" className="mt-2">Postpaid - ₹{selectedPlan?.price}/month</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ApperIcon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Next Steps</h4>
                <ul className="mt-1 text-sm text-blue-800 space-y-1">
                  <li>• Conversion will be processed within 24 hours</li>
                  <li>• You'll receive SMS confirmation once complete</li>
                  <li>• First bill will be generated next month</li>
                  <li>• Your number will remain the same</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <ApperIcon name="AlertTriangle" className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                By confirming, you agree to convert your prepaid connection to the selected postpaid plan.
                This action cannot be undone immediately.
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderMobileInput();
      case 1: return renderOTPVerification();
      case 2: return renderPlanSelection();
      case 3: return renderConfirmation();
      default: return renderMobileInput();
    }
  };

  const getActionButton = () => {
    switch (currentStep) {
      case 0:
        return (
          <Button
            onClick={handleMobileSubmit}
            loading={loading}
            disabled={!formData.mobileNumber || formData.mobileNumber.length !== 10}
            icon="Search"
            size="lg"
          >
            Check Eligibility
          </Button>
        );
      case 1:
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
      case 2:
        return (
          <Button
            onClick={handlePlanSelection}
            disabled={!formData.selectedPlan}
            icon="ArrowRight"
            size="lg"
          >
            Continue
          </Button>
        );
      case 3:
        return (
          <Button
            onClick={handleConversionComplete}
            loading={loading}
            variant="success"
            icon="CheckCircle"
            size="lg"
          >
            Confirm Conversion
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
    return <Error 
      title="Eligibility Check Failed" 
      message={error} 
      onRetry={() => {
        setError('');
        setLoading(false);
      }} 
    />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            OTP-Based Conversion
          </h1>
          <p className="text-gray-600 mt-2">
            Convert your prepaid connection to postpaid instantly
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

export default OTPConversion;