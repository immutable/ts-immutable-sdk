import { utils } from 'ethers';

export const hexToString = (hex: string) => {
  if (!hex) return hex;

  try {
    const stripped = utils.stripZeros(utils.arrayify(hex));
    const buff = Buffer.from(stripped);
    return buff.length === 32 ? hex : utils.toUtf8String(stripped);
  } catch (e) {
    return hex;
  }
};
