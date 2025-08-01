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
    await delay(400); // Faster CAF generation
    
    // Enhanced validation with detailed error messages
    try {
      this.validateCAFData(cafData);
    } catch (error) {
      // Re-throw with more user-friendly message
      throw new Error(`CAF generation failed: ${error.message}`);
    }
    
    const cafRecord = {
      ...cafData,
      Id: this.getNextId(),
      status: 'generated',
      generatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      template: this.getCAFTemplate(cafData.formData.customerType),
      documentUrl: this.generateMockDocumentUrl(cafData.cafId),
      qrCode: this.generateQRCode(cafData.cafId),
      processingTime: Date.now() - (cafData.startTime || Date.now()),
      validityPeriod: '30 days from generation'
    };
    
    this.cafRecords.push(cafRecord);
    return cloneData(cafRecord);
  }
validateCAFData(cafData) {
    const errors = [];
    
    if (!cafData.userId) {
      errors.push('User session is required. Please log in and try again.');
    }
    
    if (!cafData.formData) {
      errors.push('Form data is missing. Please complete the CAF form.');
    }
    
    if (!cafData.cafId) {
      errors.push('CAF reference ID is missing. Please restart the form.');
    }
    
    if (!cafData.formData) {
      throw new Error(errors.join(' '));
    }
    
    const customerType = cafData.formData.customerType;
    if (!customerType) {
      errors.push('Please select customer type (Individual or Business)');
    } else if (!this.templates[customerType]) {
      errors.push('Invalid customer type selected. Please choose Individual or Business.');
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join(' '));
    }
    
    // Validate required fields with user-friendly field names
    const template = this.templates[customerType];
    const missingFields = [];
    const fieldLabels = {
      'personalDetails.fullName': 'Full Name',
      'personalDetails.mobile': 'Mobile Number',
      'personalDetails.email': 'Email Address',
      'personalDetails.aadhaarNumber': 'Aadhaar Number',
      'personalDetails.panNumber': 'PAN Number',
      'addressDetails.residentialAddress': 'Residential Address',
      'addressDetails.city': 'City',
      'addressDetails.state': 'State',
      'addressDetails.pincode': 'PIN Code',
      'businessDetails.companyName': 'Company Name',
      'businessDetails.gstin': 'GSTIN',
      'serviceDetails.connectionType': 'Connection Type',
      'serviceDetails.planSelected': 'Plan Selection'
    };
    
    template.requiredFields.forEach(field => {
      if (!this.hasNestedValue(cafData.formData, field)) {
        const friendlyName = fieldLabels[field] || field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        missingFields.push(friendlyName);
      }
    });
    
    if (missingFields.length > 0) {
      const fieldCount = missingFields.length;
      if (fieldCount === 1) {
        throw new Error(`Please fill in the ${missingFields[0]} field to continue.`);
      } else {
        throw new Error(`Please complete ${fieldCount} required fields: ${missingFields.slice(0, 3).join(', ')}${fieldCount > 3 ? ` and ${fieldCount - 3} more` : ''}.`);
      }
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
await delay(200); // Faster download initiation
    
    const cafRecord = this.cafRecords.find(record => record.cafId === cafId);
    if (!cafRecord) {
      throw new Error(`CAF document not found. Please regenerate the CAF or contact support if this error persists.`);
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
      throw new Error('CAF submission requires a valid document ID. Please regenerate the CAF.');
    }
    
    const index = this.cafRecords.findIndex(record => record.Id === cafData.Id);
    if (index === -1) {
      throw new Error(`CAF document not found in system. Please regenerate and try again.`);
    }
    
    this.cafRecords[index] = {
      ...this.cafRecords[index],
      ...cafData,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      applicationNumber: `APP${Date.now()}`,
      estimatedProcessingTime: '3-5 business days',
      nextSteps: 'Application submitted successfully. You will receive updates via email and SMS.'
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