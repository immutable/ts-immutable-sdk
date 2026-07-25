import { generateRuntimeId } from './runtimeId';

/** Mirrors sdk-analytics `service.ValidateHash`. */
const validateHash = (hash: string): boolean => {
  if (hash.length < 2) {
    return false;
  }
  const firstCharDec = Number.parseInt(hash[1]!, 16);
  if (Number.isNaN(firstCharDec) || hash.length <= firstCharDec) {
    return false;
  }
  return hash[hash.length - 1] === hash[firstCharDec];
};

describe('generateRuntimeId', () => {
  it('produces ids that pass the backend ValidateHash checksum', () => {
    for (let i = 0; i < 20; i += 1) {
      expect(validateHash(generateRuntimeId())).toBe(true);
    }
  });
});
