import {
  Box, Button, Heading, OptionKey,
} from '@biom3/react';
import {
  CheckoutErrorType, GasEstimateBridgeToL2Result, GasEstimateType, GetBalanceResult,
} from '@imtbl/checkout-sdk';
import {
  useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { ApproveBridgeResponse, BridgeDepositResponse } from '@imtbl/bridge-sdk';
import { BigNumber, utils } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { amountInputValidation } from '../../../lib/validations/amountInputValidations';
import { BridgeContext } from '../context/BridgeContext';
import { SharedViews, ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';
import { CryptoFiatActions, CryptoFiatContext } from '../../../context/crypto-fiat-context/CryptoFiatContext';
import { text } from '../../../resources/text/textConfig';
import { TextInputForm } from '../../../components/FormComponents/TextInputForm/TextInputForm';
import { calculateCryptoToFiat, formatZeroAmount, tokenValueFormat } from '../../../lib/utils';
import { SelectForm } from '../../../components/FormComponents/SelectForm/SelectForm';
import { validateAmount, validateToken } from '../functions/BridgeFormValidator';
import { Fees } from '../../../components/Fees/Fees';
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

interface BridgeFormProps {
  testId?: string;
  defaultAmount?: string;
  defaultFromContractAddress?: string;
}

export function BridgeForm(props: BridgeFormProps) {
  const {
    bridgeState: {
      provider,
      checkout,
      tokenBridge,
      tokenBalances,
      allowedTokens,
    },
  } = useContext(BridgeContext);

  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const { viewDispatch } = useContext(ViewContext);
  const { testId, defaultAmount, defaultFromContractAddress } = props;
  const { content, bridgeForm, fees } = text.views[BridgeWidgetViews.BRIDGE];

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
  const [estimates, setEstimates] = useState<GasEstimateBridgeToL2Result | undefined>(undefined);
  const [gasFee, setGasFee] = useState<string>('');
  const [gasFeeFiatValue, setGasFeeFiatValue] = useState<string>('');
  const [approvalTransaction, setApprovalTransaction] = useState<ApproveBridgeResponse | undefined>(undefined);
  const [unsignedBridgeTransaction,
    setUnsignedBridgeTransaction] = useState<BridgeDepositResponse | undefined>(undefined);
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
      .filter((b) => b.balance.gt(0)
      && b.token?.address
      && b.token?.address !== NATIVE
      && b.token.address !== '')
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
        setToken(tokenBalances.find(
          (b) => (!b.token.address && defaultFromContractAddress?.toLocaleUpperCase() === NATIVE)
          || (b.token.address?.toLowerCase() === defaultFromContractAddress?.toLowerCase()),
        ));
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
    () => (token
      ? formatTokenOptionsId(token.token.symbol, token.token.address)
      : undefined),
    [token, tokenBalances, cryptoFiatState.conversions, formatTokenOptionsId],
  );

  const canFetchEstimates = (): boolean => {
    if (Number.isNaN(parseFloat(amount))) return false;
    if (parseFloat(amount) <= 0) return false;
    if (!token) return false;
    if (!token.token?.address) return false;
    if (isFetching) return false;
    return true;
  };

  const getUnsignedTransactions = async ()
  : Promise<{ approveRes: ApproveBridgeResponse, bridgeTxn:BridgeDepositResponse } | undefined> => {
    if (!checkout || !provider || !tokenBridge || !token || !token.token?.address) return;

    const depositorAddress = await provider.getSigner().getAddress();
    const depositAmount = utils.parseUnits(amount, token.token.decimals);

    const approveRes: ApproveBridgeResponse = await tokenBridge.getUnsignedApproveBridgeTx({
      depositorAddress,
      token: token.token.address,
      depositAmount,
    });

    const bridgeTxn: BridgeDepositResponse = await tokenBridge.getUnsignedDepositTx({
      depositorAddress,
      recipientAddress: depositorAddress,
      token: token.token.address,
      depositAmount,
    });

    // eslint-disable-next-line consistent-return
    return { approveRes, bridgeTxn };
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

    // get approval txn and bridge txn
    const transactions = await getUnsignedTransactions();
    setApprovalTransaction(transactions?.approveRes);
    setUnsignedBridgeTransaction(transactions?.bridgeTxn);

    // Prevent silently fetching and set a new fee estimate
    // if the user has updated and the widget is already
    // fetching or the user is updating the inputs.
    if ((silently && (loading || editing)) || !transactions?.bridgeTxn || !checkout) return;

    const gasEstimateResult = await checkout.gasEstimate({
      gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
      isSpendingCapApprovalRequired: !!transactions?.approveRes?.unsignedTx,
    }) as GasEstimateBridgeToL2Result;

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
      .find((balance) => !balance.token.address || balance.token.address === NATIVE);
    if (!ethBalance) {
      return true;
    }

    const tokenIsEth = !token?.token.address || token.token.address === NATIVE;
    const gasAmount = parseEther(gasFee.length !== 0 ? gasFee : '0');
    const additionalAmount = tokenIsEth && !Number.isNaN(parseFloat(amount))
      ? parseEther(amount)
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
      if (!provider) return;
      const address = await provider.getSigner().getAddress();
      setWalletAddress((previous) => {
        if (previous !== '' && previous !== address) {
          setToken(undefined);
        }
        return address;
      });
    })();
  }, [provider, tokenBalances]);

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
    if (!checkout || !provider || !token || !unsignedBridgeTransaction) return;

    if (insufficientFundsForGas) {
      setShowNotEnoughGasDrawer(true);
      return;
    }

    try {
      setLoading(true);
      if (approvalTransaction && approvalTransaction.required && approvalTransaction.unsignedTx) {
        // move to new Approve ERC20 view
        // pass in approvalTransaction and unsignedBridgeTransaction
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: BridgeWidgetViews.APPROVE_ERC20,
              data: {
                approveTransaction: approvalTransaction,
                transaction: unsignedBridgeTransaction,
                bridgeFormInfo: {
                  fromContractAddress: token.token?.address ?? '',
                  fromAmount: amount,
                },
              },
            },
            currentViewData: {
              tokenAddress: token.token?.address ?? '',
              amount,
            },
          },
        });
        return;
      }

      const { transactionResponse } = await checkout.sendTransaction({
        provider,
        transaction: unsignedBridgeTransaction.unsignedTx,
      });

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: BridgeWidgetViews.IN_PROGRESS,
            data: {
              token: token?.token!,
              transactionResponse,
              bridgeForm: {
                fromContractAddress: token?.token.address ?? '',
                fromAmount: amount,
              },
            },
          },
        },
      });
    } catch (err: any) {
      setLoading(false);

      if (err.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
        setShowTxnRejectedState(true);
        return;
      }
      if (err.type === CheckoutErrorType.UNPREDICTABLE_GAS_LIMIT
        || err.type === CheckoutErrorType.TRANSACTION_FAILED
        || err.type === CheckoutErrorType.INSUFFICIENT_FUNDS
        || (err.receipt && err.receipt.status === 0)) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: BridgeWidgetViews.FAIL,
              reason: 'Transaction failed',
              data: {
                fromContractAddress: token?.token.address ?? '',
                fromAmount: amount,
              },
            },
          },
        });
        return;
      }
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: SharedViews.ERROR_VIEW, error: err },
        },
      });
    }
  }, [
    checkout,
    provider,
    bridgeFormValidator,
    approvalTransaction,
    unsignedBridgeTransaction,
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
          {content.title}
        </Heading>
        <Box sx={formInputsContainerStyles}>
          <SelectForm
            id="bridge-token"
            options={tokensOptions}
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
            id="bridge-amount"
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
        {/** TODO: update here when we have the correct gas values from the estimator */}
        <Fees
          title={fees.title}
          fiatPricePrefix={content.fiatPricePrefix}
          gasFeeValue={gasFee}
          gasFeeToken={estimates?.gasFee?.token}
          gasFeeFiatValue={gasFeeFiatValue}
        />
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
          showAdjustAmount={(!token?.token.address || token.token.address === NATIVE)}
        />
      </Box>
    </Box>
  );
}
