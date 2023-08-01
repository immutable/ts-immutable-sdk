import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { TEST_CHAIN_ID, TEST_RPC_URL } from 'test/utils';
import { calculateGasFee, fetchGasPrice } from './gas';

jest.mock('@ethersproject/providers');

describe('calculateGasFee', () => {
  describe('when given a price and gas used', () => {
    it('calculates gas fee from gas used and gas price', async () => {
      const gasPrice = BigNumber.from('1500000000'); // 1.5 gwei or 1500000000 wei

      const gasUsedInTransaction = BigNumber.from('200000');
      const gasFeeEstimate = calculateGasFee(gasPrice, gasUsedInTransaction);

      expect(gasFeeEstimate).not.toBeNull();
      expect(gasFeeEstimate?.toString()).toEqual('300000000000000');
    });
  });
});

describe('fetchGasPrice', () => {
  describe('when no fee data is returned', () => {
    it('should return null', async () => {
      (JsonRpcProvider as unknown as jest.Mock).mockImplementation(
        () => ({
          getFeeData: async () => ({
            maxFeePerGas: null,
            gasPrice: null,
          }),
        }),
      ) as unknown as JsonRpcProvider;

      const provider = new JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );

      const gasFeeEstimate = await fetchGasPrice(provider);

      expect(gasFeeEstimate).toBeNull();
    });
  });

  describe('when EIP-1559 is not supported', () => {
    it('should return the gasPrice', async () => {
      const gasPrice = BigNumber.from('1500000000'); // 1.5 gwei or 1500000000 wei

      (JsonRpcProvider as unknown as jest.Mock).mockImplementation(
        () => ({
          getFeeData: async () => ({
            maxFeePerGas: null,
            gasPrice,
          }),
        }),
      ) as unknown as JsonRpcProvider;

      const provider = new JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );

      const gasFeeEstimate = await fetchGasPrice(provider);

      expect(gasFeeEstimate).not.toBeNull();
      expect(gasFeeEstimate?.toString()).toEqual('1500000000');
    });
  });

  describe('when EIP-1559 is supported', () => {
    it('should return the maxFeePerGas', async () => {
      const maxFeePerGas = BigNumber.from('2500000000'); // 2.5 gwei or 2500000000 wei
      const maxPriorityFeePerGas = BigNumber.from('500000000'); // 0.5 gwei or 500000000 wei

      (JsonRpcProvider as unknown as jest.Mock).mockImplementation(
        () => ({
          getFeeData: async () => ({
            maxFeePerGas,
            maxPriorityFeePerGas,
            gasPrice: null,
          }),
        }),
      ) as unknown as JsonRpcProvider;

      const provider = new JsonRpcProvider(
        TEST_RPC_URL,
        TEST_CHAIN_ID,
      );

      const gasFeeEstimate = await fetchGasPrice(provider);

      expect(gasFeeEstimate).not.toBeNull();
      expect(gasFeeEstimate?.toString()).toEqual('3000000000');
    });
  });
});
