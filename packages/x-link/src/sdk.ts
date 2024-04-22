/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-confusing-arrow */
/* eslint-disable arrow-body-style */
/* eslint-disable arrow-parens */
/* eslint-disable operator-linebreak */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/naming-convention */
import qs from 'qs';
import queryString from 'query-string';

import { LocalStorageKeys } from './libs';
import { Params as LinkParams, Results as LinkResults } from './types';
import {
  ConfigurableIframeOptions,
  ERC721TokenType,
  FeeType,
  FullIframeOptions,
  LINK_MESSAGE_TYPE,
  LinkError,
  // LinkParams,
  // LinkResults,
  messageTypes,
  messagingUrls,
  Routes,
} from './sdk-types';
import { dispatchLinkInfoEvent, STRINGIFY_SETTINGS } from './utils';

const messageTypesForRoute = {
  [Routes.BatchNftTransfer]: messageTypes.batchNftTransfer,
  [Routes.Sign]: messageTypes.sign,
};

export const getFullIframeOptions = (): FullIframeOptions => ({
  containerElement: document.body,
  className: '',
  size: {
    width: 375,
    height: 667,
  },
  position: {
    right: '0%',
    bottom: '0%',
  },
  protectAgainstGlobalStyleBleed: true,
});

const xButtonSize = '22px';
const globalStyleBleedProtection = `
  /*
  HARDEN STYLES TO PREVENT SOME GLOBAL STYLES FROM AFFECTING THEM
  ----------------------------------------------------------------
  This should solve issues that token trove are encountering.
  */
  .imxLinkIframeContainer__closeButton {
      transition: none !important;
      width: ${xButtonSize} !important;
      height: ${xButtonSize} !important;
      min-width: ${xButtonSize} !important;
      min-height: ${xButtonSize} !important;
      margin: 0 !important;
      border: none !important;
  }
`;

const renderEmbedStyles = ({
  size,
  position,
  protectAgainstGlobalStyleBleed,
}: FullIframeOptions) => `
  .imxLinkIframeContainer {
      position: fixed;
      ${position.top ? `top: ${position.top};` : ''}
      ${position.bottom ? `bottom: ${position.bottom};` : ''}
      ${position.left ? `left: ${position.left};` : ''}
      ${position.right ? `right: ${position.right};` : ''}
      width: ${size.width}px;
      height: ${size.height}px;
  }
  .imxLinkIframeContainer[hidden="true"] {
    opacity: 0; 
    user-select: none;
  }
  .imxLinkIframeContainer__iframe {
      display: block;
      height: 100%;
      width: 100%;
      border: none;
  }

  .imxLinkIframeContainer__closeButton {
      width: ${xButtonSize};
      height: ${xButtonSize};
      min-width: ${xButtonSize};
      min-height: ${xButtonSize};
      opacity: 0.4;
      position: absolute;
      z-index: 1;
      top: 15px;
      right: 15px;
      background: transparent url(https://images.godsunchained.com/misc/white-menu-close.svg) center;
      border: none;
      padding: 0;
      cursor: pointer;
  }

  ${protectAgainstGlobalStyleBleed ? globalStyleBleedProtection : ''}

  .imxLinkIframeContainer__closeButton:hover {
      opacity: 1;
  }
`;

export const initIframeDom = (
  fullIframeOptions: FullIframeOptions,
  url: string,
  onCloseIframe?: () => void,
) => {
  const styleSheet = document.createElement('style');
  const containerDom = document.createElement('div');
  const iframeDom = document.createElement('iframe');
  const closeButtonDom = document.createElement('button');
  containerDom.classList.add('imxLinkIframeContainer');
  fullIframeOptions.className &&
    containerDom.classList.add(fullIframeOptions.className);
  if (fullIframeOptions.hidden) containerDom.setAttribute('hidden', 'true');
  iframeDom.classList.add('imxLinkIframeContainer__iframe');
  iframeDom.setAttribute(
    'sandbox',
    'allow-same-origin allow-scripts allow-forms allow-popups',
  );
  closeButtonDom.classList.add('imxLinkIframeContainer__closeButton');
  styleSheet.append(
    document.createTextNode(renderEmbedStyles(fullIframeOptions)),
  );
  containerDom.append(styleSheet, iframeDom, closeButtonDom);

  // @NOTE: set the source of the iframe, and finally inject the iframe
  // container into the document:
  iframeDom.setAttribute('src', url);
  fullIframeOptions.containerElement.appendChild(containerDom);
  iframeDom.addEventListener('load', () => {
    console.log('iframe content loaded');
  });

  if (onCloseIframe) {
    closeButtonDom.addEventListener('click', onCloseIframe);
  }

  return { containerDom, iframeDom };
};

export class Link {
  constructor(
    private webUrl = 'https://link.sandbox.x.immutable.com',
    private iframeOptions: ConfigurableIframeOptions = null,
  ) {}

  private buildUrl(route: Routes, params: any, legacy: boolean) {
    if (messagingUrls.includes(route)) {
      return this.webUrl;
    }

    let query = params || {};

    if (
      route === Routes.Sell ||
      route === Routes.BuyV2 ||
      route === Routes.Cancel ||
      route === Routes.MakeOffer ||
      route === Routes.AcceptOffer
    ) {
      // These routes could have a list of fee objects for their params.
      // queryString.stringifyUrl() doesn't work for lists of objects. We need
      // to convert the fees param to two separate comma separated strings.
      if (Array.isArray(params.fees)) {
        const fees = params.fees as FeeType[];
        query = {
          ...query,
          fees: undefined,
          fee_percentages: fees.map(fee => fee.percentage),
          fee_recipients: fees.map(fee => fee.recipient),
        };
      }
    }

    return legacy
      ? queryString.stringifyUrl({
        url: `${this.webUrl}/${route}`,
        query,
      })
      : `${this.webUrl}/${route}${qs.stringify(params, STRINGIFY_SETTINGS)}`;
  }

  private openIframeOrWindow =
    <I, O = void>(route: Routes) =>
    (params: I): Promise<O> =>
      this.iframeOptions
        ? this.openIframe(route, params)
        : this.openWindow(route, params);

  private openIframe = <I, O = void>(route: Routes, params: I): Promise<O> =>
    new Promise((resolve, reject) => {
      const url = this.buildUrl(route, params, route !== Routes.TransferV2);
      const unloadIframe = () => {
        window.removeEventListener('message', eventListener, false);
        fullIframeOptions.containerElement.removeChild(containerDom);
        reject(new LinkError(1003, 'Code 1003 - Link window closed.'));
      };

      const fullIframeOptions: FullIframeOptions = {
        ...getFullIframeOptions(),
        ...this.iframeOptions,
        ...params,
      };
      const { containerDom, iframeDom } = initIframeDom(
        fullIframeOptions,
        url,
        unloadIframe,
      );

      const eventListener = (event: MessageEvent) => {
        if (
          event.origin !== this.getLinkDomain() ||
          event.source !== iframeDom?.contentWindow
        ) {
          return;
        }

        const { data: body } = event;
        if (body.type === LINK_MESSAGE_TYPE) {
          switch (body.message) {
            case messageTypes.inProgress: {
              console.log(`${route} In Progress`);
              break;
            }
            case messageTypes.ready: {
              console.log(`Link ready for commands`);
              switch (route) {
                case Routes.BatchNftTransfer:
                case Routes.Sign:
                  iframeDom?.contentWindow?.postMessage(
                    {
                      type: LINK_MESSAGE_TYPE,
                      message: messageTypesForRoute[route],
                      payload: params,
                    },
                    '*',
                  );
                  break;

                default:
                  console.error(`Error: Unknown route`);
                  break;
              }
              break;
            }
            case messageTypes.success: {
              console.log(`${route} Succeeded with`, body.data);
              resolve((body.data ?? {}) as O);
              break;
            }
            case messageTypes.fail: {
              console.log(`${route} Failed with`, body?.data ?? 'no data');
              if (body?.data?.code) {
                reject(new LinkError(body.data.code, body.data?.error ?? ''));
              } else reject();
              break;
            }
            case messageTypes.info: {
              // WT-985 This message type does not resolve or reject the promise
              // used for passing new wallet details back as part of a separate flow
              console.log(`${route} Sent info`, body.data);
              this.updateWalletDetailsInStorage(body.data);
              dispatchLinkInfoEvent(body.data);
              break;
            }
            // This is only used by setup function
            // TODO see if we can consolidate result and success
            case messageTypes.result: {
              console.log(`${route} Succeeded with result`, body.data);
              resolve((body.data ?? {}) as O);
              unloadIframe();
              break;
            }
            case messageTypes.close: {
              unloadIframe();
              break;
            }
            default: {
              console.error('Unknown message', body);
              break;
            }
          }
        }
      };

      window.addEventListener('message', eventListener, false);
    });

  private openWindow = <I, O = void>(route: Routes, params: I): Promise<O> =>
    new Promise((resolve, reject) => {
      const defaultOptions = getFullIframeOptions();
      const url = this.buildUrl(route, params, route !== Routes.TransferV2);
      const win = window.open(
        url,
        'imx-link',
        // eslint-disable-next-line max-len
        `menubar=yes,location=no,resizable=no,scrollbars=no,status=yes,width=${defaultOptions.size.width},height=${defaultOptions.size.height}`,
      );
      if (!win) {
        throw new Error('Unable to open window');
      }

      const checkClosed = setInterval(() => {
        if (win.closed) {
          clearInterval(checkClosed);
          reject(new LinkError(1003, 'Code 1003 - Link window closed.'));
        }
      }, 500);
      let handledNewSubscriberEvents = 0;
      const eventListener = (event: MessageEvent) => {
        // Handle messages sent by the current window
        if (event.origin === window.origin && event.source === window) {
          const { data } = event;

          // Sent whenever a new subscriber is registered and starts listening
          // for link messages (we also receive our own subscription message here)
          if (
            data.type === LINK_MESSAGE_TYPE &&
            data.message === messageTypes.newSubscriber
          ) {
            handledNewSubscriberEvents += 1;

            // The first new subscriber event handled by the event listener is
            // always for itself. Subsequent ones mean there's a new listener
            // registered and we should unregister the current event listener.
            if (handledNewSubscriberEvents > 1) {
              window.removeEventListener('message', eventListener, false);
            }
          }

          return;
        }

        if (event.origin !== this.getLinkDomain()) return;
        const { data } = event;

        if (data.type === LINK_MESSAGE_TYPE) {
          switch (data.message) {
            case messageTypes.inProgress: {
              console.log(`${route} In Progress`);
              break;
            }
            case messageTypes.ready: {
              console.log(`Link ready for commands`);
              switch (route) {
                case Routes.BatchNftTransfer:
                case Routes.Sign:
                  win.postMessage(
                    {
                      type: LINK_MESSAGE_TYPE,
                      message: messageTypesForRoute[route],
                      payload: params,
                    },
                    '*',
                  );
                  break;

                default:
                  console.error(`Error: Unknown route`);
                  break;
              }
              break;
            }
            case messageTypes.success: {
              console.log(`${route} Succeeded`, data.data);
              resolve((data.data ?? {}) as O);
              break;
            }

            case messageTypes.fail: {
              console.log(`${route} Failed`);
              reject();
              break;
            }
            case messageTypes.info: {
              // WT-985 This message type does not resolve or reject the promise
              // used for passing new wallet details back as part of a separate flow
              console.log(`${route} Sent info`, data.data);
              this.updateWalletDetailsInStorage(data.data);
              dispatchLinkInfoEvent(data.data);
              break;
            }
            case messageTypes.result: {
              console.log(`${route} Succeeded with result`, data.data);
              window.removeEventListener('message', eventListener, false);
              clearInterval(checkClosed);
              win.close();
              resolve((data.data ?? {}) as O);
              break;
            }

            case messageTypes.close: {
              window.removeEventListener('message', eventListener, false);
              clearInterval(checkClosed);
              win.close();
              reject(new LinkError(1003, 'Code 1003 - Link window closed.'));
              break;
            }

            default: {
              console.error('Unknown message', data);
              break;
            }
          }
        }
      };

      window.addEventListener('message', eventListener, false);

      // Notify any previously registered event listeners that they should stop
      // listening since we reopened the Link window and are now the current
      // "owners" of the flow being executed by Link.
      window.postMessage(
        { type: LINK_MESSAGE_TYPE, message: messageTypes.newSubscriber },
        '*',
      );
    });

  private getLinkDomain = () => new URL(this.webUrl).origin;

  private updateWalletDetailsInStorage = (result: any) => {
    if (result?.address) {
      window.localStorage.setItem(
        LocalStorageKeys.WALLET_ADDRESS,
        result.address,
      );
    }

    if (result?.starkPublicKey) {
      window.localStorage.setItem(
        LocalStorageKeys.STARK_PUBLIC_KEY,
        result.starkPublicKey,
      );
    }

    if (result?.providerPreference) {
      window.localStorage.setItem(
        LocalStorageKeys.PROVIDER_PREFERENCE,
        result.providerPreference,
      );
    }
  };

  history = this.openIframeOrWindow<LinkParams.History>(Routes.History);

  setup = async (params: LinkParams.Setup): Promise<LinkResults.Setup> => {
    const result = await this.openIframeOrWindow<
      LinkParams.Setup,
      LinkResults.Setup
    >(Routes.Setup)(params);

    window.localStorage.setItem(
      LocalStorageKeys.PROVIDER_PREFERENCE,
      result.providerPreference,
    );

    return result;
  };

  buy = this.openIframeOrWindow<LinkParams.BuyV2, LinkResults.BuyV2>(
    Routes.BuyV2,
  );

  sell = this.openIframeOrWindow<LinkParams.Sell>(Routes.Sell);

  deposit = (params: LinkParams.FlexibleDeposit = undefined) => {
    const openDeposit = () =>
      this.openIframeOrWindow<LinkParams.FlexibleDeposit>(Routes.Deposit)(
        params,
      );
    return openDeposit();
  };

  prepareWithdrawal = this.openIframeOrWindow<
    LinkParams.PrepareWithdrawal,
    LinkResults.PrepareWithdrawal
  >(Routes.PrepareWithdrawal);

  completeWithdrawal = this.openIframeOrWindow<
    LinkParams.CompleteWithdrawal,
    LinkResults.CompleteWithdrawal
  >(Routes.CompleteWithdrawal);

  // Sends individual transfer requests to v1 endpoint in a loop
  transfer = this.openIframeOrWindow<
    LinkParams.TransferV2,
    LinkResults.TransferV2
  >(Routes.TransferV2);

  // Sends NFT transfer requests to v2 endpoint in batches
  batchNftTransfer = async (params: LinkParams.BatchNftTransfer) => {
    const isNonNftTokensFound =
      params.filter(transfer => transfer.type !== ERC721TokenType.ERC721)
        .length > 0;
    if (isNonNftTokensFound) {
      throw Error('batchNftTransfer can only be called with NFT transfers');
    }

    return this.openIframeOrWindow<
      LinkParams.BatchNftTransfer,
      LinkResults.BatchNftTransfer
    >(Routes.BatchNftTransfer)(params);
  };

  cancel = this.openIframeOrWindow<LinkParams.Cancel>(Routes.Cancel);

  claim = async () => {
    console.warn(
      "Warning: 'Link.claim()' is only for the 'IMX' reward campaign.",
    );
    const openClaim = this.openIframeOrWindow<LinkParams.Claim>(Routes.Claim);
    return openClaim({});
  };

  onramp = this.openIframeOrWindow<LinkParams.Onramp, LinkResults.Onramp>(
    Routes.Onramp,
  );

  offramp = this.openIframeOrWindow<LinkParams.Offramp, LinkResults.Offramp>(
    Routes.Offramp,
  );

  /**
   * @deprecated
   * Exchange API v3 uses on 'Onramp' instead of 'FiatToCrypto'
   */
  fiatToCrypto = this.openIframeOrWindow<
    LinkParams.FiatToCrypto,
    LinkResults.FiatToCrypto
  >(Routes.FiatToCrypto);

  /**
   * @deprecated
   * Exchange API v3 uses on 'Offramp' instead of 'CryptoToFiat'
   */
  cryptoToFiat = this.openIframeOrWindow<
    LinkParams.CryptoToFiat,
    LinkResults.CryptoToFiat
  >(Routes.CryptoToFiat);

  nftCheckoutPrimary = this.openIframeOrWindow<
    LinkParams.NFTCheckoutPrimary,
    LinkResults.NFTCheckoutPrimary
  >(Routes.NFTCheckoutPrimary);

  nftCheckoutSecondary = this.openIframeOrWindow<
    LinkParams.NFTCheckoutSecondary,
    LinkResults.NFTCheckoutSecondary
  >(Routes.NFTCheckoutSecondary);

  makeOffer = (params: LinkParams.MakeOffer) => {
    return this.openIframeOrWindow<LinkParams.MakeOffer, LinkResults.MakeOffer>(
      Routes.MakeOffer,
    )(params);
  };

  cancelOffer = (params: LinkParams.CancelOffer) => {
    return this.openIframeOrWindow<LinkParams.CancelOffer>(Routes.CancelOffer)(
      params,
    );
  };

  acceptOffer = (params: LinkParams.AcceptOffer) => {
    return this.openIframeOrWindow<LinkParams.AcceptOffer>(Routes.AcceptOffer)(
      params,
    );
  };

  sign = this.openIframeOrWindow<LinkParams.Sign, LinkResults.Sign>(
    Routes.Sign,
  );

  getPublicKey = this.openIframeOrWindow<
    LinkParams.GetPublicKey,
    LinkResults.GetPublicKey
  >(Routes.GetPublicKey);
}
