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
 * Validate Alwaseet Company field (optional free text, max 5000)
 */
export function validateProblemDescription(value, status = '') {
  if (status === 'Complete' && (!value || !value.trim())) {
    return 'validation.requiredAlwaseetCompany';
  }
  if (!value || !value.trim()) {
    return '';
  }
  if (value.length > 5000) {
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
  
  const problemError = validateProblemDescription(formData.problemDescription, formData.status);
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
