import { useContext } from 'react';
import { RouteResponse } from '@0xsquid/squid-types';
import { Squid } from '@0xsquid/sdk';
import {
  ethers, MaxUint256, TransactionReceipt, TransactionResponse,
} from 'ethers';
import { Environment } from '@imtbl/config';
import { WrappedBrowserProvider } from '@imtbl/checkout-sdk';
import { EvmWallet } from '@0xsquid/sdk/dist/types';
import { isSquidNativeToken } from '../functions/isSquidNativeToken';
import { useError } from './useError';
import { AddTokensError, AddTokensErrorTypes } from '../types';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { sendAddTokensFailedEvent } from '../AddTokensWidgetEvents';
import { retry } from '../../../lib/retry';
import { ProvidersContext, ProvidersContextActions } from '../../../context/providers-context/ProvidersContext';

export const useExecute = (environment: Environment) => {
  const { showErrorHandover } = useError(environment);
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const { providersDispatch } = useContext(ProvidersContext);

  const waitForReceipt = async (provider: WrappedBrowserProvider, txHash: string, maxAttempts = 60) => {
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
      throw new Error(`Transaction receipt not found after ${maxAttempts} attempts`);
    }

    return result;
  };

  const handleTransactionError = (err: unknown) => {
    const reason = `${
      (err as any)?.reason || (err as any)?.message || ''
    }`.toLowerCase();

    let errorType = AddTokensErrorTypes.WALLET_FAILED;

    if (reason.includes('failed') && reason.includes('open confirmation')) {
      errorType = AddTokensErrorTypes.WALLET_POPUP_BLOCKED;
    }

    if (reason.includes('rejected') && reason.includes('user')) {
      errorType = AddTokensErrorTypes.WALLET_REJECTED;
    }

    if (
      reason.includes('failed to submit')
      && reason.includes('highest gas limit')
    ) {
      errorType = AddTokensErrorTypes.WALLET_REJECTED_NO_FUNDS;
    }

    if (
      reason.includes('status failed')
      || reason.includes('transaction failed')
    ) {
      errorType = AddTokensErrorTypes.TRANSACTION_FAILED;
      sendAddTokensFailedEvent(eventTarget, errorType);
    }

    if (
      reason.includes('unrecognized chain')
      || reason.includes('unrecognized chain')
    ) {
      errorType = AddTokensErrorTypes.UNRECOGNISED_CHAIN;
    }

    const error: AddTokensError = {
      type: errorType,
      data: { error: err },
    };

    showErrorHandover(errorType, { error });
  };

  // @TODO: Move to util function
  const updateFromProviderChain = async (
    provider: WrappedBrowserProvider,
    chainId: string,
  ): Promise<WrappedBrowserProvider> => {
    if (!provider.ethereumProvider) {
      throw new Error('provider is not a valid WrappedBrowserProvider');
    }
    try {
      const fromChainHex = `0x${parseInt(chainId, 10).toString(16)}`;
      const providerChainId = (await provider.getNetwork()).chainId;

      if (chainId !== providerChainId.toString()) {
        await provider.send('wallet_switchEthereumChain', [
          {
            chainId: fromChainHex,
          },
        ]);

        const updatedProvider = new WrappedBrowserProvider(provider.ethereumProvider);

        providersDispatch({
          payload: {
            type: ProvidersContextActions.SET_PROVIDER,
            fromProvider: updatedProvider,
          },
        });

        return updatedProvider;
      }

      return provider;
    } catch (error) {
      handleTransactionError(error);
      return provider;
    }
  };

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

        const allowance = await tokenContract.allowance(
          ownerAddress,
          transactionRequestTarget,
        );
        return allowance;
      }

      return MaxUint256; // no approval is needed for native tokens
    } catch (error) {
      showErrorHandover(AddTokensErrorTypes.DEFAULT, { error });
      return undefined;
    }
  };

  const approve = async (
    provider: WrappedBrowserProvider,
    routeResponse: RouteResponse,
  ): Promise<TransactionReceipt | undefined> => {
    try {
      if (!isSquidNativeToken(routeResponse?.route?.params.fromToken)) {
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
        return waitForReceipt(provider, tx.hash);
      }
      return undefined;
    } catch (error) {
      handleTransactionError(error);
      return undefined;
    }
  };

  const execute = async (
    squid: Squid,
    provider: WrappedBrowserProvider,
    routeResponse: RouteResponse,
  ): Promise<TransactionReceipt | undefined> => {
    if (!provider.send) {
      throw new Error('provider does not have send method');
    }

    try {
      const tx = (await squid.executeRoute({
        signer: await provider.getSigner() as unknown as EvmWallet,
        route: routeResponse.route,
      })) as unknown as TransactionResponse;
      return waitForReceipt(provider, tx.hash);
    } catch (error) {
      handleTransactionError(error);
      return undefined;
    }
  };

  return {
    updateFromProviderChain,
    getAllowance,
    approve,
    execute,
  };
};
