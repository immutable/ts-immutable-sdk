import { MenuItem } from '@biom3/react';

export default function SdkHome() {
  return (
    <>
      <MenuItem rc={<a href="/sdk/connect" />} emphasized size="medium">
        <MenuItem.IntentIcon icon="ArrowForward" />
        <MenuItem.Label>Connect</MenuItem.Label>
        <MenuItem.Caption>
          Manage connections, switch networks, and access vital wallet/SDK
          information. Monitor wallet balances, retrieve balance data, and
          manage allowed lists for networks, wallets, and tokens.
        </MenuItem.Caption>
      </MenuItem>
      <MenuItem rc={<a href="/sdk/smart-checkout" />} emphasized size="medium">
        <MenuItem.IntentIcon icon="ArrowForward" />
        <MenuItem.Label>Smart Checkout</MenuItem.Label>
        <MenuItem.Caption>
          Smart checkout flows such as buy, sell and cancel.
        </MenuItem.Caption>
      </MenuItem>
      <MenuItem rc={<a href="/" />} emphasized size="medium">
        <MenuItem.IntentIcon icon="ArrowBackward" />
        <MenuItem.Label>Back to Sample App</MenuItem.Label>
        <MenuItem.Caption>Return to widgets and SDK entry points.</MenuItem.Caption>
      </MenuItem>
    </>
  );
}
