// UIDAI e-KYC service for Aadhaar-based verification

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Clone data to prevent mutations
const cloneData = (data) => JSON.parse(JSON.stringify(data));

class UIDAIService {
  constructor() {
    this.ekycData = [];
    this.otpStorage = {};
    this.idCounter = 1;
  }

  // Generate next ID
  getNextId() {
    return this.idCounter++;
  }

async initiateEKYC(aadhaarNumber) {
    await delay(300); // Faster initiation
    
    const cleanAadhaar = aadhaarNumber?.replace(/\D/g, '') || '';
    
    if (!cleanAadhaar) {
      throw new Error('Please enter your 12-digit Aadhaar number');
    }
    
    if (cleanAadhaar.length !== 12) {
      throw new Error(`Aadhaar number must be exactly 12 digits (you entered ${cleanAadhaar.length})`);
    }
    
    if (!/^\d{12}$/.test(cleanAadhaar)) {
      throw new Error('Aadhaar number should contain only digits (0-9)');
    }
    
    // Simulate UIDAI API call
    // In real implementation, this would call UIDAI's authentication service
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    this.otpStorage[aadhaarNumber] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0
    };
    
    return {
      success: true,
      message: 'OTP sent to registered mobile number',
      transactionId: `TXN${Date.now()}`,
      // In development, return OTP for testing
      debugOTP: otp
    };
  }

async verifyEKYCOTP(aadhaarNumber, enteredOTP) {
    await delay(500); // Faster verification
    
    const cleanAadhaar = aadhaarNumber?.replace(/\D/g, '') || '';
    const cleanOTP = enteredOTP?.replace(/\D/g, '') || '';
    
    if (!cleanOTP || cleanOTP.length !== 6) {
      throw new Error('Please enter the complete 6-digit OTP sent to your Aadhaar-registered mobile');
    }
    
    const otpData = this.otpStorage[cleanAadhaar];
    
    if (!otpData) {
      throw new Error('OTP session not found. Please start the e-KYC process again to get a new OTP.');
    }
    
    const timeRemaining = otpData.expiresAt - Date.now();
    if (timeRemaining <= 0) {
      delete this.otpStorage[cleanAadhaar];
      throw new Error('Your OTP has expired. Please restart the e-KYC process to get a fresh verification code.');
    }
    
    otpData.attempts++;
    
    if (otpData.attempts > 3) {
      delete this.otpStorage[cleanAadhaar];
      throw new Error('Maximum verification attempts exceeded for security. Please restart the e-KYC process.');
    }
    
    if (otpData.otp !== cleanOTP) {
      const remainingAttempts = 3 - otpData.attempts;
      const minutesRemaining = Math.ceil(timeRemaining / 60000);
      
      throw new Error(`Incorrect OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining. OTP expires in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}.`);
    }
    
    // OTP verified successfully, generate mock KYC data
    delete this.otpStorage[aadhaarNumber];
    
const kycData = this.generateMockKYCData(aadhaarNumber);
    
    return {
      success: true,
      message: 'e-KYC verification successful',
      kycData: kycData,
      verifiedAt: new Date().toISOString(),
      // Enhanced for DoT compliance
      faceData: {
        photoAvailable: true,
        faceRecognitionReady: true,
        noErrorInRecords: Math.random() > 0.1,
        photoQuality: Math.floor(Math.random() * 20 + 80) // 80-100%
      }
    };
  }

  generateMockKYCData(aadhaarNumber) {
    // In real implementation, this would be actual data from UIDAI
    const mockNames = ['Rahul Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Singh', 'Rohit Gupta'];
    const mockAddresses = [
      'House No. 123, Sector 15, Noida, Uttar Pradesh',
      'Flat 4B, Residency Road, Bangalore, Karnataka',
      '2nd Floor, MG Road, Pune, Maharashtra',
      'Bungalow 56, Satellite, Ahmedabad, Gujarat',
      'Apartment 301, Anna Nagar, Chennai, Tamil Nadu'
    ];
    
    const randomIndex = Math.floor(Math.random() * mockNames.length);
    
return {
      name: mockNames[randomIndex],
      dateOfBirth: '1990-05-15',
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      address: mockAddresses[randomIndex],
      mobile: '9876543210',
      email: 'user@example.com',
      aadhaarNumber: aadhaarNumber,
      photo: null, // In real implementation, would contain base64 photo data
      verificationLevel: 'UIDAI_VERIFIED',
      timestamp: new Date().toISOString(),
      // DoT Compliance Data
      territorialInfo: {
        state: mockAddresses[randomIndex].split(',').slice(-1)[0].trim(),
        district: mockAddresses[randomIndex].split(',')[1]?.trim() || 'Unknown',
        issueLocation: mockAddresses[randomIndex].split(',').slice(-1)[0].trim()
      },
      photographData: {
        available: true,
        quality: Math.floor(Math.random() * 20 + 80),
        faceDetected: true,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  async saveEKYCData(ekycRecord) {
    await delay(300);
    
    const record = {
      ...ekycRecord,
      Id: this.getNextId(),
      savedAt: new Date().toISOString()
    };
    
    this.ekycData.push(record);
    return cloneData(record);
  }

  async getEKYCData(userId) {
    await delay(200);
    
    const userRecords = this.ekycData.filter(record => record.userId === userId);
    return cloneData(userRecords);
  }

  async getAllEKYCData() {
    await delay(200);
    return cloneData(this.ekycData);
  }

  async getEKYCById(id) {
    await delay(150);
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid ID provided');
    }
    
    const record = this.ekycData.find(item => item.Id === id);
    if (!record) {
      throw new Error(`e-KYC record with Id ${id} not found`);
    }
    
    return cloneData(record);
  }

  async updateEKYCRecord(id, updateData) {
    await delay(200);
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid ID provided for update operation');
    }
    
    const index = this.ekycData.findIndex(record => record.Id === id);
    if (index === -1) {
      throw new Error(`e-KYC record with Id ${id} not found`);
    }
    
    this.ekycData[index] = {
      ...this.ekycData[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return cloneData(this.ekycData[index]);
  }

  async deleteEKYCRecord(id) {
    await delay(200);
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid ID provided for delete operation');
    }
    
    const index = this.ekycData.findIndex(record => record.Id === id);
    if (index === -1) {
      throw new Error(`e-KYC record with Id ${id} not found`);
    }
    
    const deletedRecord = this.ekycData.splice(index, 1)[0];
    return cloneData(deletedRecord);
  }

  // Additional utility methods
  async validateAadhaar(aadhaarNumber) {
    await delay(100);
    
    // Basic validation
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      return { valid: false, error: 'Aadhaar number must be 12 digits' };
    }
    
    // Check if all digits are same (invalid Aadhaar)
    if (/^(\d)\1{11}$/.test(aadhaarNumber)) {
      return { valid: false, error: 'Invalid Aadhaar number format' };
    }
    
    return { valid: true };
  }

  async getVerificationStats() {
    await delay(150);
    
    const stats = this.ekycData.reduce((acc, record) => {
      acc.total++;
      const status = record.status || 'verified';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, { total: 0 });
    
    return stats;
  }

  // Mock method to check UIDAI service status
  async checkServiceStatus() {
    await delay(100);
    
    return {
      status: 'operational',
      message: 'UIDAI services are operational',
      lastChecked: new Date().toISOString()
    };
  }
}

// Create and export singleton instance
const uidaiService = new UIDAIService();

export default uidaiService;
export { UIDAIService, uidaiService };