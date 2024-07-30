// TODO ProviderRelay should live in a different folder

import { Web3Provider } from '@ethersproject/providers';
import { PostMessageHandler, PostMessageHandlerEventType } from '@imtbl/checkout-sdk';

export class ProviderRelay {
  // TODO maybe make this a singleton instance? only want one at a time

  private provider: Web3Provider;

  private postMessageHandler: PostMessageHandler;

  constructor(postMessageHandler: PostMessageHandler, provider: Web3Provider) {
    this.provider = provider;
    this.postMessageHandler = postMessageHandler;

    postMessageHandler.addEventHandler(PostMessageHandlerEventType.PROVIDER_RELAY, this.onMessage);
  }

  private onMessage = (payload: any) => {
    if (this.provider.provider.request) {
      this.provider.provider
        .request({ method: payload.method, params: payload.params })
        .then((resp) => {
          const formattedResponse = {
            id: payload.id,
            jsonrpc: '2.0',
            result: resp,
          };

          this.postMessageHandler.sendMessage(PostMessageHandlerEventType.PROVIDER_RELAY, formattedResponse);
        });
    }
  };
}
