import { Heading, MenuItem } from '@biom3/react';

export function PurchaseMenuItem() {
  return (
    <MenuItem
      testId="funding-route-purchase-item"
      size="small"
    >
      <MenuItem.FramedImage
        // eslint-disable-next-line max-len
        imageUrl="https://uploads-ssl.webflow.com/628b4f4f8c89f8ba7f0966ea/64e6722c5d0ab7fd505ff7b6_Mech_Wardog_L_Uncommon_1.jpg"
      />
      <MenuItem.PriceDisplay
        use={<Heading size="xSmall" />}
        price="0.0252565"
        fiatAmount="USD $2.49"
      />
      <MenuItem.Label>
        Starter Pack
      </MenuItem.Label>
      <MenuItem.Caption>
        Metalcore
      </MenuItem.Caption>
    </MenuItem>
  );
}
