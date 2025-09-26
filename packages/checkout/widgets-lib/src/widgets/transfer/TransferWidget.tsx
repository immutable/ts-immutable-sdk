/* eslint-disable react/destructuring-assignment */
/* eslint-disable max-len */
import { TransferWidgetConfiguration, TransferWidgetParams } from '@imtbl/checkout-sdk';
import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { CloudImage, Stack, useTheme } from '@biom3/react';

import { isAddress, isError, parseUnits } from 'ethers';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { LoadingView } from '../../views/loading/LoadingView';
import {
  useAnalytics,
  UserJourney,
} from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { ConnectLoaderContext } from '../../context/connect-loader-context/ConnectLoaderContext';
import { getRemoteImage } from '../../lib/utils';
import {
  CryptoFiatActions,
  CryptoFiatContext,
} from '../../context/crypto-fiat-context/CryptoFiatContext';
import { CryptoFiatProvider } from '../../context/crypto-fiat-context/CryptoFiatProvider';
import { sendTokens, loadBalances } from './functions';
import { TransferComplete } from './TransferComplete';
import { SendingTokens } from './SendingTokens';
import { AwaitingApproval } from './AwaitingApproval';
import { TransferState } from './context';
import { TransferForm } from './TransferForm';
import { sendFailedEvent, sendRejectedEvent, sendSuccessEvent } from './events';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';

export type TransferWidgetInputs = TransferWidgetParams & {
  config: StrongCheckoutWidgetsConfig;
  transferConfig: TransferWidgetConfiguration;
};

const TRANSACTION_CANCELLED_ERROR_CODE = -32003;

function TransferWidgetInner(props: TransferWidgetInputs) {
  const { t } = useTranslation();
  const { cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);
  const { track } = useAnalytics();

  const {
    connectLoaderState: { checkout, provider },
  } = useContext(ConnectLoaderContext);

  const [viewState, setViewState] = useState<TransferState>({
    type: 'INITIALISING',
  });

  useEffect(() => {
    const x = async () => {
      if (viewState.type !== 'INITIALISING') return;
      if (!checkout || !provider) return;

      const tokensAndBalances = await loadBalances(checkout, provider);

      cryptoFiatDispatch({
        payload: {
          type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
          tokenSymbols: tokensAndBalances.allowedBalances.map(
            (tb) => tb.token.symbol,
          ),
        },
      });

      setViewState({
        type: 'FORM',
        allowedBalances: tokensAndBalances.allowedBalances,
        checkout,
        provider,
        amount: props.amount || '',
        amountError: '',
        tokenAddress: props.tokenAddress || '',
        toAddress: props.toAddress || '',
        toAddressError: '',
      });
    };

    x();
  }, [checkout, provider, cryptoFiatDispatch, props.amount, props.tokenAddress, props.toAddress, viewState.type]);

  const resetForm = useCallback(() => {
    setViewState({ type: 'INITIALISING' });
  }, []);

  const onSend = useCallback(async () => {
    if (viewState.type !== 'FORM') throw new Error('Unexpected state');

    track({
      screen: 'TransferToken',
      userJourney: UserJourney.TRANSFER,
      control: 'Send',
      controlType: 'Button',
      extras: { token: viewState.tokenAddress, amount: viewState.amount },
    });

    if (!isAddress(viewState.toAddress)) {
      setViewState((s) => ({ ...s, toAddressError: 'Invalid wallet address' }));
      return;
    }

    const tokenInfo = viewState.allowedBalances.find(
      (tb) => tb.token.address === viewState.tokenAddress,
    );
    if (!tokenInfo) throw new Error('Token not found');

    if (
      tokenInfo.balance < parseUnits(viewState.amount, tokenInfo.token.decimals)
    ) {
      setViewState((s) => ({ ...s, amountError: 'Insufficient balance' }));
      return;
    }

    if (Number(viewState.amount) <= 0) {
      setViewState((s) => ({ ...s, amountError: 'Amount must be positive' }));
      return;
    }

    setViewState({
      type: 'AWAITING_APPROVAL',
      checkout: viewState.checkout,
      provider: viewState.provider,
      allowedBalances: viewState.allowedBalances,
    });

    try {
      const txResponse = await sendTokens(
        viewState.provider,
        tokenInfo,
        viewState.toAddress,
        viewState.amount,
      );

      setViewState({
        type: 'TRANSFERRING',
        checkout: viewState.checkout,
        provider: viewState.provider,
        allowedBalances: viewState.allowedBalances,
      });

      const receipt = await txResponse.wait();
      if (!receipt) {
        sendFailedEvent(eventTarget, 'Transaction failed');
        setViewState({ ...viewState, type: 'FORM' }); // TODO: We should be showing a failed view here
        return;
      }

      sendSuccessEvent(eventTarget, receipt.hash);

      setViewState({
        type: 'COMPLETE',
        receipt,
        chainId: viewState.checkout.config.l2ChainId,
        checkout: viewState.checkout,
        provider: viewState.provider,
        allowedBalances: viewState.allowedBalances,
      });
    } catch (e) {
      setViewState({
        type: 'FORM',
        allowedBalances: viewState.allowedBalances,
        checkout: viewState.checkout,
        provider: viewState.provider,
        amount: viewState.amount,
        amountError: viewState.amountError,
        tokenAddress: viewState.tokenAddress,
        toAddress: viewState.toAddress,
        toAddressError: viewState.toAddressError,
      });
      if (
        isError(e, 'UNKNOWN_ERROR')
        && e.error
        && 'code' in e.error
        && e.error.code === TRANSACTION_CANCELLED_ERROR_CODE
      ) {
        track({
          screen: 'TransferToken',
          userJourney: UserJourney.TRANSFER,
          control: 'TranactionCancel',
          controlType: 'Event',
          extras: { token: viewState.tokenAddress, amount: viewState.amount },
        });
        sendRejectedEvent(eventTarget, 'Transaction cancelled');
      } else {
        // eslint-disable-next-line no-console
        console.error(e); // TODO: where can we send these?
        sendFailedEvent(eventTarget, 'Transaction failed');
        setViewState({ ...viewState, type: 'FORM' }); // TODO: We should be showing a failed view here
      }
    }
  }, [viewState, eventTarget, track]);

  switch (viewState.type) {
    case 'INITIALISING':
      return <LoadingView loadingText={t('views.LOADING_VIEW.text')} />;
    case 'FORM':
      return (
        <TransferForm
          config={props.config}
          viewState={viewState}
          setViewState={setViewState}
          onSend={onSend}
          showBackButton={props.showBackButton}
          showHeader={props.transferConfig.showHeader ?? true}
          title={props.transferConfig.customTitle ?? t('views.TRANSFER.header.title')}
          transparentOverlay={props.transferConfig.transparentOverlay ?? false}
        />
      );
    case 'AWAITING_APPROVAL':
      return <AwaitingApproval config={props.config} />;
    case 'TRANSFERRING':
      return <SendingTokens config={props.config} />;
    case 'COMPLETE':
      return (
        <TransferComplete
          config={props.config}
          viewState={viewState}
          onContinue={resetForm}
        />
      );
    default:
      throw new Error('Invalid view state');
  }
}

export default function TransferWidget(props: TransferWidgetInputs) {
  const {
    base: { colorMode },
  } = useTheme();

  return (
    <CryptoFiatProvider environment={props.config.environment}>
      <Stack sx={{ pos: 'relative' }}>
        <CloudImage
          use={(
            <img
              src={getRemoteImage(
                props.config.environment,
                `/add-tokens-bg-texture-${colorMode}.webp`,
              )}
              alt="blurry bg texture"
            />
          )}
          sx={{
            pos: 'absolute',
            h: '100%',
            w: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
        <TransferWidgetInner {...props} />
      </Stack>
    </CryptoFiatProvider>
  );
}
