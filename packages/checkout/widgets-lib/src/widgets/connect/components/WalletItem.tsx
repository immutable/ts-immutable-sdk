import { ConnectionProviders, WalletInfo } from '@imtbl/checkout-sdk';
import { MenuItem } from '@biom3/react';
import { text } from '../../../resources/text/textConfig';

export interface WalletProps {
  onWalletClick: (providerPreference: ConnectionProviders) => void;
  wallet: WalletInfo;
}
export function WalletItem(props: WalletProps) {
  const { wallet, onWalletClick } = props;
  const { wallets } = text;

  const walletText = wallets[wallet.connectionProvider];
  const logo = {
    [ConnectionProviders.METAMASK]: 'MetaMaskSymbol',
  };

  return (
    // TODO: Fragments should contain more than one child - otherwise, there’s no need for a Fragment at all.
    // Consider checking !walletText and rendering a callback component instead, then it would make sense
    // to use a Fragment.
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {walletText && (
        <MenuItem
          testId={`wallet-list-${wallet.connectionProvider}`}
          size="medium"
          emphasized
          onClick={() => onWalletClick(wallet.connectionProvider)}
        >
          <MenuItem.FramedLogo
            logo={logo[wallet.connectionProvider] as any}
            sx={{
              width: 'base.icon.size.500',
              backgroundColor: 'base.color.translucent.emphasis.200',
              borderRadius: 'base.borderRadius.x2',
            }}
          />
          <MenuItem.Label size="medium">
            {wallets[wallet.connectionProvider].heading}
          </MenuItem.Label>
          <MenuItem.IntentIcon />
          <MenuItem.Caption>
            {wallets[wallet.connectionProvider].description}
          </MenuItem.Caption>
        </MenuItem>
      )}
    </>
  );
}
