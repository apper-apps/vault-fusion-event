import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { validateKYCForm } from "@/utils/validators";
import KYCForm from "@/components/organisms/KYCForm";
import Loading from "@/components/ui/Loading";
import { kycService } from "@/services/api/kycService";

const KYCWizard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const kycType = searchParams.get('type') === 'self' ? 'self-kyc' : 'regular';

const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      
      // Validate form data before submission
      const validation = validateKYCForm(formData);
if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors);
        toast.error(`Please fix the following errors:\n${errorMessages.slice(0, 3).join('\n')}${errorMessages.length > 3 ? '\n...and more' : ''}`);
        return;
      }
      
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
      
toast.success('KYC submission successful! You will receive updates via email.', {
        duration: 4000,
        position: 'top-center',
      });
      // Redirect to dashboard after successful submission
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting KYC:', error);
      
      let errorMessage = 'Failed to submit KYC. Please try again.';
      
      if (error.message) {
        if (error.message.includes('validation')) {
          errorMessage = 'Please check all required fields and documents are properly uploaded.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('file size')) {
          errorMessage = 'One or more files exceed the maximum size limit. Please upload smaller files.';
        } else if (error.message.includes('file type')) {
          errorMessage = 'Invalid file type detected. Please upload only supported file formats.';
        } else {
          errorMessage = `Submission failed: ${error.message}`;
        }
      }
      
toast.error(errorMessage, {
        duration: 6000,
        position: 'top-center',
      });
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
          {kycType === 'self-kyc' ? 'Self-KYC Registration' : 'KYC Verification Process'}
        </h1>
      </div>
{/* KYC Form */}
      <KYCForm onSubmit={handleSubmit} kycType={kycType} />
    </motion.div>
  );
};

export default KYCWizard;