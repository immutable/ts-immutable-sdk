import {
  Box, Button, Heading, OptionKey,
} from '@biom3/react';
import {
  CheckoutErrorType, GasEstimateBridgeToL2Result, GasEstimateType, GetBalanceResult, TokenInfo,
} from '@imtbl/checkout-sdk';
import {
  useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { ApproveBridgeResponse, BridgeDepositResponse } from '@imtbl/bridge-sdk';
import { utils } from 'ethers';
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
import { DEFAULT_TOKEN_DECIMALS, DEFAULT_QUOTE_REFRESH_INTERVAL } from '../../../lib';
import { swapButtonIconLoadingStyle } from '../../swap/components/SwapButtonStyles';
import { TransactionRejected } from '../../../components/TransactionRejected/TransactionRejected';

interface BridgeFormProps {
  testId?: string;
  defaultAmount?: string;
  defaultTokenAddress?: string;
}

export function BridgeForm(props: BridgeFormProps) {
  const {
    bridgeState: {
      provider,
      checkout,
      tokenBridge,
      network,
      tokenBalances,
      allowedTokens,
    },
  } = useContext(BridgeContext);
  const { cryptoFiatState, cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const { viewDispatch } = useContext(ViewContext);
  const { testId, defaultAmount, defaultTokenAddress } = props;
  const { content, bridgeForm, fees } = text.views[BridgeWidgetViews.BRIDGE];

  // Form state
  const [amount, setAmount] = useState<string>(defaultAmount || '');
  const [amountError, setAmountError] = useState<string>('');
  const [token, setToken] = useState<GetBalanceResult | null>(null);
  const [tokenError, setTokenError] = useState<string>('');
  const [amountFiatValue, setAmountFiatValue] = useState<string>('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fee estimates & transactions
  const [isFetching, setIsFetching] = useState(false);
  const [estimates, setEstimates] = useState<GasEstimateBridgeToL2Result | undefined>(undefined);
  const [gasFee, setGasFee] = useState<string>('');
  const [gasFeeFiatValue, setGasFeeFiatValue] = useState<string>('');
  const [approvalTransaction, setApprovalTransaction] = useState<ApproveBridgeResponse | undefined>(undefined);
  const [unsignedBridgeTransaction,
    setUnsignedBridgeTransaction] = useState<BridgeDepositResponse | undefined>(undefined);
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [tokensOptions, setTokensOptions] = useState<CoinSelectorOptionProps[]>([]);

  // user rejects transaction
  const [showTxnRejectedState, setShowTxnRejectedState] = useState(false);

  const formatTokenOptionsId = useCallback((symbol: string, address?: string) => {
    if (!address) return symbol.toLowerCase();
    return `${symbol.toLowerCase()}-${address.toLowerCase()}`;
  }, []);

  useEffect(() => {
    if (tokenBalances.length === 0 || cryptoFiatState.conversions.size === 0) return;
    const options = tokenBalances
      .filter((b) => b.balance.gt(0))
      .map(
        (t) => ({
          id: formatTokenOptionsId(t.token.symbol, t.token.address),
          name: t.token.name,
          symbol: t.token.symbol,
          icon: t.token.icon,
          balance: {
            formattedFiatAmount: calculateCryptoToFiat(
              t.formattedBalance,
              t.token.symbol,
              cryptoFiatState.conversions,
            ),
            formattedAmount: tokenValueFormat(t.formattedBalance),
          },
        } as CoinSelectorOptionProps),
      );
    setTokensOptions(options);
  }, [tokenBalances, cryptoFiatState.conversions, formatTokenOptionsId]);

  const selectedOption = useMemo(
    () => (token && token ? formatTokenOptionsId(token.token.symbol, token.token.address) : undefined),
    [token],
  );
  const getTokenAddress = (selectedToken?: TokenInfo) => ((selectedToken?.address === ''
    || selectedToken?.address === undefined)
    ? 'NATIVE'
    : selectedToken.address);

  const canFetchEstimates = (): boolean => {
    if (Number.isNaN(parseFloat(amount))) return false;
    if (parseFloat(amount) <= 0) return false;
    if (!token) return false;
    if (isFetching) return false;
    return true;
  };

  const getUnsignedTransactions = async ()
  : Promise<{ approveRes: ApproveBridgeResponse, bridgeTxn:BridgeDepositResponse } | undefined> => {
    if (!checkout || !provider || !tokenBridge || !token || !tokenAddress) return;

    const depositorAddress = await provider.getSigner().getAddress();
    const depositAmount = utils.parseUnits(amount, token.token.decimals);

    const approveRes: ApproveBridgeResponse = await tokenBridge.getUnsignedApproveBridgeTx({
      depositorAddress,
      token: tokenAddress,
      depositAmount,
    });

    const bridgeTxn: BridgeDepositResponse = await tokenBridge.getUnsignedDepositTx({
      depositorAddress,
      recipientAddress: depositorAddress,
      token: tokenAddress,
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

    setTokenAddress(getTokenAddress(selected.token));
    setToken(selected);
    setTokenError('');
  };

  /**
   * This effect is used to set the default token option
   * Set as the token that is passed in as a prop if it (is allowed and) has an available balance
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

    if (!defaultToken) {
      defaultToken = tokenBalances.find(
        (balance) => balance.token.symbol === network?.nativeCurrency.symbol,
      );
    }

    setToken(defaultToken || null);
    setTokenAddress(getTokenAddress(defaultToken?.token));
  }, [tokenBalances, network, defaultTokenAddress]);

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
    if (validateTokenError || validateAmountError) return false;
    return true;
  }, [token, amount, setTokenError, setAmountError]);

  const submitBridge = useCallback(async () => {
    if (!bridgeFormValidator()) return;
    if (!checkout || !provider || !token || !unsignedBridgeTransaction) return;

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
                  tokenAddress,
                  amount,
                },
              },
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
                tokenAddress: token?.token.address ?? '',
                amount,
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
                tokenAddress: token?.token.address ?? '',
                amount,
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
  }, [checkout, provider, bridgeFormValidator, approvalTransaction, unsignedBridgeTransaction]);

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
      </Box>
    </Box>
  );
}
