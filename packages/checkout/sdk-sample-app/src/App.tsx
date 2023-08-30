import { MenuItem } from "@biom3/react";

export default function App() {
  return (
    <>
      <MenuItem
        rc={<a href="/connect" />}
        emphasized
        size="medium"
      >
        <MenuItem.IntentIcon icon="ArrowForward" />
        <MenuItem.Label>Connect</MenuItem.Label>
        <MenuItem.Caption>
          Manage connections, switch networks, and access vital wallet/SDK
          information. Monitor wallet balances, retrieve balance data, and
          manage allowed lists for networks, wallets, and tokens, providing a
          streamlined experience for your digital asset needs.
        </MenuItem.Caption>
      </MenuItem>
      <MenuItem
        rc={<a href="/smart-checkout" />}
        emphasized
        size="medium"
      >
        <MenuItem.IntentIcon icon="ArrowForward" />
        <MenuItem.Label>Smart Checkout</MenuItem.Label>
        <MenuItem.Caption>
          Smart checkout flows such as buy, sell and cancel.
        </MenuItem.Caption>
      </MenuItem>
    </>
  );
}
