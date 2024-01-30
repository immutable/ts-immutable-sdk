import {
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import {
  Accordion,
  Body,
  Box, Button, Heading, Icon, MenuItem, PriceDisplay,
} from '@biom3/react';
import {
  ChainId, GasEstimateBridgeToL2Result, GasEstimateType, WalletProviderName,
} from '@imtbl/checkout-sdk';
import { abbreviateAddress } from 'lib/addressUtils';
import { CryptoFiatContext } from 'context/crypto-fiat-context/CryptoFiatContext';
import { isMetaMaskProvider, isPassportProvider } from 'lib/providerUtils';
import { calculateCryptoToFiat, tokenValueFormat } from 'lib/utils';
import { Web3Provider } from '@ethersproject/providers';
import { DEFAULT_QUOTE_REFRESH_INTERVAL, DEFAULT_TOKEN_DECIMALS, NATIVE } from 'lib';
import { useInterval } from 'lib/hooks/useInterval';
import { FeesBreakdown } from 'components/FeesBreakdown/FeesBreakdown';
import { ApproveBridgeResponse, BridgeTxResponse } from '@imtbl/bridge-sdk';
import { utils } from 'ethers';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { useTranslation } from 'react-i18next';
import { networkIconStyles } from './WalletNetworkButtonStyles';
import {
  arrowIconStyles,
  arrowIconWrapperStyles,
  bottomMenuItemStyles,
  bridgeButtonIconLoadingStyle,
  bridgeReviewHeadingStyles,
  bridgeReviewWrapperStyles,
  gasAmountHeadingStyles,
  topMenuItemStyles,
} from './BridgeReviewSummaryStyles';
import { BridgeContext } from '../context/BridgeContext';
import { ViewActions, ViewContext } from '../../../context/view-context/ViewContext';

const networkIcon = {
  [ChainId.IMTBL_ZKEVM_DEVNET]: 'Immutable',
  [ChainId.IMTBL_ZKEVM_MAINNET]: 'Immutable',
  [ChainId.IMTBL_ZKEVM_TESTNET]: 'Immutable',
  [ChainId.ETHEREUM]: 'EthToken',
  [ChainId.SEPOLIA]: 'EthToken',
};

const logo = {
  [WalletProviderName.PASSPORT]: 'PassportSymbolOutlined',
  [WalletProviderName.METAMASK]: 'MetaMaskSymbol',
};

const testId = 'bridge-review-summary';

export function BridgeReviewSummary() {
  const { t } = useTranslation();
  const { viewDispatch } = useContext(ViewContext);

  const {
    bridgeState: {
      checkout,
      tokenBridge,
      from,
      to,
      token,
      amount,
    },
  } = useContext(BridgeContext);

  const { track } = useAnalytics();

  const { cryptoFiatState } = useContext(CryptoFiatContext);
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false);

  const [loading, setLoading] = useState(false);
  const [estimates, setEstimates] = useState<any | undefined>(undefined);
  const [gasFee, setGasFee] = useState<string>('');
  const [gasFeeFiatValue, setGasFeeFiatValue] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [approveTransaction, setApproveTransaction] = useState<ApproveBridgeResponse | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [transaction, setTransaction] = useState<BridgeTxResponse | undefined>(undefined);

  const walletProviderName = (provider: Web3Provider | undefined) => (isPassportProvider(provider)
    ? WalletProviderName.PASSPORT
    : WalletProviderName.METAMASK);

  const displayAmount = useMemo(() => (token?.symbol ? `${token?.symbol} ${amount}` : `${amount}`), [token, amount]);
  const fromFiatAmount = useMemo(() => {
    if (!amount || !token) return '';
    return calculateCryptoToFiat(amount, token.symbol, cryptoFiatState.conversions);
  }, [token, amount]);
  const fromAddress = useMemo(() => {
    if (!from) return '-';
    return from.walletAddress;
  }, [from]);

  const fromWalletProviderName = useMemo(() => walletProviderName(from?.web3Provider), [from]);
  const fromNetwork = useMemo(() => from && from.network, [from]);

  const toAddress = useMemo(() => {
    if (!to) return '-';
    return to.walletAddress;
  }, [to]);
  const toWalletProviderName = useMemo(() => walletProviderName(to?.web3Provider), [to]);
  const toNetwork = useMemo(() => to?.network, [to]);

  const fetchGasEstimate = useCallback(async () => {
    if (!tokenBridge || !amount || !from || !to || !token) return;

    const [unsignedApproveTransaction, unsignedTransaction] = await Promise.all([
      tokenBridge!.getUnsignedApproveBridgeTx({
        senderAddress: fromAddress,
        token: token.address ?? NATIVE.toUpperCase(),
        amount: utils.parseUnits(amount, token.decimals),
        sourceChainId: from?.network.toString(),
        destinationChainId: to?.network.toString(),
      }),
      tokenBridge!.getUnsignedBridgeTx({
        senderAddress: fromAddress,
        recipientAddress: toAddress,
        token: token.address ?? NATIVE.toUpperCase(),
        amount: utils.parseUnits(amount, token.decimals),
        sourceChainId: from?.network.toString(),
        destinationChainId: to?.network.toString(),
        gasMultiplier: 1.1,
      }),
    ]);

    setApproveTransaction(unsignedApproveTransaction);
    setTransaction(unsignedTransaction);

    // todo: add approval gas fees

    const transactionFeeData = unsignedTransaction.feeData;

    const { totalFees, approvalFee } = transactionFeeData;

    let rawTotalFees = totalFees;
    if (!unsignedApproveTransaction.unsignedTx) {
      rawTotalFees = totalFees.sub(approvalFee);
    }

    const gasEstimateResult = {
      gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
      fees: { totalFees: rawTotalFees },
      token: checkout.config.networkMap.get(from!.network)?.nativeCurrency,
    } as GasEstimateBridgeToL2Result;

    setEstimates(gasEstimateResult);
    const estimatedAmount = utils.formatUnits(
      gasEstimateResult?.fees.totalFees || 0,
      DEFAULT_TOKEN_DECIMALS,
    );

    setGasFee(estimatedAmount);
    setGasFeeFiatValue(calculateCryptoToFiat(
      estimatedAmount,
      gasEstimateResult?.token?.symbol || '',
      cryptoFiatState.conversions,
    ));
  }, [checkout, tokenBridge]);
  useInterval(() => fetchGasEstimate(), DEFAULT_QUOTE_REFRESH_INTERVAL);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchGasEstimate();
      setLoading(false);
    })();
  }, []);

  const submitBridge = useCallback(async () => {
    if (!approveTransaction || !transaction) return;

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
          isPassportWallet: isPassportProvider(from?.web3Provider),
          isMetaMask: isMetaMaskProvider(from?.web3Provider),
        },
        toWalletAddress: toAddress,
        toNetwork,
        toWallet: {
          address: toAddress,
          isPassportWallet: isPassportProvider(to?.web3Provider),
          isMetaMask: isMetaMaskProvider(to?.web3Provider),
        },
        amount,
        tokenAddress: token?.address,
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
  }, [viewDispatch, approveTransaction, transaction]);

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
        <MenuItem.Label size="small" sx={{ marginBottom: 'base.spacing.x4', fontWeight: 'bold' }}>
          {t('views.BRIDGE_REVIEW.fromLabel.amountHeading')}
        </MenuItem.Label>
        <MenuItem.Caption />
        <MenuItem.PriceDisplay
          use={<Heading size="xSmall" weight="light" />}
          price={displayAmount ?? '-'}
          fiatAmount={`${t('views.BRIDGE_REVIEW.fiatPricePrefix')}${fromFiatAmount}`}
        />
      </MenuItem>
      <MenuItem
        testId={`${testId}-from-address`}
        size="xSmall"
        emphasized
        sx={bottomMenuItemStyles}
      >
        {fromWalletProviderName && (
          <MenuItem.FramedLogo
            logo={logo[fromWalletProviderName] as any}
            sx={{ backgroundColor: 'base.color.translucent.standard.200' }}
          />
        )}
        <MenuItem.Label>
          <strong>{t('views.BRIDGE_REVIEW.fromLabel.heading')}</strong>
          {' '}
          <Body
            size="small"
            sx={{
              color: 'base.color.text.secondary',
            }}
          >
            {abbreviateAddress(fromAddress ?? '')}
          </Body>
        </MenuItem.Label>
        {fromNetwork && (
          <MenuItem.IntentIcon
            icon={networkIcon[fromNetwork] as any}
            sx={networkIconStyles(fromNetwork)}
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
        {toWalletProviderName && (
          <MenuItem.FramedLogo
            logo={logo[toWalletProviderName] as any}
            sx={{ backgroundColor: 'base.color.translucent.standard.200' }}
          />
        )}
        <MenuItem.Label>
          <strong>{t('views.BRIDGE_REVIEW.toLabel.heading')}</strong>
          {' '}
          <Body
            size="small"
            sx={{
              color: 'base.color.text.secondary',
            }}
          >
            {abbreviateAddress(toAddress ?? '')}
          </Body>
        </MenuItem.Label>
        {toNetwork && (
          <MenuItem.IntentIcon
            icon={networkIcon[toNetwork] as any}
            sx={networkIconStyles(toNetwork)}
          />
        )}
      </MenuItem>
      {gasFee && (
        <Accordion
          targetClickOveride={() => setShowFeeBreakdown(true)}
          sx={bottomMenuItemStyles}
        >
          <Accordion.TargetLeftSlot>
            <Body size="medium" sx={gasAmountHeadingStyles}>
              {t('views.BRIDGE_REVIEW.fees.heading')}
            </Body>
          </Accordion.TargetLeftSlot>
          <Accordion.TargetRightSlot>
            <PriceDisplay
              testId={`${testId}-gas-amount__priceDisplay`}
              fiatAmount={`${t('views.BRIDGE_REVIEW.fiatPricePrefix')}${gasFeeFiatValue}`}
              price={`${estimates?.token?.symbol} ${tokenValueFormat(gasFee)}` ?? '-'}
            />
          </Accordion.TargetRightSlot>
        </Accordion>
      )}
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
        <Button
          size="large"
          sx={{ width: '100%' }}
          onClick={submitBridge}
          disabled={loading}
          testId={`${testId}__submit-button`}
        >
          {loading ? (
            <Button.Icon icon="Loading" sx={bridgeButtonIconLoadingStyle} />
          ) : t('views.BRIDGE_REVIEW.submitButton.buttonText')}
        </Button>
      </Box>
      <FeesBreakdown
        totalFiatAmount={`${t('views.BRIDGE_REVIEW.fiatPricePrefix')}${gasFeeFiatValue}`}
        totalAmount={gasFee}
        tokenSymbol={estimates?.token?.symbol || ''}
        fees={[
          {
            label: t('drawers.feesBreakdown.fees.gas.label'),
            fiatAmount: `${t('views.BRIDGE_REVIEW.fiatPricePrefix')}${gasFeeFiatValue}`,
            amount: gasFee,
          },
        ]}
        visible={showFeeBreakdown}
        onCloseDrawer={() => setShowFeeBreakdown(false)}
      />
    </Box>
  );
}
