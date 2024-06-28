/* eslint-disable no-console */
import { utils } from 'ethers';

export const hexToString = (hex: string) => {
  if (!hex) return hex;

  console.log('hex', hex);

  try {
    const stripped = utils.stripZeros(utils.arrayify(hex));
    const uint8Array = new Uint8Array(stripped);

    console.log('stripped', stripped);
    console.log('uint8Array', uint8Array);

    // Convert Uint8Array to string using TextDecoder
    const decoder = new TextDecoder();
    const decodedString = decoder.decode(uint8Array);

    console.log('decodedString', decodedString);

    return stripped.length === 32 ? hex : decodedString;
  } catch (e) {
    console.log('error from hexToString', e);
    return hex;
  }
};
