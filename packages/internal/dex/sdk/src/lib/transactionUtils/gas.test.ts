import { buildBlock, expectToBeDefined, formatAmount, NATIVE_TEST_TOKEN } from 'test/utils';
import { newAmount } from 'lib/utils';
import { BigNumber, providers } from 'ethers';
import { IMMUTABLE_TESTNET_RPC_URL, IMMUTABLE_TESTNET_CHAIN_ID } from 'constants/chains';
import { calculateGasFee, fetchGasPrice } from './gas';

describe('calculateGasFee', () => {
  describe('when given a price and gas used', () => {
    it('calculates gas fee from gas used and gas price', async () => {
      const gasPrice = newAmount(BigNumber.from('1500000000'), NATIVE_TEST_TOKEN); // 1.5 gwei or 1500000000 wei

      const gasUsedInTransaction = BigNumber.from('200000');
      const gasFeeEstimate = calculateGasFee(gasPrice, gasUsedInTransaction);

      expectToBeDefined(gasFeeEstimate);
      expect(gasFeeEstimate.value.toString()).toEqual('300000000000000');
    });
  });
});

describe('fetchGasPrice', () => {
  describe.skip('for realsies', () => {
    it('returns a gasPriceEstimate', async () => {
      const provider = new providers.JsonRpcProvider(IMMUTABLE_TESTNET_RPC_URL, IMMUTABLE_TESTNET_CHAIN_ID);
      const gasPriceEstimate = await fetchGasPrice(provider, NATIVE_TEST_TOKEN);
      expectToBeDefined(gasPriceEstimate);
      expect(formatAmount(gasPriceEstimate)).toEqual('0.000000010000000098');
    });
  });

  describe('when no fee data is returned', () => {
    it('should return null', async () => {
      const provider = {
        getBlock: jest.fn().mockRejectedValue(new Error('failed to get block')),
        send: jest.fn().mockRejectedValue(new Error('failed to get maxPriorityFeePerGas')),
      };

      const gasPriceEstimate = await fetchGasPrice(provider, NATIVE_TEST_TOKEN);
      expect(gasPriceEstimate).toBeNull();
    });
  });

  describe('when EIP-1559 is supported', () => {
    it('should return the maxFeePerGas', async () => {
      const lastBaseFeePerGas = BigNumber.from('49'); // 49 wei
      const maxPriorityFeePerGas = BigNumber.from('500000000'); // 0.5 gwei

      const provider = {
        getBlock: async () => buildBlock({ baseFeePerGas: lastBaseFeePerGas }),
        send: jest.fn().mockResolvedValueOnce(maxPriorityFeePerGas),
      };

      const gasPriceEstimate = await fetchGasPrice(provider, NATIVE_TEST_TOKEN);
      expectToBeDefined(gasPriceEstimate);
      expect(gasPriceEstimate.value.toString()).toEqual('500000098'); // maxPriorityFeePerGas + 2 * lastBaseFeePerGas
      expect(gasPriceEstimate.token.type).toEqual('native');
    });
  });
});
