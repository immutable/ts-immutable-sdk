import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { routingOptionsAvailable } from './routingOptions';
import { CheckoutConfiguration } from '../../config';
import * as geoBlocking from './geoBlocking';
import { DEFAULT_BRIDGE_ENABLED, DEFAULT_ON_RAMP_ENABLED, DEFAULT_SWAP_ENABLED } from '../../types';

jest.mock('./geoBlocking', () => ({
  isOnRampGeoBlocked: jest.fn().mockResolvedValue(false),
  isSwapGeoBlocked: jest.fn().mockResolvedValue(false),
}));

describe('routingOptions', () => {
  let mockProvider: Web3Provider;
  let config: CheckoutConfiguration;

  beforeEach(() => {
    mockProvider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
      }),
    } as unknown as Web3Provider;

    config = new CheckoutConfiguration({
      baseConfig: { environment: Environment.SANDBOX },
    });

    // Default to no geo-blocking
    (geoBlocking.isOnRampGeoBlocked as jest.Mock).mockResolvedValue(false);
    (geoBlocking.isSwapGeoBlocked as jest.Mock).mockResolvedValue(false);
  });

  it('should return default routing options if no routing availability overrides configured', async () => {
    const routingOptions = await routingOptionsAvailable(config, mockProvider);
    expect(routingOptions).toEqual({
      onRamp: DEFAULT_ON_RAMP_ENABLED,
      swap: DEFAULT_SWAP_ENABLED,
      bridge: DEFAULT_BRIDGE_ENABLED,
    });
  });

  it('should return default routing options if no geo-blocking', async () => {
    (geoBlocking.isOnRampGeoBlocked as jest.Mock).mockResolvedValue(false);
    (geoBlocking.isSwapGeoBlocked as jest.Mock).mockResolvedValue(false);

    const routingOptions = await routingOptionsAvailable(config, mockProvider);
    expect(routingOptions).toEqual({
      onRamp: DEFAULT_ON_RAMP_ENABLED,
      swap: DEFAULT_SWAP_ENABLED,
      bridge: DEFAULT_BRIDGE_ENABLED,
    });
  });

  it('should return configured routing availability overrides if provided', async () => {
    const configWithOptions = new CheckoutConfiguration({
      baseConfig: { environment: Environment.SANDBOX },
      isBridgeEnabled: false,
      isOnRampEnabled: false,
      isSwapEnabled: false,
    });

    const routingOptions = await routingOptionsAvailable(configWithOptions, mockProvider);
    expect(routingOptions).toEqual({
      onRamp: false,
      swap: false,
      bridge: false,
    });
  });

  it('should disable onRamp options if OnRamp is geo-blocked', async () => {
    (geoBlocking.isOnRampGeoBlocked as jest.Mock).mockResolvedValue(true);

    const routingOptions = await routingOptionsAvailable(config, mockProvider);
    expect(routingOptions.onRamp).toEqual(false);
  });

  it('should disable OnRamp options if OnRamp geo-blocked checks are rejected', async () => {
    (geoBlocking.isOnRampGeoBlocked as jest.Mock).mockRejectedValue({ error: '404' });

    const routingOptions = await routingOptionsAvailable(config, mockProvider);
    expect(routingOptions.onRamp).toEqual(false);
  });

  it('should disable Swap options if Swap is geo-blocked', async () => {
    (geoBlocking.isSwapGeoBlocked as jest.Mock).mockResolvedValue(true);

    const routingOptions = await routingOptionsAvailable(config, mockProvider);
    expect(routingOptions.swap).toEqual(false);
  });

  it('should disable Swap options if Swap geo-blocked checks are rejected', async () => {
    (geoBlocking.isSwapGeoBlocked as jest.Mock).mockRejectedValue({ error: '404' });

    const routingOptions = await routingOptionsAvailable(config, mockProvider);
    expect(routingOptions.swap).toEqual(false);
  });

  it('should disable both options if OnRamp and Bridge is geo-blocked', async () => {
    (geoBlocking.isOnRampGeoBlocked as jest.Mock).mockResolvedValue(true);
    (geoBlocking.isSwapGeoBlocked as jest.Mock).mockResolvedValue(true);

    const routingOptions = await routingOptionsAvailable(config, mockProvider);
    expect(routingOptions.onRamp).toEqual(false);
    expect(routingOptions.swap).toEqual(false);
  });

  it('should disable both options if OnRamp and Bridge geo-blocked checks are rejected', async () => {
    (geoBlocking.isOnRampGeoBlocked as jest.Mock).mockRejectedValue({ error: '404' });
    (geoBlocking.isSwapGeoBlocked as jest.Mock).mockRejectedValue({ error: '404' });

    const routingOptions = await routingOptionsAvailable(config, mockProvider);
    expect(routingOptions.onRamp).toEqual(false);
    expect(routingOptions.swap).toEqual(false);
  });

  it('should disable Bridge options if Passport provider', async () => {
    const mockPassportProvider = {
      provider: {
        isPassport: true,
      },
    } as unknown as Web3Provider;

    const routingOptions = await routingOptionsAvailable(config, mockPassportProvider);
    expect(routingOptions.bridge).toEqual(false);
  });

  it('should enable Bridge options if non-Passport provider', async () => {
    const mockPassportProvider = {
      provider: {},
    } as unknown as Web3Provider;

    const routingOptions = await routingOptionsAvailable(config, mockPassportProvider);
    expect(routingOptions.bridge).toEqual(true);
  });
});
