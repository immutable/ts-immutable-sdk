/**
 * Encodes a JSON object using base64 encoding.
 */
export const encodeObject = async (value: Object): Promise<string> => {
  try {
    const str = JSON.stringify(value);
    const base64String = btoa(str);
    return encodeURIComponent(base64String);
  } catch (error) {
    throw new Error(`Compression failed: ${(error as Error).message}`);
  }
};

/**
 * Decodes a string encoded using encodeObject.
 */
export const decodeObject = async (
  encodedValue: string,
): Promise<Object> => {
  try {
    const decodedString = atob(decodeURIComponent(encodedValue));
    return JSON.parse(decodedString);
  } catch (error) {
    throw new Error(`Decompression failed: ${(error as Error).message}`);
  }
};
