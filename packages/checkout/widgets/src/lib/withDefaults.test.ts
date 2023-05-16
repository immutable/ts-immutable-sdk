import { Environment } from '@imtbl/config';
import {
  DEFAULT_ENV,
  DEFAULT_THEME,
  WidgetTheme,
} from '../definitions/constants';
import { withDefaults } from './withDefaults';

describe('withDefaults', () => {
  it('empty config returns defaults', () => {
    expect(withDefaults({})).toEqual({
      theme: DEFAULT_THEME,
      environment: DEFAULT_ENV,
    });
  });
  it('empty config returns some defaults', () => {
    expect(
      withDefaults({
        environment: Environment.PRODUCTION,
      }),
    ).toEqual({
      theme: DEFAULT_THEME,
      environment: Environment.PRODUCTION,
    });
    expect(
      withDefaults({
        theme: WidgetTheme.CUSTOM,
      }),
    ).toEqual({
      theme: WidgetTheme.CUSTOM,
      environment: DEFAULT_ENV,
    });
  });
});
