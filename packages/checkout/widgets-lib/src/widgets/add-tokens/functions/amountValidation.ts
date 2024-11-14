const VALID_NUMBER_REGEX = /^(0|[1-9]\d*)(\.\d*)?$/;

/**
 * Validate the amount input
 * @param amount - The amount to validate
 * @returns An object containing the sanitized value, the float amount, and a boolean indicating if the amount is valid
 */
export const validateToAmount = (amount: string) => {
  const value = amount || '';
  const sanitizedValue = value.replace(/^0+(?=\d)/, '');
  const floatAmount = parseFloat(sanitizedValue);

  const isValid = VALID_NUMBER_REGEX.test(sanitizedValue) && floatAmount > 0;

  return { value: sanitizedValue, amount: floatAmount, isValid };
};
