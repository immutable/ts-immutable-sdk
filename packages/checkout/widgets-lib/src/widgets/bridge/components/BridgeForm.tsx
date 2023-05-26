import {
  Box, Button, Heading, OptionKey,
} from '@biom3/react';
import { GetBalanceResult } from '@imtbl/checkout-sdk';
import {
  useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { amountInputValidation } from '../../../lib/validations/amountInputValidations';
import { BridgeContext } from '../context/BridgeContext';
import { ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';
import { CryptoFiatActions, CryptoFiatContext } from '../../../context/crypto-fiat-context/CryptoFiatContext';
import { text } from '../../../resources/text/textConfig';
import { TextInputForm } from '../../../components/FormComponents/TextInputForm/TextInputForm';
import { calculateCryptoToFiat, formatZeroAmount, tokenValueFormat } from '../../../lib/utils';
import { SelectForm, SelectOption } from '../../../components/FormComponents/SelectForm/SelectForm';
import { validateAmount, validateToken } from '../functions/BridgeFormValidator';
import { Fees } from './Fees';

interface BridgeFormProps {
  testId?: string;
  defaultAmount?: string;
  defaultTokenAddress?: string;
}

export function BridgeForm(props: BridgeFormProps) {
  const {
    bridgeState: {
      provider, checkout, network, tokenBalances, allowedTokens,
    },
  } = useContext(BridgeContext);
  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const { viewDispatch } = useContext(ViewContext);
  const { testId, defaultAmount, defaultTokenAddress } = props;
  const { content, bridgeForm } = text.views[BridgeWidgetViews.BRIDGE];

  // Form state
  const [amount, setAmount] = useState<string>(defaultAmount || '');
  const [amountError, setAmountError] = useState<string>('');
  const [token, setToken] = useState<GetBalanceResult | null>(null);
  const [tokenError, setTokenError] = useState<string>('');
  const [amountFiatValue, setAmountFiatValue] = useState<string>('');

  const tokensOptions = useMemo(
    () => tokenBalances
      .filter((b) => b.balance.gt(0))
      .map(
        (t) => ({
          id: `${t.token.symbol}-${t.token.name}`,
          label: t.token.symbol,
          icon: t.token.icon,
        } as SelectOption),
      ),
    [tokenBalances],
  );

  const selectedOption = useMemo(
    () => (token && token ? `${token.token.symbol}-${token.token.name}` : undefined),
    [token, tokensOptions],
  );

  const handleBridgeAmountChange = (value: string) => {
    setAmount(value);
    if (amountError) {
      const validateAmountError = validateAmount(value, token?.formattedBalance);
      setAmountError(validateAmountError);
    }

    if (!token) return;
    setAmountFiatValue(calculateCryptoToFiat(
      value,
      token.token.symbol,
      cryptoFiatState.conversions,
    ));
  };

  const handleAmountInputBlur = (value: string) => {
    setAmount(value);
    if (amountError) {
      const validateAmountError = validateAmount(value, token?.formattedBalance);
      setAmountError(validateAmountError);
    }

    if (!token) return;
    setAmountFiatValue(calculateCryptoToFiat(
      value,
      token.token.symbol,
      cryptoFiatState.conversions,
    ));
  };

  const handleSelectTokenChange = (value: OptionKey) => {
    const selected = tokenBalances.find((t) => value === `${t.token.symbol}-${t.token.name}`);
    if (!selected) return;

    setToken(selected);
    setTokenError('');
  };

  /**
   * This effect is used to set the default token option
   * Set as the token that is passed in as a prop if it has an available balance
   * Otherwise will default to the native currency of the chain
   * If the user does not have any non-zero balances, this will not be set
   */
  useEffect(() => {
    let defaultToken: GetBalanceResult | undefined;
    if (defaultTokenAddress) {
      defaultToken = tokenBalances.find(
        (balance) => balance.token.address === defaultTokenAddress,
      );
    }
    // TODO: do we need to default the coin to the native curreny of the network??

    // if (!defaultToken) {
    //   defaultToken = tokenBalances.find(
    //     (balance) => balance.token.symbol === network?.nativeCurrency.symbol,
    //   );
    // }

    setToken(defaultToken || null);
  }, [tokenBalances, network, defaultTokenAddress]);

  // Does this effect need to be here?
  // can it be in the BridgeWidget?
  useEffect(() => {
    cryptoFiatDispatch({
      payload: {
        type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
        tokenSymbols: allowedTokens.map((allowedToken) => allowedToken.symbol),
      },
    });
  }, [cryptoFiatDispatch, allowedTokens]);

  useEffect(() => {
    if (!amount) return;
    if (!token) return;

    setAmountFiatValue(calculateCryptoToFiat(
      amount,
      token.token.symbol,
      cryptoFiatState.conversions,
    ));
  }, [amount, token]);

  const bridgeFormValidator = useCallback((): boolean => {
    const validateTokenError = validateToken(token);
    const validateAmountError = validateAmount(amount, token?.formattedBalance);

    if (validateTokenError) setTokenError(validateTokenError);
    if (validateAmountError) setAmountError(validateAmountError);

    if (
      validateTokenError
      || validateAmountError) return false;
    return true;
  }, [token, amount, setTokenError, setAmountError]);

  const submitBridge = useCallback(async () => {
    if (!bridgeFormValidator()) return;
    if (!checkout || !provider) return;

    // Fetch bridge transaction

    try {
      // submit bridge transaction
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: BridgeWidgetViews.SUCCESS },
        },
      });
    } catch (err: any) {
      // TODO: fix this with fail view... always succeeed for now
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: BridgeWidgetViews.SUCCESS },
        },
      });
    }
  }, [checkout, provider, bridgeFormValidator]);

  return (
    <Box
      testId={testId}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ paddingX: 'base.spacing.x4' }}>
        <Heading
          testId={`${testId}-content-heading`}
          size="small"
          weight="regular"
          sx={{ paddingBottom: 'base.spacing.x4' }}
        >
          {content.title}
        </Heading>
        <Box
          sx={{
            paddingTop: 'base.spacing.x4',
            display: 'flex',
            justifyContent: 'space-between',
            columnGap: 'base.spacing.x1',
          }}
        >
          <SelectForm
            id="bridge-token"
            options={tokensOptions}
            selectedOption={selectedOption}
            subtext={token
              ? `${content.availableBalancePrefix} ${tokenValueFormat(token?.formattedBalance)}`
              : ''}
            textAlign="left"
            errorMessage={tokenError}
            onSelectChange={(option) => handleSelectTokenChange(option)}
            disabled={false}
          />
          <TextInputForm
            id="bridge-amount"
            value={amount}
            placeholder={bridgeForm.inputPlaceholder}
            subtext={`${content.fiatPricePrefix} $${formatZeroAmount(amountFiatValue, true)}`}
            validator={amountInputValidation}
            onTextInputChange={(value) => handleBridgeAmountChange(value)}
            onTextInputBlur={(value) => handleAmountInputBlur(value)}
            textAlign="right"
            errorMessage={amountError}
            disabled={false}
          />
        </Box>
        <Fees gasFeeValue="" gasFeeToken={null} gasFeeFiatValue="" />
      </Box>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        paddingY: 'base.spacing.x6',
        paddingX: 'base.spacing.x4',
        backgroundColor: 'base.color.translucent.container.200',
      }}
      >
        <Button
          testId={`${testId}-button`}
          variant="primary"
          onClick={submitBridge}
        >
          {bridgeForm.buttonText}
        </Button>
      </Box>
    </Box>
  );
}
