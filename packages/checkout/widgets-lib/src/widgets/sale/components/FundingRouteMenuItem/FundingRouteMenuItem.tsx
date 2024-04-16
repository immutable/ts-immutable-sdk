import { Heading, MenuItem } from '@biom3/react';
// import { ChainId, FundingRoute } from '@imtbl/checkout-sdk';
import { useEffect, useState } from 'react';
// import { getChainNameById } from 'lib/chains';
import { useTranslation } from 'react-i18next';
import { SaleWidgetCurrency } from 'widgets/sale/types';
import { calculateCryptoToFiat, tokenValueFormat } from '../../../../lib/utils';
// import { fundingRouteFees } from '../../functions/smartCheckoutUtils';

// // Taken from packages/checkout/widgets-lib/src/widgets/wallet/components/NetworkMenu/NetworkMenu.tsx
// const networkIcon = {
//   [ChainId.IMTBL_ZKEVM_DEVNET]: 'Immutable',
//   [ChainId.IMTBL_ZKEVM_MAINNET]: 'Immutable',
//   [ChainId.IMTBL_ZKEVM_TESTNET]: 'Immutable',
//   [ChainId.ETHEREUM]: 'EthToken',
//   [ChainId.SEPOLIA]: 'EthToken',
// };

// const logoColour = {
//   [ChainId.IMTBL_ZKEVM_DEVNET]: 'base.color.text.link.primary',
//   [ChainId.IMTBL_ZKEVM_TESTNET]: 'base.color.text.link.primary',
//   [ChainId.IMTBL_ZKEVM_MAINNET]: 'base.color.text.link.primary',
//   [ChainId.ETHEREUM]: 'base.color.accent.5',
//   [ChainId.SEPOLIA]: 'base.color.accent.5',
// };

export interface FundingRouteMenuItemProps {
  onClick: () => void;
  currency: SaleWidgetCurrency;
  toggleVisible?: boolean;
  selected?: boolean;
  size?: 'small' | 'medium';
  conversions: Map<string, number>;
}
export function FundingRouteMenuItem({
  onClick,
  currency,
  toggleVisible,
  selected,
  size = 'small',
  conversions,
}: FundingRouteMenuItemProps) {
  const { t } = useTranslation();
  // const firstFundingStep = fundingRoute.steps[0];

  const [feesUsd, setFeesUsd] = useState<string | undefined>(undefined);
  const [usdBalance, setUsdBalance] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!conversions || !conversions.size) {
      return;
    }
    try {
      // setFeesUsd(fundingRouteFees(fundingRoute, conversions));
      setUsdBalance(
        calculateCryptoToFiat(
          currency.userBalance.formattedBalance,
          currency.symbol,
          conversions,
        ),
      );
    } catch {
      setFeesUsd(undefined);
      setUsdBalance(undefined);
    }
  }, [conversions, currency]);

  // const networkLabel = () => (
  //   <HorizontalMenu.Button
  //     rc={<a />}
  //     sx={{
  //       pointerEvents: 'none',
  //       cursor: 'default',
  //       height: '100%',
  //       marginLeft: 'base.spacing.x2',
  //       fontSize: 'base.text.body.xxSmall.regular.fontSize',
  //       fontWeight: 'base.text.body.xxSmall.regular.fontWeight',
  //       color: 'base.color.brand.4',
  //       paddingLeft: 'base.spacing.x2',
  //       paddingRight: 'base.spacing.x2',
  //     }}
  //     size="small"
  //   >
  //     <Button.Icon
  //       icon={networkIcon[firstFundingStep.chainId]}
  //       sx={{
  //         width: '14px',
  //         fill: logoColour[firstFundingStep.chainId],
  //       }}
  //     />
  //     {getChainNameById(firstFundingStep.chainId)}
  //   </HorizontalMenu.Button>
  // );

  return (
    <MenuItem
      emphasized
      testId="funding-route-menu-item"
      onClick={onClick}
      selected={selected}
      size={size}
    >
      {toggleVisible && <MenuItem.IntentIcon icon="ChevronExpand" />}
      <MenuItem.FramedIcon icon="Coins" circularFrame />
      <MenuItem.PriceDisplay
        use={<Heading size="xSmall" />}
        fiatAmount={`${t(
          'views.FUND_WITH_SMART_CHECKOUT.currency.usdEstimate',
        )}${usdBalance}`}
        price={tokenValueFormat(currency.userBalance.formattedBalance)}
      />
      <MenuItem.Label sx={{ display: 'flex', wordBreak: 'default' }}>
        {currency.symbol}
        {/* {isPassportWallet ? null : networkLabel()} */}
      </MenuItem.Label>
      <MenuItem.Caption>
        Fees ≈ USD $
        {feesUsd}
      </MenuItem.Caption>
    </MenuItem>
  );
}
