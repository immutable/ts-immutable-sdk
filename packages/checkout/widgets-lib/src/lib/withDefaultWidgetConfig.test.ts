import { Environment } from '@imtbl/config';
import { WidgetTheme } from '@imtbl/checkout-sdk';
import { withDefaultWidgetConfigs } from './withDefaultWidgetConfig';
import {
  DEFAULT_BRIDGE_ENABLED,
  DEFAULT_ENV,
  DEFAULT_ON_RAMP_ENABLED,
  DEFAULT_SWAP_ENABLED,
  DEFAULT_ADD_TOKENS_ENABLED,
  DEFAULT_THEME,
} from './constants';

describe('withDefaultWidgetConfig', () => {
  it('empty config returns defaults', () => {
    expect(withDefaultWidgetConfigs({} as any)).toEqual({
      theme: DEFAULT_THEME,
      themeOverrides: {},
      environment: DEFAULT_ENV,
      isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
      isAddTokensEnabled: DEFAULT_ADD_TOKENS_ENABLED,
    });
    expect(withDefaultWidgetConfigs(undefined as any)).toEqual({
      theme: DEFAULT_THEME,
      themeOverrides: {},
      environment: DEFAULT_ENV,
      isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
      isAddTokensEnabled: DEFAULT_ADD_TOKENS_ENABLED,
    });
  });

  it('empty config returns some defaults', () => {
    expect(
      withDefaultWidgetConfigs({
        environment: Environment.PRODUCTION,
      } as any),
    ).toEqual({
      theme: DEFAULT_THEME,
      themeOverrides: {},
      environment: Environment.PRODUCTION,
      isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
      isAddTokensEnabled: DEFAULT_ADD_TOKENS_ENABLED,
    });
    expect(
      withDefaultWidgetConfigs({
        isOnRampEnabled: false,
      } as any),
    ).toEqual({
      theme: DEFAULT_THEME,
      themeOverrides: {},
      environment: DEFAULT_ENV,
      isOnRampEnabled: false,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
      isAddTokensEnabled: DEFAULT_ADD_TOKENS_ENABLED,
    });
  });

  it('should use the correct environment', () => {
    expect(
      withDefaultWidgetConfigs({
        environment: Environment.PRODUCTION,
      } as any),
    ).toEqual({
      theme: DEFAULT_THEME,
      themeOverrides: {},
      environment: Environment.PRODUCTION,
      isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
      isAddTokensEnabled: DEFAULT_ADD_TOKENS_ENABLED,
    });

    expect(
      withDefaultWidgetConfigs({
        environment: Environment.SANDBOX,
      } as any),
    ).toEqual({
      theme: DEFAULT_THEME,
      themeOverrides: {},
      environment: Environment.SANDBOX,
      isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
      isAddTokensEnabled: DEFAULT_ADD_TOKENS_ENABLED,
    });

    expect(
      withDefaultWidgetConfigs({
        environment: 'unknown' as Environment,
      } as any),
    ).toEqual({
      theme: DEFAULT_THEME,
      themeOverrides: {},
      environment: DEFAULT_ENV,
      isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
      isAddTokensEnabled: DEFAULT_ADD_TOKENS_ENABLED,
    });
  });

  it('should use the correct theme', () => {
    expect(
      withDefaultWidgetConfigs({
        theme: WidgetTheme.DARK,
      } as any),
    ).toEqual({
      theme: WidgetTheme.DARK,
      themeOverrides: {},
      environment: DEFAULT_ENV,
      isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
      isAddTokensEnabled: DEFAULT_ADD_TOKENS_ENABLED,
    });

    expect(
      withDefaultWidgetConfigs({
        theme: WidgetTheme.LIGHT,
      } as any),
    ).toEqual({
      theme: WidgetTheme.LIGHT,
      themeOverrides: {},
      environment: DEFAULT_ENV,
      isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
      isAddTokensEnabled: DEFAULT_ADD_TOKENS_ENABLED,
    });

    expect(
      withDefaultWidgetConfigs({
        theme: 'unknown' as Environment,
      } as any),
    ).toEqual({
      theme: DEFAULT_THEME,
      themeOverrides: {},
      environment: DEFAULT_ENV,
      isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
      isAddTokensEnabled: DEFAULT_ADD_TOKENS_ENABLED,
    });
  });
});
