// TODO ProviderRelay should live in a different folder

import { Web3Provider } from '@ethersproject/providers';
import {
  PostMessageData,
  PostMessageHandler,
  PostMessageHandlerEventType,
} from '@imtbl/checkout-sdk';

export class ProviderRelay {
  private provider: Web3Provider;

  private postMessageHandler: PostMessageHandler;

  constructor(postMessageHandler: PostMessageHandler, provider: Web3Provider) {
    this.provider = provider;
    this.postMessageHandler = postMessageHandler;

    postMessageHandler.subscribe(this.onMessage);
  }

  private onMessage = ({ type, payload }: PostMessageData) => {
    if (type !== PostMessageHandlerEventType.PROVIDER_RELAY) return;

    if (!this.provider.provider.request) {
      throw new Error('Provider does not support request method');
    }

    this.provider.provider
      .request({ method: payload.method, params: payload.params })
      .then((resp) => {
        const formattedResponse = {
          id: payload.id,
          jsonrpc: '2.0',
          result: resp,
        };

        // Relay the response back to proxied provider
        this.postMessageHandler.send(
          PostMessageHandlerEventType.PROVIDER_RELAY,
          formattedResponse,
        );
      });
  };
}
