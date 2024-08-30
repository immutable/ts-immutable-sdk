import { useCallback, useEffect, useRef } from 'react';
import {
  EIP6963ProviderInfo,
  PostMessageData,
  PostMessageHandlerEventType,
} from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { useCheckoutContext } from '../context/CheckoutContextProvider';
import { CheckoutActions } from '../context/CheckoutContext';

// TODO these types should be in sync with Checkout App
type MessageId = number | string | null;

interface JsonRpcRequestMessage<TParams = any> {
  type: 'dapp';
  jsonrpc: '2.0';
  // Optional in the request.
  id?: MessageId;
  method: string;
  params?: TParams;
}

type ProviderRelayPayload = {
  jsonRpcRequestMessage: JsonRpcRequestMessage;
  eip6963Info: EIP6963ProviderInfo;
};

export function useProviderRelay() {
  const [{ checkout, postMessageHandler, provider }, checkoutDispatch] = useCheckoutContext();

  const unsubscribePostMessageHandler = useRef<() => void>();

  /**
   * Execute a request using the provider
   * and relay the response back using the postMessageHandler
   */
  const execute = useCallback(
    async (payload: ProviderRelayPayload, executeProvider: Web3Provider) => {
      if (!executeProvider?.provider.request) {
        throw new Error("Provider only supports 'request' method");
      }

      if (!postMessageHandler) {
        throw new Error(
          'Provider can execute request because PostMessageHandler is not initialized',
        );
      }

      const { id, params, method } = payload.jsonRpcRequestMessage;

      // Execute the request
      const result = await executeProvider.provider.request({ method, params });
      const formattedResponse = { id, result, jsonrpc: '2.0' };

      // Send the response using the postMessageHandler
      postMessageHandler.send(PostMessageHandlerEventType.PROVIDER_RELAY, {
        response: formattedResponse,
        eip6963Info: payload.eip6963Info,
      });
    },
    [postMessageHandler],
  );

  /**
   * Handle incoming provider relay messages
   */
  const onJsonRpcRequestMessage = useCallback(
    async ({ type, payload }: PostMessageData) => {
      if (!postMessageHandler || !checkout) return;
      if (type !== PostMessageHandlerEventType.PROVIDER_RELAY) return;

      const providerRelayPayload = payload as ProviderRelayPayload;

      const injectedProviders = checkout.getInjectedProviders();
      const targetProvider = injectedProviders.find(
        (p) => p.info.uuid === providerRelayPayload?.eip6963Info?.uuid,
      );

      if (!targetProvider && providerRelayPayload.eip6963Info !== undefined) {
        // eslint-disable-next-line no-console
        console.error(
          'PARENT - requested provider not found',
          providerRelayPayload?.eip6963Info,
          injectedProviders,
        );
        return;
      }

      // If provider is not defined, connect the target provider
      let currentProvider = provider;
      if (!currentProvider && targetProvider) {
        const connectResponse = await checkout.connect({
          provider: new Web3Provider(targetProvider.provider),
        });
        currentProvider = connectResponse.provider;

        // Set provider and execute the request
        checkoutDispatch({
          payload: {
            type: CheckoutActions.SET_PROVIDER,
            provider: currentProvider,
          },
        });
      }

      if (!currentProvider) {
        throw new Error('Provider is not defined');
      }

      await execute(providerRelayPayload, currentProvider);
    },

    [provider, postMessageHandler, checkout, execute],
  );

  /**
   * Subscribe to provider relay messages
   */
  useEffect(() => {
    // TODO we need to unsubscribe everywhere
    if (!postMessageHandler) return;
    unsubscribePostMessageHandler.current?.();
    unsubscribePostMessageHandler.current = postMessageHandler?.subscribe(onJsonRpcRequestMessage);
  }, [postMessageHandler, onJsonRpcRequestMessage]);
}

// TODO -
// 1 - commit the unsub part
// 2 - add unsubs to all postMessageHandlers subscriptions
