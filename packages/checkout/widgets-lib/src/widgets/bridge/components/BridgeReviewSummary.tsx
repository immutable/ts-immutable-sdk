import {
  useCallback, useContext, useMemo, useState, useEffect,
} from 'react';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import {
  Body, Box, Button, Heading, Icon, MenuItem,
} from '@biom3/react';
import {
  GasEstimateBridgeToL2Result,
  GasEstimateType,
} from '@imtbl/checkout-sdk';
import { abbreviateAddress } from 'lib/addressUtils';
import { CryptoFiatContext } from 'context/crypto-fiat-context/CryptoFiatContext';
import {
  getWalletProviderNameByProvider,
  isMetaMaskProvider,
  isPassportProvider,
} from 'lib/providerUtils';
import { calculateCryptoToFiat } from 'lib/utils';
import {
  DEFAULT_QUOTE_REFRESH_INTERVAL,
  DEFAULT_TOKEN_DECIMALS,
  NATIVE,
  networkIcon,
} from 'lib';
import { useInterval } from 'lib/hooks/useInterval';
import { ApproveBridgeResponse, BridgeTxResponse } from '@imtbl/bridge-sdk';
import { BigNumber, utils } from 'ethers';
import {
  UserJourney,
  useAnalytics,
} from 'context/analytics-provider/SegmentAnalyticsProvider';
import { useTranslation } from 'react-i18next';
import { getWalletLogoByName } from 'lib/logoUtils';
import { networkIconStyles } from './WalletNetworkButtonStyles';
import {
  arrowIconStyles,
  arrowIconWrapperStyles,
  bottomMenuItemStyles,
  bridgeButtonIconLoadingStyle,
  bridgeReviewHeadingStyles,
  bridgeReviewWrapperStyles,
  topMenuItemStyles,
} from './BridgeReviewSummaryStyles';
import { BridgeContext } from '../context/BridgeContext';
import {
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import { Fees } from '../../../components/Fees/Fees';
import { formatBridgeFees } from '../functions/BridgeFees';

const testId = 'bridge-review-summary';

export function BridgeReviewSummary() {
  const { t } = useTranslation();
  const { viewDispatch } = useContext(ViewContext);

  const {
    bridgeState: {
      checkout, tokenBridge, from, to, token, amount,
    },
  } = useContext(BridgeContext);

  const { track } = useAnalytics();

  const { cryptoFiatState } = useContext(CryptoFiatContext);
  const [loading, setLoading] = useState(false);
  const [estimates, setEstimates] = useState<any | undefined>(undefined);
  const [gasFee, setGasFee] = useState<string>('');
  const [gasFeeFiatValue, setGasFeeFiatValue] = useState<string>('');
  const [approveTransaction, setApproveTransaction] = useState<
  ApproveBridgeResponse | undefined
  >(undefined);
  const [transaction, setTransaction] = useState<BridgeTxResponse | undefined>(
    undefined,
  );

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

  const fromWalletProviderName = useMemo(
    () => getWalletProviderNameByProvider(from?.web3Provider),
    [from],
  );
  const fromNetwork = useMemo(() => from && from.network, [from]);
  const fromLogo = getWalletLogoByName(fromWalletProviderName);

  const toAddress = useMemo(() => {
    if (!to) return '-';
    return to.walletAddress;
  }, [to]);
  const toWalletProviderName = useMemo(
    () => getWalletProviderNameByProvider(to?.web3Provider),
    [to],
  );
  const toNetwork = useMemo(() => to?.network, [to]);
  const toLogo = getWalletLogoByName(toWalletProviderName);

  const fetchGasEstimate = useCallback(async () => {
    if (!tokenBridge || !amount || !from || !to || !token) return;

    const [unsignedApproveTransaction, unsignedTransaction] = await Promise.all(
      [
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
      ],
    );

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
  useInterval(() => fetchGasEstimate(), DEFAULT_QUOTE_REFRESH_INTERVAL);

  const formatFeeBreakdown = useCallback(
    (): any => formatBridgeFees(estimates, cryptoFiatState, t),
    [estimates],
  );

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
        fiatAmount: fromFiatAmount,
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
        <MenuItem.Label
          size="small"
          sx={{ marginBottom: 'base.spacing.x4', fontWeight: 'bold' }}
        >
          {t('views.BRIDGE_REVIEW.fromLabel.amountHeading')}
        </MenuItem.Label>
        <MenuItem.Caption />
        <MenuItem.PriceDisplay
          use={<Heading size="xSmall" weight="light" />}
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
        {fromWalletProviderName && (
          <MenuItem.FramedLogo
            logo={fromLogo}
            sx={{ backgroundColor: 'base.color.translucent.standard.200' }}
          />
        )}
        <MenuItem.Label>
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
            logo={toLogo}
            sx={{ backgroundColor: 'base.color.translucent.standard.200' }}
          />
        )}
        <MenuItem.Label>
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
          <MenuItem.IntentIcon
            icon={networkIcon[toNetwork] as any}
            sx={networkIconStyles(toNetwork)}
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
      </Box>
    </Box>
  );
}
