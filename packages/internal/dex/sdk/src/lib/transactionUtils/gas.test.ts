import { ethers } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { TEST_CHAIN_ID, TEST_RPC_URL } from 'utils/testUtils';
import { calculateGasFee, fetchGasPrice } from './gas';

jest.mock('@ethersproject/providers');

describe('calculateGasFee', () => {
  describe('when given a price and gas used', () => {
    it('calculates gas fee from and returns face value', async () => {
      const gasPrice = ethers.BigNumber.from('1500000000'); // 1.5 gwei or 1500000000 wei

      const gasUsedInTransaction = ethers.BigNumber.from('200000');
      const gasFeeEstimate = calculateGasFee(gasPrice, gasUsedInTransaction);

      expect(gasFeeEstimate).not.toBeNull();
      expect(gasFeeEstimate?.toString()).toEqual('0.0003');
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
      ) as unknown as ethers.providers.JsonRpcProvider;

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
      const gasPrice = ethers.BigNumber.from('1500000000'); // 1.5 gwei or 1500000000 wei

      (JsonRpcProvider as unknown as jest.Mock).mockImplementation(
        () => ({
          getFeeData: async () => ({
            maxFeePerGas: null,
            gasPrice,
          }),
        }),
      ) as unknown as ethers.providers.JsonRpcProvider;

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
      const maxFeePerGas = ethers.BigNumber.from('2500000000'); // 2.5 gwei or 2500000000 wei
      const maxPriorityFeePerGas = ethers.BigNumber.from('500000000'); // 0.5 gwei or 500000000 wei

      (JsonRpcProvider as unknown as jest.Mock).mockImplementation(
        () => ({
          getFeeData: async () => ({
            maxFeePerGas,
            maxPriorityFeePerGas,
            gasPrice: null,
          }),
        }),
      ) as unknown as ethers.providers.JsonRpcProvider;

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
