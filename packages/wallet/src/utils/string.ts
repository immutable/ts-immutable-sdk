import { trim, hexToString as viemHexToString } from 'viem';

export const hexToString = (hex: string) => {
  if (!hex) return hex;

  try {
    const trimmed = trim(hex as `0x${string}`);
    return viemHexToString(trimmed);
  } catch (e) {
    return hex;
  }
};
