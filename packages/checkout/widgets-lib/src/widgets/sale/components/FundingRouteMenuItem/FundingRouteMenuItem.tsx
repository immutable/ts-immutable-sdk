import {
  Button, Heading, HorizontalMenu, MenuItem,
} from '@biom3/react';
import { ChainId, FundingRoute } from '@imtbl/checkout-sdk';
import { designTokens } from '@biom3/design-tokens';
import { tokenValueFormat } from '../../../../lib/utils';
import { useSaleContext } from '../../context/SaleContextProvider';
import { getChainNameById } from '../../../../lib/chainName';

// Taken from packages/checkout/widgets-lib/src/widgets/wallet/components/NetworkMenu/NetworkMenu.tsx
const networkIcon = {
  [ChainId.IMTBL_ZKEVM_DEVNET]: 'Immutable',
  [ChainId.IMTBL_ZKEVM_MAINNET]: 'Immutable',
  [ChainId.IMTBL_ZKEVM_TESTNET]: 'Immutable',
  [ChainId.ETHEREUM]: 'EthToken',
  [ChainId.SEPOLIA]: 'EthToken',
};

const logoColour = {
  [ChainId.IMTBL_ZKEVM_DEVNET]: 'base.color.text.link.primary',
  [ChainId.IMTBL_ZKEVM_TESTNET]: 'base.color.text.link.primary',
  [ChainId.IMTBL_ZKEVM_MAINNET]: 'base.color.text.link.primary',
  [ChainId.ETHEREUM]: 'base.color.accent.5',
  [ChainId.SEPOLIA]: 'base.color.accent.5',
};

export interface FundingRouteMenuItemProps {
  onClick: () => void;
  fundingRoute: FundingRoute;
  toggleVisible?: boolean;
  selected?: boolean;
}
export function FundingRouteMenuItem({
  onClick, fundingRoute, toggleVisible, selected,
}: FundingRouteMenuItemProps) {
  const firstFundingStep = fundingRoute.steps[0];

  const { isPassportWallet } = useSaleContext();

  // todo - calculate these in useSmartCheckout hook - later PR
  const usdAmount = '2.49';
  const totalFees = '5.01';

  const networkLabel = () => (
    <HorizontalMenu.Button
      rc={<a />}
      sx={{
        pointerEvents: 'none',
        cursor: 'default',
        height: '100%',
        marginLeft: 'base.spacing.x2',
        fontSize: designTokens.base.text.body.xSmall.regular.fontSize,
        paddingX: 'base.spacing.x2',
      }}
      size="small"
    >
      <Button.Icon
        icon={networkIcon[firstFundingStep.chainId]}
        sx={{
          width: '14px',
          fill: logoColour[firstFundingStep.chainId],
        }}
      />
      {getChainNameById(firstFundingStep.chainId)}
    </HorizontalMenu.Button>
  );

  return (
    <MenuItem
      emphasized
      testId="funding-route-menu-item"
      onClick={onClick}
      selected={selected}
      size="small"
    >
      {toggleVisible && <MenuItem.IntentIcon icon="ChevronExpand" />}
      <MenuItem.FramedIcon icon="Coins" circularFrame />
      <MenuItem.PriceDisplay
        use={<Heading size="xSmall" />}
        fiatAmount={`≈ USD $${usdAmount}`}
        price={tokenValueFormat(firstFundingStep.fundingItem.fundsRequired.formattedAmount)}
      />
      <MenuItem.Label sx={{ display: 'flex', wordBreak: 'default' }}>
        { firstFundingStep.fundingItem.token.symbol }
        { isPassportWallet ? null : networkLabel()}
      </MenuItem.Label>
      <MenuItem.Caption>
        Fees ≈ USD $
        {totalFees}
      </MenuItem.Caption>
    </MenuItem>
  );
}
