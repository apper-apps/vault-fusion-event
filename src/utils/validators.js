// KYC form validation utilities

export const validatePAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

export const validateGSTIN = (gstin) => {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
};

export const validateAadhaar = (aadhaar) => {
  const aadhaarRegex = /^\d{12}$/;
  return aadhaarRegex.test(aadhaar.replace(/\s/g, ''));
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateMobile = (mobile) => {
  const mobileRegex = /^(\+91[-\s]?)?[0]?(91)?[6789]\d{9}$/;
  return mobileRegex.test(mobile.replace(/\s/g, ''));
};

// Enhanced mobile number formatting
export const formatMobileNumber = (mobile) => {
  // Remove all non-digits
  const digits = mobile.replace(/\D/g, '');
  
  // Limit to 10 digits
  const limited = digits.slice(0, 10);
  
  return limited;
};

// Format mobile for display (with masking)
export const formatMobileForDisplay = (mobile, maskDigits = 4) => {
  const cleaned = mobile.replace(/\D/g, '');
  if (cleaned.length !== 10) return mobile;
  
  const masked = cleaned.slice(0, -maskDigits) + '*'.repeat(maskDigits);
  return masked.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
};

export const validateCIN = (cin) => {
  if (!cin) return true; // CIN is optional
  const cinRegex = /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/;
  return cinRegex.test(cin);
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const validateFileType = (file, allowedTypes) => {
  const fileExtension = file.name.split('.').pop().toLowerCase();
  const mimeType = file.type.toLowerCase();
  
  return allowedTypes.some(type => 
    mimeType.includes(type.replace('.', '')) || 
    fileExtension === type.replace('.', '')
  );
};

export const validateFileSize = (file, maxSizeInMB) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

// Comprehensive form validation
export const validateKYCForm = (formData) => {
  const errors = {};

  // Personal Details validation
  const personal = formData.personalDetails || {};
  if (!validateRequired(personal.fullName)) {
    errors['personalDetails.fullName'] = 'Full name is required';
  }
  if (!validateRequired(personal.mobile)) {
    errors['personalDetails.mobile'] = 'Mobile number is required';
  } else if (!validateMobile(personal.mobile)) {
    errors['personalDetails.mobile'] = 'Invalid mobile number format';
  }
  if (!validateRequired(personal.email)) {
    errors['personalDetails.email'] = 'Email is required';
  } else if (!validateEmail(personal.email)) {
    errors['personalDetails.email'] = 'Invalid email format';
  }
  if (!validateRequired(personal.pan)) {
    errors['personalDetails.pan'] = 'PAN is required';
  } else if (!validatePAN(personal.pan)) {
    errors['personalDetails.pan'] = 'Invalid PAN format';
  }
  if (!validateRequired(personal.aadhaar)) {
    errors['personalDetails.aadhaar'] = 'Aadhaar number is required';
  } else if (!validateAadhaar(personal.aadhaar)) {
    errors['personalDetails.aadhaar'] = 'Invalid Aadhaar number';
  }
  if (!validateRequired(personal.dateOfBirth)) {
    errors['personalDetails.dateOfBirth'] = 'Date of birth is required';
  }

  // Business Details validation
  const business = formData.businessDetails || {};
  if (!validateRequired(business.companyName)) {
    errors['businessDetails.companyName'] = 'Company name is required';
  }
  if (!validateRequired(business.businessType)) {
    errors['businessDetails.businessType'] = 'Business type is required';
  }
  if (!validateRequired(business.gstin)) {
    errors['businessDetails.gstin'] = 'GSTIN is required';
  } else if (!validateGSTIN(business.gstin)) {
    errors['businessDetails.gstin'] = 'Invalid GSTIN format';
  }
  if (business.cin && !validateCIN(business.cin)) {
    errors['businessDetails.cin'] = 'Invalid CIN format';
  }
  if (!validateRequired(business.address)) {
    errors['businessDetails.address'] = 'Business address is required';
  }

  // Telecom Usage validation
  const telecom = formData.telecomUsage || {};
  if (!telecom.intendedUse || telecom.intendedUse.length === 0) {
    errors['telecomUsage.intendedUse'] = 'At least one intended use must be selected';
  }
  if (!validateRequired(telecom.trafficType)) {
    errors['telecomUsage.trafficType'] = 'Traffic type is required';
  }

  // Authorized Signatory validation
  const signatory = formData.authorizedSignatory || {};
  if (!validateRequired(signatory.name)) {
    errors['authorizedSignatory.name'] = 'Signatory name is required';
  }
  if (!validateRequired(signatory.mobile)) {
    errors['authorizedSignatory.mobile'] = 'Signatory mobile is required';
  } else if (!validateMobile(signatory.mobile)) {
    errors['authorizedSignatory.mobile'] = 'Invalid mobile number format';
  }
  if (!validateRequired(signatory.email)) {
    errors['authorizedSignatory.email'] = 'Signatory email is required';
  } else if (!validateEmail(signatory.email)) {
    errors['authorizedSignatory.email'] = 'Invalid email format';
  }
  if (!validateRequired(signatory.designation)) {
    errors['authorizedSignatory.designation'] = 'Designation is required';
  }

  // Document validation
  if (!personal.panDocument || personal.panDocument.length === 0) {
    errors['documents.panDocument'] = 'PAN card document is required';
  }
  if (!business.gstDocument || business.gstDocument.length === 0) {
    errors['documents.gstDocument'] = 'GST certificate is required';
  }
  if (!business.companyPanDocument || business.companyPanDocument.length === 0) {
    errors['documents.companyPanDocument'] = 'Company PAN document is required';
  }
  if (!business.addressProof || business.addressProof.length === 0) {
    errors['documents.addressProof'] = 'Address proof is required';
  }
  if (!telecom.complianceForm || telecom.complianceForm.length === 0) {
    errors['documents.complianceForm'] = 'Telecom compliance form is required';
  }
  if (!signatory.authorizationLetter || signatory.authorizationLetter.length === 0) {
    errors['documents.authorizationLetter'] = 'Authorization letter is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
};
};

// Self-KYC specific validators
// Enhanced OTP validation with detailed feedback
export const validateOTP = (otp) => {
  if (!otp) return false;
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp.replace(/\s/g, ''));
};

// Enhanced alternate mobile validation
export const validateAlternateMobile = (mobile, primaryMobile) => {
  if (!mobile || mobile.trim() === '') {
    return { isValid: false, message: 'Alternate mobile number is required' };
  }
  
  const cleanMobile = mobile.replace(/\D/g, '');
  const cleanPrimary = primaryMobile ? primaryMobile.replace(/\D/g, '') : '';
  
  if (cleanMobile.length !== 10) {
    return { isValid: false, message: 'Mobile number must be exactly 10 digits' };
  }
  
  if (!validateMobile(mobile)) {
    return { isValid: false, message: 'Please enter a valid Indian mobile number starting with 6, 7, 8, or 9' };
  }
  
  if (cleanMobile === cleanPrimary) {
    return { isValid: false, message: 'Alternate mobile cannot be same as primary mobile number' };
  }
  
  return { isValid: true };
};

export const validateRelationship = (relationship) => {
  const validRelationships = [
    'father', 'mother', 'spouse', 'son', 'daughter', 
    'brother', 'sister', 'friend', 'colleague', 'business_partner'
  ];
  
  return validRelationships.includes(relationship.toLowerCase());
};

// Enhanced Self-KYC form validation with comprehensive feedback
export const validateSelfKYCForm = (formData) => {
  const errors = {};
  
  // Primary mobile validation
  if (!validateRequired(formData.primaryMobile)) {
    errors.primaryMobile = 'Primary mobile number is required';
  } else {
    const cleanPrimary = formData.primaryMobile.replace(/\D/g, '');
    if (cleanPrimary.length !== 10) {
      errors.primaryMobile = 'Primary mobile must be exactly 10 digits';
    } else if (!validateMobile(formData.primaryMobile)) {
      errors.primaryMobile = 'Please enter a valid Indian mobile number starting with 6, 7, 8, or 9';
    }
  }
  
  // Alternate mobile validation
  if (!validateRequired(formData.alternateMobile)) {
    errors.alternateMobile = 'Alternate mobile number is required for verification';
  } else {
    const altMobileValidation = validateAlternateMobile(formData.alternateMobile, formData.primaryMobile);
    if (!altMobileValidation.isValid) {
      errors.alternateMobile = altMobileValidation.message;
    }
  }
  
  // Contact name validation
  if (!validateRequired(formData.contactName)) {
    errors.contactName = 'Contact person name is required';
  } else if (formData.contactName.trim().length < 2) {
    errors.contactName = 'Contact name must be at least 2 characters long';
  } else if (!/^[a-zA-Z\s.]+$/.test(formData.contactName.trim())) {
    errors.contactName = 'Contact name can only contain letters, spaces, and dots';
  }
  
  // Relationship validation
  if (!validateRequired(formData.relationship)) {
    errors.relationship = 'Please select your relationship with the contact person';
  } else if (!validateRelationship(formData.relationship)) {
    errors.relationship = 'Please select a valid relationship from the dropdown';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    completeness: Object.values(formData).filter(v => v && v.trim()).length / 4 * 100
  };
};

// Debounced validation for real-time feedback
export const createDebouncedValidator = (validator, delay = 300) => {
  let timeoutId;
  
  return (...args) => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        resolve(validator(...args));
      }, delay);
    });
  };
};

// UIDAI and DigiLocker specific validators
export const validateUIDAIResponse = (response) => {
  if (!response || typeof response !== 'object') {
    return { isValid: false, message: 'Invalid UIDAI response format' };
  }
  
  if (!response.kycData) {
    return { isValid: false, message: 'KYC data missing from UIDAI response' };
  }
  
  const requiredFields = ['name', 'dateOfBirth', 'gender', 'address'];
  const missingFields = requiredFields.filter(field => !response.kycData[field]);
  
  if (missingFields.length > 0) {
    return { isValid: false, message: `Missing required fields: ${missingFields.join(', ')}` };
  }
  
  return { isValid: true };
};

export const validateDigiLockerDocument = (document) => {
  if (!document || typeof document !== 'object') {
    return { isValid: false, message: 'Invalid document format' };
  }
  
  const requiredFields = ['id', 'name', 'type', 'issuer'];
  const missingFields = requiredFields.filter(field => !document[field]);
  
  if (missingFields.length > 0) {
    return { isValid: false, message: `Missing document fields: ${missingFields.join(', ')}` };
  }
return { isValid: true };
};

// DoT Compliance Validators
export const validateTerritorialBoundary = (documentTerritory, userTerritory) => {
  if (!documentTerritory || !userTerritory) {
    return { isValid: false, message: 'Territory information is required for validation' };
  }

  const isSameState = documentTerritory.state === userTerritory.state;
  const isCrossBoundaryAllowed = true; // In real implementation, this would check DoT rules

  if (!isSameState && !isCrossBoundaryAllowed) {
    return { 
      isValid: false, 
      message: `Cross-boundary verification not allowed between ${documentTerritory.state} and ${userTerritory.state}` 
    };
  }

  return { isValid: true, territoryMatch: isSameState };
};

export const validateFaceMatchingResult = (matchingResult) => {
  if (!matchingResult || typeof matchingResult !== 'object') {
    return { isValid: false, message: 'Invalid face matching result format' };
  }

  const requiredFields = ['confidence', 'status', 'faceRecords'];
  const missingFields = requiredFields.filter(field => !matchingResult[field]);

  if (missingFields.length > 0) {
    return { isValid: false, message: `Missing face matching fields: ${missingFields.join(', ')}` };
  }

  if (matchingResult.confidence < 70) {
    return { isValid: false, message: `Face matching confidence too low: ${matchingResult.confidence}%` };
  }

  if (!matchingResult.faceRecords?.noError) {
    return { isValid: false, message: 'Errors detected in face records validation' };
  }

  return { isValid: true };
};

export const validateLivePhotoClarity = (photoValidation) => {
  if (!photoValidation || typeof photoValidation !== 'object') {
    return { isValid: false, message: 'Invalid photo validation data' };
  }

  const minClarityScore = 85;
  if (photoValidation.clarity?.score < minClarityScore) {
    return { 
      isValid: false, 
      message: `Photo clarity score too low: ${photoValidation.clarity?.score}%. Minimum required: ${minClarityScore}%` 
    };
  }

  const requiredChecks = ['face_detected', 'eyes_visible', 'proper_lighting', 'no_blur'];
  const failedChecks = requiredChecks.filter(check => !photoValidation.checks?.[check]);

  if (failedChecks.length > 0) {
    return { isValid: false, message: `Failed photo checks: ${failedChecks.join(', ')}` };
  }

  return { isValid: true };
};

export const validateDocumentAuthenticity = (authenticityResult) => {
  if (!authenticityResult || typeof authenticityResult !== 'object') {
    return { isValid: false, message: 'Invalid authenticity result format' };
  }

  if (!authenticityResult.authentic) {
    return { isValid: false, message: 'Document failed authenticity verification' };
  }

  if (authenticityResult.tampering) {
    return { isValid: false, message: 'Document tampering detected' };
  }

  if (!authenticityResult.issuerVerified) {
    return { isValid: false, message: 'Document issuer could not be verified' };
  }

  return { isValid: true };
};

export const validateCompleteDoTVerification = (dotComplianceData) => {
  const errors = {};

  if (!dotComplianceData.authenticityVerification) {
    errors.authenticity = 'Document authenticity verification is required';
  }

  if (!dotComplianceData.faceMatching) {
    errors.faceMatching = 'Face matching verification is required';
  }

  if (!dotComplianceData.territorialValidation) {
    errors.territorial = 'Territorial boundary validation is required';
  }

  if (!dotComplianceData.livePhotoValidation) {
    errors.livePhoto = 'Live photo validation is required';
  }

  // Validate individual components
  if (dotComplianceData.faceMatching) {
    const faceValidation = validateFaceMatchingResult(dotComplianceData.faceMatching);
    if (!faceValidation.isValid) {
      errors.faceMatching = faceValidation.message;
    }
  }

  if (dotComplianceData.livePhotoValidation) {
    const photoValidation = validateLivePhotoClarity(dotComplianceData.livePhotoValidation);
    if (!photoValidation.isValid) {
      errors.livePhoto = photoValidation.message;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Conversion validators
export const validateConversionPlan = (planId, availablePlans) => {
  if (!planId) {
    return { isValid: false, message: 'Plan selection is required' };
  }
  
  if (!availablePlans || !Array.isArray(availablePlans)) {
    return { isValid: false, message: 'Available plans data is invalid' };
  }
  
  const selectedPlan = availablePlans.find(plan => plan.Id === planId);
  if (!selectedPlan) {
    return { isValid: false, message: 'Selected plan not found' };
  }
  
  return { isValid: true, plan: selectedPlan };
};

export const validateConversionEligibility = (eligibilityData) => {
  if (!eligibilityData) {
    return { isValid: false, message: 'Eligibility data is required' };
  }
  
  if (!eligibilityData.eligible) {
    return { 
      isValid: false, 
      message: eligibilityData.reason || 'Not eligible for conversion' 
    };
  }
  
  return { isValid: true };
};

// CAF form validators
export const validateCAFPersonalDetails = (personalDetails) => {
  const errors = {};
  
  if (!validateRequired(personalDetails.fullName)) {
    errors.fullName = 'Full name is required';
  }
  
  if (!validateRequired(personalDetails.dateOfBirth)) {
    errors.dateOfBirth = 'Date of birth is required';
  }
  
  if (!validateRequired(personalDetails.gender)) {
    errors.gender = 'Gender is required';
  }
  
  if (!validateRequired(personalDetails.mobile)) {
    errors.mobile = 'Mobile number is required';
  } else if (!validateMobile(personalDetails.mobile)) {
    errors.mobile = 'Invalid mobile number format';
  }
  
  if (!validateRequired(personalDetails.email)) {
    errors.email = 'Email is required';
  } else if (!validateEmail(personalDetails.email)) {
    errors.email = 'Invalid email format';
  }
  
  if (!validateRequired(personalDetails.aadhaarNumber)) {
    errors.aadhaarNumber = 'Aadhaar number is required';
  } else if (!validateAadhaar(personalDetails.aadhaarNumber)) {
    errors.aadhaarNumber = 'Invalid Aadhaar number';
  }
  
  if (!validateRequired(personalDetails.panNumber)) {
    errors.panNumber = 'PAN number is required';
  } else if (!validatePAN(personalDetails.panNumber)) {
    errors.panNumber = 'Invalid PAN format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateCAFAddressDetails = (addressDetails) => {
  const errors = {};
  
  if (!validateRequired(addressDetails.residentialAddress)) {
    errors.residentialAddress = 'Residential address is required';
  }
  
  if (!validateRequired(addressDetails.permanentAddress)) {
    errors.permanentAddress = 'Permanent address is required';
  }
  
  if (!validateRequired(addressDetails.city)) {
    errors.city = 'City is required';
  }
  
  if (!validateRequired(addressDetails.state)) {
    errors.state = 'State is required';
  }
  
  if (!validateRequired(addressDetails.pincode)) {
    errors.pincode = 'PIN code is required';
  } else if (!/^\d{6}$/.test(addressDetails.pincode)) {
    errors.pincode = 'PIN code must be 6 digits';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateCAFBusinessDetails = (businessDetails, customerType) => {
  if (customerType === 'individual') {
    return { isValid: true, errors: {} };
  }
  
  const errors = {};
  
  if (!validateRequired(businessDetails.companyName)) {
    errors.companyName = 'Company name is required';
  }
  
  if (!validateRequired(businessDetails.businessType)) {
    errors.businessType = 'Business type is required';
  }
  
  if (!validateRequired(businessDetails.gstin)) {
    errors.gstin = 'GSTIN is required';
  } else if (!validateGSTIN(businessDetails.gstin)) {
    errors.gstin = 'Invalid GSTIN format';
  }
  
  if (businessDetails.cin && !validateCIN(businessDetails.cin)) {
    errors.cin = 'Invalid CIN format';
  }
  
  if (!validateRequired(businessDetails.authorizedSignatory)) {
    errors.authorizedSignatory = 'Authorized signatory is required';
  }
  
  if (!validateRequired(businessDetails.businessAddress)) {
    errors.businessAddress = 'Business address is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateCAFServiceDetails = (serviceDetails) => {
  const errors = {};
  
  if (!validateRequired(serviceDetails.connectionType)) {
    errors.connectionType = 'Connection type is required';
  }
  
  if (!validateRequired(serviceDetails.planSelected)) {
    errors.planSelected = 'Plan selection is required';
  }
  
  if (!validateRequired(serviceDetails.installationAddress)) {
    errors.installationAddress = 'Installation address is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateCAFDeclarations = (declarations) => {
  const errors = {};
  
  if (!declarations.termsAccepted) {
    errors.termsAccepted = 'Terms and conditions must be accepted';
  }
  
  if (!declarations.kycCompleted) {
    errors.kycCompleted = 'KYC completion confirmation is required';
  }
  
  if (!declarations.informationAccuracy) {
    errors.informationAccuracy = 'Information accuracy declaration is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateCompleteCAFForm = (formData) => {
  const errors = {};
  
  if (!validateRequired(formData.serviceType)) {
    errors.serviceType = 'Service type is required';
  }
  
  if (!validateRequired(formData.customerType)) {
    errors.customerType = 'Customer type is required';
  }
  
  // Validate personal details
  const personalValidation = validateCAFPersonalDetails(formData.personalDetails || {});
  if (!personalValidation.isValid) {
    Object.keys(personalValidation.errors).forEach(key => {
      errors[`personalDetails.${key}`] = personalValidation.errors[key];
    });
  }
  
  // Validate address details
  const addressValidation = validateCAFAddressDetails(formData.addressDetails || {});
  if (!addressValidation.isValid) {
    Object.keys(addressValidation.errors).forEach(key => {
      errors[`addressDetails.${key}`] = addressValidation.errors[key];
    });
  }
  
  // Validate business details (if business customer)
  const businessValidation = validateCAFBusinessDetails(
    formData.businessDetails || {}, 
    formData.customerType
  );
  if (!businessValidation.isValid) {
    Object.keys(businessValidation.errors).forEach(key => {
      errors[`businessDetails.${key}`] = businessValidation.errors[key];
    });
  }
  
  // Validate service details
  const serviceValidation = validateCAFServiceDetails(formData.serviceDetails || {});
  if (!serviceValidation.isValid) {
    Object.keys(serviceValidation.errors).forEach(key => {
      errors[`serviceDetails.${key}`] = serviceValidation.errors[key];
    });
  }
  
  // Validate declarations
  const declarationsValidation = validateCAFDeclarations(formData.declarations || {});
  if (!declarationsValidation.isValid) {
    Object.keys(declarationsValidation.errors).forEach(key => {
      errors[`declarations.${key}`] = declarationsValidation.errors[key];
    });
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Service type validators
export const validateServiceType = (serviceType) => {
  const validServiceTypes = ['new_connection', 'plan_change', 'additional_service', 'upgrade_service'];
  
  if (!serviceType) {
    return { isValid: false, message: 'Service type is required' };
  }
  
  if (!validServiceTypes.includes(serviceType)) {
    return { isValid: false, message: 'Invalid service type' };
  }
  
  return { isValid: true };
};

export const validateConnectionType = (connectionType) => {
  const validConnectionTypes = ['postpaid', 'prepaid', 'hybrid'];
  
  if (!connectionType) {
    return { isValid: false, message: 'Connection type is required' };
  }
  
  if (!validConnectionTypes.includes(connectionType)) {
    return { isValid: false, message: 'Invalid connection type' };
  }
  
  return { isValid: true };
};