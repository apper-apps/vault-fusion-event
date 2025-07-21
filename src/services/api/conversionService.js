// OTP-based prepaid to postpaid conversion service

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Clone data to prevent mutations
const cloneData = (data) => JSON.parse(JSON.stringify(data));

class ConversionService {
  constructor() {
    this.conversions = [];
    this.otpStorage = {};
    this.idCounter = 1;
    
    // Initialize with mock postpaid plans
    this.postpaidPlans = [
      {
        Id: 1,
        name: 'Starter Postpaid',
        price: 399,
        data: '25GB',
        calls: 'Unlimited',
        sms: '100/day',
        features: ['Free Roaming', 'Netflix Basic']
      },
      {
        Id: 2,
        name: 'Premium Postpaid',
        price: 599,
        data: '50GB',
        calls: 'Unlimited',
        sms: 'Unlimited',
        features: ['Free Roaming', 'Netflix Premium', 'Amazon Prime']
      },
      {
        Id: 3,
        name: 'Business Postpaid',
        price: 999,
        data: '100GB',
        calls: 'Unlimited',
        sms: 'Unlimited',
        features: ['Free Roaming', 'Priority Support', 'Cloud Storage']
      },
      {
        Id: 4,
        name: 'Family Postpaid',
        price: 1299,
        data: '150GB',
        calls: 'Unlimited',
        sms: 'Unlimited',
        features: ['4 Connections', 'Shared Data', 'Netflix Family', 'Disney+ Hotstar']
      }
    ];
  }

  // Generate next ID
  getNextId() {
    return this.idCounter++;
  }

  async checkEligibility(mobileNumber) {
    await delay(400);
    
    if (!mobileNumber || mobileNumber.length !== 10) {
      throw new Error('Invalid mobile number');
    }
    
    // Mock eligibility check
    const mockCustomerDatabase = {
      '9876543210': {
        name: 'Rahul Kumar',
        currentPlan: 'Prepaid Unlimited',
        accountAge: 180, // days
        outstandingAmount: 0,
        eligible: true
      },
      '8765432109': {
        name: 'Priya Sharma',
        currentPlan: 'Prepaid Basic',
        accountAge: 45, // days
        outstandingAmount: 150,
        eligible: false,
        reason: 'Account not active for minimum 90 days'
      },
      '7654321098': {
        name: 'Amit Patel',
        currentPlan: 'Prepaid Premium',
        accountAge: 120,
        outstandingAmount: 75,
        eligible: false,
        reason: 'Outstanding amount needs to be cleared'
      }
    };
    
    const customerData = mockCustomerDatabase[mobileNumber] || {
      name: 'Customer',
      currentPlan: 'Prepaid Basic',
      accountAge: 200,
      outstandingAmount: 0,
      eligible: true
    };
    
    if (!customerData.eligible) {
      return {
        eligible: false,
        reason: customerData.reason || 'Not eligible for conversion',
        customerData
      };
    }
    
    // Check eligibility criteria
    if (customerData.accountAge < 90) {
      return {
        eligible: false,
        reason: 'Account must be active for at least 90 days',
        customerData
      };
    }
    
    if (customerData.outstandingAmount > 0) {
      return {
        eligible: false,
        reason: `Outstanding amount of ₹${customerData.outstandingAmount} must be cleared`,
        customerData
      };
    }
    
    return {
      eligible: true,
      customerData,
      message: 'Mobile number is eligible for conversion'
    };
  }

  async getPostpaidPlans() {
    await delay(200);
    return cloneData(this.postpaidPlans);
  }

  async sendConversionOTP(mobileNumber) {
    await delay(300);
    
    if (!mobileNumber || mobileNumber.length !== 10) {
      throw new Error('Invalid mobile number');
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    this.otpStorage[mobileNumber] = {
      otp,
      type: 'conversion',
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    };
    
    return {
      success: true,
      message: `OTP sent to ${mobileNumber}`,
      // In development, return OTP for testing
      debugOTP: otp
    };
  }

  async verifyConversionOTP(mobileNumber, enteredOTP) {
    await delay(400);
    
    const otpData = this.otpStorage[mobileNumber];
    
    if (!otpData) {
      throw new Error('OTP not found or expired. Please request a new OTP.');
    }
    
    if (Date.now() > otpData.expiresAt) {
      delete this.otpStorage[mobileNumber];
      throw new Error('OTP has expired. Please request a new OTP.');
    }
    
    otpData.attempts++;
    
    if (otpData.attempts > 3) {
      delete this.otpStorage[mobileNumber];
      throw new Error('Too many failed attempts. Please request a new OTP.');
    }
    
    if (otpData.otp !== enteredOTP) {
      throw new Error('Invalid OTP. Please check and try again.');
    }
    
    // OTP verified successfully
    delete this.otpStorage[mobileNumber];
    
    return {
      success: true,
      message: 'OTP verified successfully',
      verifiedAt: new Date().toISOString()
    };
  }

  async processConversion(conversionData) {
    await delay(800);
    
    // Validate conversion data
    if (!conversionData.mobileNumber || !conversionData.toPlan) {
      throw new Error('Mobile number and target plan are required');
    }
    
    const selectedPlan = this.postpaidPlans.find(plan => plan.Id === conversionData.toPlan);
    if (!selectedPlan) {
      throw new Error('Selected plan not found');
    }
    
    const conversionRecord = {
      ...conversionData,
      Id: this.getNextId(),
      status: 'processing',
      conversionId: `CONV${Date.now()}`,
      planDetails: selectedPlan,
      estimatedCompletionTime: '24 hours',
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    this.conversions.push(conversionRecord);
    
    return cloneData(conversionRecord);
  }

  async getConversionStatus(conversionId) {
    await delay(200);
    
    const conversion = this.conversions.find(conv => conv.conversionId === conversionId);
    if (!conversion) {
      throw new Error(`Conversion with ID ${conversionId} not found`);
    }
    
    // Simulate status progression
    const createdTime = new Date(conversion.createdAt).getTime();
    const currentTime = Date.now();
    const hoursSinceCreation = (currentTime - createdTime) / (1000 * 60 * 60);
    
    let status = 'processing';
    if (hoursSinceCreation > 24) {
      status = 'completed';
    } else if (hoursSinceCreation > 2) {
      status = 'in-progress';
    }
    
    return {
      ...cloneData(conversion),
      status,
      lastUpdated: new Date().toISOString()
    };
  }

  async getAllConversions() {
    await delay(200);
    return cloneData(this.conversions);
  }

  async getConversionById(id) {
    await delay(150);
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid ID provided');
    }
    
    const conversion = this.conversions.find(item => item.Id === id);
    if (!conversion) {
      throw new Error(`Conversion record with Id ${id} not found`);
    }
    
    return cloneData(conversion);
  }

  async updateConversionStatus(id, newStatus, comments = '') {
    await delay(250);
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid ID provided for update operation');
    }
    
    const index = this.conversions.findIndex(conv => conv.Id === id);
    if (index === -1) {
      throw new Error(`Conversion record with Id ${id} not found`);
    }
    
    const validStatuses = ['pending', 'processing', 'in-progress', 'completed', 'failed', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    this.conversions[index] = {
      ...this.conversions[index],
      status: newStatus,
      comments: comments,
      lastUpdated: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return cloneData(this.conversions[index]);
  }

  async deleteConversion(id) {
    await delay(200);
    
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid ID provided for delete operation');
    }
    
    const index = this.conversions.findIndex(conv => conv.Id === id);
    if (index === -1) {
      throw new Error(`Conversion record with Id ${id} not found`);
    }
    
    const deletedConversion = this.conversions.splice(index, 1)[0];
    return cloneData(deletedConversion);
  }

  async getConversionsByMobile(mobileNumber) {
    await delay(200);
    
    const userConversions = this.conversions.filter(
      conv => conv.mobileNumber === mobileNumber
    );
    
    return cloneData(userConversions);
  }

  async getConversionsByStatus(status) {
    await delay(200);
    
    const filteredConversions = this.conversions.filter(
      conv => conv.status === status
    );
    
    return cloneData(filteredConversions);
  }

  async getConversionStats() {
    await delay(150);
    
    const stats = this.conversions.reduce((acc, conversion) => {
      acc.total++;
      acc[conversion.status] = (acc[conversion.status] || 0) + 1;
      
      if (conversion.planDetails) {
        acc.byPlan = acc.byPlan || {};
        acc.byPlan[conversion.planDetails.name] = (acc.byPlan[conversion.planDetails.name] || 0) + 1;
      }
      
      return acc;
    }, { total: 0 });
    
    return stats;
  }

  // Additional utility methods
  async calculateConversionBenefits(currentPlan, targetPlanId) {
    await delay(200);
    
    const targetPlan = this.postpaidPlans.find(plan => plan.Id === targetPlanId);
    if (!targetPlan) {
      throw new Error('Target plan not found');
    }
    
    // Mock calculation of benefits
    return {
      targetPlan: targetPlan,
      benefits: [
        'No recharge reminders - automatic monthly billing',
        `${targetPlan.data} high-speed data`,
        'Priority network access',
        'Free roaming across India',
        'Enhanced customer support'
      ],
      additionalFeatures: targetPlan.features,
      monthlyCharge: targetPlan.price,
      securityDeposit: targetPlan.price * 2, // 2x monthly charge
      estimatedSavings: Math.floor(Math.random() * 200) + 100 // Random savings between 100-300
    };
  }

  async cancelConversion(conversionId, reason) {
    await delay(300);
    
    const conversion = this.conversions.find(conv => conv.conversionId === conversionId);
    if (!conversion) {
      throw new Error(`Conversion with ID ${conversionId} not found`);
    }
    
    if (conversion.status === 'completed') {
      throw new Error('Cannot cancel completed conversion');
    }
    
    const index = this.conversions.findIndex(conv => conv.conversionId === conversionId);
    this.conversions[index] = {
      ...this.conversions[index],
      status: 'cancelled',
      cancellationReason: reason,
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return cloneData(this.conversions[index]);
  }
}

// Create and export singleton instance
const conversionService = new ConversionService();

export default conversionService;
export { ConversionService, conversionService };