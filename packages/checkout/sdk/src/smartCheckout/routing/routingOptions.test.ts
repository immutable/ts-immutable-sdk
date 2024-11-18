import { Environment } from '@imtbl/config';
import { getAvailableRoutingOptions } from './routingOptions';
import { CheckoutConfiguration } from '../../config';
import * as geoBlocking from './geoBlocking';
import { DEFAULT_BRIDGE_ENABLED, DEFAULT_ON_RAMP_ENABLED, DEFAULT_SWAP_ENABLED } from '../../env';
import { HttpClient } from '../../api/http';
import { NamedBrowserProvider } from '../../types';

jest.mock('./geoBlocking');

describe('getAvailableRoutingOptions', () => {
  let mockProvider: NamedBrowserProvider;
  let config: CheckoutConfiguration;
  let mockedHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
      }),
    } as unknown as NamedBrowserProvider;

    mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
    config = new CheckoutConfiguration({
      baseConfig: { environment: Environment.SANDBOX },
    }, mockedHttpClient);

    // Default to no geo-blocking
    (geoBlocking.isOnRampAvailable as jest.Mock).mockResolvedValue(false);
    (geoBlocking.isSwapAvailable as jest.Mock).mockResolvedValue(false);
  });

  it('should return default routing options if no geo-blocking', async () => {
    (geoBlocking.isOnRampAvailable as jest.Mock).mockResolvedValue(true);
    (geoBlocking.isSwapAvailable as jest.Mock).mockResolvedValue(true);

    const routingOptions = await getAvailableRoutingOptions(config, mockProvider);
    expect(routingOptions).toEqual({
      onRamp: DEFAULT_ON_RAMP_ENABLED,
      swap: DEFAULT_SWAP_ENABLED,
      bridge: DEFAULT_BRIDGE_ENABLED,
    });
  });

  it('should return configured routing availability overrides if provided', async () => {
    const configWithOptions = new CheckoutConfiguration({
      baseConfig: { environment: Environment.SANDBOX },
      bridge: { enable: false },
      onRamp: { enable: false },
      swap: { enable: false },
    }, mockedHttpClient);

    const routingOptions = await getAvailableRoutingOptions(configWithOptions, mockProvider);
    expect(routingOptions).toEqual({
      onRamp: false,
      swap: false,
      bridge: false,
    });
  });

  it('should disable onRamp options if OnRamp is geo-blocked', async () => {
    (geoBlocking.isOnRampAvailable as jest.Mock).mockResolvedValue(false);

    const routingOptions = await getAvailableRoutingOptions(config, mockProvider);
    expect(routingOptions.onRamp).toEqual(false);
  });

  it('should disable OnRamp options if OnRamp geo-blocked checks are rejected', async () => {
    (geoBlocking.isOnRampAvailable as jest.Mock).mockRejectedValue({ error: '404' });

    const routingOptions = await getAvailableRoutingOptions(config, mockProvider);
    expect(routingOptions.onRamp).toEqual(false);
  });

  it('should disable Swap options if Swap is geo-blocked', async () => {
    (geoBlocking.isSwapAvailable as jest.Mock).mockResolvedValue(false);

    const routingOptions = await getAvailableRoutingOptions(config, mockProvider);
    expect(routingOptions.swap).toEqual(false);
  });

  it('should disable Swap options if Swap geo-blocked checks are rejected', async () => {
    (geoBlocking.isSwapAvailable as jest.Mock).mockRejectedValue({ error: '404' });

    const routingOptions = await getAvailableRoutingOptions(config, mockProvider);
    expect(routingOptions.swap).toEqual(false);
  });

  it('should disable both options if OnRamp and Swap is geo-blocked', async () => {
    (geoBlocking.isOnRampAvailable as jest.Mock).mockResolvedValue(false);
    (geoBlocking.isSwapAvailable as jest.Mock).mockResolvedValue(false);

    const routingOptions = await getAvailableRoutingOptions(config, mockProvider);
    expect(routingOptions.onRamp).toEqual(false);
    expect(routingOptions.swap).toEqual(false);
  });

  it('should disable both options if OnRamp and Swap geo-blocked checks are rejected', async () => {
    (geoBlocking.isOnRampAvailable as jest.Mock).mockRejectedValue({ error: '404' });
    (geoBlocking.isSwapAvailable as jest.Mock).mockRejectedValue({ error: '404' });

    const routingOptions = await getAvailableRoutingOptions(config, mockProvider);
    expect(routingOptions.onRamp).toEqual(false);
    expect(routingOptions.swap).toEqual(false);
  });

  it('should disable Bridge options if Passport provider', async () => {
    const mockPassportProvider = {
      provider: {
        isPassport: true,
      },
    } as unknown as NamedBrowserProvider;

    const routingOptions = await getAvailableRoutingOptions(config, mockPassportProvider);
    expect(routingOptions.bridge).toEqual(false);
  });

  it('should enable Bridge options if non-Passport provider', async () => {
    const mockPassportProvider = {
      provider: {},
    } as unknown as NamedBrowserProvider;

    const routingOptions = await getAvailableRoutingOptions(config, mockPassportProvider);
    expect(routingOptions.bridge).toEqual(true);
  });
});
