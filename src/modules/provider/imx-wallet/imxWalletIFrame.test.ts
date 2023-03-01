import { Environment } from '../constants';
import {
  IMX_WALLET_IFRAME_ID,
  IMX_WALLET_IFRAME_HOSTS,
  setupIframe,
  getIframe,
  getOrSetupIframe,
  IMX_WALLET_IFRAME_STYLE,
} from './imxWalletIFrame';
import {
  htmlBodyInit,
  asyncTriggerIframeOnLoad,
  triggerIframeOnLoad,
} from './testUtils';

describe('the setupIFrame function', () => {
  beforeEach(htmlBodyInit);

  afterEach(() => jest.clearAllMocks());

  it('should succeed', async () => {
    const iFrame = await asyncTriggerIframeOnLoad(
      setupIframe(Environment.DEVELOPMENT)
    );

    expect(iFrame?.getAttribute('id')).toEqual(IMX_WALLET_IFRAME_ID);
    expect(iFrame?.getAttribute('src')).toEqual(
      IMX_WALLET_IFRAME_HOSTS.development
    );
  });

  it('should put in the iFrame the correct domain address', async () => {
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://marketplace.io',
      },
      configurable: true,
      writable: true,
    });

    const iFrame = await asyncTriggerIframeOnLoad(
      setupIframe(Environment.DEVELOPMENT)
    );

    expect(iFrame?.getAttribute('id')).toEqual(IMX_WALLET_IFRAME_ID);
    expect(iFrame?.getAttribute('src')).toEqual(
      IMX_WALLET_IFRAME_HOSTS.development
    );
    expect(iFrame?.getAttribute('style')).toEqual(IMX_WALLET_IFRAME_STYLE);
  });

  it('should prevents more than one iFrame from being created', async () => {
    const setups = [
      getOrSetupIframe(Environment.DEVELOPMENT),
      getOrSetupIframe(Environment.DEVELOPMENT),
    ];

    triggerIframeOnLoad();

    await Promise.race(setups);

    expect(document.querySelectorAll('iframe')).toHaveLength(1);
  });
});

describe('the getIFrame function', () => {
  beforeEach(htmlBodyInit);

  afterEach(() => jest.clearAllMocks());

  it('should return an iFrame', async () => {
    const iFrameLoaded = await asyncTriggerIframeOnLoad(
      setupIframe(Environment.DEVELOPMENT)
    );
    const iFrame = getIframe();

    expect(iFrame).not.toBeNull();
    expect(iFrame).toEqual(iFrameLoaded);
    expect(iFrame?.id).toEqual(IMX_WALLET_IFRAME_ID);
  });
});
