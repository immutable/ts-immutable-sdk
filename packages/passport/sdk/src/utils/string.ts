import { utils } from 'ethers';

export const hexToString = (hex: string) => {
  if (!hex) return hex;

  try {
    const stripped = utils.stripZeros(utils.arrayify(hex));
    return utils.toUtf8String(stripped);
  } catch (e) {
    return hex;
  }
};
