export function amountInputValidation(value: string): boolean {
  const regex = /^([0-9]+([.][0-9]{0,6})?)?$/;
  return regex.test(value);
}
