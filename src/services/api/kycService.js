import mockData from '@/services/mockData/kycSubmissions.json';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Clone data to prevent mutations
const cloneData = (data) => JSON.parse(JSON.stringify(data));

class KYCService {
  constructor() {
    this.data = cloneData(mockData);
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
    
    // Find highest existing Id and add 1
    const maxId = this.data.reduce((max, item) => Math.max(max, item.Id), 0);
    const newSubmission = {
      ...submissionData,
      Id: maxId + 1
    };
    
    this.data.push(newSubmission);
    return cloneData(newSubmission);
  }

  async update(id, updatedData) {
    await delay(400);
    
    const index = this.data.findIndex(submission => submission.Id === id);
    if (index === -1) {
      throw new Error(`KYC submission with Id ${id} not found`);
    }
    
    this.data[index] = { ...this.data[index], ...updatedData };
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
    return this.update(id, {
      status: 'approved',
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      reviewComment: comment
    });
  }

  async reject(id, reviewedBy, reason) {
    return this.update(id, {
      status: 'rejected',
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      rejectionReason: reason
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