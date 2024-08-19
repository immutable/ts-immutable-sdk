import {
  Exchange, TransactionResponse,
} from '@imtbl/dex-sdk';
import { BigNumber, utils } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import {
  CheckoutConfiguration, CheckoutErrorType, DexConfig, TokenInfo,
} from '@imtbl/checkout-sdk';
import { ImmutableConfiguration } from '@imtbl/config';
import { CheckoutError } from '../../dist/errors';

const fromAmountIn = async (
  config: CheckoutConfiguration,
  provider: Web3Provider,
  fromToken: TokenInfo,
  fromAmount: string,
  toToken: TokenInfo,
): Promise<TransactionResponse> => {
  let dexConfig: DexConfig | undefined;
  try {
    dexConfig = (
      (await config.remote.getConfig('dex')) as DexConfig
    );
  } catch (err: any) {
    throw new CheckoutError(
      'DEX config not found.',
      CheckoutErrorType.CONFIG_NOT_FOUND_ERROR,
    );
  }
  const network = await provider.getNetwork();

  const exchange = new Exchange({
    chainId: network.chainId,
    baseConfig: new ImmutableConfiguration({ environment: config.environment }),
    secondaryFees: dexConfig?.secondaryFees,
    overrides: dexConfig?.overrides,
  });

  const address = await provider.getSigner().getAddress();
  return exchange.getUnsignedSwapTxFromAmountIn(
    address,
    fromToken.address as string,
    toToken.address as string,
    BigNumber.from(utils.parseUnits(fromAmount, fromToken.decimals)),
  );
};

const fromAmountOut = async (
  config: CheckoutConfiguration,
  provider: Web3Provider,
  fromToken: TokenInfo,
  toAmount: string,
  toToken: TokenInfo,
): Promise<TransactionResponse> => {
  let dexConfig: DexConfig | undefined;
  try {
    dexConfig = (
      (await config.remote.getConfig('dex')) as DexConfig
    );
  } catch (err: any) {
    throw new CheckoutError(
      'DEX config not found.',
      CheckoutErrorType.CONFIG_NOT_FOUND_ERROR,
    );
  }
  const network = await provider.getNetwork();
  const exchange = new Exchange({
    chainId: network.chainId,
    baseConfig: new ImmutableConfiguration({ environment: config.environment }),
    secondaryFees: dexConfig?.secondaryFees,
    overrides: dexConfig?.overrides,
  });
  const address = await provider.getSigner().getAddress();
  return exchange.getUnsignedSwapTxFromAmountOut(
    address,
    fromToken.address as string,
    toToken.address as string,
    BigNumber.from(utils.parseUnits(toAmount, fromToken.decimals)),
  );
};

const swap = async (
  config: CheckoutConfiguration,
  provider: Web3Provider,
  fromToken: TokenInfo,
  toToken: TokenInfo,
  fromAmount?: string,
  toAmount?: string,
): Promise<TransactionResponse> => {
  if (fromAmount && toAmount) {
    throw new CheckoutError(
      'Only one of fromAmount or toAmount can be provided.',
      CheckoutErrorType.MISSING_PARAMS,
    );
  }
  if (fromAmount) {
    return fromAmountIn(config, provider, fromToken, fromAmount, toToken);
  } if (toAmount) {
    return fromAmountOut(config, provider, fromToken, toAmount, toToken);
  }
  throw new CheckoutError(
    'fromAmount or toAmount must be provided.',
    CheckoutErrorType.MISSING_PARAMS,
  );
};

export { swap };
