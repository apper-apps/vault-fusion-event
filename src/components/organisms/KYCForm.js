import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  validateAadhaar, 
  validateCIN, 
  validateEmail, 
  validateGSTIN, 
  validateKYCForm, 
  validateMobile, 
  validatePAN, 
  validateRequired 
} from "@/utils/validators";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import StepIndicator from "@/components/molecules/StepIndicator";
import DocumentUpload from "@/components/molecules/DocumentUpload";

const KYCForm = ({ onSubmit, initialData = {} }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  const [formData, setFormData] = useState({
    personalDetails: {
      fullName: '',
      mobile: '',
      email: '',
      aadhaar: '',
      pan: '',
      dateOfBirth: '',
      panDocument: null,
      ...initialData.personalDetails
    },
    businessDetails: {
      companyName: '',
      businessType: '',
      gstin: '',
      cin: '',
      address: '',
      gstDocument: null,
      companyPanDocument: null,
      addressProof: null,
      ...initialData.businessDetails
    },
    telecomUsage: {
      intendedUse: '',
      trafficType: '',
      complianceForm: null,
      ...initialData.telecomUsage
    },
    authorizedSignatory: {
      name: '',
      mobile: '',
      email: '',
      designation: '',
      authorizationLetter: null,
      ...initialData.authorizedSignatory
    }
  });

  const steps = [
    { id: 1, title: "Personal Details", description: "Basic information" },
    { id: 2, title: "Business Details", description: "Company information" },
    { id: 3, title: "Telecom Usage", description: "Usage details" },
    { id: 4, title: "Authorized Signatory", description: "Signatory information" },
    { id: 5, title: "Review & Submit", description: "Final review" }
  ];

  const updateFormData = (section, field, value) => {
    const newFormData = {
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value
      }
    };
    setFormData(newFormData);
    
    // Validate form and update errors
    const validation = validateKYCForm(newFormData);
    setValidationErrors(validation.errors);
    setIsFormValid(validation.isValid);
  };
const handleSubmit = () => {
    const validation = validateKYCForm(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    onSubmit(formData);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<Input
                label="Full Name (as per PAN)"
                value={formData.personalDetails.fullName}
                onChange={(e) => updateFormData('personalDetails', 'fullName', e.target.value)}
                required
                placeholder="Enter your full name"
                error={validationErrors['personalDetails.fullName']}
              />
<Input
                label="Mobile Number"
                value={formData.personalDetails.mobile}
                onChange={(e) => updateFormData('personalDetails', 'mobile', e.target.value)}
                required
                type="tel"
                placeholder="Enter mobile number"
                error={validationErrors['personalDetails.mobile']}
              />
<Input
                label="Email Address"
                value={formData.personalDetails.email}
                onChange={(e) => updateFormData('personalDetails', 'email', e.target.value)}
                required
                type="email"
                placeholder="Enter email address"
                error={validationErrors['personalDetails.email']}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<Input
                label="Aadhaar Number"
                value={formData.personalDetails.aadhaar}
                onChange={(e) => updateFormData('personalDetails', 'aadhaar', e.target.value)}
                required
                placeholder="Enter Aadhaar number"
                maxLength={12}
                error={validationErrors['personalDetails.aadhaar']}
              />
<Input
                label="PAN Number"
                value={formData.personalDetails.pan}
                onChange={(e) => updateFormData('personalDetails', 'pan', e.target.value.toUpperCase())}
                required
                placeholder="Enter PAN number"
                style={{ textTransform: 'uppercase' }}
                error={validationErrors['personalDetails.pan']}
              />
<Input
                label="Date of Birth"
                value={formData.personalDetails.dateOfBirth}
                onChange={(e) => updateFormData('personalDetails', 'dateOfBirth', e.target.value)}
                required
                type="date"
                error={validationErrors['personalDetails.dateOfBirth']}
              />
            </div>
            <div>
<DocumentUpload
                label="Upload PAN Card"
                value={formData.personalDetails.panDocument}
                onChange={(files) => updateFormData('personalDetails', 'panDocument', files)}
                accept=".pdf,.jpg,.jpeg,.png"
                required
                error={validationErrors['documents.panDocument']}
              />
              {validationErrors['documents.panDocument'] && (
                <p className="text-sm text-error mt-1">{validationErrors['documents.panDocument']}</p>
              )}
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<Input
                label="Company Name (As per GST)"
                value={formData.businessDetails.companyName}
                onChange={(e) => updateFormData('businessDetails', 'companyName', e.target.value)}
                required
                placeholder="Enter company name"
                error={validationErrors['businessDetails.companyName']}
              />
<div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type <span className="text-error">*</span>
                </label>
                <select
                  value={formData.businessDetails.businessType}
                  onChange={(e) => updateFormData('businessDetails', 'businessType', e.target.value)}
                  className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                    validationErrors['businessDetails.businessType'] ? 'border-error' : ''
                  }`}
                  required
                >
                  <option value="">Select business type</option>
                  <option value="proprietorship">Proprietorship</option>
                  <option value="pvt-ltd">Private Limited</option>
                  <option value="llp">LLP</option>
                  <option value="partnership">Partnership</option>
                  <option value="others">Others</option>
                </select>
                {validationErrors['businessDetails.businessType'] && (
                  <p className="text-sm text-error mt-1">{validationErrors['businessDetails.businessType']}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<Input
                label="GSTIN"
                value={formData.businessDetails.gstin}
                onChange={(e) => updateFormData('businessDetails', 'gstin', e.target.value.toUpperCase())}
                required
                placeholder="Enter GSTIN"
                style={{ textTransform: 'uppercase' }}
                error={validationErrors['businessDetails.gstin']}
              />
<Input
                label="CIN (Optional)"
                value={formData.businessDetails.cin}
                onChange={(e) => updateFormData('businessDetails', 'cin', e.target.value.toUpperCase())}
                placeholder="Enter CIN"
                style={{ textTransform: 'uppercase' }}
                error={validationErrors['businessDetails.cin']}
              />
            </div>
            <div>
<Input
                label="Registered Business Address"
                value={formData.businessDetails.address}
                onChange={(e) => updateFormData('businessDetails', 'address', e.target.value)}
                required
                placeholder="Enter complete business address"
                error={validationErrors['businessDetails.address']}
              />
            </div>
            <div className="space-y-4">
<DocumentUpload
                label="Upload GST Certificate"
                value={formData.businessDetails.gstDocument}
                onChange={(files) => updateFormData('businessDetails', 'gstDocument', files)}
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
              {validationErrors['documents.gstDocument'] && (
                <p className="text-sm text-error mt-1">{validationErrors['documents.gstDocument']}</p>
              )}
<DocumentUpload
                label="Upload Company PAN"
                value={formData.businessDetails.companyPanDocument}
                onChange={(files) => updateFormData('businessDetails', 'companyPanDocument', files)}
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
              {validationErrors['documents.companyPanDocument'] && (
                <p className="text-sm text-error mt-1">{validationErrors['documents.companyPanDocument']}</p>
              )}
<DocumentUpload
                label="Upload Business Address Proof"
                value={formData.businessDetails.addressProof}
                onChange={(files) => updateFormData('businessDetails', 'addressProof', files)}
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
              {validationErrors['documents.addressProof'] && (
                <p className="text-sm text-error mt-1">{validationErrors['documents.addressProof']}</p>
              )}
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <DocumentUpload
                label="Upload Signed Telecom Compliance Form"
                value={formData.telecomUsage.complianceForm}
                onChange={(files) => updateFormData('telecomUsage', 'complianceForm', files)}
                accept=".pdf"
                required
              />
              {validationErrors['documents.complianceForm'] && (
                <p className="text-sm text-error mt-1">{validationErrors['documents.complianceForm']}</p>
              )}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<Input
                label="Signatory Name"
                value={formData.authorizedSignatory.name}
                onChange={(e) => updateFormData('authorizedSignatory', 'name', e.target.value)}
                required
                placeholder="Enter signatory name"
                error={validationErrors['authorizedSignatory.name']}
              />
<Input
                label="Mobile Number"
                value={formData.authorizedSignatory.mobile}
                onChange={(e) => updateFormData('authorizedSignatory', 'mobile', e.target.value)}
                required
                type="tel"
                placeholder="Enter mobile number"
                error={validationErrors['authorizedSignatory.mobile']}
              />
<Input
                label="Email Address"
                value={formData.authorizedSignatory.email}
                onChange={(e) => updateFormData('authorizedSignatory', 'email', e.target.value)}
                required
                type="email"
                placeholder="Enter email address"
                error={validationErrors['authorizedSignatory.email']}
              />
<Input
                label="Designation"
                value={formData.authorizedSignatory.designation}
                onChange={(e) => updateFormData('authorizedSignatory', 'designation', e.target.value)}
                required
                placeholder="Enter designation"
                error={validationErrors['authorizedSignatory.designation']}
              />
            </div>
            <div>
<DocumentUpload
                label="Upload Authorized Signatory Letter"
                value={formData.authorizedSignatory.authorizationLetter}
                onChange={(files) => updateFormData('authorizedSignatory', 'authorizationLetter', files)}
                accept=".pdf"
                required
              />
              {validationErrors['documents.authorizationLetter'] && (
                <p className="text-sm text-error mt-1">{validationErrors['documents.authorizationLetter']}</p>
              )}
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Review Your Information</h3>
              <p className="text-gray-600 mb-4">Please review all the information before submitting.</p>
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    I accept the terms and conditions and confirm that all information provided is accurate.
                  </span>
                </label>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Form</h2>
          <p className="text-gray-600">Complete all required information for KYC verification</p>
        </div>

        <StepIndicator 
          steps={steps} 
          currentStep={currentStep} 
          className="mb-8"
        />

        <form onSubmit={(e) => e.preventDefault()}>
          {renderStepContent()}
          
          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={prevStep}
                size="lg"
              >
                Previous
              </Button>
            )}
            
            <div className="ml-auto">
              {currentStep === steps.length - 1 ? (
                <Button
                  variant="success"
                  onClick={handleSubmit}
                  disabled={!termsAccepted || !isFormValid}
                  icon="Send"
                  size="lg"
                >
                  Submit KYC
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={nextStep}
                  size="lg"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default KYCForm;