export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const sanitizeString = (input: string): string => {
  // Remove any null bytes, control characters, and trim
  return input.replace(/[\x00-\x1F\x7F]/g, '').trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain an uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain a lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain a number' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, error: 'Password must contain a special character' };
  }
  return { valid: true };
};

export const validateName = (name: string): boolean => {
  // Allow letters, spaces, hyphens, apostrophes (common in names)
  const nameRegex = /^[a-zA-Z\s'-]{1,100}$/;
  return nameRegex.test(name);
};

export const validateCompany = (company: string): boolean => {
  // Allow alphanumeric, spaces, common business characters
  const companyRegex = /^[a-zA-Z0-9\s&.,'-]{1,200}$/;
  return companyRegex.test(company);
};

export const validatePhone = (phone: string): boolean => {
  // International phone format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
};
