/* eslint-disable react/destructuring-assignment */
/* eslint-disable max-len */
import {
  IMTBLWidgetEvents,
  TransferWidgetParams,
} from '@imtbl/checkout-sdk';
import {
  Dispatch,
  SetStateAction,
  useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Body,
  Box,
  Button,
  CloudImage,
  Heading,
  OptionKey,
  Stack,
  useTheme,
} from '@biom3/react';

import {
  isAddress, isError, parseUnits,
} from 'ethers';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { LoadingView } from '../../views/loading/LoadingView';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../components/Header/HeaderNavigation';
import { orchestrationEvents } from '../../lib/orchestrationEvents';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import { SelectInput } from '../../components/FormComponents/SelectInput/SelectInput';
import {
  useAnalytics,
  UserJourney,
} from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { CoinSelectorOptionProps } from '../../components/CoinSelector/CoinSelectorOption';
import { ConnectLoaderContext } from '../../context/connect-loader-context/ConnectLoaderContext';
import {
  calculateCryptoToFiat,
  formatZeroAmount,
  getDefaultTokenImage,
  getRemoteImage,
  tokenValueFormat,
} from '../../lib/utils';
import { TextInputForm } from '../../components/FormComponents/TextInputForm/TextInputForm';
import { CryptoFiatActions, CryptoFiatContext } from '../../context/crypto-fiat-context/CryptoFiatContext';
import { CryptoFiatProvider } from '../../context/crypto-fiat-context/CryptoFiatProvider';
import {
  getOptionKey,
  getFiatAmount,
  sendTokens,
  loadBalances,
  validatePartialAddress,
} from './functions';
import { amountInputValidation } from '../../lib/validations/amountInputValidations';
import { getL2ChainId } from '../../lib';
import { TransferComplete } from './TransferComplete';
import { SendingTokens } from './SendingTokens';
import { AwaitingApproval } from './AwaitingApproval';
import { TransferFormState, TransferState } from './context';

export type TransferWidgetInputs = TransferWidgetParams & {
  config: StrongCheckoutWidgetsConfig;
};

const TRANSACTION_CANCELLED_ERROR_CODE = -32003;

function TransferForm({
  config,
  viewState,
  setViewState,
  onSend,
}: {
  config: StrongCheckoutWidgetsConfig;
  viewState: TransferFormState;
  setViewState: Dispatch<SetStateAction<TransferState>>;
  onSend: () => void;
}) {
  const { t } = useTranslation();
  const { track } = useAnalytics();
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);
  const { cryptoFiatState } = useContext(CryptoFiatContext);

  const tokenOptions = useMemo(
    () =>
      viewState.allowedBalances.map<CoinSelectorOptionProps>(
        (tokenBalance) => ({
          id: getOptionKey(tokenBalance.token),
          name: tokenBalance.token.name,
          symbol: tokenBalance.token.symbol,
          defaultTokenImage: tokenBalance.token.icon || 'TODO',
          balance: {
            formattedAmount: tokenValueFormat(tokenBalance.formattedBalance),
            formattedFiatAmount: getFiatAmount(cryptoFiatState, tokenBalance),
          },
        }),
      ),
    [viewState.allowedBalances, cryptoFiatState],
  );

  const [token, setToken] = useState<CoinSelectorOptionProps | undefined>(() =>
    tokenOptions.find((option) => option.id === viewState.tokenAddress));

  const defaultTokenImage = useMemo(
    () =>
      getDefaultTokenImage(viewState.checkout.config.environment, config.theme),
    [viewState.checkout.config.environment, config.theme],
  );

  const fromFiatValue = useMemo(
    () =>
      calculateCryptoToFiat(
        viewState.amount,
        token?.symbol || '',
        cryptoFiatState.conversions,
      ),
    [viewState.amount, token, cryptoFiatState.conversions],
  );

  const handleTokenChange = useCallback(
    (optionKey: OptionKey) => {
      track({
        screen: 'TransferToken',
        userJourney: UserJourney.TRANSFER,
        control: 'SelectToken',
        controlType: 'Select',
        extras: { token: optionKey },
      });
      console.log({ tokenOptions, optionKey });
      const result = tokenOptions.find((option) => option.id === optionKey);
      if (!result) throw new Error('Token not found');
      setToken(result);
      setViewState((s) => ({ ...s, tokenAddress: result.id, amountError: '' }));
    },
    [tokenOptions, token],
  );

  const handleMaxButtonClick = useCallback(() => {
    if (!token) throw new Error('Token not found');

    const result = tokenOptions.find((option) => option.id === token.id);
    if (!result) throw new Error('Token not found');
    if (!result.balance?.formattedAmount) throw new Error('Token balance not found');

    track({
      screen: 'TransferToken',
      userJourney: UserJourney.TRANSFER,
      control: 'Max',
      controlType: 'Button',
      extras: { token: token.id, amount: result.balance.formattedAmount },
    });

    setViewState((s) => {
      if (!result.balance) throw new Error('Token balance not found');
      return { ...s, amount: result.balance.formattedAmount };
    });
  }, [tokenOptions, token]);

  const handleRecipientAddressChange = useCallback((value: string) => {
    setViewState((s) => ({ ...s, toAddress: value, toAddressError: '' }));
  }, []);

  const handleAmountChange = useCallback((value: string) => {
    setViewState((s) => ({ ...s, amount: value, amountError: '' }));
  }, []);

  const selectSubtext = useMemo(() => {
    if (!token) return '';
    return `${t('views.TRANSFER.content.availableBalancePrefix')} ${
      token.balance?.formattedAmount
    }`;
  }, [token]);

  const isButtonDisabled = useMemo(
    () => !viewState.amount || !viewState.toAddress || !token,
    [viewState.amount, viewState.toAddress, token],
  );

  return (
    <SimpleLayout
      header={(
        <HeaderNavigation
          title={t('views.TRANSFER.header.title')}
          onCloseButtonClick={() => {}}
          showBack
          onBackButtonClick={() => {
            orchestrationEvents.sendRequestGoBackEvent(
              eventTarget,
              IMTBLWidgetEvents.IMBTL_TRANSFER_WIDGET_EVENT,
              {},
            );
          }}
        />
      )}
    >
      <Stack
        justifyContent="space-between"
        sx={{
          height: '100%',
          mt: 'base.spacing.x6',
          mx: 'base.spacing.x4',
          mb: 'base.spacing.x10',
        }}
      >
        <Stack gap="base.spacing.x9">
          <Stack gap="base.spacing.x1">
            <Heading size="xSmall">
              {t('views.TRANSFER.form.coinAmountHeading')}
            </Heading>
            <SelectInput
              testId="transfer-token-select"
              options={tokenOptions}
              textInputValue={viewState.amount}
              textInputPlaceholder="0"
              textInputTextAlign="right"
              coinSelectorHeading={t('views.TRANSFER.form.coinSelectorHeading')}
              textInputMaxButtonClick={token ? handleMaxButtonClick : undefined}
              textInputValidator={amountInputValidation}
              textInputErrorMessage={viewState.amountError}
              selectSubtext={selectSubtext}
              textInputSubtext={`${t(
                'views.TRANSFER.content.fiatPricePrefix',
              )} $${formatZeroAmount(fromFiatValue, true)}`}
              onTextInputChange={handleAmountChange}
              onSelectChange={handleTokenChange}
              selectedOption={token?.id}
              defaultTokenImage={defaultTokenImage}
              userJourney={UserJourney.TRANSFER}
              screen="TransferToken"
              control="Token"
            />
          </Stack>
          <Stack gap="base.spacing.x1">
            <Heading size="xSmall">
              {t('views.TRANSFER.form.toAddressHeading')}
            </Heading>
            <TextInputForm
              testId="transfer-to-address-input"
              value={viewState.toAddress}
              placeholder="0x"
              validator={validatePartialAddress}
              onTextInputChange={handleRecipientAddressChange}
              errorMessage={viewState.toAddressError}
            />
          </Stack>
        </Stack>
        <Box>
          <Body
            rc={<div />}
            size="xSmall"
            weight="bold"
            sx={{ color: 'base.color.text.status.fatal.primary' }}
          >
            {t('views.TRANSFER.content.notAllExchangesSupportImmutableZkEVM')}
          </Body>
          <Body
            rc={<div />}
            size="xxSmall"
            weight="regular"
            sx={{ mb: 'base.spacing.x4' }}
          >
            {t(
              'views.TRANSFER.content.notAllExchangesSupportImmutableZkEVMDescription',
            )}
          </Body>
          <Button
            sx={{ width: '100%' }}
            variant="primary"
            size="large"
            disabled={isButtonDisabled}
            onClick={onSend}
          >
            {t('views.TRANSFER.form.buttonText')}
          </Button>
        </Box>
      </Stack>
    </SimpleLayout>
  );
}

function TransferWidgetInner(props: TransferWidgetInputs) {
  const { t } = useTranslation();
  const { cryptoFiatDispatch } = useContext(CryptoFiatContext);
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
          tokenSymbols: tokensAndBalances.allowedBalances.map((tb) => tb.token.symbol),
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
  }, [checkout]);

  const resetForm = useCallback(() => {
    if (viewState.type === 'INITIALISING') return;

    setViewState({
      type: 'FORM',
      allowedBalances: viewState.allowedBalances,
      checkout: viewState.checkout,
      provider: viewState.provider,
      amount: '',
      amountError: '',
      tokenAddress: '',
      toAddress: '',
      toAddressError: '',
    });
  }, [checkout, provider, viewState]);

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

    console.log({ viewState });
    const tokenInfo = viewState.allowedBalances.find((tb) => tb.token.address === viewState.tokenAddress);
    if (!tokenInfo) throw new Error('Token not found');

    if (tokenInfo.balance < parseUnits(viewState.amount, tokenInfo.token.decimals)) {
      setViewState((s) => ({ ...s, amountError: 'Insufficient balance' }));
      return;
    }

    setViewState({
      type: 'AWAITING_APPROVAL', checkout: viewState.checkout, provider: viewState.provider, allowedBalances: viewState.allowedBalances,
    });

    try {
      const txResponse = await sendTokens(
        viewState.provider,
        tokenInfo,
        viewState.toAddress,
        viewState.amount,
      );

      setViewState({
        type: 'TRANSFERRING', checkout: viewState.checkout, provider: viewState.provider, allowedBalances: viewState.allowedBalances,
      });

      const receipt = await txResponse.wait();
      if (!receipt) throw new Error('Transaction failed');

      setViewState({
        type: 'COMPLETE',
        receipt,
        chainId: getL2ChainId(viewState.checkout.config),
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
      } else {
        // eslint-disable-next-line no-console
        console.error(e); // TODO: where can we send these?
      }
    }
  }, [viewState]);

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
