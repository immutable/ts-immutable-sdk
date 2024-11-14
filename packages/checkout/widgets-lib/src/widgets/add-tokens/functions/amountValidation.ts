const VALID_NUMBER_REGEX = /^(0|[1-9]\d*)(\.\d*)?$/;

/**
 * Validate the amount input
 * @param amount - The amount to validate
 * @returns An object containing the sanitized value, the float amount, and a boolean indicating if the amount is valid
 */
export const validateToAmount = (amount: string) => {
  const value = amount || '';
  const sanitizedValue = value.replace(/^0+(?=\d)/, '');
  const isValid = VALID_NUMBER_REGEX.test(sanitizedValue);
  const floatAmount = isValid ? parseFloat(sanitizedValue) : NaN;

  return { value: sanitizedValue, amount: floatAmount, isValid: isValid && floatAmount > 0 };
};
