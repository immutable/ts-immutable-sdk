import { TradeType } from '@uniswap/sdk-core';
import { SUPPORTED_SANDBOX_CHAINS } from 'config';
import { WIMX_IMMUTABLE_TESTNET } from 'constants/tokens';
import { IMMUTABLE_TESTNET_CHAIN_ID } from 'constants/chains';
import { providers, utils } from 'ethers';
import { newAmountFromString } from 'test/utils';
import { QuoterV2__factory } from 'contracts/types';
import { Router } from './router';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const zkONE = {
  address: '0x12739A8f1A8035F439092D016DAE19A2874F30d2',
  chainId: IMMUTABLE_TESTNET_CHAIN_ID,
  decimals: 18,
  type: 'erc20',
} as const;

const zkWAT = {
  address: '0xaC953a0d7B67Fae17c87abf79f09D0f818AC66A2',
  chainId: IMMUTABLE_TESTNET_CHAIN_ID,
  decimals: 18,
  type: 'erc20',
} as const;

describe('router', () => {
  describe('for realsies', () => {
    it.skip('calculates an amount out', async () => {
      const config = SUPPORTED_SANDBOX_CHAINS[IMMUTABLE_TESTNET_CHAIN_ID];
      const provider = new providers.JsonRpcProvider(config.rpcUrl, config.chainId);
      const amountSpecified = newAmountFromString('20700000', zkWAT);
      const router = new Router(provider, config.commonRoutingTokens, config.contracts);
      const quoteResult = await router.findOptimalRoute(amountSpecified, WIMX_IMMUTABLE_TESTNET, TradeType.EXACT_INPUT);
      expect(utils.formatEther(quoteResult.amountOut.value)).toEqual('7089.43335507464515036');
    });

    it.skip('calls quoteExactInputSingle directly', async () => {
      const config = SUPPORTED_SANDBOX_CHAINS[IMMUTABLE_TESTNET_CHAIN_ID];
      const provider = new providers.JsonRpcProvider(config.rpcUrl, config.chainId);

      const q = QuoterV2__factory.connect(config.contracts.quoterV2, provider);
      const data = q.interface.encodeFunctionData('quoteExactInputSingle', [
        {
          amountIn: utils.parseEther('20700000'),
          tokenIn: zkWAT.address,
          tokenOut: WIMX_IMMUTABLE_TESTNET.address,
          fee: 100,
          sqrtPriceLimitX96: 0,
        },
      ]);
      const res = await provider.call({
        to: config.contracts.quoterV2,
        data,
      });
      const { amountOut } = q.interface.decodeFunctionResult(
        'quoteExactInputSingle',
        res,
      );
      expect(utils.formatEther(amountOut)).toEqual('516.580710655537430041');
    });
  });
});
