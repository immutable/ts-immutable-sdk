import {
  Body, Box, Heading,
} from '@biom3/react';
import {
  IMTBLWidgetEvents,
} from '@imtbl/checkout-widgets';
import {
  ReactNode, useContext, useEffect, useState,
} from 'react';
import {
  GasEstimateBridgeToL2Result, GasEstimateSwapResult, GasEstimateType, OnRampProviderFees,
} from '@imtbl/checkout-sdk';
import { FooterLogo } from '../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { SharedViews, ViewActions, ViewContext } from '../../context/view-context/ViewContext';
import { text } from '../../resources/text/textConfig';
import {
  orchestrationEvents,
} from '../../lib/orchestrationEvents';
import { SwapWidgetViews } from '../../context/view-context/SwapViewContextTypes';
import { BridgeWidgetViews } from '../../context/view-context/BridgeViewContextTypes';
import { getBridgeFeeEstimation, getOnRampFeeEstimation, getSwapFeeEstimation } from '../../lib/feeEstimation';
import { CryptoFiatActions, CryptoFiatContext } from '../../context/crypto-fiat-context/CryptoFiatContext';
import { useInterval } from '../../lib/hooks/useInterval';
import { DEFAULT_TOKEN_SYMBOLS } from '../../context/crypto-fiat-context/CryptoFiatProvider';
import { ConnectLoaderContext } from '../../context/connect-loader-context/ConnectLoaderContext';
import { isPassportProvider } from '../../lib/providerUtils';
import { OnRampWidgetViews } from '../../context/view-context/OnRampViewContextTypes';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import { TopUpMenuItem } from './TopUpMenuItem';

interface TopUpViewProps {
  widgetEvent: IMTBLWidgetEvents,
  showOnrampOption: boolean,
  showSwapOption: boolean,
  showBridgeOption: boolean,
  tokenAddress?: string,
  amount?: string,
  onCloseButtonClick: () => void,
  onBackButtonClick?: () => void,
}

const DEFAULT_FEE_REFRESH_INTERVAL = 30000;

export function TopUpView({
  widgetEvent,
  showOnrampOption,
  showSwapOption,
  showBridgeOption,
  tokenAddress,
  amount,
  onCloseButtonClick,
  onBackButtonClick,
}: TopUpViewProps) {
  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { checkout, provider } = connectLoaderState;
  const { header, topUpOptions } = text.views[SharedViews.TOP_UP_VIEW];
  const { onramp, swap, bridge } = topUpOptions;
  const { viewDispatch } = useContext(ViewContext);
  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const { conversions, fiatSymbol } = cryptoFiatState;
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const [onRampFeesPercentage, setOnRampFeesPercentage] = useState('-.--');
  const [swapFeesInFiat, setSwapFeesInFiat] = useState('-.--');
  const [bridgeFeesInFiat, setBridgeFeesInFiat] = useState('-.--');
  const [loadingOnRampFees, setLoadingOnRampFees] = useState(false);
  const [loadingSwapFees, setLoadingSwapFees] = useState(false);
  const [loadingBridgeFees, setLoadingBridgeFees] = useState(false);

  const isPassport = isPassportProvider(provider);

  useEffect(() => {
    if (!checkout) return;
    if (!cryptoFiatDispatch) return;
    cryptoFiatDispatch({
      payload: {
        type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
        tokenSymbols: DEFAULT_TOKEN_SYMBOLS,
      },
    });
  }, [checkout, cryptoFiatDispatch]);

  const refreshFees = async (silent: boolean = false) => {
    if (!checkout) return;

    if (!silent) {
      setLoadingOnRampFees(true);
      setLoadingSwapFees(true);
      setLoadingBridgeFees(true);
    }

    try {
      const [swapEstimate, bridgeEstimate, onRampFeesEstimate] = await Promise.all([
        checkout.gasEstimate({
          gasEstimateType: GasEstimateType.SWAP,
        }),
        checkout.gasEstimate({
          gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
          isSpendingCapApprovalRequired: true,
        }),
        checkout.getExchangeFeeEstimate(),
      ]);
      const onRampFees = getOnRampFeeEstimation(
        onRampFeesEstimate as OnRampProviderFees,
      );
      setOnRampFeesPercentage(onRampFees);
      const swapFeeInFiat = getSwapFeeEstimation(
        swapEstimate as GasEstimateSwapResult,
        conversions,
      );
      setSwapFeesInFiat(swapFeeInFiat);
      const bridgeFeeInFiat = getBridgeFeeEstimation(
        bridgeEstimate as GasEstimateBridgeToL2Result,
        conversions,
      );
      setBridgeFeesInFiat(bridgeFeeInFiat);
    } catch {
      setOnRampFeesPercentage('-.--');
      setSwapFeesInFiat('-.--');
      setBridgeFeesInFiat('-.--');
    } finally {
      setLoadingBridgeFees(false);
      setLoadingSwapFees(false);
      setLoadingOnRampFees(false);
    }
  };

  // Silently refresh the quote
  useInterval(() => refreshFees(true), DEFAULT_FEE_REFRESH_INTERVAL);

  useEffect(() => {
    if (!checkout) return;
    if (conversions.size === 0) return;
    refreshFees();
  }, [checkout, conversions.size === 0]);

  const onClickSwap = () => {
    if (widgetEvent === IMTBLWidgetEvents.IMTBL_SWAP_WIDGET_EVENT) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SwapWidgetViews.SWAP,
            data: {
              toContractAddress: '',
              fromAmount: '',
              fromContractAddress: '',
            },
          },
        },
      });
      return;
    }
    orchestrationEvents.sendRequestSwapEvent(eventTarget, widgetEvent, {
      fromTokenAddress: '',
      toTokenAddress: tokenAddress ?? '',
      amount: '',
    });
  };

  const onClickBridge = () => {
    if (widgetEvent === IMTBLWidgetEvents.IMTBL_BRIDGE_WIDGET_EVENT) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: BridgeWidgetViews.BRIDGE,
            data: {
              fromContractAddress: '',
              fromAmount: '',
            },
          },
        },
      });
      return;
    }
    orchestrationEvents.sendRequestBridgeEvent(eventTarget, widgetEvent, {
      tokenAddress: '',
      amount: '',
    });
  };

  const onClickOnRamp = () => {
    if (widgetEvent === IMTBLWidgetEvents.IMTBL_ONRAMP_WIDGET_EVENT) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: OnRampWidgetViews.ONRAMP,
            data: {
              contractAddress: '',
              amount: '',
            },
          },
        },
      });
      return;
    }
    orchestrationEvents.sendRequestOnrampEvent(window, widgetEvent, {
      tokenAddress: tokenAddress ?? '',
      amount: amount ?? '',
    });
  };

  const renderFees = (fees: string, feesLoading: boolean): ReactNode => {
    if (feesLoading) {
      return (
        <Body size="xSmall" shimmer={1} testId="fees-shimmer" />
      );
    }
    return ` ≈ $${fees} ${fiatSymbol.toLocaleUpperCase()}`;
  };

  const renderFeePercentage = (fees: string, feesLoading: boolean): ReactNode => {
    if (feesLoading) {
      return (
        <Body size="xSmall" shimmer={1} testId="fee-percentage-shimmer" />
      );
    }
    return ` ≈ ${fees}%`;
  };

  return (
    <SimpleLayout
      header={(
        <HeaderNavigation
          onBackButtonClick={onBackButtonClick}
          onCloseButtonClick={onCloseButtonClick}
          showBack
        />
      )}
      footer={(
        <FooterLogo />
      )}
    >
      <Box sx={{ paddingX: 'base.spacing.x4', paddingY: 'base.spacing.x4' }}>
        <Heading size="small">{header.title}</Heading>
        <Box sx={{ paddingY: 'base.spacing.x4' }}>
          {showOnrampOption && (
          <TopUpMenuItem
            testId="onramp"
            icon="Wallet"
            heading={onramp.heading}
            caption={onramp.caption}
            subcaption={onramp.subcaption}
            onClick={onClickOnRamp}
            renderFeeFunction={() => renderFeePercentage(onRampFeesPercentage, loadingOnRampFees)}
          />
          )}
          {showSwapOption && (
            <TopUpMenuItem
              testId="swap"
              icon="Coins"
              heading={swap.heading}
              caption={swap.caption}
              subcaption={swap.subcaption}
              onClick={onClickSwap}
              renderFeeFunction={() => renderFees(swapFeesInFiat, loadingSwapFees)}
            />
          )}
          {showBridgeOption && !isPassport && (
            <TopUpMenuItem
              testId="bridge"
              icon="Minting"
              heading={bridge.heading}
              caption={bridge.caption}
              subcaption={bridge.subcaption}
              onClick={onClickBridge}
              renderFeeFunction={() => renderFees(bridgeFeesInFiat, loadingBridgeFees)}
            />
          )}
        </Box>
      </Box>
    </SimpleLayout>
  );
}
