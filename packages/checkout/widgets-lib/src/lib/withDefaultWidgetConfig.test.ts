import { Environment } from '@imtbl/config';
import { withDefaultWidgetConfigs } from './withDefaultWidgetConfig';
import {
  DEFAULT_BRIDGE_ENABLED,
  DEFAULT_ENV,
  DEFAULT_ON_RAMP_ENABLED,
  DEFAULT_SWAP_ENABLED,
  DEFAULT_THEME,
} from './constants';
import { WidgetTheme } from './types';

describe('withDefaultWidgetConfig', () => {
  it('empty config returns defaults', () => {
    expect(withDefaultWidgetConfigs({})).toEqual({
      theme: DEFAULT_THEME,
      environment: DEFAULT_ENV,
      isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
    });
    expect(withDefaultWidgetConfigs(undefined)).toEqual({
      theme: DEFAULT_THEME,
      environment: DEFAULT_ENV,
      isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
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
    });
    expect(
      withDefaultWidgetConfigs({
        theme: WidgetTheme.CUSTOM,
      }),
    ).toEqual({
      theme: WidgetTheme.CUSTOM,
      environment: DEFAULT_ENV,
      isOnRampEnabled: DEFAULT_ON_RAMP_ENABLED,
      isSwapEnabled: DEFAULT_SWAP_ENABLED,
      isBridgeEnabled: DEFAULT_BRIDGE_ENABLED,
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
    });
  });
});
