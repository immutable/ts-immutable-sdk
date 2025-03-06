import {
  TokenInfo, WrappedBrowserProvider, GetBalanceResult, TokenFilterTypes, Checkout,
} from '@imtbl/checkout-sdk';

import {
  Contract, ContractTransactionResponse, JsonRpcSigner, parseUnits,
} from 'ethers';
import { CryptoFiatState } from '../../context/crypto-fiat-context/CryptoFiatContext';
import { formatZeroAmount, calculateCryptoToFiat } from '../../lib/utils';
import { getAllowedBalances } from '../../lib/balance';

export const validatePartialAddress = (value: string) => {
  const regex = /^(0(x[0-9a-fA-F]{0,40})?)?$/;
  return regex.test(value);
};

export const getOptionKey = (token: TokenInfo) => token.address ?? 'native';

export const getFiatAmount = (
  cryptoFiatState: CryptoFiatState,
  tokenBalance: GetBalanceResult,
) => {
  if (cryptoFiatState.conversions.size === 0) return formatZeroAmount('');

  return calculateCryptoToFiat(
    tokenBalance.formattedBalance,
    tokenBalance.token.symbol || '',
    cryptoFiatState.conversions,
  );
};

const erc20Abi = ['function transfer(address to, uint amount)'];

const sendErc20Tokens = async (
  signer: JsonRpcSigner,
  tokenAddress: string,
  recipientAddress: string,
  amount: bigint,
): Promise<ContractTransactionResponse> =>
  new Contract(tokenAddress, erc20Abi, signer).transfer(
    recipientAddress,
    amount,
  );

const sendNativeTokens = async (
  signer: JsonRpcSigner,
  recipientAddress: string,
  amount: bigint,
) =>
  signer.sendTransaction({
    to: recipientAddress,
    value: amount,
  });

export const sendTokens = async (
  provider: WrappedBrowserProvider,
  gbr: GetBalanceResult,
  recipientAddress: string,
  amount: string,
) => {
  const amountBigInt = parseUnits(amount, gbr.token.decimals);
  const signer = await provider.getSigner();
  if (!gbr.token.address) throw new Error('Token address not found'); // the types say it can be undefined, but for native it's "native" so not sure when this would be the case.
  if (gbr.token.address === 'native') return sendNativeTokens(signer, recipientAddress, amountBigInt);
  return sendErc20Tokens(
    signer,
    gbr.token.address,
    recipientAddress,
    amountBigInt,
  );
};

export const loadBalances = async (
  checkout: Checkout,
  provider: WrappedBrowserProvider,
) => {
  const result = await getAllowedBalances({
    checkout,
    provider,
    allowTokenListType: TokenFilterTypes.ALL,
  });
  if (!result) throw new Error('Failed to load balances');
  return result;
};
