import { DEFAULT_TOKEN_FORMATTING_DECIMALS } from '../constants';

export function amountInputValidation(value: string): boolean {
  const regex = new RegExp(
    `^([0-9]+([.][0-9]{0,${DEFAULT_TOKEN_FORMATTING_DECIMALS}})?)?$`,
  );
  return regex.test(value);
}
