import { TokenInfo, IMTBLWidgetEvents } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { orchestrationEvents } from '../../lib/orchestrationEvents';

// eslint-disable-next-line max-len
export const alphaSortTokensList = (tokens: TokenInfo[]): TokenInfo[] => tokens.sort((a, b) => a.symbol.localeCompare(b.symbol));

export const topUpBridgeOption = (
  isBridgeEnabled: boolean,
  isNotPassport: boolean,
): { text: string, action: () => void } | undefined => {
  if (isBridgeEnabled && isNotPassport) {
    const { t } = useTranslation();
    return {
      text: t('views.TOP_UP_VIEW.topUpOptions.bridge.heading'),
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

export const topUpOnRampOption = (isOnRampEnabled: boolean): { text: string, action: () => void } | undefined => {
  if (isOnRampEnabled) {
    const { t } = useTranslation();
    return {
      text: t('views.TOP_UP_VIEW.topUpOptions.onramp.heading'),
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
