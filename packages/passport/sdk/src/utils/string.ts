/* eslint-disable no-console */
import { utils } from 'ethers';

export const hexToString = (hex: string) => {
  if (!hex) return hex;

  console.log('hex', hex);

  try {
    const stripped = utils.stripZeros(utils.arrayify(hex));
    const buff = Buffer.from(stripped);

    console.log('stripped', stripped);
    console.log('buff', buff);

    if (buff.length === 32) {
      console.log('buff.length === 32', hex);
    } else {
      console.log('buff.length !== 32', utils.toUtf8String(stripped));
    }

    return buff.length === 32 ? hex : utils.toUtf8String(stripped);
  } catch (e) {
    console.log('error from hexToString', e);
    return hex;
  }
};
