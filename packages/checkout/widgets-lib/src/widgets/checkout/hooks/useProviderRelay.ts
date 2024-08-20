import { useCallback, useEffect } from 'react';
import { EIP6963ProviderInfo, PostMessageData, PostMessageHandlerEventType } from '@imtbl/checkout-sdk';
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
  jsonRpcRequestMessage: JsonRpcRequestMessage,
  eip6963Info: EIP6963ProviderInfo
};

export function useProviderRelay() {
  const [checkoutState, checkoutDispatch] = useCheckoutContext();

  const { checkout, postMessageHandler, provider } = checkoutState;

  const execute = useCallback(async (payload: ProviderRelayPayload, executeProvider: Web3Provider) => {
    if (!executeProvider?.provider.request) {
      throw new Error('Provider does not support request method');
    }

    executeProvider.provider
      .request({
        method: payload.jsonRpcRequestMessage.method,
        params: payload.jsonRpcRequestMessage.params,
      })
      .then((resp) => {
        const formattedResponse = {
          id: payload.jsonRpcRequestMessage.id,
          jsonrpc: '2.0',
          result: resp,
        };
        // console.log('PARENT - execute done', formattedResponse, payload.jsonRpcRequestMessage, executeProvider);

        postMessageHandler!.send(
          PostMessageHandlerEventType.PROVIDER_RELAY,
          {
            response: formattedResponse,
            eip6963Info: payload.eip6963Info,
          },
        );
      });
  }, [postMessageHandler]);

  const onMessage = useCallback(async ({ type, payload }: PostMessageData) => {
    if (!postMessageHandler || !checkout) return;
    if (type !== PostMessageHandlerEventType.PROVIDER_RELAY) return;

    const providerRelayPayload = payload as ProviderRelayPayload;

    //
    const injectedProviders = checkout.getInjectedProviders();
    const targetProvider = injectedProviders.find((p) => p.info.uuid === providerRelayPayload.eip6963Info.uuid);

    if (!targetProvider) {
      console.error('PARENT - requested provider not found', providerRelayPayload.eip6963Info, injectedProviders);
      return;
    }

    if (!provider) {
      // console.log('PARENT - provider not found');

      const connectRes = await checkout.connect({
        provider: new Web3Provider(targetProvider.provider),
      });

      postMessageHandler.send(PostMessageHandlerEventType.PROVIDER_UPDATED, {
        eip6963Info: payload.eip6963Info,
      });

      checkoutDispatch({
        payload: {
          type: CheckoutActions.SET_PROVIDER,
          provider: connectRes.provider,
        },
      });
      // console.log('PARENT - provider connected', connectRes);
      await execute(providerRelayPayload, connectRes.provider);
    } else {
      // console.log('PARENT - provider found', provider);
      await execute(providerRelayPayload, provider);
    }
  }, [provider, postMessageHandler, checkout]);

  useEffect(() => {
    if (!postMessageHandler || !checkout) return;

    postMessageHandler.subscribe(onMessage);
  }, [provider, postMessageHandler, checkout, execute, onMessage]);
}
