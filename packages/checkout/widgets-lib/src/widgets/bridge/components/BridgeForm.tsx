import {
  Box,
  Button,
  Heading,
  OptionKey,
} from '@biom3/react';
import {
  fetchRiskAssessment,
  GetBalanceResult, WidgetTheme,
} from '@imtbl/checkout-sdk';
import {
  useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Environment } from '@imtbl/config';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { amountInputValidation } from '../../../lib/validations/amountInputValidations';
import { BridgeActions, BridgeContext } from '../context/BridgeContext';
import {
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import { CryptoFiatActions, CryptoFiatContext } from '../../../context/crypto-fiat-context/CryptoFiatContext';
import { TextInputForm } from '../../../components/FormComponents/TextInputForm/TextInputForm';
import {
  calculateCryptoToFiat, formatZeroAmount, isNativeToken, tokenValueFormat,
} from '../../../lib/utils';
import { SelectForm } from '../../../components/FormComponents/SelectForm/SelectForm';
import { validateAmount, validateToken } from '../functions/BridgeFormValidator';
import {
  bridgeFormButtonContainerStyles,
  bridgeFormWrapperStyles,
  formInputsContainerStyles,
} from './BridgeFormStyles';
import { CoinSelectorOptionProps } from '../../../components/CoinSelector/CoinSelectorOption';
import {
  NATIVE,
} from '../../../lib';
import { TransactionRejected } from '../../../components/TransactionRejected/TransactionRejected';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';
import { TokenSelectShimmer } from './TokenSelectShimmer';

interface BridgeFormProps {
  testId?: string;
  defaultAmount?: string;
  defaultTokenAddress?: string;
  isTokenBalancesLoading?: boolean;
  defaultTokenImage: string;
  environment?: Environment;
  theme?: WidgetTheme;
}

export function BridgeForm(props: BridgeFormProps) {
  const { t } = useTranslation();
  const {
    bridgeDispatch,
    bridgeState: {
      tokenBalances,
      allowedTokens,
      checkout,
      from,
      to,
      amount,
      token,
    },
  } = useContext(BridgeContext);

  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const { viewDispatch } = useContext(ViewContext);
  const {
    testId,
    defaultAmount,
    defaultTokenAddress,
    isTokenBalancesLoading,
    defaultTokenImage,
    environment,
    theme,
  } = props;

  const { track } = useAnalytics();

  // Form state
  const [formAmount, setFormAmount] = useState<string>(defaultAmount || '');
  const [amountError, setAmountError] = useState<string>('');
  const [formToken, setFormToken] = useState<GetBalanceResult | undefined>();
  const [tokenError, setTokenError] = useState<string>('');
  const [amountFiatValue, setAmountFiatValue] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const hasSetDefaultState = useRef(false);
  const tokenBalanceSubtext = formToken
    ? `${t('views.BRIDGE_FORM.content.availableBalancePrefix')} ${tokenValueFormat(formToken?.formattedBalance)}`
    : '';

  // Fee estimates & transactions
  const [tokensOptions, setTokensOptions] = useState<CoinSelectorOptionProps[]>([]);

  // user rejects transaction
  const [showTxnRejectedState, setShowTxnRejectedState] = useState(false);

  const formatTokenOptionsId = useCallback((symbol: string, address?: string) => {
    if (!address) return symbol.toLowerCase();
    return `${symbol.toLowerCase()}-${address.toLowerCase()}`;
  }, []);

  useEffect(() => {
    if (tokenBalances.length === 0) return;
    // WT-1350 removing ETH as possible bridge option from being selected
    // balance > 0 AND token is not ETH
    const options = tokenBalances
      .filter((tokenBalance) => tokenBalance.balance > 0)
      .map(
        (tokenBalance) => ({
          id: formatTokenOptionsId(tokenBalance.token.symbol, tokenBalance.token.address),
          name: tokenBalance.token.name,
          symbol: tokenBalance.token.symbol,
          icon: tokenBalance.token.icon,
          balance: {
            formattedFiatAmount: cryptoFiatState.conversions.size === 0 ? formatZeroAmount('')
              : calculateCryptoToFiat(
                tokenBalance.formattedBalance,
                tokenBalance.token.symbol,
                cryptoFiatState.conversions,
              ),
            formattedAmount: tokenValueFormat(tokenBalance.formattedBalance),
          },
        } as CoinSelectorOptionProps),
      );
    setTokensOptions(options);

    if (!hasSetDefaultState.current) {
      hasSetDefaultState.current = true;
      if (defaultTokenAddress) {
        setFormToken(
          tokenBalances.find(
            (b) => (isNativeToken(b.token.address) && defaultTokenAddress?.toLocaleUpperCase() === NATIVE)
              || (b.token.address?.toLowerCase() === defaultTokenAddress?.toLowerCase()),
          ),
        );
      }
    }
  }, [
    tokenBalances,
    cryptoFiatState.conversions,
    defaultTokenAddress,
    hasSetDefaultState.current,
    formatTokenOptionsId,
    formatZeroAmount,
  ]);

  useEffect(() => {
    // This useEffect is for populating the form
    // with values from context when the user
    // has selected the back button from the review screen
    if (!amount || !token) return;
    setFormAmount(amount);
    for (let i = 0; i < tokenBalances.length; i++) {
      const balance = tokenBalances[i];
      if (balance.token.address === token.address) {
        setFormToken(balance);
        break;
      }
    }

    bridgeDispatch({
      payload: {
        type: BridgeActions.SET_TOKEN_AND_AMOUNT,
        token: null,
        amount: '',
      },
    });
  }, [amount, token, tokenBalances]);

  const selectedOption = useMemo(
    () => (formToken && formToken.token
      ? formatTokenOptionsId(formToken.token.symbol, formToken.token.address)
      : undefined),
    [formToken, tokenBalances, cryptoFiatState.conversions, formatTokenOptionsId],
  );

  useEffect(() => {
    if (!checkout || !from || !to) {
      return;
    }

    (async () => {
      const addresses = [from.walletAddress];
      if (to.walletAddress.toLowerCase() !== from.walletAddress.toLowerCase()) {
        addresses.push(to.walletAddress);
      }

      const assessment = await fetchRiskAssessment(addresses, checkout.config);
      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_RISK_ASSESSMENT,
          riskAssessment: assessment,
        },
      });
    })();
  }, [checkout, from, to]);

  const canFetchEstimates = (silently: boolean): boolean => {
    if (Number.isNaN(parseFloat(formAmount))) return false;
    if (parseFloat(formAmount) <= 0) return false;
    if (!formToken) return false;
    if (!from || !from.walletAddress) return false;
    if (!to || !to.walletAddress) return false;
    if (silently && loading) return false;
    if (!checkout) return false;
    return true;
  };

  const handleBridgeAmountChange = (value: string) => {
    setFormAmount(value);
    if (amountError) {
      const validateAmountError = validateAmount(value, formToken?.formattedBalance);
      setAmountError(validateAmountError);
    }

    if (!formToken) return;
    setAmountFiatValue(calculateCryptoToFiat(
      value,
      formToken.token.symbol,
      cryptoFiatState.conversions,
    ));
    if (canFetchEstimates(true)) {
      setLoading(true);
    }
  };

  const handleSelectTokenChange = (value: OptionKey) => {
    const selected = tokenBalances.find((tokenBalance) => (
      value === formatTokenOptionsId(tokenBalance.token.symbol, tokenBalance.token.address)
    ));
    if (!selected) return;

    setFormToken(selected);
    setTokenError('');
  };

  useEffect(() => {
    cryptoFiatDispatch({
      payload: {
        type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
        tokenSymbols: allowedTokens.map((allowedToken) => allowedToken.symbol),
      },
    });
  }, [cryptoFiatDispatch, allowedTokens]);

  useEffect(() => {
    if (!formAmount) return;
    if (!formToken) return;

    setAmountFiatValue(calculateCryptoToFiat(
      formAmount,
      formToken.token.symbol,
      cryptoFiatState.conversions,
    ));
  }, [formAmount, formToken]);

  const bridgeFormValidator = useCallback((): boolean => {
    const validateTokenError = validateToken(formToken);
    const validateAmountError = validateAmount(formAmount, formToken?.formattedBalance);
    if (validateTokenError) setTokenError(validateTokenError);
    if (validateAmountError) setAmountError(validateAmountError);
    if (validateTokenError || validateAmountError) return false;
    return true;
  }, [formToken, formAmount, setTokenError, setAmountError]);

  const submitBridgeValues = useCallback(async () => {
    if (!bridgeFormValidator()) return;
    if (!checkout || !from?.web3Provider || !formToken) return;

    track({
      userJourney: UserJourney.BRIDGE,
      screen: 'TokenAmount',
      control: 'Review',
      controlType: 'Button',
      extras: {
        tokenAddress: formToken.token.address,
        amount: formAmount,
      },
    });

    bridgeDispatch({
      payload: {
        type: BridgeActions.SET_TOKEN_AND_AMOUNT,
        token: formToken.token,
        amount: formAmount,
      },
    });

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: BridgeWidgetViews.BRIDGE_REVIEW,
        },
      },
    });
  }, [
    checkout,
    from?.web3Provider,
    bridgeFormValidator,
    formToken,
  ]);

  const retrySubmitBridgeValues = async () => {
    setShowTxnRejectedState(false);
    await submitBridgeValues();
  };

  return (
    <Box
      testId={testId}
      sx={bridgeFormWrapperStyles}
    >
      <Box sx={{ paddingX: 'base.spacing.x4' }}>
        <Heading
          testId={`${testId}-content-heading`}
          size="small"
          weight="regular"
          sx={{ paddingBottom: 'base.spacing.x4' }}
        >
          {t('views.BRIDGE_FORM.content.title')}
        </Heading>
        {(!defaultTokenAddress || !isTokenBalancesLoading) && (
          <Box sx={formInputsContainerStyles}>
            <SelectForm
              testId="bridge-token"
              options={tokensOptions}
              optionsLoading={isTokenBalancesLoading}
              coinSelectorHeading={t('views.BRIDGE_FORM.bridgeForm.from.selectorTitle')}
              selectedOption={selectedOption}
              subtext={tokenBalanceSubtext}
              textAlign="left"
              errorMessage={t(tokenError)}
              onSelectChange={(option) => handleSelectTokenChange(option)}
              defaultTokenImage={defaultTokenImage}
              environment={environment}
              theme={theme}
            />
            <TextInputForm
              testId="bridge-amount"
              type="number"
              value={formAmount}
              placeholder={t('views.BRIDGE_FORM.bridgeForm.from.inputPlaceholder')}
              subtext={`${t('views.BRIDGE_FORM.content.fiatPricePrefix')} $${formatZeroAmount(amountFiatValue, true)}`}
              validator={amountInputValidation}
              onTextInputChange={(value) => handleBridgeAmountChange(value)}
              onTextInputEnter={submitBridgeValues}
              textAlign="right"
              inputMode="decimal"
              errorMessage={t(amountError)}
            />
          </Box>
        )}
        {defaultTokenAddress && isTokenBalancesLoading && (
          <TokenSelectShimmer sx={formInputsContainerStyles} />
        )}
      </Box>
      <Box sx={bridgeFormButtonContainerStyles}>
        <Button
          testId={`${testId}-button`}
          variant="primary"
          onClick={submitBridgeValues}
          size="large"
        >
          {t('views.BRIDGE_FORM.bridgeForm.buttonText')}
        </Button>
        <TransactionRejected
          visible={showTxnRejectedState}
          showHeaderBar={false}
          onCloseDrawer={() => setShowTxnRejectedState(false)}
          onRetry={retrySubmitBridgeValues}
        />
      </Box>
    </Box>
  );
}
