import { HeaderNavigation } from 'components/Header/HeaderNavigation';
import { SimpleLayout } from 'components/SimpleLayout/SimpleLayout';
import { FooterLogo } from 'components/Footer/FooterLogo';
import { useContext } from 'react';
import { EventTargetContext } from 'context/event-target-context/EventTargetContext';
import { text } from 'resources/text/textConfig';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import {
  Body,
  Box, Button, Heading, Icon, MenuItem,
} from '@biom3/react';
import { ChainId, WalletProviderName } from '@imtbl/checkout-sdk';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { networkIconStyles } from '../components/WalletNetworkButtonStyles';

const testId = 'bridge-review';

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

const topMenuItemStyles = {
  borderBottomLeftRadius: '0px',
  borderBottomRightRadius: '0px',
  marginBottom: '2px',
};

const bottomMenuItemStyles = {
  borderTopLeftRadius: '0px',
  borderTopRightRadius: '0px',
};

const bridgeReviewWrapperStyles = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  paddingX: 'base.spacing.x4',
};

const bridgeReviewHeadingStyles = {
  paddingTop: 'base.spacing.x10',
  paddingBottom: 'base.spacing.x4',
};

const arrowIconWrapperStyles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingY: 'base.spacing.x1',
};

const arrowIconStyles = {
  width: 'base.icon.size.300',
  transform: 'rotate(270deg)',
};

const walletLogoStyles = {
  minWidth: 'base.icon.size.400',
  padding: '2px',
  backgroundColor: 'base.color.translucent.standard.100',
  borderRadius: 'base.borderRadius.x2',
};

const gasAmountHeadingStyles = {
  marginBottom: 'base.spacing.x4',
  color: 'base.color.text.secondary',
};

export function BridgeReview() {
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);
  // TODO: use data from context
  // const {
  //   bridgeState: {
  //     fromAmount, fromCurrency, fromAddress, toAddress, gasEstimate,
  //   },
  // } = useContext(XBridgeContext);

  // TODO: remove fake data
  const fromAmount = 'USDC 60.0';
  const fromFiatAmount = 'USD $60.00';
  const fromAddress = '0xA74...EFee';
  const fromWalletProviderName = 'metamask';
  const fromChainId = ChainId.ETHEREUM;
  const toAddress = '0x20fj...3fhjhg';
  const toWalletProviderName = 'passport';
  const toChainId = ChainId.IMTBL_ZKEVM_TESTNET;
  const gasEstimate = 'ETH 0.007984';
  const gasFiatEstimate = 'USD $15.00';
  const currencyImageUrlUsdc = 'https://design-system.immutable.com/hosted-for-ds/currency-icons/currency--usdc.svg';
  const currencyImageUrlEth = 'https://design-system.immutable.com/hosted-for-ds/currency-icons/currency--eth.svg';

  const {
    layoutHeading, heading, from, to, fees, footer,
  } = text.views[XBridgeWidgetViews.BRIDGE_REVIEW];

  return (
    <SimpleLayout
      testId="bridge-review"
      header={(
        <HeaderNavigation
          showBack
          title={layoutHeading}
          onBackButtonClick={() => {}}
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={(
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 'base.spacing.x4',
            paddingX: 'base.spacing.x4',
            backgroundColor: 'base.color.translucent.standard.200',
            width: '100%',
          }}
        >
          <Button size="large" sx={{ width: '100%' }}>
            {footer.buttonText}
          </Button>
          <FooterLogo />
        </Box>
      )}
    >
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
            price={fromAmount}
            fiatAmount={fromFiatAmount}
            currencyImageUrl={currencyImageUrlUsdc}
          />
        </MenuItem>
        <MenuItem
          testId={`${testId}-from-address`}
          size="xSmall"
          emphasized
          sx={bottomMenuItemStyles}
        >
          <MenuItem.FramedLogo
            logo={logo[fromWalletProviderName] as any}
            sx={walletLogoStyles}
          />
          <MenuItem.Label>
            <strong>{from.heading}</strong>
            {' '}
            {fromAddress}
          </MenuItem.Label>
          <MenuItem.IntentIcon
            icon={networkIcon[fromChainId] as any}
            sx={networkIconStyles(fromChainId)}
          />
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
          <MenuItem.FramedLogo
            logo={logo[toWalletProviderName] as any}
            sx={walletLogoStyles}
          />
          <MenuItem.Label>
            <strong>{to.heading}</strong>
            {' '}
            {toAddress}
          </MenuItem.Label>
          <MenuItem.IntentIcon
            icon={networkIcon[toChainId] as any}
            sx={networkIconStyles(toChainId)}
          />
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
            price={gasEstimate}
            fiatAmount={`~ ${gasFiatEstimate}`}
            currencyImageUrl={currencyImageUrlEth}
          />
        </MenuItem>
      </Box>
    </SimpleLayout>
  );
}
