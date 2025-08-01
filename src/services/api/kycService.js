import mockData from "@/services/mockData/kycSubmissions.json";

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
      await delay(500);
      
      // Enhanced validation with detailed error messages
      const validationErrors = [];
      
      if (!submissionData.userId) {
        validationErrors.push('User identification is required to process KYC submission');
      }
      
      if (!submissionData.personalDetails) {
        validationErrors.push('Personal details section is mandatory');
      } else {
        if (!submissionData.personalDetails.fullName) {
          validationErrors.push('Full name is required in personal details');
        }
        if (!submissionData.personalDetails.mobile) {
          validationErrors.push('Mobile number is required in personal details');
        }
      }
      
      if (!submissionData.businessDetails) {
        validationErrors.push('Business details section is mandatory');
      } else {
        if (!submissionData.businessDetails.companyName) {
          validationErrors.push('Company name is required in business details');
        }
      }
      
      if (validationErrors.length > 0) {
        const error = new Error(`Validation failed: ${validationErrors.join('; ')}`);
        error.code = 'VALIDATION_ERROR';
        error.details = validationErrors;
        throw error;
      }
      
      // Simulate potential network issues
      if (Math.random() < 0.1) {
        const error = new Error(ERROR_MESSAGES.NETWORK_ERROR);
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
        status: submissionData.status || 'pending'
      };
      
      this.data.push(newSubmission);
      return cloneData(newSubmission);
    });
  }

async update(id, updatedData) {
    const cacheKey = this.generateCacheKey('update', { id, updatedData });
    
    return this.deduplicateRequest(cacheKey, async () => {
      await delay(400);
      
      // Enhanced ID validation
      if (!Number.isInteger(id) || id <= 0) {
        const error = new Error('Invalid submission ID. Please provide a valid positive integer.');
        error.code = 'VALIDATION_ERROR';
        throw error;
      }
      
      const index = this.data.findIndex(submission => submission.Id === id);
      if (index === -1) {
        const error = new Error(`KYC submission not found. No record exists with ID ${id}.`);
        error.code = 'NOT_FOUND';
        throw error;
      }
      
      const currentSubmission = this.data[index];
      
      // Enhanced status transition validation
      if (updatedData.status) {
        const validStatuses = ['pending', 'approved', 'rejected', 'under-review', 'pending-verification'];
        if (!validStatuses.includes(updatedData.status)) {
          const error = new Error(`Invalid status transition. Status '${updatedData.status}' is not allowed. Valid statuses: ${validStatuses.join(', ')}`);
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
          const error = new Error(`Status cannot be changed from '${currentSubmission.status}' to '${updatedData.status}'. Allowed transitions: ${allowedTransitions.join(', ') || 'none'}`);
          error.code = 'INVALID_TRANSITION';
          throw error;
        }
      }
      
      // Track update history
      const updateHistory = currentSubmission.updateHistory || [];
      updateHistory.push({
        timestamp: new Date().toISOString(),
        changes: updatedData,
        previousStatus: currentSubmission.status
      });
      
      this.data[index] = { 
        ...currentSubmission, 
        ...updatedData, 
        updatedAt: new Date().toISOString(),
        updateHistory,
        version: (currentSubmission.version || 1) + 1
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
      throw new Error('Reviewer information is required for approval');
    }
    
    return this.update(id, {
      status: 'approved',
      reviewedBy: reviewedBy.trim(),
      reviewedAt: new Date().toISOString(),
      reviewComment: comment.trim(),
      approvalDate: new Date().toISOString()
    });
  }

  async reject(id, reviewedBy, reason) {
    if (!reviewedBy || reviewedBy.trim() === '') {
      throw new Error('Reviewer information is required for rejection');
    }
    
    if (!reason || reason.trim() === '') {
      throw new Error('Rejection reason is required');
    }
    
    return this.update(id, {
      status: 'rejected',
      reviewedBy: reviewedBy.trim(),
      reviewedAt: new Date().toISOString(),
      rejectionReason: reason.trim(),
      rejectionDate: new Date().toISOString()
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
    await delay(500);
    
    // Validate required fields for Self-KYC
    if (!registrationData.primaryMobile) {
      throw new Error('Primary mobile number is required');
    }
    
    if (!registrationData.alternateMobile) {
      throw new Error('Alternate mobile number is required');
    }
    
    if (!registrationData.relationship) {
      throw new Error('Relationship with alternate contact is required');
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
      otpVerified: false
    };
    
    this.data.push(newRegistration);
    return cloneData(newRegistration);
  }

async sendOTP(mobile, type = 'registration') {
    const cacheKey = this.generateCacheKey('sendOTP', { mobile, type });
    
    return this.deduplicateRequest(cacheKey, async () => {
      await delay(200);
      
      // Enhanced mobile validation
      const mobileRegex = /^(\+91[-\s]?)?[0]?(91)?[6789]\d{9}$/;
      if (!mobileRegex.test(mobile.replace(/\s/g, ''))) {
        const error = new Error('Invalid mobile number format. Please enter a valid 10-digit Indian mobile number.');
        error.code = 'VALIDATION_ERROR';
        throw error;
      }
      
      // Rate limiting check
      const rateLimitKey = `otp_${mobile}`;
      const lastOTPTime = this.rateLimiter?.get(rateLimitKey);
      const cooldownPeriod = 60000; // 1 minute
      
      if (lastOTPTime && Date.now() - lastOTPTime < cooldownPeriod) {
        const remainingTime = Math.ceil((cooldownPeriod - (Date.now() - lastOTPTime)) / 1000);
        const error = new Error(`Please wait ${remainingTime} seconds before requesting another OTP.`);
        error.code = 'RATE_LIMIT';
        throw error;
      }
      
      // Simulate OTP generation with better security
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP with enhanced metadata
      this.otpStorage = this.otpStorage || {};
      this.rateLimiter = this.rateLimiter || new Map();
      
      // Clean up expired OTPs
      this.cleanupExpiredOTPs();
      
      this.otpStorage[mobile] = {
        otp,
        type,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
        attempts: 0,
        generatedAt: Date.now(),
        lastAttemptAt: null,
        maxAttempts: 3
      };
      
      this.rateLimiter.set(rateLimitKey, Date.now());
      
      // Simulate network failure occasionally
      if (Math.random() < 0.05) {
        const error = new Error(ERROR_MESSAGES.NETWORK_ERROR);
        error.code = 'NETWORK_ERROR';
        throw error;
      }
      
      return {
        success: true,
        message: `OTP sent successfully to ${mobile.replace(/(\d{6})\d{4}/, '$1****')}`,
        expiresIn: 300, // 5 minutes in seconds
        canResendIn: 60, // 1 minute in seconds
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
      await delay(300);
      
      // Enhanced OTP validation
      if (!enteredOTP || !/^\d{6}$/.test(enteredOTP)) {
        const error = new Error('Please enter a valid 6-digit OTP.');
        error.code = 'VALIDATION_ERROR';
        throw error;
      }
      
      const otpData = this.otpStorage?.[mobile];
      
      if (!otpData) {
        const error = new Error('No OTP found for this mobile number. Please request a new OTP.');
        error.code = 'OTP_NOT_FOUND';
        throw error;
      }
      
      // Check expiration
      if (Date.now() > otpData.expiresAt) {
        delete this.otpStorage[mobile];
        const error = new Error('OTP has expired. Please request a new OTP.');
        error.code = 'OTP_EXPIRED';
        throw error;
      }
      
      // Update attempt tracking
      otpData.attempts++;
      otpData.lastAttemptAt = Date.now();
      
      // Check max attempts
      if (otpData.attempts > otpData.maxAttempts) {
        delete this.otpStorage[mobile];
        const error = new Error(`Maximum verification attempts exceeded. Please request a new OTP.`);
        error.code = 'MAX_ATTEMPTS_EXCEEDED';
        throw error;
      }
      
      // Verify OTP
      if (otpData.otp !== enteredOTP) {
        const remainingAttempts = otpData.maxAttempts - otpData.attempts;
        const error = new Error(`Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`);
        error.code = 'INVALID_OTP';
        error.remainingAttempts = remainingAttempts;
        throw error;
      }
      
      // OTP verified successfully
      const verificationResult = {
        mobile,
        type: otpData.type,
        verifiedAt: new Date().toISOString(),
        timeToVerify: Date.now() - otpData.generatedAt
      };
      
      delete this.otpStorage[mobile];
      
      return {
        success: true,
        message: 'OTP verified successfully!',
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
    };
  }

  // Document verification operations  
  async verifyDocumentWithDigiLocker(documentType) {
    await delay(600);
    
    const mockVerification = {
      type: documentType,
      verified: true,
      issuer: 'Government Authority',
      verifiedAt: new Date().toISOString()
    };
    
    return mockVerification;
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