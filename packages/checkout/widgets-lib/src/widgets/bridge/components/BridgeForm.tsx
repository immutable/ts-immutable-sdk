import {
  Box,
  Button,
  Heading,
  OptionKey,
} from '@biom3/react';
import {
  GasEstimateBridgeToL2Result,
  GasEstimateType,
  GetBalanceResult,
} from '@imtbl/checkout-sdk';
import {
  useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { BigNumber, utils } from 'ethers';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { useTranslation } from 'react-i18next';
import { amountInputValidation } from '../../../lib/validations/amountInputValidations';
import { BridgeActions, BridgeContext } from '../context/BridgeContext';
import {
  ViewActions,
  ViewContext,
  SharedViews,
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
import { useInterval } from '../../../lib/hooks/useInterval';
import {
  DEFAULT_TOKEN_DECIMALS,
  DEFAULT_QUOTE_REFRESH_INTERVAL,
  NATIVE,
  getL1ChainId,
  IMX_TOKEN_SYMBOL,
  ETH_TOKEN_SYMBOL,
} from '../../../lib';
import { TransactionRejected } from '../../../components/TransactionRejected/TransactionRejected';
import { NotEnoughGas } from '../../../components/NotEnoughGas/NotEnoughGas';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';
import { TokenSelectShimmer } from './TokenSelectShimmer';
import { Fees } from '../../../components/Fees/Fees';
import { formatBridgeFees } from '../functions/BridgeFees';

interface BridgeFormProps {
  testId?: string;
  defaultAmount?: string;
  defaultTokenAddress?: string;
  isTokenBalancesLoading?: boolean;
}

export function BridgeForm(props: BridgeFormProps) {
  const { t } = useTranslation();
  const {
    bridgeDispatch,
    bridgeState: {
      tokenBridge,
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
  } = props;

  const { track } = useAnalytics();

  // Form state
  const [formAmount, setFormAmount] = useState<string>(defaultAmount || '');
  const [amountError, setAmountError] = useState<string>('');
  const [formToken, setFormToken] = useState<GetBalanceResult | undefined>();
  const [tokenError, setTokenError] = useState<string>('');
  const [amountFiatValue, setAmountFiatValue] = useState<string>('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasSetDefaultState = useRef(false);
  const tokenBalanceSubtext = formToken
    ? `${t('views.BRIDGE_FORM.content.availableBalancePrefix')} ${tokenValueFormat(formToken?.formattedBalance)}`
    : '';

  // Fee estimates & transactions
  const [isFetching, setIsFetching] = useState(false);
  const [estimates, setEstimates] = useState<GasEstimateBridgeToL2Result | undefined>(undefined);
  const [gasFee, setGasFee] = useState<string>('');
  const [gasFeeFiatValue, setGasFeeFiatValue] = useState<string>('');
  const [tokensOptions, setTokensOptions] = useState<CoinSelectorOptionProps[]>([]);

  // Not enough ETH to cover gas
  const [showNotEnoughGasDrawer, setShowNotEnoughGasDrawer] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

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
      .filter((tokenBalance) => tokenBalance.balance.gt(0))
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

  const canFetchEstimates = (): boolean => {
    if (Number.isNaN(parseFloat(formAmount))) return false;
    if (parseFloat(formAmount) <= 0) return false;
    if (!formToken) return false;
    if (isFetching) return false;
    if (!from || !from.walletAddress) return false;
    if (!to || !to.walletAddress) return false;
    return true;
  };

  const fetchEstimates = async (silently: boolean = false) => {
    if (!canFetchEstimates()) return;

    // setIsFetching within this if statement
    // to allow the user to edit the form
    // even if a new quote is fetching silently
    if (!silently) {
      setLoading(true);
      setIsFetching(true);
    }

    // Prevent silently fetching and set a new fee estimate
    // if the user has updated and the widget is already
    // fetching or the user is updating the inputs.
    if ((silently && (loading || editing)) || !checkout) return;

    const tokenIsNative = isNativeToken(formToken?.token.address);
    const amountToBridge = tokenIsNative
      ? utils.parseUnits(formAmount)
      : utils.parseUnits(formAmount, formToken?.token.decimals);

    const tokenAddress = tokenIsNative ? NATIVE.toUpperCase() : formToken?.token.address;

    const [unsignedApproveTransaction, unsignedTransaction] = await Promise.all([
      tokenBridge!.getUnsignedApproveBridgeTx({
        senderAddress: from!.walletAddress!,
        token: tokenAddress ?? NATIVE.toUpperCase(),
        amount: amountToBridge,
        sourceChainId: from!.network.toString(),
        destinationChainId: to!.network.toString(),
      }),
      tokenBridge!.getUnsignedBridgeTx({
        senderAddress: from!.walletAddress!,
        recipientAddress: to!.walletAddress!,
        token: tokenAddress ?? NATIVE.toUpperCase(),
        amount: amountToBridge,
        sourceChainId: from!.network.toString(),
        destinationChainId: to!.network.toString(),
        gasMultiplier: 1.1,
      }),
    ]);

    const transactionFeeData = unsignedTransaction.feeData;

    const { totalFees, approvalFee } = transactionFeeData;

    let rawTotalFees = totalFees;
    if (!unsignedApproveTransaction.unsignedTx) {
      rawTotalFees = totalFees.sub(approvalFee);
      transactionFeeData.approvalFee = BigNumber.from(0);
    }

    const gasEstimateResult = {
      gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
      fees: { ...transactionFeeData, totalFees: rawTotalFees },
      token: checkout.config.networkMap.get(from!.network)?.nativeCurrency,
    } as GasEstimateBridgeToL2Result;

    setEstimates(gasEstimateResult);
    const estimatedAmount = utils.formatUnits(
      gasEstimateResult?.fees?.totalFees || 0,
      DEFAULT_TOKEN_DECIMALS,
    );

    setGasFee(estimatedAmount);
    setGasFeeFiatValue(calculateCryptoToFiat(
      estimatedAmount,
      gasEstimateResult?.token?.symbol || '',
      cryptoFiatState.conversions,
    ));

    if (!silently) {
      setLoading(false);
      setIsFetching(false);
    }
  };

  const insufficientFundsForGas = useMemo(() => {
    const nativeTokenBalance = tokenBalances
      .find((balance) => isNativeToken(balance.token.address));
    if (!nativeTokenBalance) {
      return true;
    }

    const tokenIsNative = isNativeToken(formToken?.token.address);
    const gasAmount = utils.parseUnits(gasFee.length !== 0 ? gasFee : '0');
    const additionalAmount = tokenIsNative && !Number.isNaN(parseFloat(formAmount))
      ? utils.parseUnits(formAmount)
      : BigNumber.from('0');

    return gasAmount.add(additionalAmount).gt(nativeTokenBalance.balance);
  }, [gasFee, tokenBalances, formToken, formAmount]);

  // Silently refresh the quote
  useInterval(() => fetchEstimates(true), DEFAULT_QUOTE_REFRESH_INTERVAL);

  useEffect(() => {
    if (editing) return;
    (async () => await fetchEstimates())();
  }, [formAmount, formToken, editing]);

  const onTextInputFocus = () => {
    setEditing(true);
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
  };

  const handleAmountInputBlur = (value: string) => {
    setEditing(false);
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

  useEffect(() => {
    (async () => {
      if (!from?.web3Provider) return;
      const address = await from.web3Provider.getSigner().getAddress();
      setWalletAddress((previous) => {
        if (previous !== '' && previous !== address) {
          setFormToken(undefined);
        }
        return address;
      });
    })();
  }, [from?.web3Provider, tokenBalances]);

  const formatFeeBreakdown = useCallback((): any => formatBridgeFees(estimates, cryptoFiatState, t), [estimates]);

  const bridgeFormValidator = useCallback((): boolean => {
    const validateTokenError = validateToken(formToken);
    const validateAmountError = validateAmount(formAmount, formToken?.formattedBalance);
    if (validateTokenError) setTokenError(validateTokenError);
    if (validateAmountError) setAmountError(validateAmountError);
    if (validateTokenError || validateAmountError) return false;
    return true;
  }, [formToken, formAmount, setTokenError, setAmountError]);

  const submitBridge = useCallback(async () => {
    if (!bridgeFormValidator()) return;
    if (!checkout || !from?.web3Provider || !formToken) return;

    if (insufficientFundsForGas) {
      setShowNotEnoughGasDrawer(true);
      return;
    }

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
    insufficientFundsForGas,
    formToken,
  ]);

  const retrySubmitBridge = async () => {
    setShowTxnRejectedState(false);
    await submitBridge();
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
              disabled={isFetching}
            />
            <TextInputForm
              testId="bridge-amount"
              value={formAmount}
              placeholder={t('views.BRIDGE_FORM.bridgeForm.from.inputPlaceholder')}
              subtext={`${t('views.BRIDGE_FORM.content.fiatPricePrefix')} $${formatZeroAmount(amountFiatValue, true)}`}
              validator={amountInputValidation}
              onTextInputFocus={onTextInputFocus}
              onTextInputChange={(value) => handleBridgeAmountChange(value)}
              onTextInputBlur={(value) => handleAmountInputBlur(value)}
              textAlign="right"
              errorMessage={t(amountError)}
              disabled={isFetching}
            />
          </Box>
        )}
        {defaultTokenAddress && isTokenBalancesLoading && (
          <TokenSelectShimmer sx={formInputsContainerStyles} />
        )}
        <Fees
          gasFeeValue={gasFee}
          gasFeeFiatValue={gasFeeFiatValue}
          gasFeeToken={estimates?.token}
          fees={formatFeeBreakdown()}
          loading={isFetching}
          onFeesClick={() => {
            track({
              userJourney: UserJourney.BRIDGE,
              screen: 'SwapCoins',
              control: 'ViewFees',
              controlType: 'Button',
            });
          }}
        />
      </Box>
      <Box sx={bridgeFormButtonContainerStyles}>
        <Button
          testId={`${testId}-button`}
          variant="primary"
          onClick={submitBridge}
          size="large"
        >
          {t('views.BRIDGE_FORM.bridgeForm.buttonText')}
        </Button>
        <TransactionRejected
          visible={showTxnRejectedState}
          showHeaderBar={false}
          onCloseDrawer={() => setShowTxnRejectedState(false)}
          onRetry={retrySubmitBridge}
        />
        <NotEnoughGas
          environment={checkout.config.environment}
          visible={showNotEnoughGasDrawer}
          showHeaderBar={false}
          onCloseDrawer={() => setShowNotEnoughGasDrawer(false)}
          walletAddress={walletAddress}
          showAdjustAmount={isNativeToken(formToken?.token.address)}
          tokenSymbol={
            from?.network === getL1ChainId(checkout?.config)
              ? ETH_TOKEN_SYMBOL
              : IMX_TOKEN_SYMBOL
          }
          onAddCoinsClick={() => {
            viewDispatch({
              payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                  type: SharedViews.TOP_UP_VIEW,
                },
              },
            });
          }}
        />
      </Box>
    </Box>
  );
}
