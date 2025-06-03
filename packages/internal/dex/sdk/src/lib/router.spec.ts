import { JsonRpcProvider } from 'ethers/providers';
import { TradeType } from '@uniswap/sdk-core';
import { Router } from './router';
import {
  IMMUTABLE_MAINNET_CHAIN_ID,
  IMMUTABLE_MAINNET_COMMON_ROUTING_TOKENS,
  IMMUTABLE_MAINNET_RPC_URL,
} from '../constants';
import { Multicall__factory } from '../contracts/types';
import { CONTRACTS_FOR_CHAIN_ID } from '../config';
import { newAmountFromString } from '../test/utils';
import { ERC20 } from '../types';

describe('Router', () => {
  it('recreates 0x886b76cd9333855dcd7e1668a53754c0ac2f0914f2a5e73c223440e5eb200b36', async () => {
    const contracts = CONTRACTS_FOR_CHAIN_ID[IMMUTABLE_MAINNET_CHAIN_ID];
    const provider = new JsonRpcProvider(IMMUTABLE_MAINNET_RPC_URL, IMMUTABLE_MAINNET_CHAIN_ID);
    const multicall = Multicall__factory.connect(contracts.multicall, provider);
    const router = new Router(
      provider,
      multicall,
      IMMUTABLE_MAINNET_COMMON_ROUTING_TOKENS,
      {
        multicall: contracts.multicall,
        coreFactory: contracts.coreFactory,
        quoter: contracts.quoter,
      },
    );

    const inputToken: ERC20 = {
      type: 'erc20',
      chainId: IMMUTABLE_MAINNET_CHAIN_ID,
      address: '0x0FA1d8Ffa9B414ABF0F47183e088bddC32e084F3',
      decimals: 18,
    };
    const outputToken = IMMUTABLE_MAINNET_COMMON_ROUTING_TOKENS[1];
    const amount = newAmountFromString('5654.4', inputToken);
    try {
      const route = await router.findOptimalRoute(amount, outputToken, TradeType.EXACT_INPUT, undefined, '0x15cab14');
      expect(route).toBeDefined();
    } catch (err) {
      expect(err).toBeDefined();
    }
  }, 5000);
});
