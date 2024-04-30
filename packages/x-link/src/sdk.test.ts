/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-len */
/* eslint-disable no-promise-executor-return */
/* eslint-disable arrow-parens */
/* eslint-disable arrow-body-style */
import '@testing-library/jest-dom';
import { Link } from './sdk';
import {
  ERC721TokenType,
  ETHTokenType,
  LINK_MESSAGE_TYPE,
  LinkError,
  // LinkParams,
  messageTypes,
  Routes,
} from './sdk-types';
import { Params as LinkParams } from './types';
import {
  ImxLinkInfoEventType,
  LINK_INFO_MESSAGE_TYPE,
} from './sdk-types/info-events';

const openMock = jest.fn();
const closeMock = jest.fn();
const postMessageMock = jest.fn();

const wait = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

const triggerEvent = (
  source: WindowProxy | null | undefined,
  origin: string,
  message: string,
  data: string | null,
  type: string = LINK_MESSAGE_TYPE,
): void => {
  window.dispatchEvent(
    new MessageEvent('message', {
      source,
      origin,
      data: {
        type,
        data,
        message,
      },
    }),
  );
};

const triggerEventWithRealData = (
  source: WindowProxy | null | undefined,
  origin: string,
  message: string,
  data: any,
  type: string = LINK_MESSAGE_TYPE,
): void => {
  window.dispatchEvent(
    new MessageEvent('message', {
      source,
      origin,
      data: {
        data: { ...data },
        type,
        message,
      },
    }),
  );
};

describe('SDK Link', () => {
  const windowOpen = window.open;
  const windowOpenMock = jest.fn();
  const linkUrl = 'http://localhost';
  const recipientA = '0x0000000000000000000000000000000000000001';
  const recipientB = '0x0000000000000000000000000000000000000002';
  const linkClosedError = new LinkError(
    1003,
    'Code 1003 - Link window closed.',
  );

  beforeEach(() => {
    window.open = windowOpenMock.mockReturnValue({
      open: openMock,
      close: closeMock,
      closed: false,
      postMessage: postMessageMock,
    });
  });

  afterEach(() => {
    // Otherwise iframes stays around between each test and cause tests to fail
    document.getElementsByTagName('html')[0].innerHTML = '';
    jest.clearAllMocks();
  });

  afterAll(() => {
    window.open = windowOpen;
  });

  it('should open window if there is no iframeOptions', () => {
    const link = new Link(linkUrl, null);
    link.setup({});

    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledWith(
      `${linkUrl}/${Routes.Setup}`,
      'imx-link',
      'menubar=yes,location=no,resizable=no,scrollbars=no,status=yes,width=375,height=667',
    );
  });

  it('should throw an error if cannot open a window', async () => {
    window.open = jest.fn().mockReturnValue(null);

    const link = new Link(linkUrl, null);
    try {
      await link.setup({});
    } catch (err) {
      expect(err).toEqual(new Error('Unable to open window'));
    }
  });

  it('should reject promise if window was closed', async () => {
    window.open = jest.fn().mockReturnValue({
      open: openMock,
      close: closeMock,
      closed: true,
    });

    const link = new Link(linkUrl, null);
    await expect(link.claim()).rejects.toEqual(linkClosedError);
  });

  it('should open window with predefined url by default', () => {
    const defaultUrl = 'https://link.sandbox.x.immutable.com';
    const link = new Link();
    link.setup({});
    expect((window.open as jest.Mock).mock.calls[0][0]).toEqual(
      `${defaultUrl}/${Routes.Setup}`,
    );
  });

  describe('should allow to configure iframe', () => {
    it('should allow to set position', () => {
      const customClassName = 'test-class-name';
      const link = new Link(linkUrl, {
        className: customClassName,
        position: {
          top: '0px',
          left: '0px',
        },
        protectAgainstGlobalStyleBleed: false,
      });
      link.setup({});

      const container = document.querySelector('div');
      expect(container).toBeInTheDocument();
      expect(container?.getAttribute('class')).toContain(customClassName);
      expect(document.body.innerHTML).toContain('top: 0px;');
      expect(document.body.innerHTML).toContain('left: 0px;');
    });

    it('should allow not to set position', () => {
      const customClassName = 'test-class-name';
      const link = new Link(linkUrl, {
        className: customClassName,
        position: {},
        protectAgainstGlobalStyleBleed: false,
      });
      link.setup({});

      const container = document.querySelector('div');
      expect(container).toBeInTheDocument();
      expect(container?.getAttribute('class')).toContain(customClassName);

      expect(document.body.innerHTML).not.toContain('right: 0%');
      expect(document.body.innerHTML).not.toContain('bottom: 0%');
    });

    it('should reject setup as iFrame if storage unavailable', async () => {
      const error = new LinkError(
        1004,
        'Code 1004 - There is no storage available. This is usually related to a 3rd party cookie-blocking policy.',
      );

      const url = 'https://storage.unavailable.com';

      const link = new Link(url, {});

      const setupPromise = link.setup({});

      triggerEventWithRealData(
        document.querySelector('iframe')?.contentWindow,
        url,
        messageTypes.fail,
        {
          code: error.code,
          error: error.message,
        },
      );

      await expect(setupPromise).rejects.toThrowError(error);
    });
  });

  it('should open correct urls for different actions', async () => {
    const link = new Link(linkUrl, null);

    link.setup({});
    expect((window.open as jest.Mock).mock.calls[0][0]).toEqual(
      `${linkUrl}/${Routes.Setup}`,
    );

    jest.clearAllMocks();
    link.history({});
    expect((window.open as jest.Mock).mock.calls[0][0]).toEqual(
      `${linkUrl}/${Routes.History}`,
    );

    jest.clearAllMocks();
    link.buy({
      orderIds: ['1', '2'],
    });
    expect((window.open as jest.Mock).mock.calls[0][0]).toEqual(
      `${linkUrl}/${Routes.BuyV2}?orderIds=1&orderIds=2`,
    );

    jest.clearAllMocks();
    link.buy({
      orderIds: ['1', '2'],
      fees: [
        {
          recipient: recipientA,
          percentage: 0.02,
        },
        {
          recipient: recipientB,
          percentage: 11.11,
        },
      ],
    });
    expect((window.open as jest.Mock).mock.calls[0][0]).toContain(
      `?fee_percentages=0.02&fee_percentages=11.11&fee_recipients=${recipientA}&fee_recipients=${recipientB}&orderIds=1&orderIds=2`,
    );

    jest.clearAllMocks();
    link.sell({
      amount: '0.01',
      tokenAddress: 'test-address',
      tokenId: 'test-id',
    });
    await wait(100);
    expect((window.open as jest.Mock).mock.calls[0][0]).toEqual(
      `${linkUrl}/${Routes.Sell}?amount=0.01&tokenAddress=test-address&tokenId=test-id`,
    );

    jest.clearAllMocks();
    link.deposit({
      type: ETHTokenType.ETH,
      amount: '1',
    });
    expect((window.open as jest.Mock).mock.calls[0][0]).toEqual(
      `${linkUrl}/${Routes.Deposit}?amount=1&type=ETH`,
    );

    jest.clearAllMocks();
    link.prepareWithdrawal({
      type: ETHTokenType.ETH,
      amount: '1',
    });
    expect((window.open as jest.Mock).mock.calls[0][0]).toEqual(
      `${linkUrl}/${Routes.PrepareWithdrawal}?amount=1&type=ETH`,
    );

    jest.clearAllMocks();
    link.completeWithdrawal({
      type: ETHTokenType.ETH,
    });
    expect((window.open as jest.Mock).mock.calls[0][0]).toEqual(
      `${linkUrl}/${Routes.CompleteWithdrawal}?type=ETH`,
    );

    jest.clearAllMocks();
    link.transfer([
      {
        type: ETHTokenType.ETH,
        amount: '1',
        toAddress: 'test-address',
      },
    ]);
    expect((window.open as jest.Mock).mock.calls[0][0]).toEqual(
      `${linkUrl}/v2/transfer?0[type]=ETH&0[amount]=1&0[toAddress]=test-address`,
    );

    jest.clearAllMocks();
    link.cancel({
      orderId: '1',
    });
    expect((window.open as jest.Mock).mock.calls[0][0]).toEqual(
      `${linkUrl}/${Routes.Cancel}?orderId=1`,
    );

    jest.clearAllMocks();
    link.cancel({
      orderId: '1',
      fees: [
        {
          recipient: recipientA,
          percentage: 0.02,
        },
        {
          recipient: recipientB,
          percentage: 11.11,
        },
      ],
    });
    expect((window.open as jest.Mock).mock.calls[0][0]).toEqual(
      `${linkUrl}/${Routes.Cancel}?fee_percentages=0.02&fee_percentages=11.11&fee_recipients=${recipientA}&fee_recipients=${recipientB}&orderId=1`,
    );

    jest.clearAllMocks();
    link.getPublicKey({});
    expect((window.open as jest.Mock).mock.calls[0][0]).toEqual(
      `${linkUrl}/${Routes.GetPublicKey}`,
    );

    jest.clearAllMocks();
    link.makeOffer({
      amount: '0.01',
      tokenAddress: 'test-address',
      tokenId: 'test-id',
      currencyAddress: '0xcurrencyAddress',
      fees: [
        {
          recipient: recipientA,
          percentage: 0.02,
        },
        {
          recipient: recipientB,
          percentage: 11.11,
        },
      ],
    });
    expect((window.open as jest.Mock).mock.calls[0][0]).toEqual(
      `${linkUrl}/${Routes.MakeOffer}?amount=0.01&currencyAddress=0xcurrencyAddress&fee_percentages=0.02&fee_percentages=11.11&fee_recipients=${recipientA}&fee_recipients=${recipientB}&tokenAddress=test-address&tokenId=test-id`,
    );

    jest.clearAllMocks();
    link.acceptOffer({
      orderId: '1',
      fees: [
        {
          recipient: recipientA,
          percentage: 0.02,
        },
        {
          recipient: recipientB,
          percentage: 11.11,
        },
      ],
    });
    expect((window.open as jest.Mock).mock.calls[0][0]).toEqual(
      `${linkUrl}/${Routes.AcceptOffer}?fee_percentages=0.02&fee_percentages=11.11&fee_recipients=${recipientA}&fee_recipients=${recipientB}&orderId=1`,
    );

    jest.clearAllMocks();
    link.cancelOffer({
      orderId: '1',
    });
    expect((window.open as jest.Mock).mock.calls[0][0]).toEqual(
      `${linkUrl}/${Routes.CancelOffer}?orderId=1`,
    );
  });

  describe('it should check experimental sell depending on params', () => {
    const link = new Link(linkUrl, null);
    const USDC_ADDRESS = '0x07865c6e87b9f70255377e024ace6630c1eaa37f';

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call sell as it is if params are the same as it was before', async () => {
      link.sell({
        amount: '0.01',
        tokenAddress: 'test-address',
        tokenId: 'test-id',
      });

      await wait(100);
      expect(windowOpenMock).toHaveBeenCalledTimes(1);
      expect((window.open as jest.Mock).mock.calls[0][0]).toEqual(
        `${linkUrl}/${Routes.Sell}?amount=0.01&tokenAddress=test-address&tokenId=test-id`,
      );
    });

    it('should call sell with fees', async () => {
      link.sell({
        amount: '0.01',
        tokenAddress: 'test-address',
        tokenId: 'test-id',
        fees: [
          {
            recipient: recipientA,
            percentage: 0.02,
          },
          {
            recipient: recipientB,
            percentage: 11.11,
          },
        ],
      });

      await wait(100);
      expect(windowOpenMock).toHaveBeenCalledTimes(1);
      expect((window.open as jest.Mock).mock.calls[0][0]).toContain(
        `&fee_percentages=11.11&fee_recipients=${recipientA}&fee_recipients=${recipientB}&tokenAddress=test-address&tokenId=test-id`,
      );
    });

    it('should call sell even if params do not include amount', async () => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://test.com/' },
        writable: true,
        configurable: true,
      });

      link.sell({
        tokenAddress: 'test-address',
        tokenId: 'test-id',
      });

      await wait(100);
      expect(windowOpenMock).toHaveBeenCalledTimes(1);
      expect((window.open as jest.Mock).mock.calls[0][0]).toEqual(
        `${linkUrl}/${Routes.Sell}?tokenAddress=test-address&tokenId=test-id`,
      );
    });

    it('should call sell even if params include currencyAddress', async () => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://test.com/' },
        writable: true,
        configurable: true,
      });

      link.sell({
        amount: '0.01',
        currencyAddress: USDC_ADDRESS,
        tokenAddress: 'test-address',
        tokenId: 'test-id',
      });

      await wait(100);
      expect(windowOpenMock).toHaveBeenCalledTimes(1);
      expect((window.open as jest.Mock).mock.calls[0][0]).toEqual(
        `${linkUrl}/${Routes.Sell}?amount=0.01&currencyAddress=${USDC_ADDRESS}&tokenAddress=test-address&tokenId=test-id`,
      );
    });

    it('should check pass experimental check if referrer is whitelisted', async () => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://market.dev.x.immutable.com/' },
        writable: true,
        configurable: true,
      });
      link.sell({
        amount: '0.01',
        currencyAddress: USDC_ADDRESS,
        tokenAddress: 'test-address',
        tokenId: 'test-id',
      });
      await wait(100);
      expect(window.open as jest.Mock).toHaveBeenCalled();
    });
  });

  describe('Deposit', () => {
    const link = new Link(linkUrl, null);
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://market.dev.x.immutable.com/' },
      writable: true,
      configurable: true,
    });

    it('should allow to run deposit without amount', async () => {
      link.deposit({
        type: ETHTokenType.ETH,
      });

      await wait(100);
      expect(windowOpenMock).toHaveBeenCalledTimes(1);
      expect((window.open as jest.Mock).mock.calls[0][0]).toEqual(
        `${linkUrl}/${Routes.Deposit}?type=ETH`,
      );
    });

    it('should allow to run deposit without any params', async () => {
      link.deposit();
      await wait(100);
      expect(windowOpenMock).toHaveBeenCalledTimes(1);
      expect((window.open as jest.Mock).mock.calls[0][0]).toEqual(
        `${linkUrl}/${Routes.Deposit}`,
      );
    });
  });

  describe('fiat to crypto', () => {
    const link = new Link(linkUrl, null);
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://newmarket.com/' },
      writable: true,
      configurable: true,
    });

    [
      {
        description: 'allow to start exchange without params',
        params: {} as LinkParams.FiatToCrypto,
      },
      {
        description: 'allow to start exchange with one currency code',
        params: {
          cryptoCurrencies: ['eth'],
        } as LinkParams.FiatToCrypto,
      },
      {
        description: 'allow to start exchange with few currencies codes',
        params: {
          cryptoCurrencies: ['eth', 'usdc'],
        } as LinkParams.FiatToCrypto,
      },
    ].forEach(testItem => {
      it(testItem.description, async () => {
        link.fiatToCrypto(testItem.params);
        await wait(100);
        expect(windowOpenMock).toHaveBeenCalledTimes(1);
        expect((window.open as jest.Mock).mock.calls[0][0]).toContain(
          `${linkUrl}/${Routes.FiatToCrypto}`,
        );
      });
    });
  });

  describe('onramp', () => {
    const link = new Link(linkUrl, null);
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://newmarket.com/' },
      writable: true,
      configurable: true,
    });

    [
      {
        description: 'allow to start exchange without params',
        params: {} as LinkParams.Onramp,
      },
      {
        description: 'allow to start exchange with one currency code',
        params: {
          cryptoCurrencies: ['eth'],
        } as LinkParams.Onramp,
      },
      {
        description: 'allow to start exchange with few currencies codes',
        params: {
          cryptoCurrencies: ['eth', 'usdc'],
        } as LinkParams.Onramp,
      },
      {
        description: 'allow to start exchange with provider',
        params: {
          provider: 'provider',
        } as LinkParams.Onramp,
      },
    ].forEach(testItem => {
      it(testItem.description, async () => {
        link.onramp(testItem.params);
        await wait(100);
        expect(windowOpenMock).toHaveBeenCalledTimes(1);
        expect((window.open as jest.Mock).mock.calls[0][0]).toContain(
          `${linkUrl}/${Routes.Onramp}`,
        );
      });
    });
  });

  describe('crypto to fiat', () => {
    const link = new Link(linkUrl, null);

    it('should start cryptoToFiat if called from allowed domain', async () => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://link.x.immutable.com/' },
        writable: true,
        configurable: true,
      });

      link.cryptoToFiat({});

      expect(windowOpenMock).toHaveBeenCalledTimes(1);
      expect((window.open as jest.Mock).mock.calls[0][0]).toContain(
        `${linkUrl}/${Routes.CryptoToFiat}`,
      );
    });

    it('should allow cryptoToFiat to be called with currency list', async () => {
      link.cryptoToFiat({
        cryptoCurrencies: ['eth', 'usdc'],
      });

      expect(windowOpenMock).toHaveBeenCalledTimes(1);
    });

    it('should allow cryptoToFiat to be called with amount', async () => {
      link.cryptoToFiat({
        amount: '0.01',
      });

      expect(windowOpenMock).toHaveBeenCalledTimes(1);
    });

    it('should allow cryptoToFiat to be called with amount and currency list', async () => {
      link.cryptoToFiat({
        cryptoCurrencies: ['eth', 'usdc'],
        amount: '0.01',
      });

      expect(windowOpenMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('offramp', () => {
    const link = new Link(linkUrl, null);

    it('should start offramp if called from allowed domain', async () => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://link.x.immutable.com/' },
        writable: true,
        configurable: true,
      });

      link.offramp({});

      expect(windowOpenMock).toHaveBeenCalledTimes(1);
      expect((window.open as jest.Mock).mock.calls[0][0]).toContain(
        `${linkUrl}/${Routes.Offramp}`,
      );
    });

    it('should allow offramp to be called with currency list', async () => {
      link.offramp({
        cryptoCurrencies: ['eth', 'usdc'],
      });

      expect(windowOpenMock).toHaveBeenCalledTimes(1);
    });

    it('should allow offramp to be called with amount', async () => {
      link.offramp({
        amount: '0.01',
      });

      expect(windowOpenMock).toHaveBeenCalledTimes(1);
    });

    it('should allow offramp to be called with amount and currency list', async () => {
      link.offramp({
        cryptoCurrencies: ['eth', 'usdc'],
        amount: '0.01',
      });

      expect(windowOpenMock).toHaveBeenCalledTimes(1);
    });

    it('should allow offramp to be called with provider', async () => {
      link.offramp({
        provider: 'provider',
      });

      expect(windowOpenMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('nftCheckoutPrimary', () => {
    const link = new Link(linkUrl, null);
    const validParams = {
      provider: 'provider',
      contractAddress: 'test-address',
      offerId: 'test-offer-id',
      sellerWalletAddress: 'test-wallet-address',
    };

    it('should start nftCheckoutPrimary if called from allowed domain', async () => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://link.x.immutable.com/' },
        writable: true,
        configurable: true,
      });

      link.nftCheckoutPrimary(validParams);

      expect(windowOpenMock).toHaveBeenCalledTimes(1);
      expect((window.open as jest.Mock).mock.calls[0][0]).toContain(
        `${linkUrl}/${Routes.NFTCheckoutPrimary}?contractAddress=test-address&offerId=test-offer-id&provider=provider&sellerWalletAddress=test-wallet-address`,
      );
    });
  });

  describe('nftCheckoutSecondary', () => {
    const link = new Link(linkUrl, null);
    const validParams = {
      provider: 'test-provider',
      orderId: 'test-order-id',
      userWalletAddress: 'test-wallet-address',
    };

    it('should start nftCheckoutSecondary if called from allowed domain', async () => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://link.x.immutable.com/' },
        writable: true,
        configurable: true,
      });

      link.nftCheckoutSecondary(validParams);

      expect(windowOpenMock).toHaveBeenCalledTimes(1);
      expect((window.open as jest.Mock).mock.calls[0][0]).toContain(
        `${linkUrl}/${Routes.NFTCheckoutSecondary}?orderId=test-order-id&provider=test-provider&userWalletAddress=test-wallet-address`,
      );
    });
  });

  describe('EventListener', () => {
    [
      {
        type: 'Window',
        iframeOptions: null,
        checkUnload: () => {
          expect(closeMock).toHaveBeenCalled();
        },
      },
      {
        type: 'iFrame',
        iframeOptions: {},
        checkUnload: () => {
          const iframe = document.querySelector('iframe');
          expect(iframe).not.toBeInTheDocument();
        },
      },
    ].forEach(dataTest => {
      describe(dataTest.type, () => {
        const link = new Link(linkUrl, dataTest.iframeOptions);

        const mockPostMessage = (testCase: any) => {
          if (testCase.type === 'iFrame') {
            const iframe = document.querySelector('iframe');
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage = postMessageMock;
            }
          }
        };

        afterEach(() => {
          // Otherwise iframes stays around between each test and cause tests to fail
          document.getElementsByTagName('html')[0].innerHTML = '';
          jest.clearAllMocks();
        });

        it('should handle inProgress and success event', async () => {
          const eventData = 'success';

          const linkPromise = link.setup({});
          const win = document.querySelector('iframe')?.contentWindow;
          triggerEvent(win, linkUrl, messageTypes.inProgress, 'inProgress');
          triggerEvent(win, linkUrl, messageTypes.success, eventData);

          await expect(linkPromise).resolves.toMatch(eventData);
        });

        it('should post batchNftTransfer message only after the ready event received', async () => {
          const eventData = 'ready';
          const payload = [
            {
              type: ERC721TokenType.ERC721,
              tokenId: '1',
              tokenAddress: '2',
              toAddress: 'test-address',
            },
          ];
          const response = {
            transfer_ids: [1],
          };
          // 1. Call batch transfer
          const batchNftTransferPromise = link.batchNftTransfer(payload);
          // 2. Set iframe postMessage function to mock function. Only applicable for iframe test
          mockPostMessage(dataTest);
          // 2. Expect mock function to be not called because link hasn't send ready message
          await expect(postMessageMock).not.toHaveBeenLastCalledWith(
            {
              type: LINK_MESSAGE_TYPE,
              message: messageTypes.batchNftTransfer,
              payload,
            },
            '*',
          );

          // 3. Simulate Link sending back "ready" message
          const win = document.querySelector('iframe')?.contentWindow;
          triggerEvent(
            win,
            linkUrl,
            messageTypes.ready,
            eventData,
            LINK_MESSAGE_TYPE,
          );

          // 4. Expect mock function to be called
          await expect(postMessageMock).toHaveBeenLastCalledWith(
            {
              type: LINK_MESSAGE_TYPE,
              message: messageTypes.batchNftTransfer,
              payload,
            },
            '*',
          );
          triggerEvent(win, linkUrl, messageTypes.inProgress, 'inProgress');
          triggerEvent(
            win,
            linkUrl,
            messageTypes.success,
            JSON.stringify(response),
          );
          // 5. Expect batchNftTransferPromise to resolve
          await expect(batchNftTransferPromise).resolves.toMatch(
            JSON.stringify(response),
          );
        });

        it('should post sign message only after the ready event received', async () => {
          Object.defineProperty(window, 'location', {
            value: { origin: 'https://link.x.immutable.com/' },
            writable: true,
            configurable: true,
          });

          const eventData = 'ready';
          const payload = {
            message: 'test',
            description: 'it is a test payload',
          };
          const response = { result: 'signed-message' };
          const signPromise = link.sign(payload);
          mockPostMessage(dataTest);
          await expect(postMessageMock).not.toHaveBeenLastCalledWith(
            {
              type: LINK_MESSAGE_TYPE,
              message: messageTypes.sign,
              payload,
            },
            '*',
          );

          const win = document.querySelector('iframe')?.contentWindow;
          triggerEvent(
            win,
            linkUrl,
            messageTypes.ready,
            eventData,
            LINK_MESSAGE_TYPE,
          );

          await expect(postMessageMock).toHaveBeenLastCalledWith(
            {
              type: LINK_MESSAGE_TYPE,
              message: messageTypes.sign,
              payload,
            },
            '*',
          );
          triggerEvent(win, linkUrl, messageTypes.inProgress, 'inProgress');
          triggerEvent(
            win,
            linkUrl,
            messageTypes.success,
            JSON.stringify(response),
          );
          await expect(signPromise).resolves.toMatch(JSON.stringify(response));
        });

        it('should return {} on success event if there is no data in event', async () => {
          const linkPromise = link.setup({});
          const win = document.querySelector('iframe')?.contentWindow;
          triggerEvent(win, linkUrl, messageTypes.success, null);

          await expect(linkPromise).resolves.toEqual({});
        });

        it('should handle fail event', async () => {
          const eventData = 'fail';

          const linkPromise = link.setup({});
          const win = document.querySelector('iframe')?.contentWindow;
          triggerEvent(win, linkUrl, messageTypes.fail, eventData);

          await expect(linkPromise).rejects.toBeUndefined();
        });

        it('should handle close event', async () => {
          const eventData = 'close';

          const linkPromise = link.setup({});
          const win = document.querySelector('iframe')?.contentWindow;
          triggerEvent(win, linkUrl, messageTypes.close, eventData);

          await expect(linkPromise).rejects.toEqual(linkClosedError);
          dataTest.checkUnload();
        });

        it('should handle result event', async () => {
          const eventData = 'result';

          const linkPromise = link.setup({});
          const win = document.querySelector('iframe')?.contentWindow;
          triggerEvent(win, linkUrl, messageTypes.result, eventData);

          await expect(linkPromise).resolves.toEqual(eventData);
          dataTest.checkUnload();
        });

        it('should return {} on result event if there is no data in event', async () => {
          const linkPromise = link.setup({});
          const win = document.querySelector('iframe')?.contentWindow;
          triggerEvent(win, linkUrl, messageTypes.result, null);

          await expect(linkPromise).resolves.toEqual({});
        });

        it('should process only known events', async () => {
          const eventData = 'result';

          const linkPromise = link.setup({});
          const win = document.querySelector('iframe')?.contentWindow;
          triggerEvent(win, linkUrl, 'unknown', 'unknown');
          triggerEvent(win, linkUrl, messageTypes.result, eventData);

          await expect(linkPromise).resolves.toEqual(eventData);
        });

        it('should process only known event type', async () => {
          const eventData = 'result';

          const linkPromise = link.setup({});
          const win = document.querySelector('iframe')?.contentWindow;
          triggerEvent(win, linkUrl, 'unknown', 'unknown', 'unknown');
          triggerEvent(win, linkUrl, messageTypes.result, eventData);

          await expect(linkPromise).resolves.toEqual(eventData);
        });

        it('should process events only from known origin', async () => {
          const eventData = 'result';

          const linkPromise = link.setup({});
          const win = document.querySelector('iframe')?.contentWindow;
          triggerEvent(
            win,
            'https://test.com',
            messageTypes.result,
            'unknown-url',
          );
          triggerEvent(win, linkUrl, messageTypes.result, eventData);

          await expect(linkPromise).resolves.toEqual(eventData);
        });

        it('should process events from the same domain but different path', async () => {
          const eventData = 'result';

          const testLink = new Link(`${linkUrl}/any`, dataTest.iframeOptions);
          const linkPromise = testLink.setup({});
          const win = document.querySelector('iframe')?.contentWindow;
          triggerEvent(win, linkUrl, messageTypes.result, eventData);

          await expect(linkPromise).resolves.toEqual(eventData);
        });

        it('should process info message type an re-propogate as a imx-link-info event on window object', async () => {
          const eventData = {
            address: '0x123',
            starkPublicKey: '0x456',
            providerPreference: 'metamask',
            email: '',
            ethNetwork: 'goerli',
          };

          let eventRecievedCount = 0;

          const customEventHandler = (event: CustomEvent) => {
            eventRecievedCount += 1;
            expect(event.detail).toEqual({
              type: ImxLinkInfoEventType.WALLET_CONNECTION,
              payload: {
                walletAddress: eventData.address,
                starkPublicKey: eventData.starkPublicKey,
                providerPreference: eventData.providerPreference,
                email: eventData.email,
                ethNetwork: eventData.ethNetwork,
              },
            });
          };

          window.addEventListener(LINK_INFO_MESSAGE_TYPE, customEventHandler);

          const testLink = new Link(`${linkUrl}/any`, dataTest.iframeOptions);
          const linkPromise = testLink.buy({ orderIds: ['1'] });
          const win = document.querySelector('iframe')?.contentWindow;
          triggerEventWithRealData(win, linkUrl, messageTypes.info, eventData);
          triggerEvent(win, linkUrl, messageTypes.result, 'link buy result');

          await linkPromise;

          expect(eventRecievedCount).toEqual(1);

          window.removeEventListener(
            LINK_INFO_MESSAGE_TYPE,
            customEventHandler,
          );
        });
      });
    });
  });

  it('should open iframe if iframeOptions were set and allow to close it', () => {
    const link = new Link(linkUrl, {});
    link.setup({}).catch(err => expect(err).toEqual(linkClosedError));
    expect(window.open).not.toHaveBeenCalled();

    let iframe = document.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', `${linkUrl}/${Routes.Setup}`);

    const cancelButton = document.querySelector('button');
    expect(cancelButton).toBeInTheDocument();

    cancelButton?.click();

    iframe = document.querySelector('iframe');
    expect(iframe).not.toBeInTheDocument();
  });
});
