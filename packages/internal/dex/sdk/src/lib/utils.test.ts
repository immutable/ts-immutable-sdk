import { constants, providers } from 'ethers';
import {
  formatAmount,
  newAmountFromString, TEST_FROM_ADDRESS, tokenWrapper, USDC_TEST_TOKEN, WETH_TEST_TOKEN, WIMX_TEST_TOKEN,
} from '../test/utils';
import {
  decimalsFunctionSig, getTokenDecimals, isValidNonZeroAddress, subtractAmount,
} from './utils';

jest.mock('@ethersproject/contracts');

const provider = {
  call: jest.fn().mockImplementation(async (payload: providers.TransactionRequest) => {
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
      expect(isValidNonZeroAddress(constants.AddressZero)).toBe(false);
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
        const decimals = await getTokenDecimals('native', tokenWrapper.nativeToken, provider as any);
        expect(decimals).toEqual(18);
      });
    });

    describe('when token is ERC20', () => {
      it('should call ERC20 contract for provided token address', async () => {
        const decimals = await getTokenDecimals(USDC_TEST_TOKEN.address, tokenWrapper.nativeToken, provider as any);
        expect(decimals).toEqual(6);
      });
    });
  });

  describe('subtract', () => {
    it('subtracts one from the other', () => {
      const a1 = newAmountFromString('3', WETH_TEST_TOKEN);
      const a2 = newAmountFromString('2', WETH_TEST_TOKEN);
      expect(formatAmount(subtractAmount(a1, a2))).toEqual('1.0');
    });

    it('throws error when different erc20', () => {
      const a1 = newAmountFromString('1', WETH_TEST_TOKEN);
      const a2 = newAmountFromString('1', WIMX_TEST_TOKEN);
      expect(() => subtractAmount(a1, a2)).toThrowError('Token mismatch: token addresses must be the same');
    });
  });
});
