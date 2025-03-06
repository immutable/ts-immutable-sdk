import {
  Checkout,
  IMTBLWidgetEvents,
  TransferWidgetParams,
  WidgetTheme,
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
  Box, Button, Heading, OptionKey, Stack,
} from '@biom3/react';

import { isError, TransactionReceipt } from 'ethers';
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
import { UserJourney } from '../../context/analytics-provider/SegmentAnalyticsProvider';
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

function FirstScreen({
  theme,
  checkout,
  provider,
}: {
  theme: WidgetTheme;
  checkout: Checkout;
  provider: WrappedBrowserProvider;
}) {
  const { t } = useTranslation();
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);
  const { transferState } = useTransferContext();
  const { cryptoFiatState } = useContext(CryptoFiatContext);
  const [token, setToken] = useState<CoinSelectorOptionProps>();
  const [amount, setAmount] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [localTransferState, setLocalTransferState] = useState<
  | { isTransferring: false; receipt?: TransactionReceipt }
  | { isTransferring: true }
  >({ isTransferring: false });
  const defaultTokenImage = useMemo(
    () => getDefaultTokenImage(checkout.config.environment, theme),
    [checkout.config.environment, theme],
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

  const handleSelectChange = useCallback(
    (optionKey: OptionKey) => {
      const result = tokenOptions.find((option) => option.id === optionKey);
      if (!result) throw new Error('Token not found');
      setToken(result);
    },
    [tokenOptions, token],
  );

  const handleMaxButtonClick = useCallback(() => {
    if (!token) return;

    const result = tokenOptions.find((option) => option.id === token.id);
    if (!result) throw new Error('Token not found');

    if (!result.balance?.formattedAmount) throw new Error('Token balance not found');
    setAmount(result.balance.formattedAmount);
  }, [tokenOptions, token]);

  const selectSubtext = useMemo(() => {
    if (!token) return '';
    return `${t('views.SWAP.content.availableBalancePrefix')} ${
      token.balance?.formattedAmount
    }`;
  }, [token]);

  const isButtonDisabled = useMemo(
    () => !amount || !recipientAddress || !token,
    [amount, recipientAddress, token],
  );

  const sendTokensCb = useCallback(async () => {
    if (!token) throw new Error('Token not found');

    const tokenInfo = transferState.tokenBalances.find(
      (tb) => tb.token.address === token.id,
    );
    if (!tokenInfo) throw new Error('Token not found');

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
        console.log('Transaction cancelled');
      } else {
        console.error(e);
      }
    }
  }, [transferState.tokenBalances, amount, recipientAddress, token, provider]);

  if (localTransferState.isTransferring) {
    return <Heading>Transferring...</Heading>;
  }

  if (localTransferState.receipt) {
    return <Heading>Transfer complete</Heading>;
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
          <Box>
            <Heading sx={{ my: 'base.spacing.x1' }} size="xSmall">
              Send
            </Heading>
            <SelectInput
              testId="transfer-token-select"
              options={tokenOptions}
              textInputValue={amount}
              textInputPlaceholder="0"
              textInputTextAlign="right"
              coinSelectorHeading="Select a token"
              textInputMaxButtonClick={token ? handleMaxButtonClick : undefined}
              textInputValidator={amountInputValidation}
              selectSubtext={selectSubtext}
              textInputSubtext={`${t(
                'views.SWAP.content.fiatPricePrefix',
              )} $${formatZeroAmount(fromFiatValue, true)}`}
              onTextInputChange={setAmount}
              onSelectChange={handleSelectChange}
              selectedOption={token?.id}
              defaultTokenImage={defaultTokenImage}
              userJourney={UserJourney.TRANSFER}
              screen="TransferToken"
              control="Token"
            />
          </Box>
          <Box>
            <Heading sx={{ my: 'base.spacing.x1' }} size="xSmall">
              To Address
            </Heading>
            <TextInputForm
              testId="transfer-to-address-input"
              value={recipientAddress}
              placeholder="0x"
              validator={validatePartialAddress}
              onTextInputChange={setRecipientAddress}
            />
          </Box>
        </Stack>
        <Button
          variant="primary"
          size="large"
          disabled={isButtonDisabled}
          onClick={sendTokensCb}
        >
          Send
        </Button>
      </Stack>
    </SimpleLayout>
  );
}

export default function TransferWidget({ config }: TransferWidgetInputs) {
  const { t } = useTranslation();
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
          {viewState.view.type === TransferWidgetViews.TRANSFER && (
            <FirstScreen
              theme={config.theme}
              checkout={checkout!}
              provider={provider!}
            />
          )}
        </CryptoFiatProvider>
      </TransferContextProvider>
    </ViewContext.Provider>
  );
}
