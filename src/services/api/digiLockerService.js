// DigiLocker integration service for document verification

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Clone data to prevent mutations
const cloneData = (data) => JSON.parse(JSON.stringify(data));

class DigiLockerService {
  constructor() {
    this.verifiedDocuments = [];
    this.authTokens = {};
    this.idCounter = 1;
  }

  // Generate next ID
  getNextId() {
    return this.idCounter++;
  }

  async getAuthorizationURL() {
    await delay(200);
    
    // In real implementation, this would generate DigiLocker OAuth URL
    const state = Math.random().toString(36).substring(2);
    const clientId = 'your_digilocker_client_id';
    
    const authUrl = `https://api.digitallocker.gov.in/public/oauth2/1/authorize?response_type=code&client_id=${clientId}&redirect_uri=your_redirect_uri&state=${state}`;
    
    return {
      authUrl,
      state
    };
  }

  async handleAuthorizationCallback(code, state) {
    await delay(500);
    
    // Simulate token exchange
    const accessToken = `dl_token_${Date.now()}`;
    const refreshToken = `dl_refresh_${Date.now()}`;
    
    this.authTokens[accessToken] = {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + 3600 * 1000, // 1 hour
      createdAt: new Date().toISOString()
    };
    
    return {
      accessToken,
      refreshToken,
      expiresIn: 3600
    };
  }

  async getUserDocuments(accessToken) {
    await delay(400);
    
    if (!this.authTokens[accessToken]) {
      throw new Error('Invalid or expired access token');
    }
    
    // Mock DigiLocker document list
    const mockDocuments = [
      {
        id: 'AADHAAR-001',
        name: 'Aadhaar Card',
        type: 'aadhaar',
        issuer: 'UIDAI',
        issueDate: '2020-01-15',
        size: '245KB',
        format: 'PDF',
        verified: true
      },
      {
        id: 'PAN-001',
        name: 'PAN Card',
        type: 'pan',
        issuer: 'Income Tax Department',
        issueDate: '2019-03-20',
        size: '180KB',
        format: 'PDF',
        verified: true
      },
      {
        id: 'DL-001',
        name: 'Driving License',
        type: 'driving_license',
        issuer: 'Transport Department',
        issueDate: '2021-06-10',
        size: '320KB',
        format: 'PDF',
        verified: true
      },
      {
        id: 'PASSPORT-001',
        name: 'Passport',
        type: 'passport',
        issuer: 'Passport Office',
        issueDate: '2018-11-05',
        size: '450KB',
        format: 'PDF',
        verified: true
      }
    ];
    
    return mockDocuments;
  }

  async verifyDocuments(documentTypes) {
    await delay(600);
    
    const verificationResults = [];
    
    for (const docType of documentTypes) {
      const verificationResult = {
        Id: this.getNextId(),
        type: docType,
        verified: true,
        verifiedAt: new Date().toISOString(),
        issuer: this.getDocumentIssuer(docType),
        status: 'verified',
        details: this.generateMockVerificationDetails(docType)
      };
      
      verificationResults.push(verificationResult);
      this.verifiedDocuments.push(verificationResult);
    }
    
    return cloneData(verificationResults);
  }

  getDocumentIssuer(docType) {
    const issuers = {
      aadhaar: 'UIDAI',
      pan: 'Income Tax Department',
      driving_license: 'Transport Department',
      passport: 'Passport Office',
      voter_id: 'Election Commission',
      ration_card: 'Food & Supply Department'
    };
    
    return issuers[docType] || 'Government Authority';
  }

  generateMockVerificationDetails(docType) {
    const mockDetails = {
      aadhaar: {
        name: 'Rahul Kumar',
        number: '****-****-1234',
        dateOfBirth: '1990-05-15',
        address: 'House No. 123, Sector 15, Noida, Uttar Pradesh'
      },
      pan: {
        name: 'RAHUL KUMAR',
        number: 'ABCDE1234F',
        dateOfBirth: '15/05/1990',
        fatherName: 'SURESH KUMAR'
      },
      driving_license: {
        name: 'Rahul Kumar',
        number: 'DL-1420110012345',
        validFrom: '2021-06-10',
        validUpto: '2041-06-09',
        address: 'House No. 123, Sector 15, Noida, Uttar Pradesh'
      },
      passport: {
        name: 'RAHUL KUMAR',
        number: 'A1234567',
        dateOfIssue: '2018-11-05',
        dateOfExpiry: '2028-11-04',
        placeOfBirth: 'Delhi'
      },
      voter_id: {
        name: 'Rahul Kumar',
        number: 'ABC1234567',
        assemblyConstituency: '123 - Noida',
        partNumber: '45'
      },
      ration_card: {
        name: 'Rahul Kumar',
        number: 'RC1234567890',
        cardType: 'APL',
        headOfFamily: 'Suresh Kumar'
      }
    };
    
    return mockDetails[docType] || { verified: true };
  }

  async downloadDocument(documentId, accessToken) {
    await delay(300);
    
    if (!this.authTokens[accessToken]) {
      throw new Error('Invalid or expired access token');
    }
    
    // In real implementation, this would download the actual document
    return {
      documentId,
      downloadUrl: `https://api.digitallocker.gov.in/download/${documentId}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
    };
  }

  async saveVerificationData(verificationData) {
    await delay(250);
    
    const record = {
      ...verificationData,
      Id: this.getNextId(),
      savedAt: new Date().toISOString()
    };
    
    this.verifiedDocuments.push(record);
    return cloneData(record);
  }

  async getVerificationHistory(userId) {
    await delay(200);
    
    const userVerifications = this.verifiedDocuments.filter(
      record => record.userId === userId
    );
    
    return cloneData(userVerifications);
  }

  async getAllVerifications() {
    await delay(200);
    return cloneData(this.verifiedDocuments);
  }

  async getVerificationById(id) {
    await delay(150);
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid ID provided');
    }
    
    const record = this.verifiedDocuments.find(item => item.Id === id);
    if (!record) {
      throw new Error(`Verification record with Id ${id} not found`);
    }
    
    return cloneData(record);
  }

  async updateVerificationRecord(id, updateData) {
    await delay(200);
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid ID provided for update operation');
    }
    
    const index = this.verifiedDocuments.findIndex(record => record.Id === id);
    if (index === -1) {
      throw new Error(`Verification record with Id ${id} not found`);
    }
    
    this.verifiedDocuments[index] = {
      ...this.verifiedDocuments[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return cloneData(this.verifiedDocuments[index]);
  }

  async deleteVerificationRecord(id) {
    await delay(200);
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid ID provided for delete operation');
    }
    
    const index = this.verifiedDocuments.findIndex(record => record.Id === id);
    if (index === -1) {
      throw new Error(`Verification record with Id ${id} not found`);
    }
    
    const deletedRecord = this.verifiedDocuments.splice(index, 1)[0];
    return cloneData(deletedRecord);
  }

  // Additional utility methods
  async checkDocumentAuthenticity(documentId) {
    await delay(400);
    
    return {
      documentId,
      authentic: true,
      verifiedBy: 'DigiLocker',
      issuerVerified: true,
      tampering: false,
      verifiedAt: new Date().toISOString()
    };
  }

  async getVerificationStats() {
    await delay(150);
    
    const stats = this.verifiedDocuments.reduce((acc, record) => {
      acc.total++;
      const status = record.status || 'verified';
      acc[status] = (acc[status] || 0) + 1;
      
      if (record.type) {
        acc.byType = acc.byType || {};
        acc.byType[record.type] = (acc.byType[record.type] || 0) + 1;
      }
      
      return acc;
    }, { total: 0 });
    
    return stats;
  }

  async refreshToken(refreshToken) {
    await delay(300);
    
    // Find the token entry
    const tokenEntry = Object.values(this.authTokens).find(
      token => token.refreshToken === refreshToken
    );
    
    if (!tokenEntry) {
      throw new Error('Invalid refresh token');
    }
    
    // Generate new tokens
    const newAccessToken = `dl_token_${Date.now()}`;
    const newRefreshToken = `dl_refresh_${Date.now()}`;
    
    // Remove old token
    delete this.authTokens[tokenEntry.accessToken];
    
    // Add new token
    this.authTokens[newAccessToken] = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt: Date.now() + 3600 * 1000, // 1 hour
      createdAt: new Date().toISOString()
    };
    
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 3600
    };
  }

  // Mock method to check DigiLocker service status
  async checkServiceStatus() {
    await delay(100);
    
    return {
      status: 'operational',
      message: 'DigiLocker services are operational',
      lastChecked: new Date().toISOString()
    };
  }
}

// Create and export singleton instance
const digiLockerService = new DigiLockerService();

export default digiLockerService;
export { DigiLockerService, digiLockerService };