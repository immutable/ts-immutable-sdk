export const validateToAmount = (amount: string): boolean => {
  const validNumberRegex = /^[0-9]+(\.[0-9]+)?$/;

  console.log('===validateToAmount', amount);

  return validNumberRegex.test(amount) && parseFloat(amount) > 0;
};
