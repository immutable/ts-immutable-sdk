import {
  Box, Button, Heading, IMX_TOKEN_IMAGE_URL, MenuItem, OptionKey,
} from '@biom3/react';
import {
  GasEstimateBridgeToL2Result, GetBalanceResult,
} from '@imtbl/checkout-sdk';
import {
  useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { BigNumber, utils } from 'ethers';
import { amountInputValidation } from '../../../lib/validations/amountInputValidations';
import { BridgeActions, XBridgeContext } from '../context/XBridgeContext';
import { ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';
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
} from './BridgeFormStyles';
import { CoinSelectorOptionProps } from '../../../components/CoinSelector/CoinSelectorOption';
import { useInterval } from '../../../lib/hooks/useInterval';
import { DEFAULT_TOKEN_DECIMALS, DEFAULT_QUOTE_REFRESH_INTERVAL, NATIVE } from '../../../lib';
import { swapButtonIconLoadingStyle } from '../../swap/components/SwapButtonStyles';
import { TransactionRejected } from '../../../components/TransactionRejected/TransactionRejected';
import { NotEnoughGas } from '../../../components/NotEnoughGas/NotEnoughGas';
import { XBridgeWidgetViews } from '../../../context/view-context/XBridgeViewContextTypes';

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
    xBridgeContent,
    xBridgeFees,
    content,
    bridgeForm,
  } = text.views[BridgeWidgetViews.BRIDGE];

  // Form state
  const [amount, setAmount] = useState<string>(defaultAmount || '');
  const [amountError, setAmountError] = useState<string>('');
  const [token, setToken] = useState<GetBalanceResult | undefined>();
  const [tokenError, setTokenError] = useState<string>('');
  const [amountFiatValue, setAmountFiatValue] = useState<string>('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasSetDefaultState = useRef(false);

  // Fee estimates & transactions
  const [isFetching, setIsFetching] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [estimates, setEstimates] = useState<GasEstimateBridgeToL2Result | undefined>(undefined);
  const [gasFee, setGasFee] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        setToken(
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
    setToken,
    setTokensOptions,
    formatTokenOptionsId,
    formatZeroAmount,
  ]);

  const selectedOption = useMemo(
    () => (token && token.token
      ? formatTokenOptionsId(token.token.symbol, token.token.address)
      : undefined),
    [token, tokenBalances, cryptoFiatState.conversions, formatTokenOptionsId],
  );

  const canFetchEstimates = (): boolean => {
    if (Number.isNaN(parseFloat(amount))) return false;
    if (parseFloat(amount) <= 0) return false;
    if (!token) return false;
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

  const insufficientFundsForGas = useMemo(() => {
    const ethBalance = tokenBalances
      .find((balance) => isNativeToken(balance.token.address));
    if (!ethBalance) {
      return true;
    }

    const tokenIsEth = isNativeToken(token?.token.address);
    const gasAmount = utils.parseEther(gasFee.length !== 0 ? gasFee : '0');
    const additionalAmount = tokenIsEth && !Number.isNaN(parseFloat(amount))
      ? utils.parseEther(amount)
      : BigNumber.from('0');

    return gasAmount.add(additionalAmount).gt(ethBalance.balance);
  }, [gasFee, tokenBalances, token, amount]);

  // Silently refresh the quote
  useInterval(() => fetchEstimates(true), DEFAULT_QUOTE_REFRESH_INTERVAL);

  useEffect(() => {
    if (editing) return;
    (async () => await fetchEstimates())();
  }, [amount, token, editing]);

  const onTextInputFocus = () => {
    setEditing(true);
  };

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
    setEditing(false);
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
    const selected = tokenBalances.find((t) => value === formatTokenOptionsId(t.token.symbol, t.token.address));
    if (!selected) return;

    setToken(selected);
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
    if (!amount) return;
    if (!token) return;

    setAmountFiatValue(calculateCryptoToFiat(
      amount,
      token.token.symbol,
      cryptoFiatState.conversions,
    ));
  }, [amount, token]);

  useEffect(() => {
    (async () => {
      if (!web3Provider) return;
      const address = await web3Provider.getSigner().getAddress();
      setWalletAddress((previous) => {
        if (previous !== '' && previous !== address) {
          setToken(undefined);
        }
        return address;
      });
    })();
  }, [web3Provider, tokenBalances]);

  const bridgeFormValidator = useCallback((): boolean => {
    const validateTokenError = validateToken(token);
    const validateAmountError = validateAmount(amount, token?.formattedBalance);
    if (validateTokenError) setTokenError(validateTokenError);
    if (validateAmountError) setAmountError(validateAmountError);
    if (validateTokenError || validateAmountError) return false;
    return true;
  }, [token, amount, setTokenError, setAmountError]);

  const submitBridge = useCallback(async () => {
    if (!bridgeFormValidator()) return;
    if (!checkout || !web3Provider || !token) return;

    if (insufficientFundsForGas) {
      setShowNotEnoughGasDrawer(true);
      return;
    }

    bridgeDispatch({
      payload: {
        type: BridgeActions.SET_TOKEN_AND_AMOUNT,
        token: token.token,
        amount,
        gasFee,
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
    token]);

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
          {xBridgeContent.title}
        </Heading>
        <Box sx={formInputsContainerStyles}>
          <SelectForm
            testId="bridge-token"
            options={tokensOptions}
            optionsLoading={isTokenBalancesLoading}
            coinSelectorHeading={bridgeForm.from.selectorTitle}
            selectedOption={selectedOption}
            subtext={token
              ? `${content.availableBalancePrefix} ${tokenValueFormat(token?.formattedBalance)}`
              : ''}
            textAlign="left"
            errorMessage={tokenError}
            onSelectChange={(option) => handleSelectTokenChange(option)}
            disabled={isFetching}
          />
          <TextInputForm
            testId="bridge-amount"
            value={amount}
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
        {/* todo: dynamically set values & add icon */}
        {gasFee && (
          <Box sx={{ paddingY: 'base.spacing.x2' }}>
            <MenuItem emphasized size="small">
              <MenuItem.Label>
                {xBridgeFees.title}
              </MenuItem.Label>
              {/* todo: dynamically set icon between eth/imx */}
              <MenuItem.PriceDisplay
                // {gasFeeFiatValue}
                fiatAmount="~ USD $5.50"
                // {content.fiatPricePrefix} {gasFee}
                price="IMX 1.23"
                // {estimates?.gasFee?.token}
                currencyImageUrl={IMX_TOKEN_IMAGE_URL}
              />
            </MenuItem>
          </Box>
        )}
      </Box>
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
          onCloseBottomSheet={() => setShowTxnRejectedState(false)}
          onRetry={retrySubmitBridge}
        />
        <NotEnoughGas
          visible={showNotEnoughGasDrawer}
          showHeaderBar={false}
          onCloseBottomSheet={() => setShowNotEnoughGasDrawer(false)}
          walletAddress={walletAddress}
          showAdjustAmount={isNativeToken(token?.token.address)}
        />
      </Box>
    </Box>
  );
}
