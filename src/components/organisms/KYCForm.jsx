import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import DocumentUpload from '@/components/molecules/DocumentUpload';
import StepIndicator from '@/components/molecules/StepIndicator';
import ApperIcon from '@/components/ApperIcon';

const KYCForm = ({ onSubmit, initialData = {} }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formData, setFormData] = useState({
    personalDetails: {
      fullName: '',
      mobile: '',
      email: '',
      aadhaar: '',
      pan: '',
      dateOfBirth: '',
      panDocument: []
    },
    businessDetails: {
      companyName: '',
      businessType: '',
      gstin: '',
      cin: '',
      address: '',
      gstDocument: [],
      companyPanDocument: [],
      addressProof: []
    },
    telecomUsage: {
      intendedUse: [],
      trafficType: '',
      complianceForm: []
    },
    authorizedSignatory: {
      name: '',
      mobile: '',
      email: '',
      designation: '',
      authorizationLetter: []
    },
    selfieVerification: {
      selfie: []
    },
    ...initialData
  });

  const steps = [
    { id: 'personal', title: 'Personal Details', description: 'Basic information' },
    { id: 'business', title: 'Business Details', description: 'Company information' },
    { id: 'telecom', title: 'Telecom Usage', description: 'Service requirements' },
    { id: 'signatory', title: 'Authorized Signatory', description: 'Signatory details' },
    { id: 'selfie', title: 'Selfie Verification', description: 'Identity verification' },
    { id: 'review', title: 'Review & Submit', description: 'Final review' }
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

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const renderPersonalDetails = () => (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <ApperIcon name="User" className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Full Name (as per PAN)"
            value={formData.personalDetails.fullName}
            onChange={(e) => updateFormData('personalDetails', 'fullName', e.target.value)}
            required
            placeholder="Enter your full name"
          />
          
          <Input
            label="Mobile Number"
            value={formData.personalDetails.mobile}
            onChange={(e) => updateFormData('personalDetails', 'mobile', e.target.value)}
            required
            type="tel"
            placeholder="Enter mobile number"
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
            value={formData.personalDetails.aadhaar}
            onChange={(e) => updateFormData('personalDetails', 'aadhaar', e.target.value)}
            required
            placeholder="Enter Aadhaar number"
            maxLength={12}
          />
          
          <Input
            label="PAN Number"
            value={formData.personalDetails.pan}
            onChange={(e) => updateFormData('personalDetails', 'pan', e.target.value)}
            required
            placeholder="Enter PAN number"
            style={{ textTransform: 'uppercase' }}
          />
          
          <Input
            label="Date of Birth"
            value={formData.personalDetails.dateOfBirth}
            onChange={(e) => updateFormData('personalDetails', 'dateOfBirth', e.target.value)}
            required
            type="date"
          />
        </div>

        <DocumentUpload
          label="Upload PAN Card"
          value={formData.personalDetails.panDocument}
          onChange={(files) => updateFormData('personalDetails', 'panDocument', files)}
          accept=".pdf,.jpg,.jpeg,.png"
          required
        />
      </div>
    </Card>
  );

  const renderBusinessDetails = () => (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <ApperIcon name="Building" className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Business Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Company Name (As per GST)"
            value={formData.businessDetails.companyName}
            onChange={(e) => updateFormData('businessDetails', 'companyName', e.target.value)}
            required
            placeholder="Enter company name"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <option value="llp">LLP</option>
              <option value="partnership">Partnership</option>
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
        </div>

        <Input
          label="Registered Business Address"
          value={formData.businessDetails.address}
          onChange={(e) => updateFormData('businessDetails', 'address', e.target.value)}
          required
          placeholder="Enter complete business address"
        />

        <div className="space-y-4">
          <DocumentUpload
            label="Upload GST Certificate"
            value={formData.businessDetails.gstDocument}
            onChange={(files) => updateFormData('businessDetails', 'gstDocument', files)}
            accept=".pdf,.jpg,.jpeg,.png"
            required
          />
          
          <DocumentUpload
            label="Upload Company PAN"
            value={formData.businessDetails.companyPanDocument}
            onChange={(files) => updateFormData('businessDetails', 'companyPanDocument', files)}
            accept=".pdf,.jpg,.jpeg,.png"
            required
          />
          
          <DocumentUpload
            label="Upload Business Address Proof"
            value={formData.businessDetails.addressProof}
            onChange={(files) => updateFormData('businessDetails', 'addressProof', files)}
            accept=".pdf,.jpg,.jpeg,.png"
            required
          />
        </div>
      </div>
    </Card>
  );

  const renderTelecomUsage = () => (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <ApperIcon name="Phone" className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Telecom Usage Declaration</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Intended Use <span className="text-error">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['Inbound IVR', 'Outbound Calls', 'Missed Call Service', 'Bulk SMS', 'Voice Broadcasting', 'Call Center'].map((option) => (
              <label key={option} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.telecomUsage.intendedUse.includes(option)}
                  onChange={(e) => {
                    const currentUse = formData.telecomUsage.intendedUse;
                    const updatedUse = e.target.checked
                      ? [...currentUse, option]
                      : currentUse.filter(item => item !== option);
                    updateFormData('telecomUsage', 'intendedUse', updatedUse);
                  }}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Traffic Type <span className="text-error">*</span>
          </label>
          <div className="flex space-x-6">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="trafficType"
                value="transactional"
                checked={formData.telecomUsage.trafficType === 'transactional'}
                onChange={(e) => updateFormData('telecomUsage', 'trafficType', e.target.value)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="text-sm text-gray-900">Transactional</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="trafficType"
                value="promotional"
                checked={formData.telecomUsage.trafficType === 'promotional'}
                onChange={(e) => updateFormData('telecomUsage', 'trafficType', e.target.value)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span className="text-sm text-gray-900">Promotional</span>
            </label>
          </div>
        </div>

        <DocumentUpload
          label="Upload Signed Telecom Compliance Form"
          value={formData.telecomUsage.complianceForm}
          onChange={(files) => updateFormData('telecomUsage', 'complianceForm', files)}
          accept=".pdf"
          required
        />
      </div>
    </Card>
  );

  const renderAuthorizedSignatory = () => (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <ApperIcon name="UserCheck" className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Authorized Signatory Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Signatory Name"
            value={formData.authorizedSignatory.name}
            onChange={(e) => updateFormData('authorizedSignatory', 'name', e.target.value)}
            required
            placeholder="Enter signatory name"
          />
          
          <Input
            label="Mobile Number"
            value={formData.authorizedSignatory.mobile}
            onChange={(e) => updateFormData('authorizedSignatory', 'mobile', e.target.value)}
            required
            type="tel"
            placeholder="Enter mobile number"
          />
          
          <Input
            label="Email Address"
            value={formData.authorizedSignatory.email}
            onChange={(e) => updateFormData('authorizedSignatory', 'email', e.target.value)}
            required
            type="email"
            placeholder="Enter email address"
          />
          
          <Input
            label="Designation"
            value={formData.authorizedSignatory.designation}
            onChange={(e) => updateFormData('authorizedSignatory', 'designation', e.target.value)}
            required
            placeholder="Enter designation"
          />
        </div>

        <DocumentUpload
          label="Upload Authorized Signatory Letter"
          value={formData.authorizedSignatory.authorizationLetter}
          onChange={(files) => updateFormData('authorizedSignatory', 'authorizationLetter', files)}
          accept=".pdf"
          required
        />
      </div>
    </Card>
  );

  const renderSelfieVerification = () => (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <ApperIcon name="Camera" className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Live Selfie Verification</h3>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ApperIcon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Selfie Verification Guidelines</h4>
              <ul className="mt-2 text-sm text-blue-800 space-y-1">
                <li>• Take a clear photo in good lighting</li>
                <li>• Face should be clearly visible and centered</li>
                <li>• Remove glasses or face coverings if possible</li>
                <li>• This will be matched with your Aadhaar photo</li>
              </ul>
            </div>
          </div>
        </div>

        <DocumentUpload
          label="Upload Recent Selfie"
          value={formData.selfieVerification.selfie}
          onChange={(files) => updateFormData('selfieVerification', 'selfie', files)}
          accept=".jpg,.jpeg,.png"
          required
        />
      </div>
    </Card>
  );

  const renderReview = () => (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <ApperIcon name="CheckCircle" className="h-6 w-6 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Review & Submit</h3>
        </div>

        <div className="space-y-6">
          {/* Personal Details Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Personal Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-600">Name:</span> {formData.personalDetails.fullName}</div>
              <div><span className="text-gray-600">Mobile:</span> {formData.personalDetails.mobile}</div>
              <div><span className="text-gray-600">Email:</span> {formData.personalDetails.email}</div>
              <div><span className="text-gray-600">PAN:</span> {formData.personalDetails.pan}</div>
            </div>
          </div>

          {/* Business Details Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Business Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-600">Company:</span> {formData.businessDetails.companyName}</div>
              <div><span className="text-gray-600">Type:</span> {formData.businessDetails.businessType}</div>
              <div><span className="text-gray-600">GSTIN:</span> {formData.businessDetails.gstin}</div>
            </div>
          </div>

          {/* Terms and Conditions */}
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                required
              />
              <span className="text-sm text-gray-700">
                I confirm that all the information provided is true and accurate to the best of my knowledge. 
                I understand that providing false information may result in rejection of my application.
              </span>
            </label>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderPersonalDetails();
      case 1: return renderBusinessDetails();
      case 2: return renderTelecomUsage();
      case 3: return renderAuthorizedSignatory();
      case 4: return renderSelfieVerification();
      case 5: return renderReview();
      default: return renderPersonalDetails();
    }
  };

  return (
    <div className="space-y-8">
      <StepIndicator 
        steps={steps} 
        currentStep={currentStep} 
        onStepClick={setCurrentStep}
      />

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderStepContent()}
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={prevStep}
          disabled={currentStep === 0}
          icon="ChevronLeft"
        >
          Previous
        </Button>

        {currentStep === steps.length - 1 ? (
<Button
            variant="success"
            onClick={handleSubmit}
            disabled={!termsAccepted}
            icon="Send"
            size="lg"
          >
            Submit KYC
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={nextStep}
            icon="ChevronRight"
            iconPosition="right"
          >
            Next Step
          </Button>
        )}
      </div>
    </div>
  );
};

export default KYCForm;