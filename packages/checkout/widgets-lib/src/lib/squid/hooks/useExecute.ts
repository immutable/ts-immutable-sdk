import { RouteResponse } from '@0xsquid/squid-types';
import { Squid } from '@0xsquid/sdk';
import {
  ethers, MaxUint256, TransactionReceipt,
} from 'ethers';

import { StatusResponse } from '@0xsquid/sdk/dist/types';
import { EIP6963ProviderInfo, WrappedBrowserProvider } from '@imtbl/checkout-sdk';
import { isSquidNativeToken } from '../functions/isSquidNativeToken';
import { retry } from '../../retry';
import { withMetricsAsync } from '../../metrics';
import { useAnalytics, UserJourney } from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { isRejectedError } from '../../../functions/errorType';
import { callApprove, callExecute } from '../functions/execute';

const TRANSACTION_NOT_COMPLETED = 'transaction not completed';

export const useExecute = (
  userJourney: UserJourney,
  onTransactionError?: (err: unknown) => void,
) => {
  const { user } = useAnalytics();

  const getAllowance = async (
    provider: WrappedBrowserProvider,
    routeResponse: RouteResponse,
  ): Promise<bigint | undefined> => {
    try {
      if (!isSquidNativeToken(routeResponse?.route?.params.fromToken)) {
        const erc20Abi = [
          'function allowance(address owner, address spender) public view returns (uint256)',
        ];
        const fromToken = routeResponse?.route.params.fromToken;
        const signer = await provider.getSigner();
        const tokenContract = new ethers.Contract(fromToken, erc20Abi, signer);

        const ownerAddress = await signer.getAddress();
        const transactionRequestTarget = routeResponse?.route?.transactionRequest?.target;

        if (!transactionRequestTarget) {
          throw new Error('transactionRequest target is undefined');
        }

        return await tokenContract.allowance(
          ownerAddress,
          transactionRequestTarget,
        );
      }

      return MaxUint256; // no approval is needed for native tokens
    } catch (error) {
      onTransactionError?.(error);
      return undefined;
    }
  };

  const getAnonymousId = async () => {
    try {
      const userData = await user();
      return userData?.anonymousId() ?? undefined;
    } catch (error) {
      return undefined;
    }
  };

  const approve = async (
    fromProviderInfo: EIP6963ProviderInfo,
    provider: WrappedBrowserProvider,
    routeResponse: RouteResponse,
  ): Promise<TransactionReceipt | undefined> => {
    try {
      if (!isSquidNativeToken(routeResponse?.route?.params.fromToken)) {
        return await withMetricsAsync(
          (flow) => callApprove(flow, fromProviderInfo, provider, routeResponse),
          `${userJourney}_Approve`,
          await getAnonymousId(),
          (error) => (isRejectedError(error) ? 'rejected' : ''),
        );
      }
      return undefined;
    } catch (error) {
      onTransactionError?.(error);
      return undefined;
    }
  };

  const execute = async (
    squid: Squid,
    fromProviderInfo: EIP6963ProviderInfo,
    provider: WrappedBrowserProvider,
    routeResponse: RouteResponse,
  ): Promise<TransactionReceipt | undefined> => {
    if (!provider.send) {
      throw new Error('provider does not have send method');
    }
    try {
      return await withMetricsAsync(
        (flow) => callExecute(flow, squid, fromProviderInfo, provider, routeResponse),
        `${userJourney}_Execute`,
        await getAnonymousId(),
        (error) => (isRejectedError(error) ? 'rejected' : ''),
      );
    } catch (error) {
      onTransactionError?.(error);
      return undefined;
    }
  };

  const getStatus = async (
    squid: Squid,
    transactionHash: string,
  ): Promise<StatusResponse | undefined> => {
    const completedTransactionStatus = [
      'success',
      'partial_success',
      'needs_gas',
      'not_found',
    ];
    try {
      return await retry(
        async () => {
          const result = await squid.getStatus({
            transactionId: transactionHash,
          });
          if (
            completedTransactionStatus.includes(
              result.squidTransactionStatus ?? '',
            )
          ) {
            return result;
          }
          return Promise.reject(TRANSACTION_NOT_COMPLETED);
        },
        {
          retries: 240,
          retryIntervalMs: 5000,
          nonRetryable: (err) => {
            if (err.response) {
              return err.response.status === 400 || err.response.status === 500;
            }
            return err !== TRANSACTION_NOT_COMPLETED;
          },
        },
      );
    } catch (error) {
      onTransactionError?.(error);
      return undefined;
    }
  };

  return {
    getAllowance,
    approve,
    execute,
    getStatus,
  };
};
