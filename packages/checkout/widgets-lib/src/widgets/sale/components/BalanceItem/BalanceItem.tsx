import {
  Button, Heading, HorizontalMenu, MenuItem,
} from '@biom3/react';
import { ChainId, FundingRoute } from '@imtbl/checkout-sdk';
import { useContext, useEffect, useState } from 'react';
import { getChainNameById } from 'lib/chains';
import { useTranslation } from 'react-i18next';
import { CryptoFiatContext } from '../../../../context/crypto-fiat-context/CryptoFiatContext';
import { calculateCryptoToFiat, tokenValueFormat } from '../../../../lib/utils';
import { useSaleContext } from '../../context/SaleContextProvider';
import { fundingRouteFees } from '../../functions/smartCheckoutUtils';

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

export interface BalanceItemProps {
  onClick: () => void;
  fundingRoute: FundingRoute;
  toggleVisible?: boolean;
  selected?: boolean;
  size?: 'small' | 'medium';
}
export function BalanceItem({
  onClick,
  fundingRoute,
  toggleVisible,
  selected,
  size = 'small',
}: BalanceItemProps) {
  const { t } = useTranslation();
  const firstFundingStep = fundingRoute.steps[0];

  const { cryptoFiatState } = useContext(CryptoFiatContext);

  const { isPassportWallet } = useSaleContext();

  const [feesUsd, setFeesUsd] = useState<string | undefined>(undefined);
  const [usdBalance, setUsdBalance] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!cryptoFiatState.conversions) {
      return;
    }
    try {
      setFeesUsd(fundingRouteFees(fundingRoute, cryptoFiatState.conversions));
      setUsdBalance(
        calculateCryptoToFiat(
          firstFundingStep.fundingItem.userBalance.formattedBalance,
          firstFundingStep.fundingItem.token.symbol,
          cryptoFiatState.conversions,
        ),
      );
    } catch {
      setFeesUsd(undefined);
      setUsdBalance(undefined);
    }
  }, [cryptoFiatState, fundingRoute]);

  const networkLabel = () => (
    <HorizontalMenu.Button
      rc={<a />}
      sx={{
        pointerEvents: 'none',
        cursor: 'default',
        height: '100%',
        marginLeft: 'base.spacing.x2',
        fontSize: 'base.text.body.xxSmall.regular.fontSize',
        fontWeight: 'base.text.body.xxSmall.regular.fontWeight',
        color: 'base.color.brand.4',
        paddingLeft: 'base.spacing.x2',
        paddingRight: 'base.spacing.x2',
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
      size={size}
    >
      {toggleVisible && <MenuItem.IntentIcon icon="ChevronExpand" />}
      <MenuItem.FramedIcon icon="Coins" circularFrame />
      <MenuItem.PriceDisplay
        use={<Heading size="xSmall" />}
        fiatAmount={`${t(
          'views.FUND_WITH_SMART_CHECKOUT.currency.usdEstimate',
        )}${usdBalance}`}
        price={tokenValueFormat(
          firstFundingStep.fundingItem.userBalance.formattedBalance,
        )}
      />
      <MenuItem.Label sx={{ display: 'flex', wordBreak: 'default' }}>
        {firstFundingStep.fundingItem.token.symbol}
        {isPassportWallet ? null : networkLabel()}
      </MenuItem.Label>
      <MenuItem.Caption>
        Fees ≈ USD $
        {feesUsd}
      </MenuItem.Caption>
    </MenuItem>
  );
}
