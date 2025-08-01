import mockData from "@/services/mockData/kycSubmissions.json";
import React from "react";
import Error from "@/components/ui/Error";

// Enhanced API delay with realistic network simulation
const delay = (ms) => new Promise(resolve => {
  // Add random jitter to simulate real network conditions
  const jitter = Math.random() * 100;
  setTimeout(resolve, ms + jitter);
});

// Clone data to prevent mutations with error handling
const cloneData = (data) => {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error('Data cloning failed:', error);
    return Array.isArray(data) ? [] : {};
  }
};

// Request deduplication cache
const requestCache = new Map();
const CACHE_DURATION = 5000; // 5 seconds

// Enhanced error messages
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  VALIDATION_ERROR: 'Please check the provided information and try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SERVER_ERROR: 'Service temporarily unavailable. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  RATE_LIMIT: 'Too many requests. Please wait before trying again.'
};

class KYCService {
  constructor() {
    this.data = cloneData(mockData);
    this.documentIdCounter = 10000; // Start document IDs from 10000
    this.requestQueue = new Map(); // For request deduplication
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 5000
    };
  }

  // Enhanced request wrapper with retry logic
  async executeWithRetry(operation, retries = this.retryConfig.maxRetries) {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        const delayMs = Math.min(
          this.retryConfig.baseDelay * (this.retryConfig.maxRetries - retries + 1),
          this.retryConfig.maxDelay
        );
        
        await delay(delayMs);
        return this.executeWithRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  // Check if error is retryable
  isRetryableError(error) {
    const retryableErrors = ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR'];
    return retryableErrors.includes(error.code) || error.status >= 500;
  }

  // Enhanced cache key generation
  generateCacheKey(method, params) {
    return `${method}_${JSON.stringify(params)}`;
  }

  // Request deduplication
  async deduplicateRequest(cacheKey, operation) {
    // Check if request is already in progress
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey);
    }

    // Check cache
    if (requestCache.has(cacheKey)) {
      const cached = requestCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
      requestCache.delete(cacheKey);
    }

    // Execute request
    const promise = this.executeWithRetry(operation);
    this.requestQueue.set(cacheKey, promise);

    try {
      const result = await promise;
      
      // Cache successful results
      requestCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } finally {
      this.requestQueue.delete(cacheKey);
    }
  }

  // Generate next document ID
  getNextDocumentId() {
    return ++this.documentIdCounter;
  }

  async getAll() {
    await delay(300);
    return cloneData(this.data);
  }

  async getById(id) {
    await delay(200);
    const item = this.data.find(submission => submission.Id === id);
    if (!item) {
      throw new Error(`KYC submission with Id ${id} not found`);
    }
    return cloneData(item);
  }

async create(submissionData) {
    const cacheKey = this.generateCacheKey('create', submissionData);
    
    return this.deduplicateRequest(cacheKey, async () => {
      await delay(300); // Faster response time
      
      // Enhanced validation with detailed, actionable error messages
      const validationErrors = [];
      
      if (!submissionData.userId) {
        validationErrors.push('User session expired. Please refresh the page and try again.');
      }
      
      if (!submissionData.personalDetails) {
        validationErrors.push('Personal details are required. Please complete the first step.');
      } else {
        if (!submissionData.personalDetails.fullName || submissionData.personalDetails.fullName.trim().length < 2) {
          validationErrors.push('Please enter your complete full name (minimum 2 characters)');
        }
        if (!submissionData.personalDetails.mobile) {
          validationErrors.push('Mobile number is required for verification and updates');
        } else if (!/^[6-9]\d{9}$/.test(submissionData.personalDetails.mobile.replace(/\D/g, ''))) {
          validationErrors.push('Please enter a valid 10-digit Indian mobile number');
        }
        if (!submissionData.personalDetails.email) {
          validationErrors.push('Email address is required for application updates');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submissionData.personalDetails.email)) {
          validationErrors.push('Please enter a valid email address');
        }
      }
      
      if (!submissionData.businessDetails) {
        validationErrors.push('Business details are required. Please complete the second step.');
      } else {
        if (!submissionData.businessDetails.companyName) {
          validationErrors.push('Company name is required as per GST registration');
        }
        if (!submissionData.businessDetails.gstin) {
          validationErrors.push('GSTIN is mandatory for business verification');
        }
      }
      
      if (!submissionData.documents || submissionData.documents.length === 0) {
        validationErrors.push('At least one document upload is required for verification');
      }
      
      if (validationErrors.length > 0) {
        const error = new Error(validationErrors.length === 1 ? validationErrors[0] : `Please fix ${validationErrors.length} issues:\n• ${validationErrors.join('\n• ')}`);
        error.code = 'VALIDATION_ERROR';
        error.details = validationErrors;
        throw error;
      }
      
      // Simulate potential network issues with lower probability
      if (Math.random() < 0.03) { // Reduced from 0.1 to 0.03
        const error = new Error('Connection timeout. Please check your internet and try again.');
        error.code = 'NETWORK_ERROR';
        throw error;
      }
      
      // Find highest existing Id and add 1
      const maxId = this.data.reduce((max, item) => Math.max(max, item.Id), 0);
      const newSubmission = {
        ...submissionData,
        Id: maxId + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submissionId: `KYC${Date.now()}${Math.floor(Math.random() * 1000)}`,
        status: submissionData.status || 'pending',
        processingStage: 'document_review',
        estimatedCompletionTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days
      };
      
      this.data.push(newSubmission);
      return cloneData(newSubmission);
    });
  }

async update(id, updatedData) {
    const cacheKey = this.generateCacheKey('update', { id, updatedData });
    
    return this.deduplicateRequest(cacheKey, async () => {
      await delay(250); // Faster response
      
      // Enhanced ID validation with clearer messages
      if (!Number.isInteger(id) || id <= 0) {
        const error = new Error('Invalid submission reference. Please refresh the page and try again.');
        error.code = 'VALIDATION_ERROR';
        throw error;
      }
      
      const index = this.data.findIndex(submission => submission.Id === id);
      if (index === -1) {
        const error = new Error(`Submission not found. This application may have been removed or archived.`);
        error.code = 'NOT_FOUND';
        throw error;
      }
      
      const currentSubmission = this.data[index];
      
      // Enhanced status transition validation with user-friendly messages
      if (updatedData.status) {
        const validStatuses = ['pending', 'approved', 'rejected', 'under-review', 'pending-verification'];
        if (!validStatuses.includes(updatedData.status)) {
          const error = new Error(`Invalid status update. Please contact support if this error persists.`);
          error.code = 'VALIDATION_ERROR';
          throw error;
        }
        
        // Check business rules for status transitions
        const statusTransitions = {
          'pending': ['under-review', 'rejected'],
          'under-review': ['approved', 'rejected', 'pending'],
          'approved': [], // Final state
          'rejected': ['pending'], // Allow resubmission
          'pending-verification': ['pending', 'under-review']
        };
        
        const allowedTransitions = statusTransitions[currentSubmission.status] || [];
        const isValidTransition = allowedTransitions.includes(updatedData.status) || 
                                currentSubmission.status === updatedData.status;
        
        if (!isValidTransition && currentSubmission.status !== 'pending') {
          let friendlyMessage = 'This application cannot be updated at this time.';
          
          if (currentSubmission.status === 'approved') {
            friendlyMessage = 'This application has already been approved and cannot be modified.';
          } else if (currentSubmission.status === 'rejected' && updatedData.status !== 'pending') {
            friendlyMessage = 'Rejected applications can only be resubmitted for review.';
          }
          
          const error = new Error(friendlyMessage);
          error.code = 'INVALID_TRANSITION';
          throw error;
        }
      }
      
      // Track update history with better structure
      const updateHistory = currentSubmission.updateHistory || [];
      updateHistory.push({
        timestamp: new Date().toISOString(),
        changes: updatedData,
        previousStatus: currentSubmission.status,
        changeType: updatedData.status ? 'status_change' : 'data_update'
      });
      
      // Add estimated completion time for status changes
      let estimatedCompletionTime = currentSubmission.estimatedCompletionTime;
      if (updatedData.status === 'under-review') {
        estimatedCompletionTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 1 day
      } else if (updatedData.status === 'pending-verification') {
        estimatedCompletionTime = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(); // 12 hours
      }
      
      this.data[index] = { 
        ...currentSubmission, 
        ...updatedData, 
        updatedAt: new Date().toISOString(),
        updateHistory,
        version: (currentSubmission.version || 1) + 1,
        estimatedCompletionTime
      };
      
      return cloneData(this.data[index]);
    });
  }

  async delete(id) {
    await delay(300);
    
    const index = this.data.findIndex(submission => submission.Id === id);
    if (index === -1) {
      throw new Error(`KYC submission with Id ${id} not found`);
    }
    
    const deletedItem = this.data.splice(index, 1)[0];
    return cloneData(deletedItem);
  }

  // Additional methods for KYC-specific operations
  async getByStatus(status) {
    await delay(200);
    const filtered = this.data.filter(submission => submission.status === status);
    return cloneData(filtered);
  }

  async getByUserId(userId) {
    await delay(200);
    const filtered = this.data.filter(submission => submission.userId === userId);
    return cloneData(filtered);
  }

async approve(id, reviewedBy, comment = '') {
    if (!reviewedBy || reviewedBy.trim() === '') {
      throw new Error('Admin approval requires reviewer identification for audit trail');
    }
    
    return this.update(id, {
      status: 'approved',
      reviewedBy: reviewedBy.trim(),
      reviewedAt: new Date().toISOString(),
      reviewComment: comment.trim() || 'Application approved - all requirements met',
      approvalDate: new Date().toISOString(),
      processingStage: 'completed'
    });
  }
async reject(id, reviewedBy, reason) {
    if (!reviewedBy || reviewedBy.trim() === '') {
      throw new Error('Admin rejection requires reviewer identification for audit trail');
    }
    
    if (!reason || reason.trim() === '' || reason.trim().length < 10) {
      throw new Error('Detailed rejection reason is required (minimum 10 characters) to help applicant understand next steps');
    }
    
    return this.update(id, {
      status: 'rejected',
      reviewedBy: reviewedBy.trim(),
      reviewedAt: new Date().toISOString(),
      rejectionReason: reason.trim(),
      rejectionDate: new Date().toISOString(),
      processingStage: 'rejected',
      canResubmit: true,
      resubmissionGuidelines: 'Please address the issues mentioned in rejection reason and resubmit your application'
    });
  }

  async getStats() {
    await delay(200);
    const stats = this.data.reduce((acc, submission) => {
      acc.total++;
      acc[submission.status] = (acc[submission.status] || 0) + 1;
      return acc;
    }, { total: 0 });
return stats;
  }

  // Self-KYC specific operations
async registerSelfKYC(registrationData) {
    await delay(300); // Faster processing
    
    // Enhanced validation for Self-KYC with specific error messages
    const errors = [];
    
    if (!registrationData.primaryMobile) {
      errors.push('Your primary mobile number is required for account verification');
    } else {
      const cleanPrimary = registrationData.primaryMobile.replace(/\D/g, '');
      if (cleanPrimary.length !== 10 || !/^[6789]/.test(cleanPrimary)) {
        errors.push('Primary mobile must be a valid 10-digit Indian number starting with 6, 7, 8, or 9');
      }
    }
    
    if (!registrationData.alternateMobile) {
      errors.push('Alternate mobile number is required for Self-KYC verification as per DoT guidelines');
    } else {
      const cleanAlternate = registrationData.alternateMobile.replace(/\D/g, '');
      if (cleanAlternate.length !== 10 || !/^[6789]/.test(cleanAlternate)) {
        errors.push('Alternate mobile must be a valid 10-digit Indian number starting with 6, 7, 8, or 9');
      }
      
      const cleanPrimary = registrationData.primaryMobile?.replace(/\D/g, '') || '';
      if (cleanPrimary === cleanAlternate) {
        errors.push('Alternate mobile number must be different from your primary mobile number');
      }
    }
    
    if (!registrationData.contactName || registrationData.contactName.trim().length < 2) {
      errors.push('Please provide the full name of the alternate contact person (minimum 2 characters)');
    }
    
    if (!registrationData.relationship) {
      errors.push('Please specify your relationship with the alternate contact person');
    }
    
    if (errors.length > 0) {
      const error = new Error(errors.length === 1 ? errors[0] : `Please fix the following:\n• ${errors.join('\n• ')}`);
      error.code = 'VALIDATION_ERROR';
      error.details = errors;
      throw error;
    }
    
    // Find highest existing Id and add 1
    const maxId = this.data.reduce((max, item) => Math.max(max, item.Id), 0);
    const newRegistration = {
      ...registrationData,
      Id: maxId + 1,
      type: 'self-kyc',
      status: 'pending-verification',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      otpVerified: false,
      processingStage: 'mobile_verification',
      estimatedCompletionTime: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
    };
    
    this.data.push(newRegistration);
    return cloneData(newRegistration);
  }

async sendOTP(mobile, type = 'registration') {
    const cacheKey = this.generateCacheKey('sendOTP', { mobile, type });
    
    return this.deduplicateRequest(cacheKey, async () => {
      await delay(150); // Faster OTP delivery
      
      // Enhanced mobile validation with specific error messages
      const cleanMobile = mobile.replace(/\D/g, '');
      
      if (!cleanMobile || cleanMobile.length !== 10) {
        const error = new Error('Please enter exactly 10 digits for your mobile number (without +91 or spaces)');
        error.code = 'VALIDATION_ERROR';
        throw error;
      }
      
      if (!/^[6789]/.test(cleanMobile)) {
        const error = new Error('Indian mobile numbers must start with 6, 7, 8, or 9');
        error.code = 'VALIDATION_ERROR';
        throw error;
      }
      
      // Rate limiting check with better messaging
      const rateLimitKey = `otp_${cleanMobile}`;
      const lastOTPTime = this.rateLimiter?.get(rateLimitKey);
      const cooldownPeriod = 45000; // Reduced to 45 seconds for better UX
      
      if (lastOTPTime && Date.now() - lastOTPTime < cooldownPeriod) {
        const remainingTime = Math.ceil((cooldownPeriod - (Date.now() - lastOTPTime)) / 1000);
        const error = new Error(`Please wait ${remainingTime} seconds before requesting another OTP to prevent spam`);
        error.code = 'RATE_LIMIT';
        error.remainingTime = remainingTime;
        throw error;
      }
      
      // Generate more secure OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP with enhanced metadata
      this.otpStorage = this.otpStorage || {};
      this.rateLimiter = this.rateLimiter || new Map();
      
      // Clean up expired OTPs
      this.cleanupExpiredOTPs();
      
      this.otpStorage[cleanMobile] = {
        otp,
        type,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
        attempts: 0,
        generatedAt: Date.now(),
        lastAttemptAt: null,
        maxAttempts: 3,
        mobile: cleanMobile
      };
      
      this.rateLimiter.set(rateLimitKey, Date.now());
      
      // Simulate network failure with very low probability
      if (Math.random() < 0.01) {
        const error = new Error('Network connection issue. Please check your internet and try again.');
        error.code = 'NETWORK_ERROR';
        throw error;
      }
      
      const maskedMobile = `${cleanMobile.slice(0, 2)}***${cleanMobile.slice(-3)}`;
      
      return {
        success: true,
        message: `📱 OTP sent to ${maskedMobile}. It will arrive within 30 seconds.`,
        expiresIn: 300, // 5 minutes in seconds
        canResendIn: 45, // 45 seconds
        maskedMobile,
        // In development, return OTP for testing
        debugOTP: otp
      };
    });
  }

  // Cleanup expired OTPs to prevent memory leaks
  cleanupExpiredOTPs() {
    if (!this.otpStorage) return;
    
    const now = Date.now();
    Object.keys(this.otpStorage).forEach(mobile => {
      if (this.otpStorage[mobile].expiresAt < now) {
        delete this.otpStorage[mobile];
      }
    });
  }

async verifyOTP(mobile, enteredOTP) {
    const cacheKey = this.generateCacheKey('verifyOTP', { mobile, enteredOTP });
    
    return this.executeWithRetry(async () => {
      await delay(200); // Faster verification
      
      // Enhanced OTP validation with specific guidance
      if (!enteredOTP) {
        const error = new Error('Please enter the OTP you received via SMS');
        error.code = 'VALIDATION_ERROR';
        throw error;
      }
      
      const cleanOTP = enteredOTP.replace(/\D/g, '');
      if (cleanOTP.length !== 6) {
        const error = new Error(`Please enter all 6 digits of the OTP (you entered ${cleanOTP.length} digit${cleanOTP.length !== 1 ? 's' : ''})`);
        error.code = 'VALIDATION_ERROR';
        throw error;
      }
      
      const cleanMobile = mobile.replace(/\D/g, '');
      const otpData = this.otpStorage?.[cleanMobile];
      
      if (!otpData) {
        const error = new Error('No OTP session found. Please request a new OTP to continue.');
        error.code = 'OTP_NOT_FOUND';
        throw error;
      }
      
      // Check expiration with time remaining
      const timeRemaining = otpData.expiresAt - Date.now();
      if (timeRemaining <= 0) {
        delete this.otpStorage[cleanMobile];
        const error = new Error('Your OTP has expired. Please click "Resend OTP" to get a new verification code.');
        error.code = 'OTP_EXPIRED';
        throw error;
      }
      
      // Update attempt tracking
      otpData.attempts++;
      otpData.lastAttemptAt = Date.now();
      
      // Check max attempts with clear guidance
      if (otpData.attempts > otpData.maxAttempts) {
        delete this.otpStorage[cleanMobile];
        const error = new Error('Too many incorrect attempts for security. Please request a new OTP to continue.');
        error.code = 'MAX_ATTEMPTS_EXCEEDED';
        throw error;
      }
      
      // Verify OTP with helpful feedback
      if (otpData.otp !== cleanOTP) {
        const remainingAttempts = otpData.maxAttempts - otpData.attempts;
        const minutesRemaining = Math.ceil(timeRemaining / 60000);
        
        let message = `Incorrect OTP. Please check your SMS and try again.`;
        if (remainingAttempts === 1) {
          message += ` This is your last attempt before needing to request a new OTP.`;
        } else {
          message += ` ${remainingAttempts} attempts remaining.`;
        }
        message += ` (OTP expires in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''})`;
        
        const error = new Error(message);
        error.code = 'INVALID_OTP';
        error.remainingAttempts = remainingAttempts;
        error.timeRemaining = minutesRemaining;
        throw error;
      }
      
      // OTP verified successfully
      const verificationTime = Math.round((Date.now() - otpData.generatedAt) / 1000);
      const verificationResult = {
        mobile: cleanMobile,
        type: otpData.type,
        verifiedAt: new Date().toISOString(),
        timeToVerify: verificationTime
      };
      
      delete this.otpStorage[cleanMobile];
      
      return {
        success: true,
        message: `✅ Mobile number verified successfully in ${verificationTime}s!`,
        verificationDetails: verificationResult
      };
    });
  }

  async updateSelfKYCStatus(id, status, otpVerified = false) {
    await delay(200);
    
    const index = this.data.findIndex(item => item.Id === id);
    if (index === -1) {
      throw new Error(`Self-KYC registration with Id ${id} not found`);
    }
    
    this.data[index] = {
      ...this.data[index],
      status,
      otpVerified,
      updatedAt: new Date().toISOString()
    };
    
return cloneData(this.data[index]);
  }

  // e-KYC specific operations
  async initiateEKYC(aadhaarNumber) {
    await delay(500);
    
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      throw new Error('Invalid Aadhaar number');
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    this.otpStorage = this.otpStorage || {};
    this.otpStorage[aadhaarNumber] = {
      otp,
      type: 'e-kyc',
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0
    };
    
    return {
      success: true,
      message: 'OTP sent to registered mobile number',
      debugOTP: otp
    };
  }

async verifyEKYCOTP(aadhaarNumber, enteredOTP) {
    const cacheKey = this.generateCacheKey('verifyEKYCOTP', { aadhaarNumber, enteredOTP });
    
    return this.executeWithRetry(async () => {
      await delay(800);
      
      // Enhanced Aadhaar validation
      if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber.replace(/\s/g, ''))) {
        const error = new Error('Invalid Aadhaar number format. Please enter a valid 12-digit Aadhaar number.');
        error.code = 'VALIDATION_ERROR';
        throw error;
      }
      
      if (!enteredOTP || !/^\d{6}$/.test(enteredOTP)) {
        const error = new Error('Please enter a valid 6-digit OTP.');
        error.code = 'VALIDATION_ERROR';
        throw error;
      }
      
      const otpData = this.otpStorage?.[aadhaarNumber];
      
      if (!otpData) {
        const error = new Error('No OTP found for this Aadhaar number. Please request a new OTP.');
        error.code = 'OTP_NOT_FOUND';
        throw error;
      }
      
      if (Date.now() > otpData.expiresAt) {
        delete this.otpStorage[aadhaarNumber];
        const error = new Error('OTP has expired. Please request a new OTP.');
        error.code = 'OTP_EXPIRED';
        throw error;
      }
      
      otpData.attempts++;
      
      if (otpData.attempts > 3) {
        delete this.otpStorage[aadhaarNumber];
        const error = new Error('Maximum verification attempts exceeded. Please request a new OTP.');
        error.code = 'MAX_ATTEMPTS_EXCEEDED';
        throw error;
      }
      
      if (otpData.otp !== enteredOTP) {
        const remainingAttempts = 3 - otpData.attempts;
        const error = new Error(`Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`);
        error.code = 'INVALID_OTP';
        error.remainingAttempts = remainingAttempts;
        throw error;
      }
      
      // Simulate UIDAI verification delay
      await delay(1200);
      
      // Generate more realistic mock e-KYC data
      const maskedAadhaar = aadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, '****-****-$3');
      delete this.otpStorage[aadhaarNumber];
      
      // Simulate different user profiles based on Aadhaar number
      const profiles = [
        {
          name: 'Rahul Kumar',
          dateOfBirth: '1990-05-15',
          gender: 'Male',
          address: 'House No. 123, Sector 15, Noida, Uttar Pradesh - 201301',
          mobile: '9876543210',
          email: 'rahul.kumar@example.com',
          photo: '/api/placeholder/150/200' // Mock photo URL
        },
        {
          name: 'Priya Sharma',
          dateOfBirth: '1985-08-22',
          gender: 'Female',
          address: 'Flat 4B, Maple Apartments, Bandra West, Mumbai, Maharashtra - 400050',
          mobile: '9123456789',
          email: 'priya.sharma@example.com',
          photo: '/api/placeholder/150/200'
        },
        {
          name: 'Amit Patel',
          dateOfBirth: '1992-12-10',
          gender: 'Male',
          address: '456 Galaxy Heights, Satellite, Ahmedabad, Gujarat - 380015',
          mobile: '9898765432',
          email: 'amit.patel@example.com',
          photo: '/api/placeholder/150/200'
        }
      ];
      
      const selectedProfile = profiles[parseInt(aadhaarNumber.slice(-1)) % profiles.length];
      
      const ekycData = {
        ...selectedProfile,
        aadhaarNumber: maskedAadhaar,
        verifiedAt: new Date().toISOString(),
        verificationId: `EKYC${Date.now()}`,
        verificationSource: 'UIDAI',
        dataQuality: {
          nameMatch: 98,
          addressMatch: 95,
          photoMatch: 92
        }
      };
      
      return {
        success: true,
        message: 'e-KYC verification completed successfully',
        kycData: ekycData,
        verificationMetrics: {
          responseTime: '2.3s',
          dataAccuracy: '95%',
          securityScore: 'High'
        }
      };
    });
  }

  // OTP-based conversion operations
  async checkConversionEligibility(mobileNumber) {
    await delay(400);
    
    const mockEligibility = {
      eligible: true,
      currentPlan: 'Prepaid Unlimited',
      accountAge: 180,
      outstandingAmount: 0
    };
    
    return mockEligibility;
  }

  async sendConversionOTP(mobileNumber) {
    await delay(300);
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    this.otpStorage = this.otpStorage || {};
    this.otpStorage[mobileNumber] = {
      otp,
      type: 'conversion',
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    };
    
    return {
      success: true,
      message: `OTP sent to ${mobileNumber}`,
      debugOTP: otp
return {
      success: true,
      message: `OTP sent to ${mobileNumber}`,
      debugOTP: otp
    };
  }

  // Document verification operations
  async analyzeDocument(documentId) {
    await delay(800); // Realistic AI processing time
    
    // Simulate comprehensive document analysis
    const analysisResults = {
      documentId,
      analyzedAt: new Date().toISOString(),
      quality: Math.floor(Math.random() * 30) + 70, // 70-100%
      fraudScore: Math.floor(Math.random() * 100), // 0-100 (lower is better)
      textConfidence: Math.floor(Math.random() * 20) + 80, // 80-100%
      
      // Simulated OCR extraction
      extractedText: this.generateMockOCRText(documentId),
      
      // Key fields extraction (varies by document type)
      keyFields: this.extractKeyFields(documentId),
      
      // Technical metadata
      metadata: {
        imageResolution: '1920x1080',
        colorSpace: 'RGB',
        compression: 'JPEG',
        fileIntegrity: 'Valid',
        lastModified: new Date().toISOString()
      },
      
      // Fraud indicators
      fraudIndicators: this.generateFraudIndicators(),
      
      // Quality metrics
      qualityMetrics: {
        sharpness: Math.floor(Math.random() * 20) + 80,
        brightness: Math.floor(Math.random() * 30) + 70,
        contrast: Math.floor(Math.random() * 25) + 75,
        noise: Math.floor(Math.random() * 30) + 10
      }
    };
    
    return analysisResults;
  }

  generateMockOCRText(documentId) {
    const ocrSamples = [
      "PERMANENT ACCOUNT NUMBER CARD\nName: RAJESH KUMAR SHARMA\nFathers Name: KUMAR SHARMA\nDate of Birth: 15/07/1985\nPAN: ABCDE1234F",
      "GST CERTIFICATE\nGSTIN: 29ABCDE1234F1Z5\nTrade Name: TECHCORP SOLUTIONS PVT LTD\nLegal Name: TECHCORP SOLUTIONS PRIVATE LIMITED\nDate of Registration: 01/04/2020",
      "AADHAAR\nName: PRIYA PATEL\nDate of Birth: 22/03/1990\nAddress: 456 BUSINESS CENTER MUMBAI MAHARASHTRA 400001",
      "BANK STATEMENT\nAccount Holder: AMIT SINGH\nAccount Number: ****1234\nIFSC Code: HDFC0001234\nStatement Period: JAN 2024"
    ];
    
    return ocrSamples[documentId % ocrSamples.length];
  }

  extractKeyFields(documentId) {
    const fieldSets = [
      {
        documentType: 'PAN',
        panNumber: 'ABCDE1234F',
        holderName: 'RAJESH KUMAR SHARMA',
        fatherName: 'KUMAR SHARMA',
        dateOfBirth: '15/07/1985'
      },
      {
        documentType: 'GST',
        gstin: '29ABCDE1234F1Z5',
        tradeName: 'TECHCORP SOLUTIONS PVT LTD',
        registrationDate: '01/04/2020',
        status: 'Active'
      },
      {
        documentType: 'Aadhaar',
        holderName: 'PRIYA PATEL',
        dateOfBirth: '22/03/1990',
        address: 'MUMBAI MAHARASHTRA',
        maskedNumber: '****-****-1234'
      },
      {
        documentType: 'Bank Statement',
        accountHolder: 'AMIT SINGH',
        accountNumber: '****1234',
        ifscCode: 'HDFC0001234',
        statementPeriod: 'JAN 2024'
      }
    ];
    
    return fieldSets[documentId % fieldSets.length];
  }

  generateFraudIndicators() {
    const indicators = [];
    const possibleIndicators = [
      { type: 'font_inconsistency', severity: 'low', description: 'Minor font variations detected' },
      { type: 'image_quality', severity: 'medium', description: 'Unusually high compression artifacts' },
      { type: 'metadata_anomaly', severity: 'low', description: 'Creation date seems recent' },
      { type: 'template_match', severity: 'high', description: 'Document matches known template' },
      { type: 'watermark_missing', severity: 'medium', description: 'Expected security features not found' }
    ];
    
    // Randomly select 0-2 indicators
    const numIndicators = Math.floor(Math.random() * 3);
    for (let i = 0; i < numIndicators; i++) {
      const randomIndicator = possibleIndicators[Math.floor(Math.random() * possibleIndicators.length)];
      if (!indicators.find(ind => ind.type === randomIndicator.type)) {
        indicators.push(randomIndicator);
      }
    }
    
    return indicators;
  }

  async validateDocumentIntegrity(documentId) {
    await delay(500);
    
    return {
      documentId,
      isValid: Math.random() > 0.1, // 90% valid
      validationChecks: {
        fileSignature: Math.random() > 0.05,
        checksumValid: Math.random() > 0.02,
        noTampering: Math.random() > 0.08,
        formatCompliant: Math.random() > 0.03
      },
      validatedAt: new Date().toISOString()
    };
  }

  async compareDocumentFields(documentId, applicationData) {
    await delay(400);
    
    const mockComparison = {
      documentId,
      comparisonResult: {
        nameMatch: Math.floor(Math.random() * 15) + 85, // 85-100%
        addressMatch: Math.floor(Math.random() * 20) + 80, // 80-100%
        dateMatch: Math.random() > 0.1, // 90% match
        numberMatch: Math.random() > 0.05 // 95% match
      },
      discrepancies: [],
      overallMatchScore: Math.floor(Math.random() * 15) + 85,
      comparedAt: new Date().toISOString()
    };
    
    // Add discrepancies if match scores are low
    if (mockComparison.comparisonResult.nameMatch < 90) {
      mockComparison.discrepancies.push({
        field: 'name',
        severity: 'medium',
        description: 'Minor spelling variations in name field'
      });
    }
    
    return mockComparison;
  }

  async generateVerificationReport(submissionId) {
    await delay(1000);
    
    const submission = await this.getById(submissionId);
    const documents = submission.documents || [];
    
    const documentAnalyses = await Promise.all(
      documents.map(doc => this.analyzeDocument(doc.Id))
    );
    
    const overallScore = documentAnalyses.reduce((sum, analysis) => 
      sum + analysis.quality, 0) / documentAnalyses.length;
    
    const fraudRisk = documentAnalyses.reduce((sum, analysis) => 
      sum + analysis.fraudScore, 0) / documentAnalyses.length;
    
    return {
      submissionId,
      generatedAt: new Date().toISOString(),
      overallQualityScore: Math.round(overallScore),
      overallFraudRisk: Math.round(fraudRisk),
      documentCount: documents.length,
      documentAnalyses,
      recommendations: this.generateRecommendations(overallScore, fraudRisk),
      verificationStatus: overallScore >= 80 && fraudRisk < 50 ? 'RECOMMENDED_APPROVE' : 
                         overallScore >= 60 && fraudRisk < 70 ? 'REQUIRES_MANUAL_REVIEW' : 
                         'RECOMMENDED_REJECT'
    };
  }

  generateRecommendations(qualityScore, fraudRisk) {
    const recommendations = [];
    
    if (qualityScore < 70) {
      recommendations.push({
        type: 'quality_concern',
        priority: 'high',
        message: 'Document quality is below acceptable threshold. Request re-upload.'
      });
    }
    
    if (fraudRisk > 70) {
      recommendations.push({
        type: 'fraud_risk',
        priority: 'critical',
        message: 'High fraud risk detected. Conduct thorough manual verification.'
      });
    }
    
    if (qualityScore >= 90 && fraudRisk < 30) {
      recommendations.push({
        type: 'auto_approve',
        priority: 'low',
        message: 'High quality documents with low fraud risk. Safe for approval.'
      });
    }
    
    return recommendations;
  }

  // CAF operations
  async generateCAF(formData) {
    await delay(600);
    
    const cafId = `CAF${Date.now()}`;
    const cafRecord = {
      Id: this.data.length + 1,
      cafId,
      formData,
      status: 'generated',
      generatedAt: new Date().toISOString()
    };
    
    return cafRecord;
  }
}
// Create and export singleton instance
const kycService = new KYCService();

// Export both the instance (default) and the class (named)
export default kycService;
export { KYCService, kycService };