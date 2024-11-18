import {
  useCallback, useContext, useMemo, useState, useEffect,
} from 'react';
import {
  Body, Box, Button, Heading, Icon, Logo, MenuItem,
} from '@biom3/react';
import {
  GasEstimateBridgeToL2Result,
  GasEstimateType,
  isAddressSanctioned,
  NamedBrowserProvider,
} from '@imtbl/checkout-sdk';
import { ApproveBridgeResponse, BridgeTxResponse } from '@imtbl/bridge-sdk';
import { useTranslation } from 'react-i18next';
import { formatUnits, parseUnits } from 'ethers';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';
import { abbreviateAddress } from '../../../lib/addressUtils';
import { CryptoFiatContext } from '../../../context/crypto-fiat-context/CryptoFiatContext';
import {
  isMetaMaskProvider,
  isPassportProvider,
  isWalletConnectProvider,
} from '../../../lib/provider';
import { calculateCryptoToFiat, getChainImage, isNativeToken } from '../../../lib/utils';
import {
  DEFAULT_QUOTE_REFRESH_INTERVAL,
  DEFAULT_TOKEN_DECIMALS,
  ETH_TOKEN_SYMBOL,
  IMX_TOKEN_SYMBOL,
  NATIVE,
  addChainChangedListener,
  getL1ChainId,
  getL2ChainId,
  networkName,
  removeChainChangedListener,
} from '../../../lib';
import { useInterval } from '../../../lib/hooks/useInterval';
import {
  UserJourney,
  useAnalytics,
} from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { NetworkSwitchDrawer } from '../../../components/NetworkSwitchDrawer/NetworkSwitchDrawer';
import { useWalletConnect } from '../../../lib/hooks/useWalletConnect';
import { NotEnoughGas } from '../../../components/NotEnoughGas/NotEnoughGas';
import {
  arrowIconStyles,
  arrowIconWrapperStyles,
  bottomMenuItemStyles,
  bridgeButtonIconLoadingStyle,
  bridgeReviewHeadingStyles,
  bridgeReviewWrapperStyles, rawImageStyle,
  topMenuItemStyles,
  wcStickerLogoStyles,
  wcWalletLogoStyles,
  networkIconStyles,
} from './BridgeReviewSummaryStyles';
import { BridgeActions, BridgeContext } from '../context/BridgeContext';
import {
  SharedViews,
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import { Fees } from '../../../components/Fees/Fees';
import { formatBridgeFees } from '../functions/BridgeFees';
import { RawImage } from '../../../components/RawImage/RawImage';
import { getErc20Contract } from '../functions/TransferErc20';
import {
  WithdrawalQueueDrawer,
  WithdrawalQueueWarningType,
} from '../../../components/WithdrawalQueueDrawer/WithdrawalQueueDrawer';

const testId = 'bridge-review-summary';

export function BridgeReviewSummary() {
  const { t } = useTranslation();
  const { viewDispatch } = useContext(ViewContext);

  const {
    bridgeState: {
      checkout, tokenBridge, from, to, token, amount, tokenBalances, riskAssessment,
    },
    bridgeDispatch,
  } = useContext(BridgeContext);
  const { environment } = checkout.config;

  const { track } = useAnalytics();

  const { cryptoFiatState } = useContext(CryptoFiatContext);
  const [loading, setLoading] = useState(false);
  const [estimates, setEstimates] = useState<GasEstimateBridgeToL2Result | undefined>(undefined);
  const [gasFee, setGasFee] = useState<string>('');
  const [gasFeeFiatValue, setGasFeeFiatValue] = useState<string>('');
  const [approveTransaction, setApproveTransaction] = useState<
  ApproveBridgeResponse | undefined
  >(undefined);
  const [transaction, setTransaction] = useState<BridgeTxResponse | undefined>(
    undefined,
  );
  const [showSwitchNetworkDrawer, setShowSwitchNetworkDrawer] = useState(false);

  const [fromWalletLogoUrl, setFromWalletLogoUrl] = useState<string | undefined>(
    undefined,
  );
  const [toWalletLogoUrl, setToWalletLogoUrl] = useState<string | undefined>(
    undefined,
  );
  const [fromWalletIsWalletConnect, setFromWalletIsWalletConnect] = useState<boolean>(false);
  const [toWalletIsWalletConnect, setToWalletIsWalletConnect] = useState<boolean>(false);
  const { isWalletConnectEnabled, getWalletLogoUrl } = useWalletConnect();

  // Not enough ETH to cover gas
  const [showNotEnoughGasDrawer, setShowNotEnoughGasDrawer] = useState(false);

  const [withdrawalQueueWarning, setWithdrawalQueueWarning] = useState<{
    visible: boolean;
    warningType?: WithdrawalQueueWarningType;
    threshold?: number;
  }>({ visible: false });

  const isTransfer = useMemo(() => from?.network === to?.network, [from, to]);
  const isDeposit = useMemo(
    () => (getL2ChainId(checkout.config) === to?.network),
    [from, to, checkout],
  );
  const insufficientFundsForGas = useMemo(() => {
    if (!estimates) return false;
    if (!token) return true;

    const nativeTokenBalance = tokenBalances
      .find((balance) => isNativeToken(balance.token.address));

    let requiredAmount = BigInt(estimates.fees.totalFees);
    if (isNativeToken(token.address)) {
      // add native move amount to required amount as they need to cover
      // the gas + move amount
      requiredAmount += (parseUnits(amount, token.decimals));
    }

    return !nativeTokenBalance || nativeTokenBalance.balance < requiredAmount;
  }, [tokenBalances, estimates, token, amount]);

  const displayAmount = useMemo(
    () => (token?.symbol ? `${token?.symbol} ${amount}` : `${amount}`),
    [token, amount],
  );
  const fromFiatAmount = useMemo(() => {
    if (!amount || !token) return '';
    return calculateCryptoToFiat(
      amount,
      token.symbol,
      cryptoFiatState.conversions,
    );
  }, [token, amount]);
  const fromAddress = useMemo(() => {
    if (!from) return '-';
    return from.walletAddress;
  }, [from]);

  const fromNetwork = useMemo(() => from && from.network, [from]);

  const toAddress = useMemo(() => {
    if (!to) return '-';
    return to.walletAddress;
  }, [to]);

  const toNetwork = useMemo(() => to?.network, [to]);

  const fetchTransferGasEstimate = useCallback(async () => {
    if (!tokenBridge || !amount || !from || !to || !token) return;

    const tokenToTransfer = token?.address?.toLowerCase() ?? NATIVE.toUpperCase();
    const gasEstimateResult = {
      gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
      fees: {},
      token: checkout.config.networkMap.get(from!.network)?.nativeCurrency,
    } as GasEstimateBridgeToL2Result;
    let estimatePromise: Promise<bigint>;
    if (tokenToTransfer === NATIVE.toLowerCase()) {
      estimatePromise = checkout.providerCall(from.browserProvider, async (provider) => await provider.estimateGas({
        to: toAddress,
        // If 'from' not provided it assumes the transaction is being sent from the zero address.
        // Estimation will fail unless the amount is within the zero addresses balance.
        from: fromAddress,
        value: parseUnits(amount, token.decimals),
      }));
    } else {
      const erc20 = getErc20Contract(tokenToTransfer, await from.browserProvider.getSigner());
      estimatePromise = erc20.transfer.estimateGas(toAddress, parseUnits(amount, token.decimals));
    }
    try {
      const [estimate, gasPrice] = await Promise.all([
        estimatePromise, (await from.browserProvider.getFeeData()).gasPrice,
      ]);
      const gas = estimate * (gasPrice ?? 0n);
      const formattedEstimate = formatUnits(gas, DEFAULT_TOKEN_DECIMALS);
      gasEstimateResult.fees.sourceChainGas = gas;
      gasEstimateResult.fees.totalFees = gas;
      setEstimates(gasEstimateResult);
      setGasFee(formattedEstimate);
      setGasFeeFiatValue(calculateCryptoToFiat(formattedEstimate, NATIVE.toUpperCase(), cryptoFiatState.conversions));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Unable to fetch gas estimate', e);
    }
  }, [checkout, from, to, token, amount]);

  const fetchBridgeGasEstimate = useCallback(async () => {
    if (!tokenBridge || !amount || !from || !to || !token) return;

    const bundledTxn = await tokenBridge!.getUnsignedBridgeBundledTx({
      senderAddress: fromAddress,
      recipientAddress: toAddress,
      token: token.address ?? NATIVE.toUpperCase(),
      amount: parseUnits(amount, token.decimals),
      sourceChainId: from?.network.toString(),
      destinationChainId: to?.network.toString(),
      gasMultiplier: 'auto',
    });

    if (bundledTxn.withdrawalQueueActivated) {
      setWithdrawalQueueWarning({
        visible: true,
        warningType: WithdrawalQueueWarningType.TYPE_ACTIVE_QUEUE,
      });
    } else if (bundledTxn.delayWithdrawalLargeAmount && bundledTxn.largeTransferThresholds) {
      const threshold = formatUnits(bundledTxn.largeTransferThresholds, token.decimals);

      setWithdrawalQueueWarning({
        visible: true,
        warningType: WithdrawalQueueWarningType.TYPE_THRESHOLD,
        threshold: parseInt(threshold, 10),
      });
    }

    const unsignedApproveTransaction = {
      contractToApprove: bundledTxn.contractToApprove,
      unsignedTx: bundledTxn.unsignedApprovalTx,
    };

    const unsignedTransaction = {
      feeData: bundledTxn.feeData,
      unsignedTx: bundledTxn.unsignedBridgeTx,
    };

    setApproveTransaction(unsignedApproveTransaction);
    setTransaction(unsignedTransaction);

    // todo: add approval gas fees

    const transactionFeeData = unsignedTransaction.feeData;

    const { totalFees, approvalFee } = transactionFeeData;

    let rawTotalFees = totalFees;
    if (!unsignedApproveTransaction.unsignedTx) {
      rawTotalFees = totalFees - approvalFee;
      transactionFeeData.approvalFee = BigInt(0);
    }

    const gasEstimateResult = {
      gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
      fees: {
        ...transactionFeeData,
        totalFees: rawTotalFees,
      },
      token: checkout.config.networkMap.get(from!.network)?.nativeCurrency,
    } as GasEstimateBridgeToL2Result;
    setEstimates(gasEstimateResult);
    const estimatedAmount = formatUnits(
      gasEstimateResult?.fees.totalFees || 0,
      DEFAULT_TOKEN_DECIMALS,
    );

    setGasFee(estimatedAmount);
    setGasFeeFiatValue(
      calculateCryptoToFiat(
        estimatedAmount,
        gasEstimateResult?.token?.symbol || '',
        cryptoFiatState.conversions,
      ),
    );
  }, [checkout, tokenBridge]);
  useInterval(() => {
    if (isTransfer) {
      fetchTransferGasEstimate();
    } else {
      fetchBridgeGasEstimate();
    }
  }, DEFAULT_QUOTE_REFRESH_INTERVAL);

  const formatFeeBreakdown = useCallback(
    () => formatBridgeFees(estimates, isDeposit, cryptoFiatState, t),
    [estimates, isDeposit],
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (isTransfer) {
        await fetchTransferGasEstimate();
      } else {
        await fetchBridgeGasEstimate();
      }
      setLoading(false);
    })();
  }, []);

  const handleNetworkSwitch = useCallback((provider: NamedBrowserProvider) => {
    bridgeDispatch({
      payload: {
        type: BridgeActions.SET_WALLETS_AND_NETWORKS,
        from: {
          browserProvider: provider,
          walletAddress: from?.walletAddress!,
          walletProviderInfo: from?.walletProviderInfo!,
          network: from?.network!,
        },
        to: {
          browserProvider: to?.browserProvider!,
          walletAddress: to?.walletAddress!,
          walletProviderInfo: to?.walletProviderInfo!,
          network: to?.network!,
        },
      },
    });
  }, [from?.browserProvider, from?.network, to?.browserProvider, to?.network]);

  useEffect(() => {
    if (!from?.browserProvider) return;

    const handleChainChanged = () => {
      handleNetworkSwitch(from?.browserProvider);
      setShowSwitchNetworkDrawer(false);
    };
    addChainChangedListener(from?.browserProvider, handleChainChanged);

    // eslint-disable-next-line consistent-return
    return () => {
      removeChainChangedListener(from?.browserProvider, handleChainChanged);
    };
  }, [from?.browserProvider]);

  useEffect(() => {
    if (isWalletConnectEnabled) {
      const isFromProviderWalletConnect = isWalletConnectProvider(from?.browserProvider.name);
      const isToProviderWalletConnect = isWalletConnectProvider(to?.browserProvider.name);
      setFromWalletIsWalletConnect(isFromProviderWalletConnect);
      setToWalletIsWalletConnect(isToProviderWalletConnect);
      (async () => {
        if (isFromProviderWalletConnect) {
          setFromWalletLogoUrl(await getWalletLogoUrl());
        }
        if (isToProviderWalletConnect) {
          setToWalletLogoUrl(await getWalletLogoUrl());
        }
      })();
    }
  }, [isWalletConnectEnabled, from?.browserProvider, to?.browserProvider]);

  useEffect(() => {
    if (insufficientFundsForGas) {
      setShowNotEnoughGasDrawer(true);
    }
  }, [insufficientFundsForGas]);

  const submitBridge = useCallback(async () => {
    if (!isTransfer && (!approveTransaction || !transaction)) return;
    if (!from || !to) return;
    if (riskAssessment && isAddressSanctioned(riskAssessment)) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: BridgeWidgetViews.SERVICE_UNAVAILABLE,
          },
        },
      });

      return;
    }

    if (insufficientFundsForGas) {
      setShowNotEnoughGasDrawer(true);
      return;
    }

    try {
      // eslint-disable-next-line max-len
      const currentChainId = await (from?.browserProvider.provider as any).request({ method: 'eth_chainId', params: [] });
      // eslint-disable-next-line radix
      const parsedChainId = parseInt(currentChainId.toString());
      if (parsedChainId !== from?.network) {
        setShowSwitchNetworkDrawer(true);
        return;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Current network check failed', err);
    }

    track({
      userJourney: UserJourney.BRIDGE,
      screen: 'Summary',
      control: 'Submit',
      controlType: 'Button',
      extras: {
        fromWalletAddress: fromAddress,
        fromNetwork,
        fromWallet: {
          address: fromAddress,
          rdns: from?.walletProviderInfo?.rdns,
          uuid: from?.walletProviderInfo?.uuid,
          isPassportWallet: isPassportProvider(from?.browserProvider.name),
          isMetaMask: isMetaMaskProvider(from?.browserProvider.name),
        },
        toWalletAddress: toAddress,
        toNetwork,
        toWallet: {
          address: toAddress,
          rdns: to?.walletProviderInfo?.rdns,
          uuid: to?.walletProviderInfo?.uuid,
          isPassportWallet: isPassportProvider(to?.browserProvider.name),
          isMetaMask: isMetaMaskProvider(to?.browserProvider.name),
        },
        amount,
        fiatAmount: fromFiatAmount,
        tokenAddress: token?.address,
        moveType: isTransfer ? 'transfer' : 'bridge',
      },
    });

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: BridgeWidgetViews.APPROVE_TRANSACTION,
          approveTransaction,
          transaction,
        },
      },
    });
  }, [
    viewDispatch,
    approveTransaction,
    transaction,
    from?.browserProvider,
    from?.network,
    from?.walletProviderInfo,
    to?.browserProvider,
    to?.network,
    to?.walletProviderInfo,
  ]);

  return (
    <Box testId={testId} sx={bridgeReviewWrapperStyles}>
      <Heading
        testId={`${testId}-heading`}
        size="small"
        weight="regular"
        sx={bridgeReviewHeadingStyles}
      >
        {t('views.BRIDGE_REVIEW.heading')}
      </Heading>

      {/* From review */}
      <MenuItem
        testId={`${testId}-from-amount`}
        size="small"
        emphasized
        sx={topMenuItemStyles}
      >
        <MenuItem.Label
          size="small"
          sx={{ marginBottom: 'base.spacing.x4', fontWeight: 'bold' }}
        >
          {t('views.BRIDGE_REVIEW.fromLabel.amountHeading')}
        </MenuItem.Label>
        <MenuItem.Caption />
        <MenuItem.PriceDisplay
          price={displayAmount ?? '-'}
          fiatAmount={`${t(
            'views.BRIDGE_REVIEW.fiatPricePrefix',
          )}${fromFiatAmount}`}
        />
      </MenuItem>
      <MenuItem
        testId={`${testId}-from-address`}
        size="xSmall"
        emphasized
        sx={bottomMenuItemStyles}
      >
        {(fromWalletIsWalletConnect && fromWalletLogoUrl) ? (
          <>
            <MenuItem.FramedImage
              imageUrl={fromWalletLogoUrl}
              alt="walletconnect"
              sx={wcWalletLogoStyles}
            />
            <Logo logo="WalletConnectSymbol" sx={wcStickerLogoStyles} />
          </>
        ) : (from?.walletProviderInfo && (
          <RawImage
            src={from?.walletProviderInfo.icon}
            alt={from?.walletProviderInfo.name}
            sx={rawImageStyle}
          />
        ))}
        <MenuItem.Label sx={{ marginLeft: (fromWalletIsWalletConnect && fromWalletLogoUrl) ? '0px' : '45px' }}>
          <strong>{t('views.BRIDGE_REVIEW.fromLabel.heading')}</strong>
          {' '}
          <Body
            size="small"
            sx={{
              color: 'base.color.text.body.secondary',
            }}
          >
            {abbreviateAddress(fromAddress ?? '')}
          </Body>
        </MenuItem.Label>
        {fromNetwork && (
          <MenuItem.FramedImage
            use={(
              <img
                src={getChainImage(environment, fromNetwork)}
                alt={networkName[fromNetwork]}
              />
            )}
            sx={networkIconStyles}
          />
        )}
      </MenuItem>

      <Box sx={arrowIconWrapperStyles}>
        <Icon icon="ArrowBackward" sx={arrowIconStyles} />
      </Box>

      {/* To review */}
      <MenuItem
        testId={`${testId}-to-address`}
        size="xSmall"
        emphasized
        sx={topMenuItemStyles}
      >
        {(toWalletIsWalletConnect && toWalletLogoUrl) ? (
          <>
            <MenuItem.FramedImage
              imageUrl={toWalletLogoUrl}
              alt="walletconnect"
              sx={wcWalletLogoStyles}
            />
            <Logo logo="WalletConnectSymbol" sx={wcStickerLogoStyles} />
          </>
        ) : (to?.walletProviderInfo && (
          <RawImage
            src={to?.walletProviderInfo.icon}
            alt={to?.walletProviderInfo.name}
            sx={rawImageStyle}
          />
        ))}
        <MenuItem.Label sx={{ marginLeft: (toWalletIsWalletConnect && toWalletLogoUrl) ? '0px' : '45px' }}>
          <strong>{t('views.BRIDGE_REVIEW.toLabel.heading')}</strong>
          {' '}
          <Body
            size="small"
            sx={{
              color: 'base.color.text.body.secondary',
            }}
          >
            {abbreviateAddress(toAddress ?? '')}
          </Body>
        </MenuItem.Label>
        {toNetwork && (
          <MenuItem.FramedImage
            use={(
              <img
                src={getChainImage(environment, toNetwork)}
                alt={networkName[toNetwork]}
              />
            )}
            sx={networkIconStyles}
          />
        )}
      </MenuItem>
      <Fees
        gasFeeValue={gasFee}
        gasFeeFiatValue={gasFeeFiatValue}
        gasFeeToken={estimates?.token}
        fees={formatFeeBreakdown()}
        onFeesClick={() => {
          track({
            userJourney: UserJourney.BRIDGE,
            screen: 'MoveCoins',
            control: 'ViewFees',
            controlType: 'Button',
          });
        }}
        sx={{ borderTopRightRadius: '0', borderTopLeftRadius: '0' }}
        loading={loading}
      />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          paddingY: 'base.spacing.x6',
          width: '100%',
        }}
      >
        {(estimates && !loading) && (
        <Button
          size="large"
          sx={{ width: '100%' }}
          onClick={submitBridge}
          disabled={loading}
          testId={`${testId}__submit-button`}
        >
          {loading ? (
            <Button.Icon icon="Loading" sx={bridgeButtonIconLoadingStyle} />
          ) : (
            t('views.BRIDGE_REVIEW.submitButton.buttonText')
          )}
        </Button>
        )}
      </Box>
      <NetworkSwitchDrawer
        visible={showSwitchNetworkDrawer}
        targetChainId={from?.network!}
        provider={from?.browserProvider!}
        checkout={checkout}
        onCloseDrawer={() => setShowSwitchNetworkDrawer(false)}
        onNetworkSwitch={handleNetworkSwitch}
      />
      <NotEnoughGas
        environment={checkout.config.environment}
        visible={showNotEnoughGasDrawer}
        onCloseDrawer={() => setShowNotEnoughGasDrawer(false)}
        walletAddress={from?.walletAddress || ''}
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

      <WithdrawalQueueDrawer
        visible={withdrawalQueueWarning.visible}
        warningType={withdrawalQueueWarning.warningType}
        checkout={checkout}
        onAdjustAmount={() => {
          setWithdrawalQueueWarning({ visible: false });
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: BridgeWidgetViews.BRIDGE_FORM,
              },
            },
          });
        }}
        onCloseDrawer={() => {
          setWithdrawalQueueWarning({ visible: false });
        }}
        threshold={withdrawalQueueWarning.threshold}
      />
    </Box>
  );
}
