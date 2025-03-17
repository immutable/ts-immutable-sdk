import {
  OptionKey, Stack, Heading, Box, Body, Button,
} from '@biom3/react';
import { IMTBLWidgetEvents } from '@imtbl/checkout-sdk';
import {
  Dispatch, SetStateAction, useContext, useMemo, useState, useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import { CoinSelectorOptionProps } from '../../components/CoinSelector/CoinSelectorOption';
import { SelectInput } from '../../components/FormComponents/SelectInput/SelectInput';
import { TextInputForm } from '../../components/FormComponents/TextInputForm/TextInputForm';
import { HeaderNavigation } from '../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { useAnalytics, UserJourney } from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { CryptoFiatContext } from '../../context/crypto-fiat-context/CryptoFiatContext';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import { orchestrationEvents } from '../../lib/orchestrationEvents';
import {
  tokenValueFormat, getDefaultTokenImage, calculateCryptoToFiat, formatZeroAmount,
} from '../../lib/utils';
import { amountInputValidation } from '../../lib/validations/amountInputValidations';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { TransferFormState, TransferState } from './context';
import { getOptionKey, getFiatAmount, validatePartialAddress } from './functions';

export function TransferForm({
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
