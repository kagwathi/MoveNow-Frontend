// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (Kenyan format)
export const validatePhone = (phone) => {
  // Remove spaces and check format
  const cleanPhone = phone.replace(/\s/g, '');
  const phoneRegex = /^(\+254|254|0)[17]\d{8}$/;
  return phoneRegex.test(cleanPhone);
};

// Password strength validation
export const validatePassword = (password) => {
  const rules = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[@$!%*?&]/.test(password),
  };

  const isValid = Object.values(rules).every((rule) => rule);

  return {
    isValid,
    rules,
    score: Object.values(rules).filter((rule) => rule).length,
  };
};

// Name validation
export const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return nameRegex.test(name.trim());
};

// Form validation helper
export const validateForm = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const value = data[field];
    const fieldRules = rules[field];

    if (fieldRules.required && !value) {
      errors[field] = `${field.replace('_', ' ')} is required`;
      return;
    }

    if (value && fieldRules.email && !validateEmail(value)) {
      errors[field] = 'Please enter a valid email address';
    }

    if (value && fieldRules.phone && !validatePhone(value)) {
      errors[field] = 'Please enter a valid phone number';
    }

    if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] = `Must be at least ${fieldRules.minLength} characters`;
    }

    if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[field] = `Must be less than ${fieldRules.maxLength} characters`;
    }

    if (value && fieldRules.match && value !== data[fieldRules.match]) {
      errors[field] = 'Values do not match';
    }

    if (value && fieldRules.custom && !fieldRules.custom(value)) {
      errors[field] = fieldRules.customMessage || 'Invalid value';
    }
  });

  return errors;
};
