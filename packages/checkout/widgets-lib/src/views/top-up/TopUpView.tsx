import { Box, Heading } from '@biom3/react';
import {
  ReactNode, useContext, useEffect, useState,
} from 'react';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { StandardAnalyticsControlTypes } from '@imtbl/react-analytics';
import {
  Checkout,
  GasEstimateBridgeToL2Result,
  GasEstimateType,
  IMTBLWidgetEvents,
} from '@imtbl/checkout-sdk';
import { DEFAULT_TOKEN_SYMBOLS } from 'context/crypto-fiat-context/CryptoFiatProvider';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { Web3Provider } from '@ethersproject/providers';
import { FooterLogo } from '../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import {
  SharedViews,
  ViewActions,
  ViewContext,
} from '../../context/view-context/ViewContext';
import { text } from '../../resources/text/textConfig';
import { orchestrationEvents } from '../../lib/orchestrationEvents';
import { SwapWidgetViews } from '../../context/view-context/SwapViewContextTypes';
import {
  getBridgeFeeEstimation,
  getOnRampFeeEstimation,
} from '../../lib/feeEstimation';
import { CryptoFiatActions, CryptoFiatContext } from '../../context/crypto-fiat-context/CryptoFiatContext';
import { isPassportProvider } from '../../lib/providerUtils';
import { OnRampWidgetViews } from '../../context/view-context/OnRampViewContextTypes';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import { TopUpMenuItem } from './TopUpMenuItem';

interface TopUpViewProps {
  widgetEvent: IMTBLWidgetEvents,
  checkout?: Checkout,
  provider?: Web3Provider,
  showOnrampOption: boolean,
  showSwapOption: boolean,
  showBridgeOption: boolean,
  tokenAddress?: string,
  amount?: string,
  analytics: {
    userJourney: UserJourney
  },
  onCloseButtonClick: () => void,
  onBackButtonClick?: () => void,
}

export function TopUpView({
  widgetEvent,
  checkout,
  provider,
  showOnrampOption,
  showSwapOption,
  showBridgeOption,
  tokenAddress,
  amount,
  analytics,
  onCloseButtonClick,
  onBackButtonClick,
}: TopUpViewProps) {
  const { userJourney } = analytics;

  const { header, topUpOptions } = text.views[SharedViews.TOP_UP_VIEW];
  const { onramp, swap, bridge } = topUpOptions;

  const { viewDispatch } = useContext(ViewContext);

  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const { conversions, fiatSymbol } = cryptoFiatState;

  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const [onRampFeesPercentage, setOnRampFeesPercentage] = useState('-.--');
  const swapFeesInFiat = '0.05';
  const [bridgeFeesInFiat, setBridgeFeesInFiat] = useState('-.--');
  const [isSwapAvailable, setIsSwapAvailable] = useState(true);

  const { page, track } = useAnalytics();

  const isPassport = isPassportProvider(provider);

  useEffect(() => {
    page({
      userJourney,
      screen: 'TopUp',
    });
  }, []);

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

      const est = await getBridgeFeeEstimation(bridgeEstimate as GasEstimateBridgeToL2Result, conversions);
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
  }, [checkout]);

  // Check if swap is available
  useEffect(() => {
    if (!checkout) return;
    (async () => {
      setIsSwapAvailable(await checkout.isSwapAvailable());
    })();
  }, [checkout !== undefined]);

  const localTrack = (control: string, extras: any, controlType: StandardAnalyticsControlTypes = 'Button') => {
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
        toContractAddress: '',
        fromAmount: '',
        fromContractAddress: '',
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
        fromContractAddress: '',
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
        contractAddress: '',
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

  const renderFees = (txt: string): ReactNode => (
    <Box sx={{ fontSize: 'base.text.caption.small.regular.fontSize' }}>
      {txt}
    </Box>
  );

  const topUpFeatures = [
    {
      testId: 'onramp',
      icon: 'Wallet',
      textConfig: onramp,
      onClickEvent: onClickOnRamp,
      fee: () => renderFees(`${onramp.subcaption} ≈ ${onRampFeesPercentage}%`),
      isAvailable: true,
      isEnabled: showOnrampOption,
    }, {
      testId: 'swap',
      icon: 'Coins',
      textConfig: swap,
      onClickEvent: onClickSwap,
      fee: () => renderFees(`${swap.subcaption} ≈ $${swapFeesInFiat} ${fiatSymbol.toUpperCase()}`),
      isAvailable: isSwapAvailable,
      isEnabled: showSwapOption,
    },
    {
      testId: 'bridge',
      icon: 'Minting',
      textConfig: bridge,
      onClickEvent: onClickBridge,
      fee: () => renderFees(`${bridge.subcaption} ≈ $${bridgeFeesInFiat} ${fiatSymbol.toUpperCase()}`),
      isAvailable: true,
      isEnabled: showBridgeOption && !isPassport,
    },
  ];

  return (
    <SimpleLayout
      header={(
        <HeaderNavigation
          onBackButtonClick={onBackButtonClick}
          onCloseButtonClick={onCloseButtonClick}
          showBack
        />
        )}
      footer={<FooterLogo />}
    >
      <Box sx={{ paddingX: 'base.spacing.x4', paddingY: 'base.spacing.x4' }}>
        <Heading size="small">{header.title}</Heading>
        <Box sx={{ paddingY: 'base.spacing.x4' }}>
          {topUpFeatures
            .sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable))
            .map((element) => element.isEnabled && (
            <TopUpMenuItem
              key={element.textConfig.heading.toLowerCase()}
              testId={element.testId}
              icon={element.icon as 'Wallet' | 'Coins' | 'Minting'}
              heading={element.textConfig.heading}
              caption={!element.isAvailable ? element.textConfig.disabledCaption : element.textConfig.caption}
              onClick={element.onClickEvent}
              renderFeeFunction={element.fee}
              isDisabled={!element.isAvailable}
            />
            ))}
        </Box>
      </Box>
    </SimpleLayout>
  );
}
