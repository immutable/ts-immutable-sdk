import {
  useCallback, useContext, useMemo, useState, useEffect,
} from 'react';
import {
  Body, Box, Button, Heading, Icon, Logo, MenuItem,
} from '@biom3/react';
import {
  GasEstimateBridgeToL2Result,
  GasEstimateType,
} from '@imtbl/checkout-sdk';
import { ApproveBridgeResponse, BridgeTxResponse } from '@imtbl/bridge-sdk';
import { BigNumber, utils } from 'ethers';
import { useTranslation } from 'react-i18next';
import { Web3Provider } from '@ethersproject/providers';
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

const testId = 'bridge-review-summary';

export function BridgeReviewSummary() {
  const { t } = useTranslation();
  const { viewDispatch } = useContext(ViewContext);

  const {
    bridgeState: {
      checkout, tokenBridge, from, to, token, amount, tokenBalances,
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

    let requiredAmount = BigNumber.from(estimates.fees.totalFees);
    if (isNativeToken(token.address)) {
      // add native move amount to required amount as they need to cover
      // the gas + move amount
      requiredAmount = requiredAmount.add(utils.parseUnits(amount, token.decimals));
    }

    return !nativeTokenBalance || nativeTokenBalance.balance.lt(requiredAmount);
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
    let estimatePromise: Promise<BigNumber>;
    if (tokenToTransfer === NATIVE.toLowerCase()) {
      estimatePromise = checkout.providerCall(from.web3Provider, async (provider) => await provider.estimateGas({
        to: toAddress,
        // If 'from' not provided it assumes the transaction is being sent from the zero address.
        // Estimation will fail unless the amount is within the zero addresses balance.
        from: fromAddress,
        value: utils.parseUnits(amount, token.decimals),
      }));
    } else {
      const erc20 = getErc20Contract(tokenToTransfer, from.web3Provider.getSigner());
      estimatePromise = erc20.estimateGas.transfer(toAddress, utils.parseUnits(amount, token.decimals));
    }
    try {
      const [estimate, gasPrice] = await Promise.all([estimatePromise, from.web3Provider.getGasPrice()]);
      const gas = estimate.mul(gasPrice);
      const formattedEstimate = utils.formatUnits(gas, DEFAULT_TOKEN_DECIMALS);
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
      amount: utils.parseUnits(amount, token.decimals),
      sourceChainId: from?.network.toString(),
      destinationChainId: to?.network.toString(),
      gasMultiplier: 'auto',
    });

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
      rawTotalFees = totalFees.sub(approvalFee);
      transactionFeeData.approvalFee = BigNumber.from(0);
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
    const estimatedAmount = utils.formatUnits(
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

  const handleNetworkSwitch = useCallback((provider: Web3Provider) => {
    bridgeDispatch({
      payload: {
        type: BridgeActions.SET_WALLETS_AND_NETWORKS,
        from: {
          web3Provider: provider,
          walletAddress: from?.walletAddress!,
          walletProviderInfo: from?.walletProviderInfo!,
          network: from?.network!,
        },
        to: {
          web3Provider: to?.web3Provider!,
          walletAddress: to?.walletAddress!,
          walletProviderInfo: to?.walletProviderInfo!,
          network: to?.network!,
        },
      },
    });
  }, [from?.web3Provider, from?.network, to?.web3Provider, to?.network]);

  useEffect(() => {
    if (!from?.web3Provider) return;

    const handleChainChanged = () => {
      const newProvider = new Web3Provider(from?.web3Provider.provider);
      handleNetworkSwitch(newProvider);
      setShowSwitchNetworkDrawer(false);
    };
    addChainChangedListener(from?.web3Provider, handleChainChanged);

    // eslint-disable-next-line consistent-return
    return () => {
      removeChainChangedListener(from?.web3Provider, handleChainChanged);
    };
  }, [from?.web3Provider]);

  useEffect(() => {
    if (isWalletConnectEnabled) {
      const isFromProviderWalletConnect = isWalletConnectProvider(from?.web3Provider);
      const isToProviderWalletConnect = isWalletConnectProvider(to?.web3Provider);
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
  }, [isWalletConnectEnabled, from?.web3Provider, to?.web3Provider]);

  useEffect(() => {
    if (insufficientFundsForGas) {
      setShowNotEnoughGasDrawer(true);
    }
  }, [insufficientFundsForGas]);

  const submitBridge = useCallback(async () => {
    if (!isTransfer && (!approveTransaction || !transaction)) return;

    if (insufficientFundsForGas) {
      setShowNotEnoughGasDrawer(true);
      return;
    }

    try {
      const currentChainId = await (from?.web3Provider.provider as any).request({ method: 'eth_chainId', params: [] });
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
          isPassportWallet: isPassportProvider(from?.web3Provider),
          isMetaMask: isMetaMaskProvider(from?.web3Provider),
        },
        toWalletAddress: toAddress,
        toNetwork,
        toWallet: {
          address: toAddress,
          rdns: to?.walletProviderInfo?.rdns,
          uuid: to?.walletProviderInfo?.uuid,
          isPassportWallet: isPassportProvider(to?.web3Provider),
          isMetaMask: isMetaMaskProvider(to?.web3Provider),
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
    from?.web3Provider,
    from?.network,
    from?.walletProviderInfo,
    to?.web3Provider,
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
        provider={from?.web3Provider!}
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
    </Box>
  );
}
