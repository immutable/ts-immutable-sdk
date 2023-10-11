import { ETH_TOKEN_IMAGE_URL, Heading, MenuItem } from '@biom3/react';
import { FundingRoute } from '@imtbl/checkout-sdk';

export interface FundingRouteMenuItemProps {
  onClick: () => void;
  fundingRoute: FundingRoute;
  toggleVisible?: boolean;
  selected?: boolean;
}
export function FundingRouteMenuItem({
  onClick, fundingRoute, toggleVisible, selected,
}: FundingRouteMenuItemProps) {
  return (
    <MenuItem
      testId="funding-route-menu-item"
      onClick={onClick}
      selected={selected}
      size="small"
    >
      {toggleVisible && <MenuItem.IntentIcon icon="ChevronExpand" />}
      <MenuItem.FramedImage imageUrl={ETH_TOKEN_IMAGE_URL} />
      <MenuItem.PriceDisplay
        use={<Heading size="xSmall" />}
        price="0.0252565"
        fiatAmount="USD $2.49"
        currencyImageUrl={ETH_TOKEN_IMAGE_URL}
      />
      <MenuItem.Label>
        { fundingRoute.steps[0].fundingItem.token.symbol }
      </MenuItem.Label>
      <MenuItem.Caption>
        Fees - USD $0.10
      </MenuItem.Caption>
    </MenuItem>
  );
}
