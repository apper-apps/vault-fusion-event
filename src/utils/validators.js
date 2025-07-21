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
export const validateOTP = (otp) => {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
};

export const validateAlternateMobile = (mobile, primaryMobile) => {
  if (!validateMobile(mobile)) {
    return { isValid: false, message: 'Invalid mobile number format' };
  }
  
  if (mobile === primaryMobile) {
    return { isValid: false, message: 'Alternate mobile cannot be same as primary mobile' };
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

export const validateSelfKYCForm = (formData) => {
  const errors = {};
  
  if (!validateRequired(formData.primaryMobile)) {
    errors.primaryMobile = 'Primary mobile number is required';
  } else if (!validateMobile(formData.primaryMobile)) {
    errors.primaryMobile = 'Invalid primary mobile number format';
  }
  
  if (!validateRequired(formData.alternateMobile)) {
    errors.alternateMobile = 'Alternate mobile number is required';
  } else {
    const altMobileValidation = validateAlternateMobile(formData.alternateMobile, formData.primaryMobile);
    if (!altMobileValidation.isValid) {
      errors.alternateMobile = altMobileValidation.message;
    }
  }
  
  if (!validateRequired(formData.contactName)) {
    errors.contactName = 'Contact person name is required';
  }
  
  if (!validateRequired(formData.relationship)) {
    errors.relationship = 'Relationship is required';
  } else if (!validateRelationship(formData.relationship)) {
    errors.relationship = 'Please select a valid relationship';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};