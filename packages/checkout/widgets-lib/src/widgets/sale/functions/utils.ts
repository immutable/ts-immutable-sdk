import { ExecutedTransaction } from '../types';

export const toStringifyTransactions = (transactions: ExecutedTransaction[]) => transactions
  .map(({ method, hash }) => `${method}: ${hash}`).join(' | ');

export const toPascalCase = (str: string) => str
  .split('_')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  .join('');
