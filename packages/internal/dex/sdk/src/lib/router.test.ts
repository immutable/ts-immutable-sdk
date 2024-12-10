/* eslint-disable arrow-body-style */
import { TradeType } from '@uniswap/sdk-core';
import { formatEther, JsonRpcProvider, parseEther } from 'ethers';
import { SUPPORTED_SANDBOX_CHAINS } from '../config';
import { WIMX_IMMUTABLE_TESTNET } from '../constants/tokens';
import { IMMUTABLE_TESTNET_CHAIN_ID } from '../constants/chains';
import { newAmountFromString } from '../test/utils';
import { Multicall__factory, QuoterV2__factory } from '../contracts/types';
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

const fees = [100, 500, 10000];

const config = SUPPORTED_SANDBOX_CHAINS[IMMUTABLE_TESTNET_CHAIN_ID];
const provider = new JsonRpcProvider(config.rpcUrl, config.chainId);

const q = QuoterV2__factory.connect(config.contracts.quoter, provider);
const m = Multicall__factory.connect(config.contracts.multicall, provider);

const callDatas = () => fees.map((fee) => {
  // const rand = Math.floor(Math.random() * 100);
  const amountIn = parseEther('20700000'); //  BigInt(rand).mul(BigInt(10).pow(18));
  return q.interface.encodeFunctionData('quoteExactInputSingle', [
    {
      amountIn,
      tokenIn: zkWAT.address,
      tokenOut: WIMX_IMMUTABLE_TESTNET.address,
      fee,
      sqrtPriceLimitX96: 0,
    },
  ]);
});

describe('router', () => {
  describe.skip('for realsies', () => {
    it('calculates an amount out', async () => {
      const amountSpecified = newAmountFromString('20700000', zkWAT);
      const router = new Router(provider, m, config.commonRoutingTokens, config.contracts);
      const quoteResult = await router.findOptimalRoute(amountSpecified, WIMX_IMMUTABLE_TESTNET, TradeType.EXACT_INPUT);
      expect(formatEther(quoteResult.amountOut.value)).toEqual('7089.43335507464515036');
    });

    it.each(Array(10).fill(null))('parallel', async () => {
      const promises = callDatas().map(async (data) => {
        const res = await provider.call({
          to: config.contracts.quoter,
          data,
        });
        const { amountOut } = q.interface.decodeFunctionResult(
          'quoteExactInputSingle',
          res,
        );
        return formatEther(amountOut);
      });
      const results = await Promise.all(promises);

      expect(results).toEqual(['516.580710655537430041', '7089.43335507464515036', '3.718255837400445597']);
    });

    it.each(Array(10).fill(null))('multicall', async () => {
      const calls = callDatas().map((callData) => {
        return {
          target: config.contracts.quoter,
          callData,
          gasLimit: 24_000_000,
        };
      });

      const { returnData } = await m.multicall.staticCall(calls);

      const results = returnData.map((data) => {
        if (data.returnData === '0x') return [];
        const res = q.interface.decodeFunctionResult('quoteExactInputSingle', data.returnData);
        return formatEther(res.amountOut);
      });

      expect(results).toEqual(['516.580710655537430041', '7089.43335507464515036', '3.718255837400445597']);
    });

    it.each(Array(1).fill(null))('batch', async () => {
      const promises = callDatas().map((callData) => {
        return provider.send('eth_call', [{
          to: config.contracts.quoter,
          data: callData,
        }, 'latest']);
      });

      const promise = await Promise.allSettled(promises);

      const results = promise.map((data) => {
        if (data.status === 'rejected') return [];
        if (data.value === '0x') return [];
        const res = q.interface.decodeFunctionResult('quoteExactInputSingle', data.value);
        return formatEther(res.amountOut);
      });

      expect(results).toEqual(['516.580710655537430041', '7089.43335507464515036', '3.718255837400445597']);
    });
  });
});
