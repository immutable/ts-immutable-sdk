import { EIP6963ProviderInfo, WrappedBrowserProvider } from '@imtbl/checkout-sdk';
import { Flow } from '@imtbl/metrics';
import { ethers, TransactionReceipt, TransactionResponse } from 'ethers';
import { RouteResponse } from '@0xsquid/squid-types';
import { Squid } from '@0xsquid/sdk';
import { EvmWallet } from '@0xsquid/sdk/dist/types';
import { retry } from '../../retry';

export const waitForReceipt = async (
  provider: WrappedBrowserProvider,
  txHash: string,
  maxAttempts = 120,
) => {
  const result = await retry(
    async () => {
      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt) {
        throw new Error('receipt not found');
      }
      if (receipt.status === 0) {
        throw new Error('status failed');
      }
      return receipt;
    },
    {
      retries: maxAttempts,
      retryIntervalMs: 1000,
      nonRetryable: (error) => error.message === 'status failed',
    },
  );

  if (!result) {
    throw new Error(
      `Transaction receipt not found after ${maxAttempts} attempts`,
    );
  }

  return result;
};

export const callApprove = async (
  flow: Flow,
  fromProviderInfo: EIP6963ProviderInfo,
  provider: WrappedBrowserProvider,
  routeResponse: RouteResponse,
): Promise<TransactionReceipt> => {
  flow.addEvent(`provider_${fromProviderInfo.name}`);
  const erc20Abi = [
    'function approve(address spender, uint256 amount) public returns (bool)',
  ];
  const fromToken = routeResponse?.route.params.fromToken;
  const signer = await provider.getSigner();
  const tokenContract = new ethers.Contract(fromToken, erc20Abi, signer);

  const fromAmount = routeResponse?.route.params.fromAmount;
  if (!fromAmount) {
    throw new Error('fromAmount is undefined');
  }

  const transactionRequestTarget = routeResponse?.route?.transactionRequest?.target;
  if (!transactionRequestTarget) {
    throw new Error('transactionRequest target is undefined');
  }

  const tx = await tokenContract.approve(
    transactionRequestTarget,
    fromAmount,
  );
  flow.addEvent('transactionSent');

  return await waitForReceipt(provider, tx.hash);
};

export const callExecute = async (
  flow: Flow,
  squid: Squid,
  fromProviderInfo: EIP6963ProviderInfo,
  provider: WrappedBrowserProvider,
  routeResponse: RouteResponse,
): Promise<TransactionReceipt> => {
  flow.addEvent(`provider_${fromProviderInfo.name}`);
  const tx = (await squid.executeRoute({
    signer: await provider.getSigner() as unknown as EvmWallet,
    route: routeResponse.route,
  })) as unknown as TransactionResponse;
  flow.addEvent('transactionSent');
  return await waitForReceipt(provider, tx.hash);
};
