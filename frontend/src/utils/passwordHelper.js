/**
 * Password validation utility functions
 */

/**
 * Checks password strength against criteria
 * @param {string} password - The password to validate
 * @returns {Object} Validation result with score and feedback
 */
export const validatePasswordStrength = (password) => {
  if (!password) {
    return {
      isValid: false,
      score: 0,
      feedback: 'Password is required'
    };
  }

  // Check minimum length
  if (password.length < 8) {
    return {
      isValid: false,
      score: 0,
      feedback: 'Password must be at least 8 characters long'
    };
  }

  // Check for complexity requirements
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);
  
  const criteriaCount = [hasLowercase, hasUppercase, hasNumber, hasSpecialChar].filter(Boolean).length;
  
  if (criteriaCount < 3) {
    return {
      isValid: false,
      score: criteriaCount,
      feedback: 'Password must contain at least 3 of the following: lowercase letters, uppercase letters, numbers, special characters'
    };
  }

  // Password is valid, determine strength score
  let strengthLabel = '';
  if (criteriaCount === 3) {
    strengthLabel = 'Good';
  } else if (criteriaCount === 4) {
    strengthLabel = 'Strong';
  }

  return {
    isValid: true,
    score: criteriaCount,
    feedback: `Password strength: ${strengthLabel}`
  };
};

/**
 * Validates that passwords match
 * @param {string} password - The original password
 * @param {string} confirmPassword - The confirmation password
 * @returns {boolean} Whether passwords match
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};
