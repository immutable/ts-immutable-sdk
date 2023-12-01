import { text } from 'resources/text/textConfig';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import {
  Body,
  Box, Heading, Icon, MenuItem,
} from '@biom3/react';
import { ChainId, WalletProviderName } from '@imtbl/checkout-sdk';
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

const currencyImageUrl = {
  usdc: 'https://design-system.immutable.com/hosted-for-ds/currency-icons/currency--usdc.svg',
  eth: 'https://design-system.immutable.com/hosted-for-ds/currency-icons/currency--eth.svg',
  imx: 'https://design-system.immutable.com/hosted-for-ds/currency-icons/currency--imx.svg',
};

interface BridgeReviewSummaryProps {
  testId?: string;
  fromAmount?: string;
  fromFiatAmount?: string;
  fromAddress: string | null;
  fromWalletProviderName?: WalletProviderName;
  fromNetwork?: ChainId | null;
  toAddress: string | null;
  toWalletProviderName?: WalletProviderName;
  toNetwork?: ChainId | null;
  gasEstimate?: string;
  gasFiatEstimate?: string;
}

export function BridgeReviewSummary({
  testId,
  fromAmount,
  fromFiatAmount,
  fromAddress,
  fromWalletProviderName,
  fromNetwork,
  toAddress,
  toWalletProviderName,
  toNetwork,
  gasEstimate,
  gasFiatEstimate,
}: BridgeReviewSummaryProps) {
  const {
    heading, from, to, fees,
  } = text.views[XBridgeWidgetViews.BRIDGE_REVIEW];

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
          {from.amountHeading}
        </MenuItem.Label>
        <MenuItem.Caption />
        <MenuItem.PriceDisplay
          use={<Heading size="xSmall" weight="light" />}
          price={fromAmount ?? '-'}
          fiatAmount={fromFiatAmount}
          currencyImageUrl={currencyImageUrl.usdc}
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
          <strong>{from.heading}</strong>
          {' '}
          {fromAddress}
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
          <strong>{to.heading}</strong>
          {' '}
          {toAddress}
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
          fiatAmount={`~ ${gasFiatEstimate}`}
          currencyImageUrl={currencyImageUrl.eth}
        />
      </MenuItem>
    </Box>
  );
}
