import {
  Box,
  Button,
  Heading,
  MenuItem,
  OptionKey,
} from '@biom3/react';
import {
  GasEstimateBridgeToL2Result, GetBalanceResult,
} from '@imtbl/checkout-sdk';
import {
  useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { BigNumber, utils } from 'ethers';
import { FeesBreakdown } from 'components/FeesBreakdown/FeesBreakdown';
import { amountInputValidation } from '../../../lib/validations/amountInputValidations';
import { BridgeActions, XBridgeContext } from '../context/XBridgeContext';
import { ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { CryptoFiatActions, CryptoFiatContext } from '../../../context/crypto-fiat-context/CryptoFiatContext';
import { text } from '../../../resources/text/textConfig';
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
  gasAmountHeadingStyles,
} from './BridgeFormStyles';
import { CoinSelectorOptionProps } from '../../../components/CoinSelector/CoinSelectorOption';
import { useInterval } from '../../../lib/hooks/useInterval';
import {
  DEFAULT_TOKEN_DECIMALS,
  DEFAULT_QUOTE_REFRESH_INTERVAL,
  NATIVE,
} from '../../../lib';
import { swapButtonIconLoadingStyle } from '../../swap/components/SwapButtonStyles';
import { TransactionRejected } from '../../../components/TransactionRejected/TransactionRejected';
import { NotEnoughGas } from '../../../components/NotEnoughGas/NotEnoughGas';
import { XBridgeWidgetViews } from '../../../context/view-context/XBridgeViewContextTypes';
import { TokenSelectShimmer } from './TokenSelectShimmer';

interface BridgeFormProps {
  testId?: string;
  defaultAmount?: string;
  defaultFromContractAddress?: string;
  isTokenBalancesLoading?: boolean;
}

export function BridgeForm(props: BridgeFormProps) {
  const {
    bridgeDispatch,
    bridgeState: {
      tokenBalances,
      allowedTokens,
      checkout,
      web3Provider,
      amount,
      token,
    },
  } = useContext(XBridgeContext);

  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const { viewDispatch } = useContext(ViewContext);
  const {
    testId,
    defaultAmount,
    defaultFromContractAddress,
    isTokenBalancesLoading,
  } = props;
  const {
    fees,
    content,
    bridgeForm,
  } = text.views[XBridgeWidgetViews.BRIDGE_FORM];

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
    ? `${content.availableBalancePrefix} ${tokenValueFormat(formToken?.formattedBalance)}`
    : '';

  // Fee estimates & transactions
  const [isFetching, setIsFetching] = useState(false);
  const [estimates, setEstimates] = useState<GasEstimateBridgeToL2Result | undefined>(undefined);
  const [gasFee, setGasFee] = useState<string>('');
  const [gasFeeFiatValue, setGasFeeFiatValue] = useState<string>('');
  const [tokensOptions, setTokensOptions] = useState<CoinSelectorOptionProps[]>([]);
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false);

  // Not enough ETH to cover gas
  const [showNotEnoughGasDrawer, setShowNotEnoughGasDrawer] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // user rejects transaction
  const [showTxnRejectedState, setShowTxnRejectedState] = useState(false);

  const formatTokenOptionsId = useCallback((symbol: string, address?: string) => {
    if (!address) return symbol.toLowerCase();
    return `${symbol.toLowerCase()}-${address.toLowerCase()}`;
  }, []);

  const gasFiatAmount = `${fees.fiatPricePrefix} ${gasFeeFiatValue}`;
  const gasTokenAmount = `${estimates?.gasFee.token?.symbol} ${tokenValueFormat(gasFee)}`;

  useEffect(() => {
    if (tokenBalances.length === 0) return;
    // WT-1350 removing ETH as possible bridge option from being selected
    // balance > 0 AND token is not ETH
    const options = tokenBalances
      .filter((tokenBalance) => tokenBalance.balance.gt(0))
      .map(
        (t) => ({
          id: formatTokenOptionsId(t.token.symbol, t.token.address),
          name: t.token.name,
          symbol: t.token.symbol,
          icon: t.token.icon,
          balance: {
            formattedFiatAmount: cryptoFiatState.conversions.size === 0 ? formatZeroAmount('')
              : calculateCryptoToFiat(
                t.formattedBalance,
                t.token.symbol,
                cryptoFiatState.conversions,
              ),
            formattedAmount: tokenValueFormat(t.formattedBalance),
          },
        } as CoinSelectorOptionProps),
      );
    setTokensOptions(options);

    if (!hasSetDefaultState.current) {
      hasSetDefaultState.current = true;
      if (defaultFromContractAddress) {
        setFormToken(
          tokenBalances.find(
            (b) => (isNativeToken(b.token.address) && defaultFromContractAddress?.toLocaleUpperCase() === NATIVE)
            || (b.token.address?.toLowerCase() === defaultFromContractAddress?.toLowerCase()),
          ),
        );
      }
    }
  }, [
    tokenBalances,
    cryptoFiatState.conversions,
    defaultFromContractAddress,
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
    // if ((silently && (loading || editing)) || !checkout) return;

    // TODO: Implement the gas estimate
    // const gasEstimateResult = await checkout.gasEstimate({
    //   gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
    //   isSpendingCapApprovalRequired: !!transactions?.approveRes?.unsignedTx,
    // }) as GasEstimateBridgeToL2Result;

    const gasEstimateResult = {
      gasFee: {
        estimatedAmount: BigNumber.from(100),
        token: {
          address: 'native',
          decimals: 18,
          name: 'IMX',
          symbol: 'IMX',
        },
      },
    } as GasEstimateBridgeToL2Result;

    setEstimates(gasEstimateResult);
    const estimatedAmount = utils.formatUnits(
      gasEstimateResult?.gasFee?.estimatedAmount || 0,
      DEFAULT_TOKEN_DECIMALS,
    );

    setGasFee(estimatedAmount);
    setGasFeeFiatValue(calculateCryptoToFiat(
      estimatedAmount,
      gasEstimateResult.gasFee?.token?.symbol || '',
      cryptoFiatState.conversions,
    ));

    if (!silently) {
      setLoading(false);
      setIsFetching(false);
    }
  };

  // TODO: rename uses of ETH to native token
  const insufficientFundsForGas = useMemo(() => {
    const ethBalance = tokenBalances
      .find((balance) => isNativeToken(balance.token.address));
    if (!ethBalance) {
      return true;
    }

    const tokenIsEth = isNativeToken(formToken?.token.address);
    const gasAmount = utils.parseEther(gasFee.length !== 0 ? gasFee : '0');
    const additionalAmount = tokenIsEth && !Number.isNaN(parseFloat(formAmount))
      ? utils.parseEther(formAmount)
      : BigNumber.from('0');

    return gasAmount.add(additionalAmount).gt(ethBalance.balance);
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
    const selected = tokenBalances.find((t) => value === formatTokenOptionsId(t.token.symbol, t.token.address));
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
      if (!web3Provider) return;
      const address = await web3Provider.getSigner().getAddress();
      setWalletAddress((previous) => {
        if (previous !== '' && previous !== address) {
          setFormToken(undefined);
        }
        return address;
      });
    })();
  }, [web3Provider, tokenBalances]);

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
    if (!checkout || !web3Provider || !formToken) return;

    if (insufficientFundsForGas) {
      setShowNotEnoughGasDrawer(true);
      return;
    }

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
          type: XBridgeWidgetViews.BRIDGE_REVIEW,
        },
      },
    });
  }, [
    checkout,
    web3Provider,
    bridgeFormValidator,
    insufficientFundsForGas,
    formToken]);

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
          {content.title}
        </Heading>
        {isTokenBalancesLoading && (
          <TokenSelectShimmer sx={formInputsContainerStyles} />
        )}
        {!isTokenBalancesLoading && (
          <Box sx={formInputsContainerStyles}>
            <SelectForm
              testId="bridge-token"
              options={tokensOptions}
              coinSelectorHeading={bridgeForm.from.selectorTitle}
              selectedOption={selectedOption}
              subtext={tokenBalanceSubtext}
              textAlign="left"
              errorMessage={tokenError}
              onSelectChange={(option) => handleSelectTokenChange(option)}
              disabled={isFetching}
            />
            <TextInputForm
              testId="bridge-amount"
              value={formAmount}
              placeholder={bridgeForm.from.inputPlaceholder}
              subtext={`${content.fiatPricePrefix} $${formatZeroAmount(amountFiatValue, true)}`}
              validator={amountInputValidation}
              onTextInputFocus={onTextInputFocus}
              onTextInputChange={(value) => handleBridgeAmountChange(value)}
              onTextInputBlur={(value) => handleAmountInputBlur(value)}
              textAlign="right"
              errorMessage={amountError}
              disabled={isFetching}
            />
          </Box>
        )}
        {gasFee && (
          <Box sx={{ paddingY: 'base.spacing.x2' }}>
            <MenuItem emphasized size="small">
              <MenuItem.Label sx={gasAmountHeadingStyles}>
                {fees.title}
              </MenuItem.Label>
              <MenuItem.PriceDisplay
                fiatAmount={`${fees.fiatPricePrefix} ${gasFeeFiatValue}`}
                price={`${estimates?.gasFee.token?.symbol} ${tokenValueFormat(gasFee)}`}
              />
              <MenuItem.StatefulButtCon
                icon="ChevronExpand"
                onClick={() => setShowFeeBreakdown(true)}
              />
            </MenuItem>
          </Box>
        )}
      </Box>
      <FeesBreakdown
        totalFiatAmount={gasFiatAmount}
        totalAmount={gasTokenAmount}
        fees={[
          {
            label: text.drawers.feesBreakdown.fees.gas.label,
            fiatAmount: gasFiatAmount,
            amount: gasTokenAmount,
          },
        ]}
        visible={showFeeBreakdown}
        onCloseDrawer={() => setShowFeeBreakdown(false)}
      />
      <Box sx={bridgeFormButtonContainerStyles}>
        <Button
          testId={`${testId}-button`}
          variant="primary"
          onClick={submitBridge}
          disabled={loading}
          size="large"
        >
          {loading ? (
            <Button.Icon icon="Loading" sx={swapButtonIconLoadingStyle} />
          ) : bridgeForm.buttonText}
        </Button>
        <TransactionRejected
          visible={showTxnRejectedState}
          showHeaderBar={false}
          onCloseDrawer={() => setShowTxnRejectedState(false)}
          onRetry={retrySubmitBridge}
        />
        <NotEnoughGas
          visible={showNotEnoughGasDrawer}
          showHeaderBar={false}
          onCloseDrawer={() => setShowNotEnoughGasDrawer(false)}
          walletAddress={walletAddress}
          showAdjustAmount={isNativeToken(formToken?.token.address)}
        />
      </Box>
    </Box>
  );
}
