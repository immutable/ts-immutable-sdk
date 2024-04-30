import { ExecutedTransaction } from '../types';

export const toStringifyTransactions = (transactions: ExecutedTransaction[]) => transactions
  .map(({ method, hash }) => `${method}: ${hash}`).join(' | ');

export const toPascalCase = (str: string) => str
  .split(/[_\s-]+/)
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  .join('');

export const sanitizeToLatin1 = (str: string): string => {
  const regex = /[^\u0000-\u00FF]/g; // eslint-disable-line no-control-regex
  return str.replace(regex, '');
};

export const hexToText = (value: string): string => {
  if (!value) return '';
  let hex = value.trim().toLowerCase();

  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }

  if (!/^[0-9a-f]+$/i.test(hex)) {
    throw new Error('Invalid hexadecimal input');
  }

  let text = '';
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.substr(i, 2), 16);
    text += String.fromCharCode(byte);
  }

  return text;
};
