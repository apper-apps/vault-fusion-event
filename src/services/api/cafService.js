// Customer Application Form (CAF) generation and management service

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Clone data to prevent mutations
const cloneData = (data) => JSON.parse(JSON.stringify(data));

class CAFService {
  constructor() {
    this.cafRecords = [];
    this.templates = {};
    this.idCounter = 1;
    
    // Initialize CAF templates
    this.initializeTemplates();
  }

  // Generate next ID
  getNextId() {
    return this.idCounter++;
  }

  initializeTemplates() {
    this.templates = {
      individual: {
        sections: [
          'Service Selection',
          'Personal Details',
          'Address Information',
          'Service Requirements',
          'Declarations & Signatures'
        ],
        requiredFields: [
          'serviceType', 'fullName', 'dateOfBirth', 'mobile', 'email',
          'aadhaarNumber', 'panNumber', 'residentialAddress', 'connectionType'
        ]
      },
      business: {
        sections: [
          'Service Selection',
          'Personal Details',
          'Address Information',
          'Business Details',
          'Service Requirements',
          'Declarations & Signatures'
        ],
        requiredFields: [
          'serviceType', 'fullName', 'dateOfBirth', 'mobile', 'email',
          'companyName', 'businessType', 'gstin', 'businessAddress', 'connectionType'
        ]
      }
    };
  }

  async generateCAF(cafData) {
    await delay(600);
    
    // Validate CAF data
    this.validateCAFData(cafData);
    
    const cafRecord = {
      ...cafData,
      Id: this.getNextId(),
      status: 'generated',
      generatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      template: this.getCAFTemplate(cafData.formData.customerType),
      documentUrl: this.generateMockDocumentUrl(cafData.cafId),
      qrCode: this.generateQRCode(cafData.cafId)
    };
    
    this.cafRecords.push(cafRecord);
    return cloneData(cafRecord);
  }

  validateCAFData(cafData) {
    if (!cafData.userId) {
      throw new Error('User ID is required for CAF generation');
    }
    
    if (!cafData.formData) {
      throw new Error('Form data is required for CAF generation');
    }
    
    if (!cafData.cafId) {
      throw new Error('CAF ID is required');
    }
    
    const customerType = cafData.formData.customerType;
    if (!customerType || !this.templates[customerType]) {
      throw new Error('Invalid customer type');
    }
    
    // Validate required fields based on customer type
    const template = this.templates[customerType];
    const missingFields = [];
    
    template.requiredFields.forEach(field => {
      if (!this.hasNestedValue(cafData.formData, field)) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  hasNestedValue(obj, path) {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current[key] === undefined || current[key] === null || current[key] === '') {
        // Check in nested objects
        const sections = ['personalDetails', 'addressDetails', 'businessDetails', 'serviceDetails'];
        for (const section of sections) {
          if (current[section] && current[section][key]) {
            return true;
          }
        }
        return false;
      }
      current = current[key];
    }
    
    return true;
  }

  getCAFTemplate(customerType) {
    return cloneData(this.templates[customerType] || this.templates.individual);
  }

  generateMockDocumentUrl(cafId) {
    return `https://api.callerdesk.com/caf/documents/${cafId}.pdf`;
  }

  generateQRCode(cafId) {
    return `https://api.callerdesk.com/caf/verify/${cafId}`;
  }

  async downloadCAF(cafId) {
    await delay(400);
    
    const cafRecord = this.cafRecords.find(record => record.cafId === cafId);
    if (!cafRecord) {
      throw new Error(`CAF with ID ${cafId} not found`);
    }
    
    // In real implementation, this would generate and return the PDF
    return {
      cafId,
      downloadUrl: cafRecord.documentUrl,
      filename: `CAF_${cafId}.pdf`,
      mimeType: 'application/pdf',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    };
  }

  async submitCAF(cafData) {
    await delay(500);
    
    if (!cafData.Id) {
      throw new Error('CAF ID is required for submission');
    }
    
    const index = this.cafRecords.findIndex(record => record.Id === cafData.Id);
    if (index === -1) {
      throw new Error(`CAF record with ID ${cafData.Id} not found`);
    }
    
    this.cafRecords[index] = {
      ...this.cafRecords[index],
      ...cafData,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      applicationNumber: `APP${Date.now()}`
    };
    
    return cloneData(this.cafRecords[index]);
  }

  async getAllCAFs() {
    await delay(200);
    return cloneData(this.cafRecords);
  }

  async getCAFById(id) {
    await delay(150);
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid ID provided');
    }
    
    const cafRecord = this.cafRecords.find(item => item.Id === id);
    if (!cafRecord) {
      throw new Error(`CAF record with Id ${id} not found`);
    }
    
    return cloneData(cafRecord);
  }

  async getCAFByCAFId(cafId) {
    await delay(150);
    
    const cafRecord = this.cafRecords.find(record => record.cafId === cafId);
    if (!cafRecord) {
      throw new Error(`CAF with ID ${cafId} not found`);
    }
    
    return cloneData(cafRecord);
  }

  async updateCAFStatus(id, newStatus, comments = '') {
    await delay(250);
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid ID provided for update operation');
    }
    
    const index = this.cafRecords.findIndex(record => record.Id === id);
    if (index === -1) {
      throw new Error(`CAF record with Id ${id} not found`);
    }
    
    const validStatuses = ['generated', 'submitted', 'under-review', 'approved', 'rejected', 'processing'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    this.cafRecords[index] = {
      ...this.cafRecords[index],
      status: newStatus,
      comments: comments,
      lastStatusUpdate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return cloneData(this.cafRecords[index]);
  }

  async deleteCAF(id) {
    await delay(200);
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid ID provided for delete operation');
    }
    
    const index = this.cafRecords.findIndex(record => record.Id === id);
    if (index === -1) {
      throw new Error(`CAF record with Id ${id} not found`);
    }
    
    const deletedCAF = this.cafRecords.splice(index, 1)[0];
    return cloneData(deletedCAF);
  }

  async getCAFsByUserId(userId) {
    await delay(200);
    
    const userCAFs = this.cafRecords.filter(record => record.userId === userId);
    return cloneData(userCAFs);
  }

  async getCAFsByStatus(status) {
    await delay(200);
    
    const filteredCAFs = this.cafRecords.filter(record => record.status === status);
    return cloneData(filteredCAFs);
  }

  async getCAFStats() {
    await delay(150);
    
    const stats = this.cafRecords.reduce((acc, caf) => {
      acc.total++;
      acc[caf.status] = (acc[caf.status] || 0) + 1;
      
      if (caf.formData && caf.formData.customerType) {
        acc.byType = acc.byType || {};
        acc.byType[caf.formData.customerType] = (acc.byType[caf.formData.customerType] || 0) + 1;
      }
      
      if (caf.formData && caf.formData.serviceType) {
        acc.byService = acc.byService || {};
        acc.byService[caf.formData.serviceType] = (acc.byService[caf.formData.serviceType] || 0) + 1;
      }
      
      return acc;
    }, { total: 0 });
    
    return stats;
  }

  // Additional utility methods
  async validateCAFIntegrity(cafId) {
    await delay(300);
    
    const cafRecord = this.cafRecords.find(record => record.cafId === cafId);
    if (!cafRecord) {
      throw new Error(`CAF with ID ${cafId} not found`);
    }
    
    return {
      cafId,
      valid: true,
      generatedAt: cafRecord.generatedAt,
      submittedAt: cafRecord.submittedAt,
      status: cafRecord.status,
      checksum: `CHK${Date.now()}`, // Mock checksum
      verifiedAt: new Date().toISOString()
    };
  }

  async generateCAFPreview(formData) {
    await delay(400);
    
    return {
      previewUrl: `https://api.callerdesk.com/caf/preview/${Date.now()}`,
      sections: this.getCAFTemplate(formData.customerType).sections,
      estimatedPages: formData.customerType === 'business' ? 3 : 2,
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
    };
}

  async updateCAFRecord(id, updateData) {
    await delay(250);
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid ID provided for update operation');
    }
    
    const index = this.cafRecords.findIndex(record => record.Id === id);
    if (index === -1) {
      throw new Error(`CAF record with Id ${id} not found`);
    }
    
    // Prevent updating immutable fields
    const immutableFields = ['Id', 'cafId', 'generatedAt', 'createdAt'];
    immutableFields.forEach(field => {
      if (updateData[field] !== undefined) {
        delete updateData[field];
      }
    });
    
    this.cafRecords[index] = {
      ...this.cafRecords[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return cloneData(this.cafRecords[index]);
  }

  async searchCAFs(query) {
    await delay(250);
    
    if (!query || query.trim() === '') {
      return cloneData(this.cafRecords);
    }
    
    const searchTerm = query.toLowerCase();
    const filteredCAFs = this.cafRecords.filter(caf => {
      return (
        caf.cafId.toLowerCase().includes(searchTerm) ||
        (caf.applicationNumber && caf.applicationNumber.toLowerCase().includes(searchTerm)) ||
        (caf.formData.personalDetails && caf.formData.personalDetails.fullName && 
         caf.formData.personalDetails.fullName.toLowerCase().includes(searchTerm)) ||
        (caf.formData.personalDetails && caf.formData.personalDetails.mobile && 
         caf.formData.personalDetails.mobile.includes(searchTerm))
      );
    });
    
    return cloneData(filteredCAFs);
  }
}

// Create and export singleton instance
const cafService = new CAFService();

export default cafService;
export { CAFService, cafService };