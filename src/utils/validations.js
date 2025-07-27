import { VALIDATION_RULES, ERROR_MESSAGES } from './constants';

// Basic validation functions
export const required = (value) => {
  if (value === null || value === undefined) return ERROR_MESSAGES.REQUIRED;
  if (typeof value === 'string' && value.trim() === '') return ERROR_MESSAGES.REQUIRED;
  if (Array.isArray(value) && value.length === 0) return ERROR_MESSAGES.REQUIRED;
  return null;
};

export const email = (value) => {
  if (!value) return null; // Skip if empty (use required for mandatory fields)
  if (!VALIDATION_RULES.EMAIL.test(value)) return ERROR_MESSAGES.INVALID_EMAIL;
  return null;
};

export const phone = (value) => {
  if (!value) return null;
  if (!VALIDATION_RULES.PHONE.test(value)) return ERROR_MESSAGES.INVALID_PHONE;
  return null;
};

export const password = (value) => {
  if (!value) return null;
  if (!VALIDATION_RULES.PASSWORD.test(value)) return ERROR_MESSAGES.INVALID_PASSWORD;
  return null;
};

export const studentId = (value) => {
  if (!value) return null;
  if (!VALIDATION_RULES.STUDENT_ID.test(value)) return ERROR_MESSAGES.INVALID_STUDENT_ID;
  return null;
};

export const grNumber = (value) => {
  if (!value) return null;
  if (!VALIDATION_RULES.GR_NUMBER.test(value)) return ERROR_MESSAGES.INVALID_GR_NUMBER;
  return null;
};

// Length validations
export const minLength = (min) => (value) => {
  if (!value) return null;
  if (value.length < min) return ERROR_MESSAGES.MIN_LENGTH(min);
  return null;
};

export const maxLength = (max) => (value) => {
  if (!value) return null;
  if (value.length > max) return ERROR_MESSAGES.MAX_LENGTH(max);
  return null;
};

// Numeric validations
export const minValue = (min) => (value) => {
  if (value === null || value === undefined) return null;
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue < min) return ERROR_MESSAGES.MIN_VALUE(min);
  return null;
};

export const maxValue = (max) => (value) => {
  if (value === null || value === undefined) return null;
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue > max) return ERROR_MESSAGES.MAX_VALUE(max);
  return null;
};

export const positiveNumber = (value) => {
  if (value === null || value === undefined) return null;
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue <= 0) return 'Must be a positive number';
  return null;
};

// Date validations
export const futureDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date <= today) return 'Date must be in the future';
  return null;
};

export const pastDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (date >= today) return 'Date must be in the past';
  return null;
};

export const validDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return 'Please enter a valid date';
  return null;
};

// File validations
export const fileSize = (maxSizeMB) => (file) => {
  if (!file) return null;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) return ERROR_MESSAGES.FILE_SIZE(maxSizeMB);
  return null;
};

export const fileType = (allowedTypes) => (file) => {
  if (!file) return null;
  const extension = file.name.split('.').pop().toLowerCase();
  if (!allowedTypes.includes(extension)) return ERROR_MESSAGES.FILE_TYPE(allowedTypes);
  return null;
};

// URL validations
export const validUrl = (value) => {
  if (!value) return null;
  try {
    new URL(value);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
};

// Custom validations
export const matches = (pattern, message) => (value) => {
  if (!value) return null;
  if (!pattern.test(value)) return message;
  return null;
};

export const oneOf = (allowedValues, message) => (value) => {
  if (!value) return null;
  if (!allowedValues.includes(value)) return message;
  return null;
};

export const unique = (existingValues, message) => (value) => {
  if (!value) return null;
  if (existingValues.includes(value)) return message;
  return null;
};

// Form validation helper
export const validateForm = (values, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field];
    const value = values[field];
    
    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return errors;
};

// Async validation helper
export const validateAsync = async (values, asyncRules) => {
  const errors = {};
  
  const promises = Object.keys(asyncRules).map(async field => {
    const fieldRules = asyncRules[field];
    const value = values[field];
    
    for (const rule of fieldRules) {
      const error = await rule(value);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });
  
  await Promise.all(promises);
  return errors;
};

// Common validation rules
export const commonValidations = {
  email: [required, email],
  password: [required, password],
  phone: [required, phone],
  name: [required, minLength(2), maxLength(50)],
  description: [maxLength(500)],
  amount: [required, positiveNumber],
  date: [required, validDate],
  url: [validUrl],
  studentId: [required, studentId],
  grNumber: [required, grNumber]
};

// Export all validation functions
export default {
  required,
  email,
  phone,
  password,
  studentId,
  grNumber,
  minLength,
  maxLength,
  minValue,
  maxValue,
  positiveNumber,
  futureDate,
  pastDate,
  validDate,
  fileSize,
  fileType,
  validUrl,
  matches,
  oneOf,
  unique,
  validateForm,
  validateAsync,
  commonValidations
};