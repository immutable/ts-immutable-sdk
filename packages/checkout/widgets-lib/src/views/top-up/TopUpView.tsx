import { Body, Box, Heading } from '@biom3/react';
import {
  ReactNode, useContext, useEffect, useMemo, useState,
} from 'react';
import { StandardAnalyticsControlTypes } from '@imtbl/react-analytics';
import {
  Checkout,
  GasEstimateBridgeToL2Result,
  GasEstimateType,
  IMTBLWidgetEvents,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { BrowserProvider } from 'ethers';
import { useTranslation } from 'react-i18next';
import {
  UserJourney,
  useAnalytics,
} from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { DEFAULT_TOKEN_SYMBOLS } from '../../context/crypto-fiat-context/CryptoFiatProvider';
import { BridgeWidgetViews } from '../../context/view-context/BridgeViewContextTypes';
import { useMount } from '../../hooks/useMount';
import { HeaderNavigation } from '../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import {
  ViewActions,
  ViewContext,
} from '../../context/view-context/ViewContext';
import { orchestrationEvents } from '../../lib/orchestrationEvents';
import { SwapWidgetViews } from '../../context/view-context/SwapViewContextTypes';
import {
  getBridgeFeeEstimation,
  getOnRampFeeEstimation,
} from '../../lib/feeEstimation';
import {
  CryptoFiatActions,
  CryptoFiatContext,
} from '../../context/crypto-fiat-context/CryptoFiatContext';
import { OnRampWidgetViews } from '../../context/view-context/OnRampViewContextTypes';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import { TopUpMenuItem, TopUpMenuItemProps } from './TopUpMenuItem';
import { useAsyncMemo } from '../../lib/hooks/useAsyncMemo';

type $Dictionary<T = unknown> = { [key: string]: T };

interface TopUpViewProps {
  widgetEvent: IMTBLWidgetEvents;
  checkout?: Checkout;
  provider?: BrowserProvider;
  showOnrampOption: boolean;
  showSwapOption: boolean;
  showBridgeOption: boolean;
  tokenAddress?: string;
  amount?: string;
  analytics: {
    userJourney: UserJourney;
  };
  onCloseButtonClick: () => void;
  onBackButtonClick?: () => void;
  heading?: [key: string, options?: $Dictionary];
  subheading?: [key: string, options?: $Dictionary];
}

type TopUpFeatures = Partial<TopUpMenuItemProps> & {
  testId: string;
  textConfigKey: string;
  onClickEvent: () => void;
  fee: (txt: string) => ReactNode;
  isAvailable: boolean;
  isEnabled: boolean;
};

export const TOOLKIT_BASE_URL = {
  [Environment.SANDBOX]: 'https://checkout-playground.sandbox.immutable.com',
  [Environment.PRODUCTION]: 'https://toolkit.immutable.com',
};

export function TopUpView({
  widgetEvent,
  checkout,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  provider, // Keep this for future use
  showOnrampOption,
  showSwapOption,
  showBridgeOption,
  tokenAddress,
  amount,
  analytics,
  onCloseButtonClick,
  onBackButtonClick,
  heading,
  subheading,
}: TopUpViewProps) {
  const { t } = useTranslation();
  const { userJourney } = analytics;

  const { viewDispatch } = useContext(ViewContext);

  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const { conversions, fiatSymbol } = cryptoFiatState;

  const environment = checkout?.config.environment ?? Environment.SANDBOX;

  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const [onRampFeesPercentage, setOnRampFeesPercentage] = useState('-.--');
  const swapFeesInFiat = '0.05';
  const [, setBridgeFeesInFiat] = useState('-.--');

  const title = heading ? t(...heading) : t('views.TOP_UP_VIEW.header.title');
  const description = subheading ? t(...subheading) : null;

  const { page, track } = useAnalytics();

  const isSwapAvailable = useAsyncMemo<boolean | undefined>(async () => {
    if (!checkout) return undefined;
    try {
      return checkout.isSwapAvailable();
    } catch (error) {
      return false;
    }
  }, [checkout]);

  useMount(() => {
    page({ userJourney, screen: 'TopUp' });
  });

  useEffect(() => {
    if (!cryptoFiatDispatch) return;
    cryptoFiatDispatch({
      payload: {
        type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
        tokenSymbols: DEFAULT_TOKEN_SYMBOLS,
      },
    });
  }, [cryptoFiatDispatch]);

  // Bridge fees estimation
  useEffect(() => {
    if (!checkout) return;
    (async () => {
      const bridgeEstimate = await checkout.gasEstimate({
        gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
      });

      const est = await getBridgeFeeEstimation(
        bridgeEstimate as GasEstimateBridgeToL2Result,
        conversions,
      );
      setBridgeFeesInFiat(est);
    })();
  }, [checkout !== undefined]);

  // Onramp fees estimation
  useEffect(() => {
    if (!checkout) return;
    (async () => {
      const onRampFeesEstimate = await checkout.getExchangeFeeEstimate();
      const onRampFees = getOnRampFeeEstimation(onRampFeesEstimate);
      setOnRampFeesPercentage(onRampFees);
    })();
  }, [checkout !== undefined]);

  const localTrack = (
    control: string,
    extras: any,
    controlType: StandardAnalyticsControlTypes = 'Button',
  ) => {
    track({
      userJourney,
      screen: 'TopUp',
      control,
      controlType,
      extras,
    });
  };

  const onClickSwap = () => {
    if (widgetEvent === IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT) {
      const data = {
        toTokenAddress: '',
        fromAmount: '',
        fromTokenAddress: '',
      };

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SwapWidgetViews.SWAP,
            data,
          },
        },
      });
      localTrack('Swap', { ...data, widgetEvent });
      return;
    }

    const data = {
      fromTokenAddress: '',
      toTokenAddress: tokenAddress ?? '',
      amount: '',
    };
    orchestrationEvents.sendRequestSwapEvent(eventTarget, widgetEvent, data);
    localTrack('Swap', { ...data, widgetEvent });
  };

  const onClickBridge = () => {
    if (widgetEvent === IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT) {
      const data = {
        fromTokenAddress: '',
        fromAmount: '',
      };

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: BridgeWidgetViews.WALLET_NETWORK_SELECTION,
            data,
          },
        },
      });
      localTrack('Bridge', { ...data, widgetEvent });
      return;
    }

    const data = {
      tokenAddress: '',
      amount: '',
    };
    orchestrationEvents.sendRequestBridgeEvent(eventTarget, widgetEvent, data);
    localTrack('Bridge', { ...data, widgetEvent });
  };

  const onClickOnRamp = () => {
    if (widgetEvent === IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT) {
      const data = {
        tokenAddress: '',
        amount: '',
      };

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: OnRampWidgetViews.ONRAMP,
            data,
          },
        },
      });
      localTrack('OnRamp', { ...data, widgetEvent });
      return;
    }

    const data = {
      tokenAddress: tokenAddress ?? '',
      amount: amount ?? '',
    };
    orchestrationEvents.sendRequestOnrampEvent(eventTarget, widgetEvent, data);
    localTrack('OnRamp', { ...data, widgetEvent });
  };

  const onClickAdvancedOptions = () => {
    const toolkitBaseUrl = TOOLKIT_BASE_URL[environment];
    const data = {
      tokenAddress: tokenAddress ?? '',
      amount: amount ?? '',
    };

    localTrack('AdvancedOptions', { ...data, widgetEvent });

    window.open(`${toolkitBaseUrl}/squid-bridge/`, '_blank');
  };

  const renderFees = (txt: string): ReactNode => (
    <Box
      sx={{
        fontSize: 'base.text.caption.small.regular.fontSize',
        c: 'base.color.translucent.standard.600',
      }}
    >
      {txt}
    </Box>
  );

  const topUpFeatures: TopUpFeatures[] = useMemo(
    () => [
      {
        testId: 'onramp',
        icon: 'BankCard',
        iconVariant: 'bold',
        textConfigKey: 'views.TOP_UP_VIEW.topUpOptions.debit',
        onClickEvent: onClickOnRamp,
        fee: () => renderFees(
          `${t(
            'views.TOP_UP_VIEW.topUpOptions.debit.subcaption',
          )} ≈ ${onRampFeesPercentage}%`,
        ),
        isAvailable: true,
        isEnabled: showOnrampOption,
      },
      {
        testId: 'onramp',
        icon: 'BankCard',
        textConfigKey: 'views.TOP_UP_VIEW.topUpOptions.credit',
        onClickEvent: onClickOnRamp,
        fee: () => renderFees(
          `${t(
            'views.TOP_UP_VIEW.topUpOptions.credit.subcaption',
          )} ≈ ${onRampFeesPercentage}%`,
        ),
        isAvailable: true,
        isEnabled: showOnrampOption,
      },
      {
        testId: 'advanced',
        icon: 'Minting',
        iconVariant: 'bold',
        intentIcon: 'JumpTo',
        textConfigKey: 'views.TOP_UP_VIEW.topUpOptions.advanced',
        onClickEvent: onClickAdvancedOptions,
        fee: () => renderFees(''),
        isAvailable: true,
        isEnabled: true,
      },
      {
        testId: 'swap',
        icon: 'Swap',
        textConfigKey: 'views.TOP_UP_VIEW.topUpOptions.swap',
        onClickEvent: onClickSwap,
        fee: () => renderFees(
          `${t(
            'views.TOP_UP_VIEW.topUpOptions.swap.subcaption',
          )} ≈ $${swapFeesInFiat} ${fiatSymbol.toUpperCase()}`,
        ),
        isAvailable: !!isSwapAvailable,
        isEnabled: showSwapOption,
      },
      {
        testId: 'bridge',
        icon: 'ArrowForward',
        textConfigKey: 'views.TOP_UP_VIEW.topUpOptions.bridge',
        onClickEvent: onClickBridge,
        fee: () => renderFees(''),
        isAvailable: true,
        isEnabled: showBridgeOption,
      },
    ],
    [showBridgeOption, showOnrampOption, showSwapOption],
  );

  return (
    <SimpleLayout
      header={(
        <HeaderNavigation
          onBackButtonClick={onBackButtonClick}
          onCloseButtonClick={onCloseButtonClick}
          showBack
        />
      )}
    >
      <Box sx={{ paddingX: 'base.spacing.x4', paddingY: 'base.spacing.x4' }}>
        <Heading size="small">{title}</Heading>
        {description && (
          <Body size="small" sx={{ color: 'base.color.text.body.secondary' }}>
            {description}
          </Body>
        )}
        <Box sx={{ paddingY: 'base.spacing.x4' }}>
          {topUpFeatures
            .sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable))
            .map(
              (element) => element.isEnabled && (
              <TopUpMenuItem
                key={t(`${element.textConfigKey}.heading`).toLowerCase()}
                testId={element.testId}
                icon={element.icon!}
                iconVariant={element.iconVariant}
                intentIcon={element.intentIcon}
                heading={t(`${element.textConfigKey}.heading`)}
                caption={
                      !element.isAvailable
                        ? t(`${element.textConfigKey}.disabledCaption`)
                        : t(`${element.textConfigKey}.caption`)
                    }
                onClick={element.onClickEvent}
                renderFeeFunction={element.fee}
                isDisabled={!element.isAvailable}
              />
              ),
            )}
        </Box>
      </Box>
    </SimpleLayout>
  );
}
