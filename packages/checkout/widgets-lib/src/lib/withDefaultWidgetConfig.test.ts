import { Environment } from '@imtbl/config';
import { WidgetTheme } from '@imtbl/checkout-sdk';
import { withDefaultWidgetConfigs } from './withDefaultWidgetConfig';
import {
  DEFAULT_BRIDGE_ENABLED,
  DEFAULT_ENV,
  DEFAULT_ON_RAMP_ENABLED,
  DEFAULT_SWAP_ENABLED,
  DEFAULT_ADD_FUNDS_ENABLED,
  DEFAULT_THEME,
} from './constants';

describe('withDefaultWidgetConfig', () => {
  it('empty config returns defaults', () => {
    expect(withDefaultWidgetConfigs({})).toEqual({
      theme: DEFAULT_THEME,
      environment: DEFAULT_ENV,
      isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
      isAddFundsEnabled: DEFAULT_ADD_FUNDS_ENABLED,
    });
    expect(withDefaultWidgetConfigs(undefined)).toEqual({
      theme: DEFAULT_THEME,
      environment: DEFAULT_ENV,
      isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
      isAddFundsEnabled: DEFAULT_ADD_FUNDS_ENABLED,
    });
  });

  it('empty config returns some defaults', () => {
    expect(
      withDefaultWidgetConfigs({
        environment: Environment.PRODUCTION,
      }),
    ).toEqual({
      theme: DEFAULT_THEME,
      environment: Environment.PRODUCTION,
      isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
      isAddFundsEnabled: DEFAULT_ADD_FUNDS_ENABLED,
    });
    expect(
      withDefaultWidgetConfigs({
        isOnRampEnabled: false,
      }),
    ).toEqual({
      theme: DEFAULT_THEME,
      environment: DEFAULT_ENV,
      isOnRampEnabled: false,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
      isAddFundsEnabled: DEFAULT_ADD_FUNDS_ENABLED,
    });
  });

  it('should use the correct environment', () => {
    expect(
      withDefaultWidgetConfigs({
        environment: Environment.PRODUCTION,
      }),
    ).toEqual({
      theme: DEFAULT_THEME,
      environment: Environment.PRODUCTION,
      isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
      isAddFundsEnabled: DEFAULT_ADD_FUNDS_ENABLED,
    });

    expect(
      withDefaultWidgetConfigs({
        environment: Environment.SANDBOX,
      }),
    ).toEqual({
      theme: DEFAULT_THEME,
      environment: Environment.SANDBOX,
      isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
      isAddFundsEnabled: DEFAULT_ADD_FUNDS_ENABLED,
    });

    expect(
      withDefaultWidgetConfigs({
        environment: 'unknown' as Environment,
      }),
    ).toEqual({
      theme: DEFAULT_THEME,
      environment: DEFAULT_ENV,
      isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
      isAddFundsEnabled: DEFAULT_ADD_FUNDS_ENABLED,
    });
  });

  it('should use the correct theme', () => {
    expect(
      withDefaultWidgetConfigs({
        theme: WidgetTheme.DARK,
      }),
    ).toEqual({
      theme: WidgetTheme.DARK,
      environment: DEFAULT_ENV,
      isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
      isAddFundsEnabled: DEFAULT_ADD_FUNDS_ENABLED,
    });

    expect(
      withDefaultWidgetConfigs({
        theme: WidgetTheme.LIGHT,
      }),
    ).toEqual({
      theme: WidgetTheme.LIGHT,
      environment: DEFAULT_ENV,
      isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
      isAddFundsEnabled: DEFAULT_ADD_FUNDS_ENABLED,
    });

    expect(
      withDefaultWidgetConfigs({
        theme: 'unknown' as Environment,
      }),
    ).toEqual({
      theme: DEFAULT_THEME,
      environment: DEFAULT_ENV,
      isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
      isAddFundsEnabled: DEFAULT_ADD_FUNDS_ENABLED,
    });
  });
});
