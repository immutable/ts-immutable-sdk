import LZMA from 'lzma-web';

const lzma = new LZMA();

/**
 * Compresses and encodes a JSON object using LZMA and base64 encoding.
 */
export const compressAndEncode = async (value: Object): Promise<string> => {
  try {
    const str = JSON.stringify(value);
    const buffer = await lzma.compress(str);
    const base64String = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return encodeURIComponent(base64String);
  } catch (error) {
    throw new Error(`Compression failed: ${(error as Error).message}`);
  }
};

/**
 * Decodes and decompresses a string that was compressed and encoded using compressAndEncode.
 */
export const decodeAndDecompress = async (
  encodedValue: string,
): Promise<Object> => {
  try {
    const decodedString = atob(decodeURIComponent(encodedValue));
    const uint8Array = new Uint8Array(decodedString.split('').map((char) => char.charCodeAt(0)));
    const decompressedBuffer = await lzma.decompress(uint8Array);
    const decompressedString = typeof decompressedBuffer === 'string'
      ? decompressedBuffer
      : new TextDecoder().decode(decompressedBuffer);
    return JSON.parse(decompressedString);
  } catch (error) {
    throw new Error(`Decompression failed: ${(error as Error).message}`);
  }
};
