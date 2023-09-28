/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ETH_TOKEN_IMAGE_URL, Heading, MenuItem } from '@biom3/react';

export interface FundingRouteMenuItemProps {
  onClick: () => void;
  fundingRoute: any;
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
        { fundingRoute.steps[0].asset.token.symbol}
      </MenuItem.Label>
      <MenuItem.Caption>
        Fees - USD $0.10
      </MenuItem.Caption>
    </MenuItem>
  );
}
