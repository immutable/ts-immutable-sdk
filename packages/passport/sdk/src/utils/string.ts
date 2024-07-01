import { utils } from 'ethers';

export const hexToString = async (hex: string) => {
  if (!hex) return hex;

  try {
    // Ensures Buffer is available when using the browser bundle of the SDK
    if (typeof window !== 'undefined' && !window.Buffer) {
      const bufferModule = await import('buffer');
      window.Buffer = bufferModule.Buffer;
    }

    const stripped = utils.stripZeros(utils.arrayify(hex));
    const buff = Buffer.from(stripped);
    return buff.length === 32 ? hex : utils.toUtf8String(stripped);
  } catch (e) {
    return hex;
  }
};
