import { hexToString } from './string';

describe('string', () => {
  describe('hexToString', () => {
    it('should return hex if it is not a valid hex', () => {
      const hex = '0x123';
      const hex2 = 'test';

      expect(hexToString(hex)).toEqual(hex);
      expect(hexToString(hex2)).toEqual(hex2);
    });

    it('should return utf8 string if it is a valid utf8', () => {
      const hex = '0x68656c6c6f20776f726c64';

      expect(hexToString(hex)).toEqual('hello world');
    });

    it('should return utf8 string if it is a valid utf8 with leading zeros', () => {
      const hex = '0x0068656c6c6f20776f726c64'; // 'hello world' with leading zero

      expect(hexToString(hex)).toEqual('hello world');
    });

    it('should return empty string if input is an empty string', () => {
      const hex = '';

      expect(hexToString(hex)).toEqual('');
    });

    it('should return hex if it is a valid hex but not a valid utf8', () => {
      const hex = '0x1234567890abcdef'; // valid hex but not a valid utf8

      expect(hexToString(hex)).toEqual(hex);
    });

    it('should return hex if length is 32', () => {
      const hex = `0x${'12'.repeat(32)}`;
      expect(hexToString(hex)).toEqual(hex);
    });
  });
});
