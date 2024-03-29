import { onDarkBase, onLightBase } from '@biom3/design-tokens';
import { WidgetTheme } from '@imtbl/checkout-sdk';
import { widgetTheme } from './theme';

describe('widgetTheme', () => {
  it('should return BIOME theme', () => {
    expect(widgetTheme(WidgetTheme.DARK)).toEqual(onDarkBase);
    expect(widgetTheme(WidgetTheme.LIGHT)).toEqual(onLightBase);
  });
});
