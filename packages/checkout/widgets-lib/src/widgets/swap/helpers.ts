import { TokenInfo } from '@imtbl/checkout-sdk';
import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';
import { text } from '../../resources/text/textConfig';
import { SharedViews } from '../../context/view-context/ViewContext';
import { orchestrationEvents } from '../../lib/orchestrationEvents';

export const alphaSortTokensList = (
  tokens: TokenInfo[],
): TokenInfo[] => tokens.sort((a, b) => a.symbol.localeCompare(b.symbol));

export const topUpBridgeOption = (
  isBridgeEnabled:boolean,
  isNotPassport:boolean,
): { text:string, action: ()=>void } | undefined => {
  if (isBridgeEnabled && isNotPassport) {
    return {
      text: text.views[SharedViews.TOP_UP_VIEW].topUpOptions.bridge.heading,
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

export const topUpOnRampOption = (isOnRampEnabled:boolean): { text:string, action: ()=>void } | undefined => {
  if (isOnRampEnabled) {
    return {
      text: text.views[SharedViews.TOP_UP_VIEW].topUpOptions.onramp.heading,
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
