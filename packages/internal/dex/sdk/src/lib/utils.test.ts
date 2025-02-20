import { TransactionRequest, ZeroAddress } from 'ethers';
import { TEST_FROM_ADDRESS, USDC_TEST_TOKEN, nativeTokenService } from '../test/utils';
import { decimalsFunctionSig, getTokenDecimals, isValidNonZeroAddress } from './utils';

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  Contract: jest.fn(),
}));

const provider = {
  call: jest.fn().mockImplementation(async (payload: TransactionRequest) => {
    if (payload.data === decimalsFunctionSig) {
      if (payload.to === USDC_TEST_TOKEN.address) {
        return USDC_TEST_TOKEN.decimals.toString(16);
      }
      throw new Error(`Unrecognized ERC20: ${payload.to}`);
    }
    throw new Error(`Call not supported: ${payload.data}`);
  }),
};

describe('utils', () => {
  describe('isValidNonZeroAddress', () => {
    it('should return false for zero address', () => {
      expect(isValidNonZeroAddress(ZeroAddress)).toBe(false);
    });

    it('should return false for invalid address', () => {
      expect(isValidNonZeroAddress('0xinvalid')).toBe(false);
    });

    it('should return true for valid address', () => {
      expect(isValidNonZeroAddress(TEST_FROM_ADDRESS)).toBe(true);
    });
  });

  describe('getTokenDecimals', () => {
    describe('when token is native', () => {
      it('should return default native token decimals', async () => {
        const decimals = await getTokenDecimals('native', provider as any, nativeTokenService.nativeToken);
        expect(decimals).toEqual(18);
      });
    });

    describe('when token is ERC20', () => {
      it('should call ERC20 contract for provided token address', async () => {
        const decimals = await getTokenDecimals(
          USDC_TEST_TOKEN.address,
          provider as any,
          nativeTokenService.nativeToken,
        );
        expect(decimals).toEqual(6);
      });
    });
  });
});
