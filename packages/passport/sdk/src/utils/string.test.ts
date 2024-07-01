import { hexToString } from './string';

describe('string', () => {
  describe('hexToString', () => {
    it('should return hex if it is not a valid hex', async () => {
      const hex = '0x123';
      const hex2 = 'test';

      expect(await hexToString(hex)).toEqual(hex);
      expect(await hexToString(hex2)).toEqual(hex2);
    });

    it('should return utf8 string if it is a valid utf8', async () => {
      const hex = '0x68656c6c6f20776f726c64';

      expect(await hexToString(hex)).toEqual('hello world');
    });

    it('should return utf8 string if it is a valid utf8 with leading zeros', async () => {
      const hex = '0x0068656c6c6f20776f726c64'; // 'hello world' with leading zero

      expect(await hexToString(hex)).toEqual('hello world');
    });

    it('should return empty string if input is an empty string', async () => {
      const hex = '';

      expect(await hexToString(hex)).toEqual('');
    });

    it('should return hex if it is a valid hex but not a valid utf8', async () => {
      const hex = '0x1234567890abcdef'; // valid hex but not a valid utf8

      expect(await hexToString(hex)).toEqual(hex);
    });
  });
});
