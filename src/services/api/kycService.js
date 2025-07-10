import mockData from '@/services/mockData/kycSubmissions.json';

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
}

export const kycService = new KYCService();