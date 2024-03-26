import { TokenInfo, IMTBLWidgetEvents } from '@imtbl/checkout-sdk';
import { orchestrationEvents } from '../../lib/orchestrationEvents';

// eslint-disable-next-line max-len
export const alphaSortTokensList = (tokens: TokenInfo[]): TokenInfo[] => tokens.sort((a, b) => a.symbol.localeCompare(b.symbol));

export const topUpBridgeOption = (
  isBridgeEnabled: boolean,
  isNotPassport: boolean,
): { textKey: string, action: () => void } | undefined => {
  if (isBridgeEnabled && isNotPassport) {
    return {
      textKey: 'views.TOP_UP_VIEW.topUpOptions.bridge.heading',
      action: () => {
        orchestrationEvents.sendRequestBridgeEvent(
          window,
          IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT,
          {
            tokenAddress: '',
            amount: '',
          },
        );
      },
    };
  }
  return undefined;
};

export const topUpOnRampOption = (isOnRampEnabled: boolean): { textKey: string, action: () => void } | undefined => {
  if (isOnRampEnabled) {
    return {
      textKey: 'views.TOP_UP_VIEW.topUpOptions.onramp.heading',
      action: () => {
        orchestrationEvents.sendRequestOnrampEvent(
          window,
          IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT,
          {
            tokenAddress: '',
            amount: '',
          },
        );
      },
    };
  }
  return undefined;
};
