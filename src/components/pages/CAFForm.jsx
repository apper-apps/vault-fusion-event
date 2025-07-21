import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { cafService } from "@/services/api/cafService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import { validateKYCForm } from "@/utils/validators";

const CAFForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedCAF, setGeneratedCAF] = useState(null);
  const [formData, setFormData] = useState({
    serviceType: '',
    customerType: 'individual', // 'individual' or 'business'
    personalDetails: {
      fullName: '',
      fatherName: '',
      dateOfBirth: '',
      gender: '',
      mobile: '',
      alternateMobile: '',
      email: '',
      aadhaarNumber: '',
      panNumber: ''
    },
    addressDetails: {
      residentialAddress: '',
      permanentAddress: '',
      city: '',
      state: '',
      pincode: '',
      sameAsResidential: false
    },
    businessDetails: {
      companyName: '',
      businessType: '',
      gstin: '',
      cin: '',
      businessAddress: '',
      authorizedSignatory: ''
    },
    serviceDetails: {
      connectionType: '',
      planSelected: '',
      securityDeposit: '',
      installationAddress: ''
    },
    declarations: {
      termsAccepted: false,
      kycCompleted: false,
      informationAccuracy: false
    }
  });

  const steps = [
    { id: 'service', title: 'Service', description: 'Service selection' },
    { id: 'personal', title: 'Personal', description: 'Personal details' },
    { id: 'address', title: 'Address', description: 'Address information' },
    { id: 'business', title: 'Business', description: 'Business details' },
    { id: 'declarations', title: 'Declarations', description: 'Terms & declarations' },
    { id: 'generate', title: 'Generate', description: 'CAF generation' }
  ];

  const serviceTypes = [
    { id: 'new_connection', name: 'New Connection', description: 'Apply for new telecom connection' },
    { id: 'plan_change', name: 'Plan Change', description: 'Change existing plan' },
    { id: 'additional_service', name: 'Additional Service', description: 'Add-on services' },
    { id: 'upgrade_service', name: 'Service Upgrade', description: 'Upgrade current service' }
  ];

  const connectionTypes = [
    { id: 'postpaid', name: 'Postpaid', description: 'Monthly billing' },
    { id: 'prepaid', name: 'Prepaid', description: 'Pay as you go' },
    { id: 'hybrid', name: 'Hybrid', description: 'Mixed billing' }
  ];

  const updateFormData = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateNestedFormData = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: value
    }));
  };

  const handleStepNavigation = (direction) => {
    const maxStep = formData.customerType === 'individual' ? 4 : 5; // Skip business step for individuals
    
    if (direction === 'next') {
      let nextStep = currentStep + 1;
      if (formData.customerType === 'individual' && nextStep === 3) {
        nextStep = 4; // Skip business step
      }
      setCurrentStep(Math.min(nextStep, maxStep));
    } else {
      let prevStep = currentStep - 1;
      if (formData.customerType === 'individual' && prevStep === 3) {
        prevStep = 2; // Skip business step
      }
      setCurrentStep(Math.max(0, prevStep));
    }
  };

  const handleGenerateCAF = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validate form data
      const validation = validateKYCForm(formData);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        toast.error(firstError);
        return;
      }
      
      // Generate CAF document
      const cafData = {
        userId: 'user123',
        formData: formData,
        generatedAt: new Date().toISOString(),
        cafId: `CAF${Date.now()}`
      };
      
      const result = await cafService.generateCAF(cafData);
      setGeneratedCAF(result);
      setCurrentStep(5);
      toast.success('CAF generated successfully!');
      
    } catch (err) {
      setError(err.message || 'Failed to generate CAF');
      toast.error(err.message || 'Failed to generate CAF');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCAF = async () => {
    try {
      if (!generatedCAF) return;
      
      await cafService.downloadCAF(generatedCAF.cafId);
      toast.success('CAF downloaded successfully!');
      
    } catch (err) {
      toast.error('Failed to download CAF');
    }
  };

  const handleSubmitCAF = async () => {
    try {
      setLoading(true);
      
      await cafService.submitCAF({
        ...generatedCAF,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      });
      
      toast.success('CAF submitted for processing!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      toast.error(err.message || 'Failed to submit CAF');
    } finally {
      setLoading(false);
    }
  };

  const renderServiceSelection = () => (
    <Card>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <ApperIcon name="FileText" className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Application Form</h2>
          <p className="text-gray-600">Select the service type and customer category</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Service Type <span className="text-error">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceTypes.map((service) => (
                <motion.div
                  key={service.id}
                  whileHover={{ scale: 1.02 }}
                  className={`
                    p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                    ${formData.serviceType === service.id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => updateNestedFormData('serviceType', null, service.id)}
                >
                  <h3 className="text-sm font-semibold text-gray-900">{service.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">{service.description}</p>
                  {formData.serviceType === service.id && (
                    <Badge variant="primary" size="sm" className="mt-2" icon="Check">Selected</Badge>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Customer Type <span className="text-error">*</span>
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="customerType"
                  value="individual"
                  checked={formData.customerType === 'individual'}
                  onChange={(e) => updateNestedFormData('customerType', null, e.target.value)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="text-sm text-gray-900">Individual</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="customerType"
                  value="business"
                  checked={formData.customerType === 'business'}
                  onChange={(e) => updateNestedFormData('customerType', null, e.target.value)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="text-sm text-gray-900">Business</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderPersonalDetails = () => (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <ApperIcon name="User" className="h-6 w-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-gray-900">Personal Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Full Name (as per ID proof)"
            value={formData.personalDetails.fullName}
            onChange={(e) => updateFormData('personalDetails', 'fullName', e.target.value)}
            required
            placeholder="Enter your full name"
          />
          
          <Input
            label="Father's Name"
            value={formData.personalDetails.fatherName}
            onChange={(e) => updateFormData('personalDetails', 'fatherName', e.target.value)}
            required
            placeholder="Enter father's name"
          />
          
          <Input
            label="Date of Birth"
            value={formData.personalDetails.dateOfBirth}
            onChange={(e) => updateFormData('personalDetails', 'dateOfBirth', e.target.value)}
            required
            type="date"
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Gender <span className="text-error">*</span>
            </label>
            <select
              value={formData.personalDetails.gender}
              onChange={(e) => updateFormData('personalDetails', 'gender', e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <Input
            label="Mobile Number"
            value={formData.personalDetails.mobile}
            onChange={(e) => updateFormData('personalDetails', 'mobile', e.target.value)}
            required
            type="tel"
            placeholder="Enter mobile number"
          />
          
          <Input
            label="Alternate Mobile"
            value={formData.personalDetails.alternateMobile}
            onChange={(e) => updateFormData('personalDetails', 'alternateMobile', e.target.value)}
            type="tel"
            placeholder="Enter alternate mobile"
          />
          
          <Input
            label="Email Address"
            value={formData.personalDetails.email}
            onChange={(e) => updateFormData('personalDetails', 'email', e.target.value)}
            required
            type="email"
            placeholder="Enter email address"
          />
          
          <Input
            label="Aadhaar Number"
            value={formData.personalDetails.aadhaarNumber}
            onChange={(e) => updateFormData('personalDetails', 'aadhaarNumber', e.target.value)}
            required
            placeholder="Enter Aadhaar number"
            maxLength={12}
          />
          
          <Input
            label="PAN Number"
            value={formData.personalDetails.panNumber}
            onChange={(e) => updateFormData('personalDetails', 'panNumber', e.target.value.toUpperCase())}
            required
            placeholder="Enter PAN number"
            maxLength={10}
          />
        </div>
      </div>
    </Card>
  );

  const renderAddressDetails = () => (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <ApperIcon name="MapPin" className="h-6 w-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-gray-900">Address Details</h3>
        </div>

        <div className="space-y-6">
          <Input
            label="Residential Address"
            value={formData.addressDetails.residentialAddress}
            onChange={(e) => updateFormData('addressDetails', 'residentialAddress', e.target.value)}
            required
            placeholder="Enter residential address"
          />
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="sameAsResidential"
              checked={formData.addressDetails.sameAsResidential}
              onChange={(e) => {
                updateFormData('addressDetails', 'sameAsResidential', e.target.checked);
                if (e.target.checked) {
                  updateFormData('addressDetails', 'permanentAddress', formData.addressDetails.residentialAddress);
                }
              }}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="sameAsResidential" className="text-sm text-gray-700">
              Permanent address same as residential
            </label>
          </div>
          
          <Input
            label="Permanent Address"
            value={formData.addressDetails.permanentAddress}
            onChange={(e) => updateFormData('addressDetails', 'permanentAddress', e.target.value)}
            required
            placeholder="Enter permanent address"
            disabled={formData.addressDetails.sameAsResidential}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="City"
              value={formData.addressDetails.city}
              onChange={(e) => updateFormData('addressDetails', 'city', e.target.value)}
              required
              placeholder="Enter city"
            />
            
            <Input
              label="State"
              value={formData.addressDetails.state}
              onChange={(e) => updateFormData('addressDetails', 'state', e.target.value)}
              required
              placeholder="Enter state"
            />
            
            <Input
              label="PIN Code"
              value={formData.addressDetails.pincode}
              onChange={(e) => updateFormData('addressDetails', 'pincode', e.target.value)}
              required
              placeholder="Enter PIN code"
              maxLength={6}
            />
          </div>
        </div>
      </div>
    </Card>
  );

  const renderBusinessDetails = () => {
    if (formData.customerType === 'individual') return null;
    
    return (
      <Card>
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <ApperIcon name="Building" className="h-6 w-6 text-primary-600" />
            <h3 className="text-xl font-semibold text-gray-900">Business Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Company Name"
              value={formData.businessDetails.companyName}
              onChange={(e) => updateFormData('businessDetails', 'companyName', e.target.value)}
              required
              placeholder="Enter company name"
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Business Type <span className="text-error">*</span>
              </label>
              <select
                value={formData.businessDetails.businessType}
                onChange={(e) => updateFormData('businessDetails', 'businessType', e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              >
                <option value="">Select business type</option>
                <option value="proprietorship">Proprietorship</option>
                <option value="pvt-ltd">Private Limited</option>
                <option value="partnership">Partnership</option>
                <option value="llp">LLP</option>
                <option value="others">Others</option>
              </select>
            </div>
            
            <Input
              label="GSTIN"
              value={formData.businessDetails.gstin}
              onChange={(e) => updateFormData('businessDetails', 'gstin', e.target.value)}
              required
              placeholder="Enter GSTIN"
            />
            
            <Input
              label="CIN (Optional)"
              value={formData.businessDetails.cin}
              onChange={(e) => updateFormData('businessDetails', 'cin', e.target.value)}
              placeholder="Enter CIN"
            />
            
            <Input
              label="Authorized Signatory"
              value={formData.businessDetails.authorizedSignatory}
              onChange={(e) => updateFormData('businessDetails', 'authorizedSignatory', e.target.value)}
              required
              placeholder="Enter signatory name"
            />
          </div>

          <Input
            label="Business Address"
            value={formData.businessDetails.businessAddress}
            onChange={(e) => updateFormData('businessDetails', 'businessAddress', e.target.value)}
            required
            placeholder="Enter business address"
          />
        </div>
      </Card>
    );
  };

  const renderDeclarations = () => (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <ApperIcon name="FileCheck" className="h-6 w-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-gray-900">Service Details & Declarations</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Connection Type <span className="text-error">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {connectionTypes.map((type) => (
                <motion.div
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  className={`
                    p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                    ${formData.serviceDetails.connectionType === type.id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => updateFormData('serviceDetails', 'connectionType', type.id)}
                >
                  <h4 className="text-sm font-semibold text-gray-900">{type.name}</h4>
                  <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                  {formData.serviceDetails.connectionType === type.id && (
                    <Badge variant="primary" size="sm" className="mt-2" icon="Check">Selected</Badge>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Plan Selected"
              value={formData.serviceDetails.planSelected}
              onChange={(e) => updateFormData('serviceDetails', 'planSelected', e.target.value)}
              required
              placeholder="Enter selected plan"
            />
            
            <Input
              label="Security Deposit"
              value={formData.serviceDetails.securityDeposit}
              onChange={(e) => updateFormData('serviceDetails', 'securityDeposit', e.target.value)}
              placeholder="Enter security deposit amount"
            />
          </div>

          <Input
            label="Installation Address"
            value={formData.serviceDetails.installationAddress}
            onChange={(e) => updateFormData('serviceDetails', 'installationAddress', e.target.value)}
            required
            placeholder="Enter installation address"
          />

          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900">Declarations</h4>
            
            <div className="space-y-3">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.declarations.termsAccepted}
                  onChange={(e) => updateFormData('declarations', 'termsAccepted', e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  required
                />
                <span className="text-sm text-gray-700">
                  I accept the terms and conditions of service
                </span>
              </label>
              
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.declarations.kycCompleted}
                  onChange={(e) => updateFormData('declarations', 'kycCompleted', e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  required
                />
                <span className="text-sm text-gray-700">
                  I confirm that KYC verification will be completed as per regulations
                </span>
              </label>
              
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.declarations.informationAccuracy}
                  onChange={(e) => updateFormData('declarations', 'informationAccuracy', e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  required
                />
<span className="text-sm text-gray-700">
                  I declare that all information provided is true and accurate
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderGenerated = () => (
    <Card>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <ApperIcon name="CheckCircle" className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">CAF Generated Successfully</h2>
          <p className="text-gray-600">Your Customer Application Form has been generated</p>
        </div>

        {generatedCAF && (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">CAF Details</h3>
              <Badge variant="success" size="sm" icon="FileText">Generated</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-600">CAF ID:</span> {generatedCAF.cafId}</div>
              <div><span className="text-gray-600">Generated On:</span> {new Date(generatedCAF.generatedAt).toLocaleDateString()}</div>
              <div><span className="text-gray-600">Service Type:</span> {formData.serviceType}</div>
              <div><span className="text-gray-600">Customer Type:</span> {formData.customerType}</div>
              <div><span className="text-gray-600">Applicant:</span> {formData.personalDetails.fullName}</div>
              <div><span className="text-gray-600">Connection Type:</span> {formData.serviceDetails.connectionType}</div>
            </div>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <Button
            variant="secondary"
            onClick={handleDownloadCAF}
            icon="Download"
            size="lg"
          >
            Download CAF
          </Button>
          
          <Button
            variant="primary"
            onClick={() => {
              // Preview functionality
              toast.info('CAF preview opened in new window');
            }}
            icon="Eye"
            size="lg"
          >
            Preview CAF
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ApperIcon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Next Steps</h4>
              <ul className="mt-1 text-sm text-blue-800 space-y-1">
                <li>• Download and review your CAF document</li>
                <li>• Submit the form for processing</li>
                <li>• Complete KYC verification if required</li>
                <li>• Await service activation confirmation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderServiceSelection();
      case 1: return renderPersonalDetails();
      case 2: return renderAddressDetails();
      case 3: return renderBusinessDetails();
      case 4: return renderDeclarations();
      case 5: return renderGenerated();
      default: return renderServiceSelection();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.serviceType && formData.customerType;
      case 1:
        return formData.personalDetails.fullName && 
               formData.personalDetails.mobile && 
               formData.personalDetails.email;
      case 2:
        return formData.addressDetails.residentialAddress && 
               formData.addressDetails.city && 
               formData.addressDetails.state;
      case 3:
        if (formData.customerType === 'individual') return true;
        return formData.businessDetails.companyName && 
               formData.businessDetails.businessType;
      case 4:
        return formData.declarations.termsAccepted && 
               formData.declarations.kycCompleted && 
               formData.declarations.informationAccuracy;
      default:
        return true;
    }
  };

  const getActionButton = () => {
    if (currentStep === 4) {
      return (
        <Button
          onClick={handleGenerateCAF}
          loading={loading}
          disabled={!canProceed()}
          variant="success"
          icon="FileText"
          size="lg"
        >
          Generate CAF
        </Button>
      );
    } else if (currentStep === 5) {
      return (
        <Button
          onClick={handleSubmitCAF}
          loading={loading}
          variant="success"
          icon="Send"
          size="lg"
        >
          Submit CAF
        </Button>
      );
    } else {
      return (
        <Button
          onClick={() => handleStepNavigation('next')}
          disabled={!canProceed()}
          icon="ArrowRight"
          size="lg"
        >
          Continue
        </Button>
      );
    }
  };

  if (loading && currentStep === 0) {
    return <Loading type="cards" />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Customer Application Form (CAF)
          </h1>
          <p className="text-gray-600 mt-2">
            Generate digital Customer Application Form for telecom services
          </p>
        </div>
        
        <Button variant="secondary" icon="ArrowLeft" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => {
            // Skip business step for individuals
            if (formData.customerType === 'individual' && index === 3) {
              return null;
            }
            
            return (
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
                <div className="ml-2 text-left">
                  <p className={`text-xs font-medium ${index <= currentStep ? 'text-primary-600' : 'text-gray-400'}`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (formData.customerType === 'business' || index !== 2) && (
                  <div className={`w-12 h-0.5 ml-4 ${index < currentStep ? 'bg-primary-600' : 'bg-gray-300'}`} />
                )}
              </div>
            );
          })}
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
          onClick={() => handleStepNavigation('prev')}
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

export default CAFForm;