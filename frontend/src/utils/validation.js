// Validation utilities for user registration

// Username validation rules
export const validateUsername = (username) => {
  const trimmed = username?.trim();
  
  if (!trimmed) {
    return { isValid: false, message: 'Username is required' };
  }
  
  if (trimmed.length < 3) {
    return { isValid: false, message: 'Username must be at least 3 characters long' };
  }
  
  if (trimmed.length > 20) {
    return { isValid: false, message: 'Username must be less than 20 characters' };
  }
  
  // Only allow alphanumeric characters and underscores
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }
  
  // Cannot start or end with underscore
  if (trimmed.startsWith('_') || trimmed.endsWith('_')) {
    return { isValid: false, message: 'Username cannot start or end with underscore' };
  }
  
  // Cannot have consecutive underscores
  if (trimmed.includes('__')) {
    return { isValid: false, message: 'Username cannot have consecutive underscores' };
  }
  
  return { isValid: true, message: '', value: trimmed };
};

// Password validation rules
export const validatePassword = (password) => {
  const trimmed = password?.trim();
  
  if (!trimmed) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (trimmed.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (trimmed.length > 128) {
    return { isValid: false, message: 'Password must be less than 128 characters' };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(trimmed)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(trimmed)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  // Check for at least one number
  if (!/\d/.test(trimmed)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(trimmed)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  
  // Check for common weak patterns
  if (/(.)\1{2,}/.test(trimmed)) {
    return { isValid: false, message: 'Password cannot contain more than 2 consecutive identical characters' };
  }
  
  // Check for common sequences
  if (/123|abc|qwe|asd|zxc/i.test(trimmed)) {
    return { isValid: false, message: 'Password cannot contain common sequences like 123, abc, etc.' };
  }
  
  return { isValid: true, message: '', value: trimmed };
};

// Email validation
export const validateEmail = (email) => {
  const trimmed = email?.trim();
  
  if (!trimmed) {
    return { isValid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  if (trimmed.length > 254) {
    return { isValid: false, message: 'Email address is too long' };
  }
  
  return { isValid: true, message: '', value: trimmed };
};

// Name validation
export const validateName = (name) => {
  const trimmed = name?.trim();
  
  if (!trimmed) {
    return { isValid: false, message: 'Name is required' };
  }
  
  if (trimmed.length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }
  
  if (trimmed.length > 50) {
    return { isValid: false, message: 'Name must be less than 50 characters' };
  }
  
  // Only allow letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(trimmed)) {
    return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { isValid: true, message: '', value: trimmed };
};

// Password confirmation validation
export const validatePasswordConfirmation = (password, confirmPassword) => {
  const trimmedConfirm = confirmPassword?.trim();
  
  if (!trimmedConfirm) {
    return { isValid: false, message: 'Please confirm your password' };
  }
  
  if (password !== trimmedConfirm) {
    return { isValid: false, message: 'Passwords do not match' };
  }
  
  return { isValid: true, message: '', value: trimmedConfirm };
};

// Comprehensive form validation
export const validateRegistrationForm = (formData) => {
  const errors = {};
  const validatedData = {};
  
  // Validate name
  const nameValidation = validateName(formData.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
  } else {
    validatedData.name = nameValidation.value;
  }
  
  // Validate username
  const usernameValidation = validateUsername(formData.username);
  if (!usernameValidation.isValid) {
    errors.username = usernameValidation.message;
  } else {
    validatedData.username = usernameValidation.value;
  }
  
  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
  } else {
    validatedData.email = emailValidation.value;
  }
  
  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
  } else {
    validatedData.password = passwordValidation.value;
  }
  
  // Validate password confirmation
  const confirmPasswordValidation = validatePasswordConfirmation(formData.password, formData.confirmPassword);
  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation.message;
  } else {
    validatedData.confirmPassword = confirmPasswordValidation.value;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    validatedData
  };
};

// Real-time validation for input fields
export const getFieldValidation = (fieldName, value, formData = {}) => {
  switch (fieldName) {
    case 'name':
      return validateName(value);
    case 'username':
      return validateUsername(value);
    case 'email':
      return validateEmail(value);
    case 'password':
      return validatePassword(value);
    case 'confirmPassword':
      return validatePasswordConfirmation(formData.password, value);
    default:
      return { isValid: true, message: '', value: value?.trim() };
  }
};
