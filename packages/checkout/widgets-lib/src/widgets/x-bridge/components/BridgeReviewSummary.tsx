import { text } from 'resources/text/textConfig';
import { useContext, useMemo } from 'react';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import {
  Body,
  Box, Heading, Icon, MenuItem,
} from '@biom3/react';
import { ChainId, WalletProviderName } from '@imtbl/checkout-sdk';
import { abbreviateAddress } from 'lib/addressUtils';
import { CryptoFiatContext } from 'context/crypto-fiat-context/CryptoFiatContext';
import { isPassportProvider } from 'lib/providerUtils';
import { calculateCryptoToFiat } from 'lib/utils';
import { Web3Provider } from '@ethersproject/providers';
import { DEFAULT_QUOTE_REFRESH_INTERVAL } from 'lib';
import { useInterval } from 'lib/hooks/useInterval';
import { networkIconStyles } from './WalletNetworkButtonStyles';
import {
  arrowIconStyles,
  arrowIconWrapperStyles,
  bottomMenuItemStyles,
  bridgeReviewHeadingStyles,
  bridgeReviewWrapperStyles,
  gasAmountHeadingStyles,
  topMenuItemStyles,
  walletLogoStyles,
} from './BridgeReviewSummaryStyles';
import { XBridgeContext } from '../context/XBridgeContext';

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
  const {
    heading, fromLabel, toLabel, fees, fiatPricePrefix,
  } = text.views[XBridgeWidgetViews.BRIDGE_REVIEW];

  const {
    bridgeState: {
      from,
      to,
      token,
      amount,
    },
  } = useContext(XBridgeContext);

  const { cryptoFiatState } = useContext(CryptoFiatContext);

  const walletProviderName = (provider: Web3Provider | undefined) => (isPassportProvider(provider)
    ? WalletProviderName.PASSPORT
    : WalletProviderName.METAMASK);

  const fromAmount = useMemo(() => (token?.symbol ? `${token?.symbol} ${amount}` : `${amount}`), [token, amount]);
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

  const fetchGasEstimate = () => {
    // eslint-disable-next-line no-console
    console.log('fetch gas estimate');
  };
  useInterval(() => fetchGasEstimate(), DEFAULT_QUOTE_REFRESH_INTERVAL);

  // Fetch on useInterval interval when available
  const gasEstimate = 'ETH 0.007984';
  const gasFiatEstimate = '15.00';

  return (
    <Box testId={testId} sx={bridgeReviewWrapperStyles}>
      <Heading
        testId={`${testId}-heading`}
        size="small"
        weight="regular"
        sx={bridgeReviewHeadingStyles}
      >
        {heading}
      </Heading>

      {/* From review */}
      <MenuItem
        testId={`${testId}-from-amount`}
        size="small"
        emphasized
        sx={topMenuItemStyles}
      >
        <MenuItem.Label size="small" sx={{ marginBottom: 'base.spacing.x4', fontWeight: 'bold' }}>
          {fromLabel.amountHeading}
        </MenuItem.Label>
        <MenuItem.Caption />
        <MenuItem.PriceDisplay
          use={<Heading size="xSmall" weight="light" />}
          price={fromAmount ?? '-'}
          fiatAmount={`${fiatPricePrefix}${fromFiatAmount}`}
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
            sx={walletLogoStyles(fromWalletProviderName)}
          />
        )}
        <MenuItem.Label>
          <strong>{fromLabel.heading}</strong>
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
            sx={walletLogoStyles(toWalletProviderName)}
          />
        )}
        <MenuItem.Label>
          <strong>{toLabel.heading}</strong>
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
      <MenuItem
        testId={`${testId}-gas-amount`}
        size="small"
        emphasized
        sx={bottomMenuItemStyles}
      >
        <MenuItem.Label
          size="small"
          sx={gasAmountHeadingStyles}
        >
          {fees.heading}
        </MenuItem.Label>
        <MenuItem.PriceDisplay
          use={<Body size="xSmall" />}
          price={gasEstimate ?? '-'}
          fiatAmount={`${fiatPricePrefix}${gasFiatEstimate}`}
        />
      </MenuItem>
    </Box>
  );
}
