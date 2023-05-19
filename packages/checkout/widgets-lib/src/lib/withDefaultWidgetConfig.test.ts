import {
  DEFAULT_ENV,
  DEFAULT_THEME,
  WidgetTheme,
} from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';
import { withDefaultWidgetConfigs } from './withDefaultWidgetConfig';

describe('withDefaultWidgetConfig', () => {
  it('empty config returns defaults', () => {
    expect(withDefaultWidgetConfigs({})).toEqual({
      theme: DEFAULT_THEME,
      environment: DEFAULT_ENV,
      isOnRampEnabled: true,
      isSwapEnabled: true,
      isBridgeEnabled: true,
    });
    expect(withDefaultWidgetConfigs(undefined)).toEqual({
      theme: DEFAULT_THEME,
      environment: DEFAULT_ENV,
      isOnRampEnabled: true,
      isSwapEnabled: true,
      isBridgeEnabled: true,
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
      isOnRampEnabled: true,
      isSwapEnabled: true,
      isBridgeEnabled: true,
    });
    expect(
      withDefaultWidgetConfigs({
        theme: WidgetTheme.CUSTOM,
      }),
    ).toEqual({
      theme: WidgetTheme.CUSTOM,
      environment: DEFAULT_ENV,
      isOnRampEnabled: true,
      isSwapEnabled: true,
      isBridgeEnabled: true,
    });
    expect(
      withDefaultWidgetConfigs({
        isOnRampEnabled: false,
      }),
    ).toEqual({
      theme: DEFAULT_THEME,
      environment: DEFAULT_ENV,
      isOnRampEnabled: false,
      isSwapEnabled: true,
      isBridgeEnabled: true,
    });
  });
});
