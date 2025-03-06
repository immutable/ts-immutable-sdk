/* eslint-disable max-len */
import {
  Checkout,
  IMTBLWidgetEvents,
  TransferWidgetParams,
  WrappedBrowserProvider,
} from '@imtbl/checkout-sdk';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Body,
  Box,
  Button,
  CloudImage,
  Heading,
  Link,
  OptionKey,
  Stack,
  useTheme,
} from '@biom3/react';

import {
  isAddress, isError, parseUnits, TransactionReceipt,
} from 'ethers';
import { useRive } from '@rive-app/react-canvas-lite';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import {
  initialViewState,
  SharedViews,
  ViewActions,
  ViewContext,
  viewReducer,
} from '../../context/view-context/ViewContext';
import { TransferWidgetViews } from '../../context/view-context/TransferViewContextTypes';
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
  initialTransferState,
  TransferActions,
  transferReducer,
  useTransferContext,
  TransferContextProvider,
} from './TransferContext';
import {
  calculateCryptoToFiat,
  formatZeroAmount,
  getDefaultTokenImage,
  getRemoteImage,
  getRemoteRive,
  tokenValueFormat,
} from '../../lib/utils';
import { TextInputForm } from '../../components/FormComponents/TextInputForm/TextInputForm';
import { CryptoFiatContext } from '../../context/crypto-fiat-context/CryptoFiatContext';
import { CryptoFiatProvider } from '../../context/crypto-fiat-context/CryptoFiatProvider';
import {
  getOptionKey,
  getFiatAmount,
  sendTokens,
  loadBalances,
  validatePartialAddress,
} from './functions';
import { amountInputValidation } from '../../lib/validations/amountInputValidations';

export type TransferWidgetInputs = TransferWidgetParams & {
  config: StrongCheckoutWidgetsConfig;
};

const TRANSACTION_CANCELLED_ERROR_CODE = -32003;

function SendingTokens({ config }: { config: StrongCheckoutWidgetsConfig }) {
  const { t } = useTranslation();
  const { RiveComponent } = useRive({
    src: getRemoteRive(config.environment, '/swapping_coins.riv'),
    stateMachines: 'State',
    autoplay: true,
  });

  return (
    <SimpleLayout containerSx={{ bg: 'transparent' }}>
      <Stack
        justifyContent="space-between"
        sx={{
          height: '100%',
          mb: 'base.spacing.x10',
          textAlign: 'center',
        }}
      >
        <Box>
          <Box sx={{ height: '240px' }} rc={<RiveComponent />} />
          <Heading sx={{ mb: 'base.spacing.x4', mx: 'base.spacing.x4' }}>
            {t('views.TRANSFER.content.sendingTokens')}
          </Heading>
        </Box>
      </Stack>
    </SimpleLayout>
  );
}

function TransferComplete({
  config,
  onContinue,
  txHash,
}: {
  config: StrongCheckoutWidgetsConfig;
  onContinue: () => void;
  txHash: string;
}) {
  const { t } = useTranslation();
  const { RiveComponent } = useRive({
    src: getRemoteRive(config.environment, '/swapping_coins.riv'),
    stateMachines: 'State',
    autoplay: true,
  });

  return (
    <SimpleLayout containerSx={{ bg: 'transparent' }}>
      <Stack
        justifyContent="space-between"
        sx={{
          height: '100%',
          mb: 'base.spacing.x10',
          textAlign: 'center',
        }}
      >
        <Box>
          <Box sx={{ height: '240px' }} rc={<RiveComponent />} />
          <Heading sx={{ mb: 'base.spacing.x4', mx: 'base.spacing.x4' }}>
            {t('views.TRANSFER.content.tokensSentSuccessfully')}
          </Heading>
          <Link
            rc={(
              <a
                target="_blank"
                href={`https://explorer.testnet.immutable.com/tx/${txHash}`}
                rel="noreferrer"
              />
            )}
          >
            <Body size="medium">{t('views.TRANSFER.content.seeTransactionOnImmutableZkEVM')}</Body>
          </Link>
        </Box>
        <Box sx={{ mx: 'base.spacing.x4' }}>
          <Button sx={{ width: '100%' }} onClick={onContinue} size="large">
            {t('views.TRANSFER.form.continueButtonText')}
          </Button>
        </Box>
      </Stack>
    </SimpleLayout>
  );
}

function TransferForm({
  config,
  checkout,
  provider,
  initialAmount = '',
  initialTokenAddress = '',
  initialToAddress = '',
}: {
  config: StrongCheckoutWidgetsConfig;
  checkout: Checkout;
  provider: WrappedBrowserProvider;
  initialAmount?: string;
  initialTokenAddress?: `0x${string}` | 'native' | '';
  initialToAddress?: `0x${string}` | '';
}) {
  const { t } = useTranslation();
  const { track } = useAnalytics();
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);
  const { transferState } = useTransferContext();
  const { cryptoFiatState } = useContext(CryptoFiatContext);

  const tokenOptions = useMemo(
    () =>
      transferState.tokenBalances.map<CoinSelectorOptionProps>(
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
    [transferState.tokenBalances],
  );

  const [token, setToken] = useState<CoinSelectorOptionProps | undefined>(() =>
    tokenOptions.find((option) => option.id === initialTokenAddress));

  const [amount, setAmount] = useState<string>(initialAmount);
  const [recipientAddress, setRecipientAddress] = useState<string>(initialToAddress);
  const [recipientAddressError, setRecipientAddressError] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');

  const [localTransferState, setLocalTransferState] = useState<
  | { isTransferring: false; receipt?: TransactionReceipt }
  | { isTransferring: true }
  >({ isTransferring: false });

  const defaultTokenImage = useMemo(
    () => getDefaultTokenImage(checkout.config.environment, config.theme),
    [checkout.config.environment, config.theme],
  );

  const fromFiatValue = useMemo(
    () =>
      calculateCryptoToFiat(
        amount,
        token?.symbol || '',
        cryptoFiatState.conversions,
      ),
    [amount, token, cryptoFiatState.conversions],
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
      const result = tokenOptions.find((option) => option.id === optionKey);
      if (!result) throw new Error('Token not found');
      setToken(result);
      setAmountError('');
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

    setAmount(result.balance.formattedAmount);
  }, [tokenOptions, token]);

  const handleRecipientAddressChange = useCallback((value: string) => {
    setRecipientAddress(value);
    setRecipientAddressError('');
  }, []);

  const handleAmountChange = useCallback((value: string) => {
    setAmount(value);
    setAmountError('');
  }, []);

  const selectSubtext = useMemo(() => {
    if (!token) return '';
    return `${t('views.TRANSFER.content.availableBalancePrefix')} ${
      token.balance?.formattedAmount
    }`;
  }, [token]);

  const isButtonDisabled = useMemo(
    () => !amount || !recipientAddress || !token,
    [amount, recipientAddress, token],
  );

  const resetForm = useCallback(() => {
    setLocalTransferState({ isTransferring: false });
    setToken(undefined);
    setAmount('');
    setAmountError('');
    setRecipientAddress('');
    setRecipientAddressError('');
  }, []);

  const sendTokensCb = useCallback(async () => {
    if (!token) throw new Error('Token not found');

    track({
      screen: 'TransferToken',
      userJourney: UserJourney.TRANSFER,
      control: 'Send',
      controlType: 'Button',
      extras: { token: token.id, amount },
    });

    if (!isAddress(recipientAddress)) {
      setRecipientAddressError('Invalid wallet address');
      return;
    }

    const tokenInfo = transferState.tokenBalances.find(
      (tb) => tb.token.address === token.id,
    );
    if (!tokenInfo) throw new Error('Token not found');

    if (tokenInfo.balance < parseUnits(amount, tokenInfo.token.decimals)) {
      setAmountError('Insufficient balance');
      return;
    }

    setLocalTransferState({ isTransferring: true });

    try {
      const txResponse = await sendTokens(
        provider,
        tokenInfo,
        recipientAddress,
        amount,
      );
      const receipt = await txResponse.wait();
      if (!receipt) throw new Error('Transaction failed');

      setLocalTransferState({ isTransferring: false, receipt });
    } catch (e) {
      setLocalTransferState({ isTransferring: false });
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
          extras: { token: token.id, amount },
        });
      } else {
        console.error(e); // TODO: where can we send these?
      }
    }
  }, [transferState.tokenBalances, amount, recipientAddress, token, provider]);

  if (localTransferState.isTransferring) {
    return <SendingTokens config={config} />;
  }

  if (localTransferState.receipt) {
    return (
      <TransferComplete
        config={config}
        onContinue={resetForm}
        txHash={localTransferState.receipt.hash}
      />
    );
  }

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
            <Heading size="xSmall">{t('views.TRANSFER.form.coinAmountHeading')}</Heading>
            <SelectInput
              testId="transfer-token-select"
              options={tokenOptions}
              textInputValue={amount}
              textInputPlaceholder="0"
              textInputTextAlign="right"
              coinSelectorHeading={t('views.TRANSFER.form.coinSelectorHeading')}
              textInputMaxButtonClick={token ? handleMaxButtonClick : undefined}
              textInputValidator={amountInputValidation}
              textInputErrorMessage={amountError}
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
            <Heading size="xSmall">{t('views.TRANSFER.form.toAddressHeading')}</Heading>
            <TextInputForm
              testId="transfer-to-address-input"
              value={recipientAddress}
              placeholder="0x"
              validator={validatePartialAddress}
              onTextInputChange={handleRecipientAddressChange}
              errorMessage={recipientAddressError}
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
            {t('views.TRANSFER.content.notAllExchangesSupportImmutableZkEVMDescription')}
          </Body>
          <Button
            sx={{ width: '100%' }}
            variant="primary"
            size="large"
            disabled={isButtonDisabled}
            onClick={sendTokensCb}
          >
            {t('views.TRANSFER.form.buttonText')}
          </Button>
        </Box>
      </Stack>
    </SimpleLayout>
  );
}

export default function TransferWidget({
  amount,
  tokenAddress,
  toAddress,
  config,
}: TransferWidgetInputs) {
  const { t } = useTranslation();
  const {
    base: { colorMode },
  } = useTheme();
  const [viewState, viewDispatch] = useReducer(viewReducer, {
    ...initialViewState,
    history: [],
  });
  const viewReducerValues = useMemo(
    () => ({ viewState, viewDispatch }),
    [viewState, viewDispatch],
  );
  const [transferState, transferDispatch] = useReducer(
    transferReducer,
    initialTransferState,
  );
  const {
    connectLoaderState: { checkout, provider },
  } = useContext(ConnectLoaderContext);

  useEffect(() => {
    const x = async () => {
      if (viewState.view.type !== SharedViews.LOADING_VIEW) return;
      if (!checkout || !provider) return;

      const tokensAndBalances = await loadBalances(checkout, provider);

      transferDispatch({
        payload: {
          type: TransferActions.SET_TOKEN_BALANCES,
          tokenBalances: tokensAndBalances.allowedBalances,
        },
      });

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: TransferWidgetViews.TRANSFER },
        },
      });
    };

    x();
  }, [checkout]);

  return (
    <ViewContext.Provider value={viewReducerValues}>
      {viewState.view.type === SharedViews.LOADING_VIEW && (
        <LoadingView loadingText={t('views.LOADING_VIEW.text')} />
      )}
      <TransferContextProvider value={{ transferState, transferDispatch }}>
        <CryptoFiatProvider environment={config.environment}>
          <Stack sx={{ pos: 'relative' }}>
            <CloudImage
              use={(
                <img
                  src={getRemoteImage(
                    config.environment,
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
            {viewState.view.type === TransferWidgetViews.TRANSFER && (
              <TransferForm
                config={config}
                checkout={checkout!}
                provider={provider!}
                initialAmount={amount}
                initialTokenAddress={tokenAddress}
                initialToAddress={toAddress}
              />
            )}
          </Stack>
        </CryptoFiatProvider>
      </TransferContextProvider>
    </ViewContext.Provider>
  );
}
