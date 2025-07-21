import { useState, useEffect } from 'react';
import { kycService } from '@/services/api/kycService';

export const useKYCData = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await kycService.getAll();
      setSubmissions(data);
    } catch (err) {
      setError('Failed to load KYC submissions. Please try again.');
      console.error('Error loading submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const refetch = () => {
    loadSubmissions();
  };

const createSelfKYC = async (selfKYCData) => {
    try {
      const created = await kycService.registerSelfKYC(selfKYCData);
      setSubmissions(prev => [...prev, created]);
      return created;
    } catch (err) {
      const errorMessage = err.message.includes('validation')
        ? 'The provided Self-KYC data failed validation. Please check all required fields.'
        : `Failed to create Self-KYC submission: ${err.message}`;
      throw new Error(errorMessage);
    }
  };

  const updateSubmission = async (id, updatedData) => {
    try {
      const updated = await kycService.update(id, updatedData);
      setSubmissions(prev => 
        prev.map(submission => 
          submission.Id === id ? updated : submission
        )
      );
      return updated;
    } catch (err) {
      const errorMessage = err.message.includes('not found') 
        ? `KYC submission with ID ${id} was not found. It may have been deleted.`
        : err.message.includes('validation')
        ? 'The provided data failed validation. Please check all required fields.'
        : `Failed to update submission: ${err.message}`;
      throw new Error(errorMessage);
    }
  };

const approveSubmission = async (id, reviewedBy, comment = '') => {
    try {
      return await updateSubmission(id, {
        status: 'approved',
        reviewedBy,
        reviewedAt: new Date().toISOString(),
        reviewComment: comment
      });
    } catch (err) {
      throw new Error(`Failed to approve submission: ${err.message}`);
    }
  };

  const rejectSubmission = async (id, reviewedBy, reason) => {
    try {
      if (!reason || reason.trim() === '') {
        throw new Error('Rejection reason is required');
      }
      return await updateSubmission(id, {
        status: 'rejected',
        reviewedBy,
        reviewedAt: new Date().toISOString(),
        rejectionReason: reason
      });
    } catch (err) {
      throw new Error(`Failed to reject submission: ${err.message}`);
    }
  };

  const getStats = () => {
    return submissions.reduce((acc, submission) => {
      acc.total++;
      acc[submission.status] = (acc[submission.status] || 0) + 1;
      return acc;
    }, { total: 0, pending: 0, approved: 0, rejected: 0 });
  };

return {
    submissions,
    loading,
    error,
    refetch,
    createSelfKYC,
    updateSubmission,
    approveSubmission,
    rejectSubmission,
    getStats
  };
};