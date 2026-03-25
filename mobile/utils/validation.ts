/**
 * Email and form validation utilities
 */

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateFPTEmail = (email: string): boolean => {
  return email.toLowerCase().endsWith('@fpt.edu.vn');
};

export const validateLoginForm = (email: string, password: string): string | null => {
  // Check empty fields
  if (!email.trim() || !password.trim()) {
    return 'Please fill in all fields';
  }

  // Check email format
  if (!validateEmail(email)) {
    return 'Please enter a valid email address';
  }

  // Check FPT email domain
  if (!validateFPTEmail(email)) {
    return 'Please use FPT University email (@fpt.edu.vn)';
  }

  // Check password length
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }

  return null;
};

export const validateRegisterForm = (
  email: string,
  password: string,
  confirmPassword: string,
  fullName: string,
): string | null => {
  if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
    return 'Please fill in all fields';
  }

  if (!validateEmail(email)) {
    return 'Please enter a valid email address';
  }

  if (!validateFPTEmail(email)) {
    return 'Please use FPT University email (@fpt.edu.vn)';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  if (password !== confirmPassword) {
    return 'Confirm password does not match';
  }

  return null;
};

/**
 * Extract error message from various error types
 */
export const getErrorMessage = (error: any): string => {
  // If it's already a string
  if (typeof error === 'string') {
    return error;
  }

  // If it's an Error object
  if (error instanceof Error) {
    return error.message;
  }

  // If it has a message property (API response)
  if (error?.message && typeof error.message === 'string') {
    return error.message;
  }

  // If it has a data property with message
  if (error?.data?.message && typeof error.data.message === 'string') {
    return error.data.message;
  }

  // If it's a response error from axios
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again.';
};
