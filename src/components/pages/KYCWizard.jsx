import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import KYCForm from '@/components/organisms/KYCForm';
import Loading from '@/components/ui/Loading';
import { kycService } from '@/services/api/kycService';

const KYCWizard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      
      // Prepare submission data with proper document structure
      const submissionData = {
        userId: 'user123', // Mock user ID
        status: 'pending',
        personalDetails: formData.personalDetails,
        businessDetails: formData.businessDetails,
        telecomUsage: formData.telecomUsage,
        authorizedSignatory: formData.authorizedSignatory,
        selfieVerification: formData.selfieVerification,
        documents: [
          ...(formData.personalDetails.panDocument || []),
          ...(formData.businessDetails.gstDocument || []),
          ...(formData.businessDetails.companyPanDocument || []),
          ...(formData.businessDetails.addressProof || []),
          ...(formData.telecomUsage.complianceForm || []),
          ...(formData.authorizedSignatory.authorizationLetter || []),
          ...(formData.selfieVerification.selfie || [])
        ],
        submittedAt: new Date().toISOString(),
        reviewedBy: null,
        reviewedAt: null
      };

      await kycService.create(submissionData);
      
      toast.success('KYC submission successful! You will receive updates via email.');
      
      // Redirect to dashboard after successful submission
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
} catch (error) {
      console.error('Error submitting KYC:', error);
      const errorMessage = error.message && error.message.includes('validation') 
        ? 'Please check all required fields and documents are properly uploaded.'
        : 'Failed to submit KYC. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loading />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-4">
          KYC Verification Process
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Complete your Know Your Customer (KYC) verification to access all CallerDesk services. 
          This process ensures compliance with telecom regulations and helps us provide better service.
        </p>
      </div>

      {/* Progress Information */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white rounded-xl shadow-elevation-1">
            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Secure & Encrypted Process</h3>
            <p className="text-gray-600">All your information is protected with bank-grade security</p>
          </div>
        </div>
      </div>

      {/* KYC Form */}
      <KYCForm onSubmit={handleSubmit} />
    </motion.div>
  );
};

export default KYCWizard;