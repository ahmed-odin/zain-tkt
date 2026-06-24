/**
 * Validate ticket title (MISSDN)
 */
export function validateMissdn(value) {
  if (!value || !value.trim()) {
    return 'validation.requiredMissdn';
  }
  if (!/^[0-9]+$/.test(value)) {
    return 'validation.invalidMissdn';
  }
  if (value.length !== 10) {
    return 'validation.lengthMissdn';
  }
  return '';
}

/**
 * Validate governorate selection
 */
export function validateGovernorate(value) {
  if (!value || !value.trim()) {
    return 'validation.requiredGov';
  }
  return '';
}

/**
 * Validate comments
 */
export function validateComments(value) {
  if (value && value.length > 500) {
    return 'validation.maxLengthComments';
  }
  return '';
}

/**
 * Validate problem description (required, min 10, max 1000)
 */
export function validateProblemDescription(value) {
  // Make intermediary comment optional: only validate when non-empty
  if (!value || !value.trim()) {
    return '';
  }
  if (value.trim().length < 10) {
    return 'validation.minLengthDesc';
  }
  if (value.length > 1000) {
    return 'validation.maxLengthDesc';
  }
  return '';
}

/**
 * Validate status
 */
export function validateStatus(value) {
  const validStatuses = ['Pending', 'Complete'];
  if (!validStatuses.includes(value)) {
    return 'validation.invalidStatus';
  }
  return '';
}

/**
 * Validate all ticket fields
 */
export function validateTicketForm(formData) {
  const errors = {};
  
  const missdnError = validateMissdn(formData.missdn);
  if (missdnError) errors.missdn = missdnError;
  
  const problemError = validateProblemDescription(formData.problemDescription);
  if (problemError) errors.problemDescription = problemError;
  
  const governorateError = validateGovernorate(formData.governorate);
  if (governorateError) errors.governorate = governorateError;
  
  const commentsError = validateComments(formData.comments);
  if (commentsError) errors.comments = commentsError;
  
  const statusError = validateStatus(formData.status);
  if (statusError) errors.status = statusError;
  
  return errors;
}

/**
 * Validate login credentials
 */
export function validateCredentials(username, password) {
  const errors = {};
  
  if (!username || !username.trim()) {
    errors.username = 'validation.requiredUsername';
  }
  
  if (!password) {
    errors.password = 'validation.requiredPassword';
  }
  
  return errors;
}
