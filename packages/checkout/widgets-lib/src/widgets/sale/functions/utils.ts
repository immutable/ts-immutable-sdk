import { ExecutedTransaction } from '../types';

export const toStringifyTransactions = (transactions: ExecutedTransaction[]) => transactions
  .map(({ method, hash }) => `${method}: ${hash}`).join(' | ');

export const toPascalCase = (str: string) => str
  .split('_')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  .join('');

export const sanitizeToLatin1 = (str: string): string => {
  const regex = /[^\u0000-\u00FF]/g; // eslint-disable-line no-control-regex
  return str.replace(regex, '');
};
