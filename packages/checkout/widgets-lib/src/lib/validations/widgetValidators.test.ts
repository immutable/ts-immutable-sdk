import { isValidAddress, isValidAmount, isValidWalletProvider } from './widgetValidators';

describe('widget validators', () => {
  describe('Wallet Provider Validator', () => {
    it('should return true for "metamask"', () => {
      const result = isValidWalletProvider('metamask');
      expect(result).toBeTruthy();
    });

    it('should return false for "METAMASK" (all uppercase)', () => {
      const result = isValidWalletProvider('METAMASK');
      expect(result).toBeFalsy();
    });

    it('should return false for "metramask" ', () => {
      const result = isValidWalletProvider('metramask');
      expect(result).toBeFalsy();
    });

    it('should return false for empty string', () => {
      const result = isValidWalletProvider('');
      expect(result).toBeFalsy();
    });
  });

  describe('Amount Validator', () => {
    const validCases = ['1', '1.0', '1.234567', '100000000', '']; // empty amount should pass as valid
    const invalidCases = ['acdas', '0.1234s', '1.2345678'];

    validCases.forEach((testCase) => {
      it(`should validate amount as a float with 6 decimal places for ${testCase}`, () => {
        const result = isValidAmount(testCase);
        expect(result).toBeTruthy();
      });
    });

    invalidCases.forEach((testCase) => {
      it(`should return false for any amount not a float with 6 decimal places for ${testCase}`, () => {
        const result = isValidAmount(testCase);
        expect(result).toBeFalsy();
      });
    });
  });

  describe('Address Validator', () => {
    const IMX_L1_ADDRESS = '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF';
    const INVALID_ADDRESS = '0x1234567890';

    it('should return true if address is valid', () => {
      const result = isValidAddress(IMX_L1_ADDRESS);
      expect(result).toBeTruthy();
    });

    it('should return true if address is valid and lowercase', () => {
      const result = isValidAddress(IMX_L1_ADDRESS.toLowerCase());
      expect(result).toBeTruthy();
    });

    it('should return false if address is valid and uppercase', () => {
      const result = isValidAddress(IMX_L1_ADDRESS.toUpperCase());
      expect(result).toBeFalsy();
    });

    it('should return false if address is not valid', () => {
      const result = isValidAddress(INVALID_ADDRESS);
      expect(result).toBeFalsy();
    });

    it('should return false if address empty', () => {
      const result = isValidAddress('');
      expect(result).toBeFalsy();
    });
  });
});
