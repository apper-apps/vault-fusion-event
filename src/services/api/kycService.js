import mockData from "@/services/mockData/kycSubmissions.json";

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Clone data to prevent mutations
const cloneData = (data) => JSON.parse(JSON.stringify(data));
class KYCService {
  constructor() {
    this.data = cloneData(mockData);
    this.documentIdCounter = 10000; // Start document IDs from 10000
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
    await delay(500);
    
    // Validate required fields
    if (!submissionData.userId) {
      throw new Error('User ID is required for KYC submission');
    }
    
    if (!submissionData.personalDetails || !submissionData.businessDetails) {
      throw new Error('Personal and business details are required');
    }
    
    // Find highest existing Id and add 1
    const maxId = this.data.reduce((max, item) => Math.max(max, item.Id), 0);
    const newSubmission = {
      ...submissionData,
      Id: maxId + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.data.push(newSubmission);
    return cloneData(newSubmission);
  }

async update(id, updatedData) {
    await delay(400);
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid ID provided for update operation');
    }
    
    const index = this.data.findIndex(submission => submission.Id === id);
    if (index === -1) {
      throw new Error(`KYC submission with Id ${id} not found`);
    }
    
    // Validate status transitions
    if (updatedData.status) {
      const validStatuses = ['pending', 'approved', 'rejected', 'under-review'];
      if (!validStatuses.includes(updatedData.status)) {
        throw new Error(`Invalid status: ${updatedData.status}. Must be one of: ${validStatuses.join(', ')}`);
      }
    }
    
    this.data[index] = { 
      ...this.data[index], 
      ...updatedData, 
      updatedAt: new Date().toISOString() 
    };
    return cloneData(this.data[index]);
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
    await delay(200);
    
    // Simulate OTP generation (in real app, this would call SMS gateway)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in memory for verification (in real app, use secure storage)
    this.otpStorage = this.otpStorage || {};
    this.otpStorage[mobile] = {
      otp,
      type,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    };
    
    return {
      success: true,
      message: `OTP sent to ${mobile}`,
      // In development, return OTP for testing
      debugOTP: otp
    };
  }

  async verifyOTP(mobile, enteredOTP) {
    await delay(300);
    
    const otpData = this.otpStorage?.[mobile];
    
    if (!otpData) {
      throw new Error('OTP not found or expired. Please request a new OTP.');
    }
    
    if (Date.now() > otpData.expiresAt) {
      delete this.otpStorage[mobile];
      throw new Error('OTP has expired. Please request a new OTP.');
    }
    
    otpData.attempts++;
    
    if (otpData.attempts > 3) {
      delete this.otpStorage[mobile];
      throw new Error('Too many failed attempts. Please request a new OTP.');
    }
    
    if (otpData.otp !== enteredOTP) {
      throw new Error('Invalid OTP. Please check and try again.');
    }
    
    // OTP verified successfully
    delete this.otpStorage[mobile];
    
    return {
      success: true,
      message: 'OTP verified successfully'
    };
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
}

// Create and export singleton instance
const kycService = new KYCService();

// Export both the instance (default) and the class (named)
export default kycService;
export { KYCService, kycService };