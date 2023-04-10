/*
 * @jest-environment jsdom
 */

import { Environment } from '@imtbl/config';
import {
  IMX_WALLET_IFRAME_ID,
  IMX_WALLET_IFRAME_HOSTS,
  setupIFrame,
  getIFrame,
  getOrSetupIFrame,
  IMX_WALLET_IFRAME_STYLE,
} from './imxWalletIFrame';
import {
  htmlBodyInit,
  asyncTriggerIFrameOnLoad,
  triggerIFrameOnLoad,
} from './testUtils';

describe('the setupIFrame function', () => {
  beforeEach(htmlBodyInit);

  afterEach(() => jest.clearAllMocks());

  it('should succeed', async () => {
    const iFrame = await asyncTriggerIFrameOnLoad(
      setupIFrame(Environment.DEVELOPMENT)
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

    const iFrame = await asyncTriggerIFrameOnLoad(
      setupIFrame(Environment.DEVELOPMENT)
    );

    expect(iFrame?.getAttribute('id')).toEqual(IMX_WALLET_IFRAME_ID);
    expect(iFrame?.getAttribute('src')).toEqual(
      IMX_WALLET_IFRAME_HOSTS.development
    );
    expect(iFrame?.getAttribute('style')).toEqual(IMX_WALLET_IFRAME_STYLE);
  });

  it('should prevents more than one iFrame from being created', async () => {
    const setups = [
      getOrSetupIFrame(Environment.DEVELOPMENT),
      getOrSetupIFrame(Environment.DEVELOPMENT),
    ];

    triggerIFrameOnLoad();

    await Promise.race(setups);

    expect(document.querySelectorAll('iframe')).toHaveLength(1);
  });
});

describe('the getIFrame function', () => {
  beforeEach(htmlBodyInit);

  afterEach(() => jest.clearAllMocks());

  it('should return an iFrame', async () => {
    const iFrameLoaded = await asyncTriggerIFrameOnLoad(
      setupIFrame(Environment.DEVELOPMENT)
    );
    const iFrame = getIFrame();

    expect(iFrame).not.toBeNull();
    expect(iFrame).toEqual(iFrameLoaded);
    expect(iFrame?.id).toEqual(IMX_WALLET_IFRAME_ID);
  });
});
